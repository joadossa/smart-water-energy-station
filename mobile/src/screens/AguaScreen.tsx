import React, { useCallback, useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useApiConfig } from '../context/ApiConfigContext';
import { useResumo } from '../context/ResumoContext';
import usePolling from '../hooks/usePolling';
import useAcoesCabecalho from '../hooks/useAcoesCabecalho';
import useAcionamentoAtuador from '../hooks/useAcionamentoAtuador';
import AvisoApiOffline from '../components/AvisoApiOffline';
import BotaoAtuador from '../components/BotaoAtuador';
import CartaoSecao from '../components/CartaoSecao';
import Carregando from '../components/Carregando';
import ConfirmacaoModal from '../components/ConfirmacaoModal';
import EtiquetaStatus from '../components/EtiquetaStatus';
import GraficoLinha from '../components/GraficoLinha';
import MedidorCircular from '../components/MedidorCircular';
import MensagemResultado from '../components/MensagemResultado';
import { comAlfa, cores, fontes, raio } from '../theme/cores';
import { LIMITES_PADRAO, type Leitura } from '../types/api';
import { acaoPara, corDaAcao, descreverEstado, nomeAtuador } from '../utils/atuadores';
import { calcularTendencia, pontosDoSensor } from '../utils/estatistica';
import { formatarHora, formatarInteiro, formatarNumero, nomeSensor } from '../utils/formatar';
import { descreverTendencia, situacaoNivel } from '../utils/textos';

const RESERVATORIOS = ['RES-A', 'RES-B'];

export default function AguaScreen() {
  const { api } = useApiConfig();
  const { definirFalhasAbertas } = useResumo();

  const status = usePolling(() => api.buscarStatus(), { intervaloMs: 5000, chave: api.baseUrl });
  const historicoNivel = usePolling(() => api.listarLeituras({ tipo: 'NIVEL', minutos: 30, limite: 500 }), {
    intervaloMs: 15000,
    chave: api.baseUrl,
  });
  const historicoVazao = usePolling(() => api.listarLeituras({ tipo: 'VAZAO', minutos: 15, limite: 500 }), {
    intervaloMs: 15000,
    chave: api.baseUrl,
  });
  const atualizarStatus = status.atualizar;
  const atualizarNivel = historicoNivel.atualizar;
  const atualizarVazao = historicoVazao.atualizar;
  const [puxando, setPuxando] = useState(false);

  const atualizarTudo = useCallback(async () => {
    await Promise.all([atualizarStatus(), atualizarNivel(), atualizarVazao()]);
  }, [atualizarStatus, atualizarNivel, atualizarVazao]);

  useAcoesCabecalho(atualizarTudo);
  const acionamento = useAcionamentoAtuador(api, atualizarStatus);

  useEffect(() => {
    if (status.dados) definirFalhasAbertas(status.dados.falhasAbertas);
  }, [status.dados, definirFalhasAbertas]);

  async function puxarParaAtualizar() {
    setPuxando(true);
    await atualizarTudo();
    setPuxando(false);
  }

  if (status.carregando && !status.dados && !status.erro) {
    return <Carregando mensagem="Carregando dados de água..." />;
  }

  const dados = status.dados;
  const limites = dados?.limites ?? LIMITES_PADRAO;
  const capacidades = dados?.capacidadesLitros ?? {};
  const valvulas = (dados?.atuadores ?? []).filter((a) => a.tipo === 'VALVULA');
  const pontosSaida = pontosDoSensor(historicoVazao.dados, 'SAIDA');
  const pontosEntrada = pontosDoSensor(historicoVazao.dados, 'ENTRADA');
  const pedido = acionamento.pedido;

  return (
    <>
      <ScrollView
        style={estilos.tela}
        contentContainerStyle={estilos.conteudo}
        refreshControl={<RefreshControl refreshing={puxando} onRefresh={puxarParaAtualizar} tintColor={cores.ciano} colors={[cores.ciano]} />}
      >
        <AvisoApiOffline erro={status.erro} ultimaAtualizacao={status.ultimaAtualizacao} onTentarNovamente={atualizarTudo} />

        {RESERVATORIOS.map((sensor) => {
          const leitura: Leitura | undefined = dados?.niveis.find((l) => l.sensor === sensor);
          const valor = leitura ? leitura.valor : null;
          const situacao = situacaoNivel(valor, limites);
          const capacidade = capacidades[sensor];
          const pontos = pontosDoSensor(historicoNivel.dados, sensor);
          const tendencia = calcularTendencia(pontos);

          return (
            <CartaoSecao
              key={sensor}
              titulo={nomeSensor(sensor)}
              subtitulo={leitura ? `Última leitura às ${formatarHora(leitura.dataHora)}` : 'Sem leituras ainda'}
            >
              <View style={estilos.reservatorio}>
                <MedidorCircular percentual={valor} cor={situacao.cor} tamanho={104} />
                <View style={estilos.infoReservatorio}>
                  <EtiquetaStatus texto={situacao.texto} cor={situacao.cor} icone={situacao.icone} />
                  <Text style={estilos.volume}>
                    {capacidade && valor !== null ? `${formatarInteiro((capacidade * valor) / 100)} L` : '--'}
                    <Text style={estilos.capacidade}> de {capacidade ? `${formatarInteiro(capacidade)} L` : '--'}</Text>
                  </Text>
                  <Text style={estilos.limites}>
                    Mínimo {formatarNumero(limites.nivelMinimo, 0)}% · Máximo {formatarNumero(limites.nivelMaximo, 0)}%
                  </Text>
                </View>
              </View>

              {valor !== null && valor < limites.nivelMinimo ? (
                <View style={[estilos.critico, { borderColor: comAlfa(cores.vermelho, 0.6), backgroundColor: comAlfa(cores.vermelho, 0.1) }]}>
                  <Ionicons name="alert-circle" size={18} color={cores.vermelho} />
                  <Text style={estilos.criticoTexto}>
                    Nível crítico: abaixo do mínimo de {formatarNumero(limites.nivelMinimo, 0)}%. Ligue a bomba deste reservatório ou reduza a saída.
                  </Text>
                </View>
              ) : null}
              {valor !== null && valor > limites.nivelMaximo ? (
                <View style={[estilos.critico, { borderColor: comAlfa(cores.amarelo, 0.6), backgroundColor: comAlfa(cores.amarelo, 0.1) }]}>
                  <Ionicons name="warning" size={18} color={cores.amarelo} />
                  <Text style={estilos.criticoTexto}>
                    Risco de transbordo: acima de {formatarNumero(limites.nivelMaximo, 0)}%. Desligue a bomba deste reservatório.
                  </Text>
                </View>
              ) : null}

              <Text style={estilos.legendaGrafico}>Histórico · últimos 30 min</Text>
              <GraficoLinha
                series={[{ nome: 'Nível', cor: cores.ciano, pontos }]}
                minimoY={0}
                maximoY={100}
                casas={0}
                altura={120}
                linhasReferencia={[
                  { valor: limites.nivelMinimo, cor: cores.vermelho, rotulo: `mínimo ${formatarNumero(limites.nivelMinimo, 0)}%` },
                  { valor: limites.nivelMaximo, cor: cores.amarelo, rotulo: `máximo ${formatarNumero(limites.nivelMaximo, 0)}%` },
                ]}
                mensagemVazio={historicoNivel.erro ? 'Histórico indisponível com a API fora do ar.' : 'Aguardando leituras de nível...'}
              />
              <Text style={estilos.tendencia}>{descreverTendencia(tendencia, 'p.p.')}</Text>
            </CartaoSecao>
          );
        })}

        <CartaoSecao titulo="Vazão" subtitulo={descreverTendencia(calcularTendencia(pontosSaida), 'L/min', 'Tendência da saída')}>
          <View style={estilos.vazoes}>
            {(['ENTRADA', 'SAIDA'] as const).map((sensor) => {
              const leitura = dados?.vazoes.find((l) => l.sensor === sensor);
              return (
                <View key={sensor} style={estilos.vazao}>
                  <Text style={estilos.vazaoRotulo}>{sensor === 'ENTRADA' ? 'Entrada (bombas)' : 'Saída (distribuição)'}</Text>
                  <Text style={estilos.vazaoValor}>
                    {formatarNumero(leitura ? leitura.valor : null)}
                    <Text style={estilos.vazaoUnidade}> L/min</Text>
                  </Text>
                  <Text style={estilos.vazaoHora}>{leitura ? `às ${formatarHora(leitura.dataHora)}` : 'sem leitura'}</Text>
                </View>
              );
            })}
          </View>
          <GraficoLinha
            series={[
              { nome: 'Saída', cor: cores.ciano, pontos: pontosSaida },
              { nome: 'Entrada', cor: cores.azul, pontos: pontosEntrada },
            ]}
            altura={140}
            mensagemVazio={historicoVazao.erro ? 'Histórico indisponível com a API fora do ar.' : 'Aguardando leituras de vazão...'}
          />
        </CartaoSecao>

        <CartaoSecao titulo="Válvula de distribuição" subtitulo="Controla a saída de água para a rede">
          <MensagemResultado resultado={acionamento.resultado} onFechar={acionamento.limparResultado} />
          {valvulas.length ? (
            valvulas.map((valvula) => (
              <BotaoAtuador
                key={valvula.id}
                atuador={valvula}
                onAlternar={status.erro ? null : acionamento.solicitar}
                ocupado={acionamento.executando && pedido?.atuador.id === valvula.id}
              />
            ))
          ) : (
            <Text style={estilos.vazio}>Nenhuma válvula cadastrada.</Text>
          )}
          {status.erro ? <Text style={estilos.vazio}>Comandos desabilitados enquanto a API estiver fora do ar.</Text> : null}
        </CartaoSecao>
      </ScrollView>

      <ConfirmacaoModal
        visivel={pedido !== null}
        titulo={pedido ? `${acaoPara(pedido.atuador, pedido.novoEstado)} ${nomeAtuador(pedido.atuador).toLowerCase()}?` : ''}
        mensagem={
          pedido
            ? `O comando será enviado ao servidor. A ${nomeAtuador(pedido.atuador).toLowerCase()} ficará ${descreverEstado(pedido.atuador, pedido.novoEstado)} somente após a confirmação da API.`
            : ''
        }
        textoConfirmar={pedido ? acaoPara(pedido.atuador, pedido.novoEstado) : 'Confirmar'}
        corConfirmar={pedido ? corDaAcao(pedido.novoEstado) : cores.ciano}
        carregando={acionamento.executando}
        onConfirmar={() => void acionamento.confirmar()}
        onCancelar={acionamento.cancelar}
      />
    </>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  conteudo: { padding: 16, paddingBottom: 32, gap: 12 },
  reservatorio: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  infoReservatorio: { flex: 1, gap: 6 },
  volume: { color: cores.texto, fontFamily: fontes.titulo, fontSize: 22 },
  capacidade: { color: cores.textoSecundario, fontFamily: fontes.regular, fontSize: 13 },
  limites: { color: cores.textoSecundario, fontFamily: fontes.regular, fontSize: 12 },
  critico: { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderRadius: raio.controle, padding: 10 },
  criticoTexto: { flex: 1, color: cores.texto, fontFamily: fontes.media, fontSize: 12, lineHeight: 17 },
  legendaGrafico: { color: cores.textoSecundario, fontFamily: fontes.media, fontSize: 12 },
  tendencia: { color: cores.textoSecundario, fontFamily: fontes.regular, fontSize: 12 },
  vazoes: { flexDirection: 'row', gap: 10 },
  vazao: { flex: 1, backgroundColor: cores.fundo, borderRadius: raio.controle, padding: 10, gap: 2 },
  vazaoRotulo: { color: cores.textoSecundario, fontFamily: fontes.media, fontSize: 12 },
  vazaoValor: { color: cores.ciano, fontFamily: fontes.titulo, fontSize: 22 },
  vazaoUnidade: { color: cores.textoSecundario, fontFamily: fontes.regular, fontSize: 12 },
  vazaoHora: { color: cores.textoFraco, fontFamily: fontes.regular, fontSize: 11 },
  vazio: { color: cores.textoSecundario, fontFamily: fontes.regular, fontStyle: 'italic', fontSize: 12 },
});

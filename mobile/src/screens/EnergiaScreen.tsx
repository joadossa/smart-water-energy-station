import React, { useCallback, useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';

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
import MensagemResultado from '../components/MensagemResultado';
import { comAlfa, cores, fontes, raio } from '../theme/cores';
import { LIMITES_PADRAO } from '../types/api';
import { acaoPara, corDaAcao, descreverEstado, nomeAtuador } from '../utils/atuadores';
import { calcularTendencia, integrarEnergiaKwh, somarPorInstante } from '../utils/estatistica';
import { formatarHora, formatarNumero, nomeSensor, paraData } from '../utils/formatar';
import { descreverTendencia } from '../utils/textos';

const JANELA_MINUTOS = 30;

export default function EnergiaScreen() {
  const { api } = useApiConfig();
  const { definirFalhasAbertas } = useResumo();

  const status = usePolling(() => api.buscarStatus(), { intervaloMs: 5000, chave: api.baseUrl });
  const historico = usePolling(() => api.listarLeituras({ tipo: 'ENERGIA', minutos: JANELA_MINUTOS, limite: 1000 }), {
    intervaloMs: 15000,
    chave: api.baseUrl,
  });
  const atualizarStatus = status.atualizar;
  const atualizarHistorico = historico.atualizar;
  const [puxando, setPuxando] = useState(false);

  const atualizarTudo = useCallback(async () => {
    await Promise.all([atualizarStatus(), atualizarHistorico()]);
  }, [atualizarStatus, atualizarHistorico]);

  useAcoesCabecalho(atualizarTudo);
  const acionamento = useAcionamentoAtuador(api, atualizarTudo);

  useEffect(() => {
    if (status.dados) definirFalhasAbertas(status.dados.falhasAbertas);
  }, [status.dados, definirFalhasAbertas]);

  async function puxarParaAtualizar() {
    setPuxando(true);
    await atualizarTudo();
    setPuxando(false);
  }

  if (status.carregando && !status.dados && !status.erro) {
    return <Carregando mensagem="Carregando consumo elétrico..." />;
  }

  const dados = status.dados;
  const limites = dados?.limites ?? LIMITES_PADRAO;
  const consumos = dados?.consumos ?? [];
  const total = dados ? dados.consumoTotalKw : null;
  const bombas = (dados?.atuadores ?? []).filter((a) => a.tipo === 'BOMBA');
  const pontosPotencia = somarPorInstante(historico.dados);
  const energia = integrarEnergiaKwh(pontosPotencia);
  const tendencia = calcularTendencia(pontosPotencia, 0.05);
  const horaLeitura = consumos
    .map((l) => paraData(l.dataHora))
    .filter((d): d is Date => d !== null)
    .sort((a, b) => b.getTime() - a.getTime())[0];
  const pedido = acionamento.pedido;

  return (
    <>
      <ScrollView
        style={estilos.tela}
        contentContainerStyle={estilos.conteudo}
        refreshControl={<RefreshControl refreshing={puxando} onRefresh={puxarParaAtualizar} tintColor={cores.ciano} colors={[cores.ciano]} />}
      >
        <AvisoApiOffline erro={status.erro} ultimaAtualizacao={status.ultimaAtualizacao} onTentarNovamente={atualizarTudo} />

        <View style={estilos.destaques}>
          <View style={[estilos.destaque, { borderColor: comAlfa(cores.amarelo, 0.5) }]}>
            <Text style={estilos.destaqueRotulo}>Potência instantânea</Text>
            <Text style={estilos.destaqueValor}>
              {formatarNumero(total, 2)}
              <Text style={estilos.destaqueUnidade}> kW</Text>
            </Text>
            <Text style={estilos.destaqueInfo}>{horaLeitura ? `Leitura às ${formatarHora(horaLeitura)}` : 'Sem leitura ainda'}</Text>
            {dados?.simulacaoAtiva ? <EtiquetaStatus texto="Valor simulado" cor={cores.azul} icone="flask-outline" /> : null}
          </View>

          <View style={[estilos.destaque, { borderColor: comAlfa(cores.ciano, 0.5) }]}>
            <Text style={estilos.destaqueRotulo}>Energia estimada</Text>
            <Text style={[estilos.destaqueValor, { color: cores.ciano }]}>
              {energia.duracaoMinutos > 0 ? `≈ ${formatarNumero(energia.kwh, 2)}` : '--'}
              <Text style={estilos.destaqueUnidade}> kWh</Text>
            </Text>
            <Text style={estilos.destaqueInfo}>
              {energia.duracaoMinutos > 0 ? `em ${formatarNumero(energia.duracaoMinutos, 0)} min de leituras` : 'Aguardando histórico'}
            </Text>
            <EtiquetaStatus texto="Estimativa simulada" cor={cores.textoSecundario} icone="calculator-outline" />
          </View>
        </View>

        <Text style={estilos.nota}>
          kW é a potência no instante da leitura; kWh é a energia acumulada no período, estimada integrando a potência ao longo do tempo
          (regra dos trapézios) com as leituras dos últimos {JANELA_MINUTOS} min.
        </Text>

        <CartaoSecao titulo={`Potência total · últimos ${JANELA_MINUTOS} min`} subtitulo={descreverTendencia(tendencia, 'kW')}>
          <GraficoLinha
            series={[{ nome: 'Potência total', cor: cores.amarelo, pontos: pontosPotencia }]}
            altura={150}
            casas={1}
            mensagemVazio={historico.erro ? 'Histórico indisponível com a API fora do ar.' : 'Aguardando leituras de consumo...'}
          />
        </CartaoSecao>

        <CartaoSecao
          titulo="Bombas"
          subtitulo={`${bombas.filter((b) => b.estado === 'LIGADO').length} de ${bombas.length} ligadas · confirmação antes de cada comando`}
        >
          <MensagemResultado resultado={acionamento.resultado} onFechar={acionamento.limparResultado} />
          {bombas.length ? (
            bombas.map((bomba) => (
              <BotaoAtuador
                key={bomba.id}
                atuador={bomba}
                onAlternar={status.erro ? null : acionamento.solicitar}
                ocupado={acionamento.executando && pedido?.atuador.id === bomba.id}
              />
            ))
          ) : (
            <Text style={estilos.vazio}>Nenhuma bomba cadastrada.</Text>
          )}
          {status.erro ? <Text style={estilos.vazio}>Comandos desabilitados enquanto a API estiver fora do ar.</Text> : null}
        </CartaoSecao>

        <CartaoSecao titulo="Consumo por equipamento" subtitulo={`Limite por equipamento: ${formatarNumero(limites.consumoMaximo, 0)} kW`}>
          {consumos.length ? (
            consumos.map((leitura) => {
              const acimaDoLimite = leitura.valor > limites.consumoMaximo;
              const participacao = total ? (leitura.valor / total) * 100 : 0;
              const cor = acimaDoLimite ? cores.vermelho : cores.amarelo;
              return (
                <View key={leitura.sensor} style={estilos.equipamento}>
                  <View style={estilos.equipamentoLinha}>
                    <Text style={estilos.equipamentoNome}>{nomeSensor(leitura.sensor)}</Text>
                    <Text style={[estilos.equipamentoValor, { color: cor }]}>{formatarNumero(leitura.valor, 2)} kW</Text>
                  </View>
                  <View style={estilos.trilho}>
                    <View style={[estilos.barra, { width: `${Math.min(100, Math.max(0, participacao))}%`, backgroundColor: cor }]} />
                  </View>
                  <Text style={estilos.equipamentoInfo}>
                    {formatarNumero(participacao, 0)}% do total{acimaDoLimite ? ' · acima do limite (sobrecarga)' : ''}
                  </Text>
                </View>
              );
            })
          ) : (
            <Text style={estilos.vazio}>Sem leituras de consumo ainda.</Text>
          )}
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
  destaques: { flexDirection: 'row', gap: 12 },
  destaque: { flex: 1, backgroundColor: cores.card, borderWidth: 1, borderRadius: raio.card, padding: 14, gap: 6 },
  destaqueRotulo: { color: cores.textoSecundario, fontFamily: fontes.media, fontSize: 12 },
  destaqueValor: { color: cores.amarelo, fontFamily: fontes.titulo, fontSize: 30 },
  destaqueUnidade: { color: cores.textoSecundario, fontFamily: fontes.media, fontSize: 14 },
  destaqueInfo: { color: cores.textoSecundario, fontFamily: fontes.regular, fontSize: 11 },
  nota: { color: cores.textoFraco, fontFamily: fontes.regular, fontSize: 11, lineHeight: 16 },
  equipamento: { gap: 4, paddingVertical: 6 },
  equipamentoLinha: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  equipamentoNome: { color: cores.texto, fontFamily: fontes.media, fontSize: 14 },
  equipamentoValor: { fontFamily: fontes.titulo, fontSize: 15 },
  trilho: { height: 6, borderRadius: 3, backgroundColor: cores.borda, overflow: 'hidden' },
  barra: { height: 6, borderRadius: 3 },
  equipamentoInfo: { color: cores.textoSecundario, fontFamily: fontes.regular, fontSize: 11 },
  vazio: { color: cores.textoSecundario, fontFamily: fontes.regular, fontStyle: 'italic', fontSize: 12 },
});

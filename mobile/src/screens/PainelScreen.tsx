import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useApiConfig } from '../context/ApiConfigContext';
import { useResumo } from '../context/ResumoContext';
import usePolling from '../hooks/usePolling';
import useAcoesCabecalho from '../hooks/useAcoesCabecalho';
import AvisoApiOffline from '../components/AvisoApiOffline';
import CardIndicador from '../components/CardIndicador';
import CartaoSecao from '../components/CartaoSecao';
import Carregando from '../components/Carregando';
import EtiquetaStatus from '../components/EtiquetaStatus';
import GraficoLinha from '../components/GraficoLinha';
import LinhaAtuador from '../components/LinhaAtuador';
import MedidorCircular from '../components/MedidorCircular';
import { comAlfa, cores, fontes, raio } from '../theme/cores';
import { LIMITES_PADRAO } from '../types/api';
import { calcularTendencia, pontosDoSensor } from '../utils/estatistica';
import { formatarHora, formatarInteiro, formatarNumero, nomeSensor, valorDoSensor } from '../utils/formatar';
import { descreverTendencia, situacaoNivel } from '../utils/textos';
import type { PropsAba } from '../navigation/tipos';

const RESERVATORIOS = ['RES-A', 'RES-B'];

export default function PainelScreen({ navigation }: PropsAba<'Painel'>) {
  const { api } = useApiConfig();
  const { definirFalhasAbertas } = useResumo();

  const status = usePolling(() => api.buscarStatus(), { intervaloMs: 5000, chave: api.baseUrl });
  const historicoVazao = usePolling(() => api.listarLeituras({ tipo: 'VAZAO', minutos: 15, limite: 500 }), {
    intervaloMs: 15000,
    chave: api.baseUrl,
  });
  const atualizarStatus = status.atualizar;
  const atualizarHistorico = historicoVazao.atualizar;
  const [puxando, setPuxando] = useState(false);

  const atualizarTudo = useCallback(async () => {
    await Promise.all([atualizarStatus(), atualizarHistorico()]);
  }, [atualizarStatus, atualizarHistorico]);

  useAcoesCabecalho(atualizarTudo);

  useEffect(() => {
    if (status.dados) definirFalhasAbertas(status.dados.falhasAbertas);
  }, [status.dados, definirFalhasAbertas]);

  async function puxarParaAtualizar() {
    setPuxando(true);
    await atualizarTudo();
    setPuxando(false);
  }

  if (status.carregando && !status.dados && !status.erro) {
    return <Carregando mensagem="Conectando à estação..." />;
  }

  const dados = status.dados;
  const online = Boolean(dados) && !status.erro;
  const limites = dados?.limites ?? LIMITES_PADRAO;
  const capacidades = dados?.capacidadesLitros ?? {};
  const bombas = (dados?.atuadores ?? []).filter((a) => a.tipo === 'BOMBA');
  const bombasLigadas = bombas.filter((b) => b.estado === 'LIGADO').length;
  const valvulas = (dados?.atuadores ?? []).filter((a) => a.tipo === 'VALVULA');
  const valvulasAbertas = valvulas.filter((v) => v.estado === 'LIGADO').length;
  const falhaRecente = dados?.ultimasFalhas?.[0];
  const pontosSaida = pontosDoSensor(historicoVazao.dados, 'SAIDA');
  const pontosEntrada = pontosDoSensor(historicoVazao.dados, 'ENTRADA');
  const tendenciaSaida = calcularTendencia(pontosSaida);

  return (
    <ScrollView
      style={estilos.tela}
      contentContainerStyle={estilos.conteudo}
      refreshControl={<RefreshControl refreshing={puxando} onRefresh={puxarParaAtualizar} tintColor={cores.ciano} colors={[cores.ciano]} />}
    >
      <Text style={estilos.projeto}>Smart Water & Energy Station · painel de operação</Text>

      <View style={estilos.conexao}>
        <View style={[estilos.ponto, { backgroundColor: online ? cores.verde : cores.vermelho }]} />
        <View style={estilos.conexaoTextos}>
          <Text style={estilos.conexaoTitulo}>{online ? 'Estação online' : 'API fora do ar'}</Text>
          <Text style={estilos.conexaoHora}>
            {status.ultimaAtualizacao
              ? `${online ? 'Atualizado' : 'Última leitura disponível'} às ${formatarHora(status.ultimaAtualizacao)}`
              : 'Nenhuma leitura recebida ainda'}
          </Text>
        </View>
        {dados?.simulacaoAtiva ? <EtiquetaStatus texto="Dados simulados" cor={cores.azul} icone="flask-outline" /> : null}
      </View>

      <AvisoApiOffline erro={status.erro} ultimaAtualizacao={status.ultimaAtualizacao} onTentarNovamente={atualizarTudo} />

      {dados && dados.falhasAbertas > 0 && falhaRecente ? (
        <Pressable
          accessibilityRole="button"
          onPress={() => navigation.navigate('Alertas')}
          style={({ pressed }) => [estilos.bannerFalha, pressed && { opacity: 0.8 }]}
        >
          <Ionicons name="warning" size={20} color={cores.vermelho} />
          <Text style={estilos.bannerTexto}>
            {dados.falhasAbertas} {dados.falhasAbertas > 1 ? 'falhas abertas' : 'falha aberta'} · {nomeSensor(falhaRecente.origem)}:{' '}
            {falhaRecente.descricao}
          </Text>
          <Ionicons name="chevron-forward" size={18} color={cores.vermelho} />
        </Pressable>
      ) : null}

      {dados ? (
        <>
          <View style={estilos.linha}>
            {RESERVATORIOS.map((sensor) => {
              const valor = valorDoSensor(dados.niveis, sensor);
              const situacao = situacaoNivel(valor, limites);
              const capacidade = capacidades[sensor];
              return (
                <View key={sensor} style={estilos.cardReservatorio}>
                  <Text style={estilos.nomeReservatorio}>{nomeSensor(sensor)}</Text>
                  <MedidorCircular
                    percentual={valor}
                    cor={situacao.cor}
                    tamanho={112}
                    legenda={capacidade && valor !== null ? `${formatarInteiro((capacidade * valor) / 100)} L` : undefined}
                  />
                  <EtiquetaStatus texto={situacao.texto} cor={situacao.cor} icone={situacao.icone} style={{ alignSelf: 'center' }} />
                </View>
              );
            })}
          </View>

          <View style={estilos.linha}>
            <CardIndicador
              titulo="Vazão atual"
              valor={formatarNumero(valorDoSensor(dados.vazoes, 'SAIDA'))}
              unidade="L/min"
              icone="water-outline"
              cor={cores.ciano}
              subtitulo={`Entrada: ${formatarNumero(valorDoSensor(dados.vazoes, 'ENTRADA'))} L/min`}
            />
            <CardIndicador
              titulo="Consumo elétrico"
              valor={formatarNumero(dados.consumoTotalKw)}
              unidade="kW"
              icone="flash-outline"
              cor={cores.amarelo}
              subtitulo={dados.simulacaoAtiva ? 'Potência simulada' : 'Potência instantânea'}
            />
          </View>

          <CartaoSecao
            titulo="Bombas"
            subtitulo={`${bombasLigadas} de ${bombas.length} ${bombasLigadas === 1 ? 'ligada' : 'ligadas'}`}
            acao={{ rotulo: 'Controlar', onPress: () => navigation.navigate('Energia') }}
          >
            <View style={estilos.atuadores}>
              {bombas.map((bomba) => (
                <LinhaAtuador key={bomba.id} atuador={bomba} />
              ))}
            </View>
          </CartaoSecao>

          <CartaoSecao
            titulo={valvulas.length > 1 ? 'Válvulas' : 'Válvula'}
            subtitulo={
              valvulas.length > 1
                ? `${valvulasAbertas} de ${valvulas.length} ${valvulasAbertas === 1 ? 'aberta' : 'abertas'}`
                : 'Controla a saída de água para a rede'
            }
            acao={{ rotulo: 'Controlar', onPress: () => navigation.navigate('Agua', { secao: 'valvula' }) }}
          >
            <View style={estilos.atuadores}>
              {valvulas.length ? (
                valvulas.map((valvula) => <LinhaAtuador key={valvula.id} atuador={valvula} />)
              ) : (
                <Text style={estilos.vazio}>Nenhuma válvula cadastrada.</Text>
              )}
            </View>
          </CartaoSecao>

          <CartaoSecao titulo="Vazão · últimos 15 min" subtitulo={descreverTendencia(tendenciaSaida, 'L/min', 'Tendência da saída')}>
            <GraficoLinha
              series={[
                { nome: 'Saída', cor: cores.ciano, pontos: pontosSaida },
                { nome: 'Entrada', cor: cores.azul, pontos: pontosEntrada },
              ]}
              altura={150}
              mensagemVazio={historicoVazao.erro ? 'Histórico indisponível enquanto a API estiver fora do ar.' : 'Aguardando leituras de vazão...'}
            />
          </CartaoSecao>
        </>
      ) : null}
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  conteudo: { padding: 16, paddingBottom: 32, gap: 12 },
  projeto: { color: cores.textoFraco, fontFamily: fontes.media, fontSize: 12, letterSpacing: 0.3 },
  conexao: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  ponto: { width: 10, height: 10, borderRadius: 5 },
  conexaoTextos: { flex: 1 },
  conexaoTitulo: { color: cores.texto, fontFamily: fontes.seminegrito, fontSize: 14 },
  conexaoHora: { color: cores.textoSecundario, fontFamily: fontes.regular, fontSize: 12 },
  bannerFalha: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: comAlfa(cores.vermelho, 0.12),
    borderColor: comAlfa(cores.vermelho, 0.6),
    borderWidth: 1,
    borderRadius: raio.card,
    padding: 12,
  },
  bannerTexto: { flex: 1, color: cores.texto, fontFamily: fontes.media, fontSize: 13, lineHeight: 18 },
  linha: { flexDirection: 'row', gap: 12 },
  cardReservatorio: {
    flex: 1,
    backgroundColor: cores.card,
    borderColor: cores.borda,
    borderWidth: 1,
    borderRadius: raio.card,
    padding: 12,
    alignItems: 'center',
    gap: 8,
  },
  nomeReservatorio: { color: cores.texto, fontFamily: fontes.seminegrito, fontSize: 13, alignSelf: 'flex-start' },
  atuadores: { gap: 8 },
  vazio: { color: cores.textoSecundario, fontFamily: fontes.regular, fontStyle: 'italic', fontSize: 12 },
});

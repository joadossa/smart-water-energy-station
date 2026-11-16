import React, { useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useApiConfig } from '../context/ApiConfigContext';
import usePolling from '../hooks/usePolling';
import AvisoApiOffline from '../components/AvisoApiOffline';
import CardIndicador from '../components/CardIndicador';
import AlertaItem from '../components/AlertaItem';
import Carregando from '../components/Carregando';
import { cores } from '../theme/cores';
import { formatarHora, formatarNumero, valorDoSensor } from '../utils/formatar';

export default function PainelScreen({ navigation }) {
  const { api } = useApiConfig();
  const { dados, erro, carregando, ultimaAtualizacao, atualizar } = usePolling(() => api.buscarStatus(), {
    intervaloMs: 5000,
    chave: api.baseUrl,
  });
  const [puxando, setPuxando] = useState(false);

  async function puxarParaAtualizar() {
    setPuxando(true);
    await atualizar();
    setPuxando(false);
  }

  if (carregando && !dados && !erro) {
    return <Carregando mensagem="Conectando à estação..." />;
  }

  const niveis = dados?.niveis ?? [];
  const nivelMedio = niveis.length ? niveis.reduce((soma, l) => soma + l.valor, 0) / niveis.length : null;
  const atuadores = dados?.atuadores ?? [];
  const ligados = atuadores.filter((a) => a.estado === 'LIGADO').length;
  const falhasAbertas = dados?.falhasAbertas ?? 0;
  const online = Boolean(dados) && !erro;

  return (
    <ScrollView
      style={estilos.tela}
      contentContainerStyle={estilos.conteudo}
      refreshControl={<RefreshControl refreshing={puxando} onRefresh={puxarParaAtualizar} tintColor={cores.texto} />}
    >
      <View style={estilos.cabecalho}>
        <Text style={estilos.titulo}>Smart Water & Energy Station</Text>
        <View style={estilos.statusLinha}>
          <View style={[estilos.ponto, { backgroundColor: online ? cores.ok : cores.critico }]} />
          <Text style={estilos.statusTexto}>
            {online ? `Online · atualizado às ${formatarHora(ultimaAtualizacao)}` : 'Sem conexão com a API'}
          </Text>
        </View>
      </View>

      <AvisoApiOffline erro={erro} ultimaAtualizacao={ultimaAtualizacao} onTentarNovamente={atualizar} />

      {dados ? (
        <>
          <View style={estilos.grade}>
            <CardIndicador
              titulo="Nível médio"
              valor={formatarNumero(nivelMedio)}
              unidade="%"
              icone="water-outline"
              cor={cores.agua}
              subtitulo={`${niveis.length} reservatório(s)`}
            />
            <CardIndicador
              titulo="Vazão de entrada"
              valor={formatarNumero(valorDoSensor(dados.vazoes, 'ENTRADA'))}
              unidade="L/min"
              icone="arrow-down-circle-outline"
              cor={cores.agua}
            />
            <CardIndicador
              titulo="Vazão de saída"
              valor={formatarNumero(valorDoSensor(dados.vazoes, 'SAIDA'))}
              unidade="L/min"
              icone="arrow-up-circle-outline"
              cor={cores.agua}
            />
            <CardIndicador
              titulo="Consumo elétrico"
              valor={formatarNumero(dados.consumoTotalKw, 2)}
              unidade="kW"
              icone="flash-outline"
              cor={cores.energia}
              subtitulo="simulado"
            />
            <CardIndicador
              titulo="Falhas abertas"
              valor={String(falhasAbertas)}
              icone="warning-outline"
              cor={falhasAbertas > 0 ? cores.critico : cores.ok}
            />
            <CardIndicador
              titulo="Atuadores ligados"
              valor={`${ligados}/${atuadores.length}`}
              icone="cog-outline"
              cor={cores.primaria}
            />
          </View>

          <Text style={estilos.secao}>Últimos alertas</Text>
          {dados.ultimasFalhas?.length ? (
            dados.ultimasFalhas.slice(0, 3).map((falha) => <AlertaItem key={falha.id} falha={falha} />)
          ) : (
            <Text style={estilos.vazio}>Nenhuma falha aberta. Tudo operando normalmente.</Text>
          )}
          {falhasAbertas > 0 ? (
            <Pressable onPress={() => navigation.navigate('Alertas')}>
              <Text style={estilos.link}>Ver todos os alertas →</Text>
            </Pressable>
          ) : null}
        </>
      ) : null}
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  conteudo: { padding: 16, paddingBottom: 32 },
  cabecalho: { marginBottom: 12, gap: 6 },
  titulo: { color: cores.texto, fontSize: 20, fontWeight: '700' },
  statusLinha: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  ponto: { width: 10, height: 10, borderRadius: 5 },
  statusTexto: { color: cores.textoSecundario, fontSize: 13 },
  grade: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  secao: { color: cores.texto, fontSize: 16, fontWeight: '700', marginTop: 20, marginBottom: 10 },
  vazio: { color: cores.textoSecundario, fontStyle: 'italic' },
  link: { color: cores.primaria, fontWeight: '600', marginTop: 4 },
});

import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { useApiConfig } from '../context/ApiConfigContext';
import usePolling from '../hooks/usePolling';
import AvisoApiOffline from '../components/AvisoApiOffline';
import CardIndicador from '../components/CardIndicador';
import Carregando from '../components/Carregando';
import { cores } from '../theme/cores';
import { formatarNumero, nomeSensor } from '../utils/formatar';

// Tarifa ilustrativa usada só para estimar o custo da simulação
const TARIFA_KWH = 0.8;
const LIMITE_CONSUMO_KW = 15;

/** Agrupa as leituras (mais recentes primeiro) por sensor, em ordem cronológica. */
function agruparHistorico(leituras) {
  const grupos = {};
  [...(leituras || [])].reverse().forEach((leitura) => {
    if (!grupos[leitura.sensor]) grupos[leitura.sensor] = [];
    grupos[leitura.sensor].push(leitura.valor);
  });
  Object.keys(grupos).forEach((sensor) => {
    grupos[sensor] = grupos[sensor].slice(-20);
  });
  return grupos;
}

function MiniGrafico({ valores }) {
  const maximo = Math.max(...valores, 0.01);
  return (
    <View style={estilos.grafico}>
      {valores.map((valor, i) => (
        <View
          key={i}
          style={[
            estilos.barra,
            {
              height: `${Math.max(3, (valor / maximo) * 100)}%`,
              backgroundColor: valor > LIMITE_CONSUMO_KW ? cores.critico : cores.energia,
            },
          ]}
        />
      ))}
    </View>
  );
}

export default function EnergiaScreen() {
  const { api } = useApiConfig();
  const status = usePolling(() => api.buscarStatus(), { intervaloMs: 5000, chave: api.baseUrl });
  const historico = usePolling(() => api.listarLeituras({ tipo: 'ENERGIA', limite: 60 }), {
    intervaloMs: 10000,
    chave: api.baseUrl,
  });

  if (status.carregando && !status.dados && !status.erro) {
    return <Carregando mensagem="Carregando consumo elétrico..." />;
  }

  const consumos = status.dados?.consumos ?? [];
  const total = status.dados?.consumoTotalKw ?? null;
  const porSensor = agruparHistorico(historico.dados);
  const erro = status.erro || historico.erro;

  function tentarNovamente() {
    status.atualizar();
    historico.atualizar();
  }

  return (
    <ScrollView style={estilos.tela} contentContainerStyle={estilos.conteudo}>
      <AvisoApiOffline erro={erro} ultimaAtualizacao={status.ultimaAtualizacao} onTentarNovamente={tentarNovamente} />

      <View style={estilos.destaque}>
        <Text style={estilos.destaqueRotulo}>Consumo elétrico total (simulado)</Text>
        <Text style={estilos.destaqueValor}>
          {formatarNumero(total, 2)} <Text style={estilos.destaqueUnidade}>kW</Text>
        </Text>
        <Text style={estilos.destaqueInfo}>
          ≈ {formatarNumero(total, 2)} kWh por hora de operação · R$ {formatarNumero(total === null ? null : total * TARIFA_KWH, 2)}/h
        </Text>
      </View>

      <Text style={estilos.secao}>Consumo por equipamento</Text>
      {consumos.length ? (
        <View style={estilos.grade}>
          {consumos.map((leitura) => (
            <CardIndicador
              key={leitura.sensor}
              titulo={nomeSensor(leitura.sensor)}
              valor={formatarNumero(leitura.valor, 2)}
              unidade="kW"
              icone="flash-outline"
              cor={leitura.valor > LIMITE_CONSUMO_KW ? cores.critico : cores.energia}
              subtitulo={total ? `${formatarNumero((leitura.valor / total) * 100, 0)}% do total` : 'sem consumo'}
            />
          ))}
        </View>
      ) : (
        <Text style={estilos.vazio}>Sem leituras de consumo ainda.</Text>
      )}

      <Text style={estilos.secao}>Histórico recente</Text>
      {Object.keys(porSensor).length ? (
        Object.entries(porSensor).map(([sensor, valores]) => (
          <View key={sensor} style={estilos.cardGrafico}>
            <View style={estilos.linha}>
              <Text style={estilos.nomeGrafico}>{nomeSensor(sensor)}</Text>
              <Text style={estilos.valorGrafico}>máx. {formatarNumero(Math.max(...valores), 2)} kW</Text>
            </View>
            <MiniGrafico valores={valores} />
          </View>
        ))
      ) : (
        <Text style={estilos.vazio}>Sem histórico de consumo ainda.</Text>
      )}
      <Text style={estilos.legenda}>Barras em vermelho: consumo acima de {LIMITE_CONSUMO_KW} kW (sobrecarga).</Text>
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  conteudo: { padding: 16, paddingBottom: 32 },
  destaque: {
    backgroundColor: cores.card,
    borderColor: cores.energia,
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    gap: 4,
  },
  destaqueRotulo: { color: cores.textoSecundario, fontSize: 13 },
  destaqueValor: { color: cores.energia, fontSize: 40, fontWeight: '800' },
  destaqueUnidade: { fontSize: 18, color: cores.textoSecundario, fontWeight: '600' },
  destaqueInfo: { color: cores.textoSecundario, fontSize: 12 },
  secao: { color: cores.texto, fontSize: 16, fontWeight: '700', marginTop: 20, marginBottom: 10 },
  grade: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  vazio: { color: cores.textoSecundario, fontStyle: 'italic' },
  cardGrafico: {
    backgroundColor: cores.card,
    borderColor: cores.borda,
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    gap: 8,
  },
  linha: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  nomeGrafico: { color: cores.texto, fontWeight: '600' },
  valorGrafico: { color: cores.textoSecundario, fontSize: 12 },
  grafico: { height: 60, flexDirection: 'row', alignItems: 'flex-end', gap: 3 },
  barra: { flex: 1, borderTopLeftRadius: 3, borderTopRightRadius: 3 },
  legenda: { color: cores.textoSecundario, fontSize: 11, marginTop: 4 },
});

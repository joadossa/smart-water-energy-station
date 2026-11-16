import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { useApiConfig } from '../context/ApiConfigContext';
import usePolling from '../hooks/usePolling';
import AvisoApiOffline from '../components/AvisoApiOffline';
import BarraNivel from '../components/BarraNivel';
import BotaoAtuador from '../components/BotaoAtuador';
import CardIndicador from '../components/CardIndicador';
import Carregando from '../components/Carregando';
import { cores } from '../theme/cores';
import { formatarHora, formatarNumero, nomeSensor } from '../utils/formatar';

export default function AguaScreen() {
  const { api } = useApiConfig();
  const { dados, erro, carregando, ultimaAtualizacao, atualizar } = usePolling(() => api.buscarStatus(), {
    intervaloMs: 4000,
    chave: api.baseUrl,
  });
  const [acionando, setAcionando] = useState(null); // id do atuador em acionamento
  const [erroAcao, setErroAcao] = useState(null);

  async function alternar(atuador, novoEstado) {
    setAcionando(atuador.id);
    setErroAcao(null);
    try {
      await api.acionarAtuador(atuador.id, novoEstado);
      await atualizar();
    } catch (e) {
      setErroAcao(`Não foi possível acionar ${atuador.codigo}: ${e.message}`);
    } finally {
      setAcionando(null);
    }
  }

  if (carregando && !dados && !erro) {
    return <Carregando mensagem="Carregando dados de água..." />;
  }

  const niveis = dados?.niveis ?? [];
  const vazoes = dados?.vazoes ?? [];
  const atuadores = dados?.atuadores ?? [];

  return (
    <ScrollView style={estilos.tela} contentContainerStyle={estilos.conteudo}>
      <AvisoApiOffline erro={erro} ultimaAtualizacao={ultimaAtualizacao} onTentarNovamente={atualizar} />

      <Text style={estilos.secao}>Níveis dos reservatórios</Text>
      {niveis.length ? (
        niveis.map((leitura) => (
          <BarraNivel
            key={leitura.sensor}
            nome={nomeSensor(leitura.sensor)}
            valor={leitura.valor}
            atualizadoEm={leitura.dataHora}
          />
        ))
      ) : (
        <Text style={estilos.vazio}>Sem leituras de nível ainda.</Text>
      )}

      <Text style={estilos.secao}>Vazão</Text>
      {vazoes.length ? (
        <View style={estilos.grade}>
          {vazoes.map((leitura) => (
            <CardIndicador
              key={leitura.sensor}
              titulo={`Vazão de ${nomeSensor(leitura.sensor).toLowerCase()}`}
              valor={formatarNumero(leitura.valor)}
              unidade={leitura.unidade}
              icone={leitura.sensor === 'ENTRADA' ? 'arrow-down-circle-outline' : 'arrow-up-circle-outline'}
              cor={cores.agua}
              subtitulo={`às ${formatarHora(leitura.dataHora)}`}
            />
          ))}
        </View>
      ) : (
        <Text style={estilos.vazio}>Sem leituras de vazão ainda.</Text>
      )}

      <Text style={estilos.secao}>Bombas e válvulas</Text>
      {erroAcao ? <Text style={estilos.erroAcao}>{erroAcao}</Text> : null}
      {atuadores.length ? (
        atuadores.map((atuador) => (
          <BotaoAtuador
            key={atuador.id}
            atuador={atuador}
            onAlternar={erro ? null : alternar}
            ocupado={acionando === atuador.id}
          />
        ))
      ) : (
        <Text style={estilos.vazio}>Nenhum atuador cadastrado.</Text>
      )}
      {erro && atuadores.length ? (
        <Text style={estilos.vazio}>Acionamento desabilitado enquanto a API estiver fora do ar.</Text>
      ) : null}
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  conteudo: { padding: 16, paddingBottom: 32 },
  secao: { color: cores.texto, fontSize: 16, fontWeight: '700', marginTop: 12, marginBottom: 10 },
  grade: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  vazio: { color: cores.textoSecundario, fontStyle: 'italic', marginBottom: 8 },
  erroAcao: { color: cores.critico, marginBottom: 8 },
});

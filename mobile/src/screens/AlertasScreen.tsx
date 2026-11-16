import React, { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { useApiConfig } from '../context/ApiConfigContext';
import usePolling from '../hooks/usePolling';
import AvisoApiOffline from '../components/AvisoApiOffline';
import AlertaItem from '../components/AlertaItem';
import Carregando from '../components/Carregando';
import { cores } from '../theme/cores';

const FILTROS = [
  { valor: 'ABERTAS', rotulo: 'Abertas' },
  { valor: 'TODAS', rotulo: 'Todas' },
  { valor: 'RESOLVIDAS', rotulo: 'Resolvidas' },
];

export default function AlertasScreen() {
  const { api } = useApiConfig();
  const [filtro, setFiltro] = useState('ABERTAS');
  const { dados, erro, carregando, ultimaAtualizacao, atualizar } = usePolling(() => api.listarFalhas(filtro), {
    intervaloMs: 5000,
    chave: `${api.baseUrl}|${filtro}`,
  });
  const [resolvendo, setResolvendo] = useState(null); // id da falha em resolução
  const [erroAcao, setErroAcao] = useState(null);

  async function resolver(falha) {
    setResolvendo(falha.id);
    setErroAcao(null);
    try {
      await api.resolverFalha(falha.id);
      await atualizar();
    } catch (e) {
      setErroAcao(`Não foi possível resolver a falha ${falha.id}: ${e.message}`);
    } finally {
      setResolvendo(null);
    }
  }

  return (
    <View style={estilos.tela}>
      <View style={estilos.filtros}>
        {FILTROS.map((opcao) => {
          const ativo = filtro === opcao.valor;
          return (
            <Pressable
              key={opcao.valor}
              onPress={() => setFiltro(opcao.valor)}
              style={[estilos.chip, ativo && estilos.chipAtivo]}
            >
              <Text style={[estilos.chipTexto, ativo && estilos.chipTextoAtivo]}>{opcao.rotulo}</Text>
            </Pressable>
          );
        })}
      </View>

      <View style={estilos.topo}>
        <AvisoApiOffline erro={erro} ultimaAtualizacao={ultimaAtualizacao} onTentarNovamente={atualizar} />
        {erroAcao ? <Text style={estilos.erroAcao}>{erroAcao}</Text> : null}
      </View>

      {carregando && !dados && !erro ? (
        <Carregando mensagem="Carregando alertas..." />
      ) : (
        <FlatList
          data={dados ?? []}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={estilos.lista}
          renderItem={({ item }) => (
            <AlertaItem falha={item} onResolver={erro ? null : resolver} resolvendo={resolvendo === item.id} />
          )}
          ListEmptyComponent={
            <Text style={estilos.vazio}>
              {filtro === 'ABERTAS' ? 'Nenhuma falha aberta. Tudo operando normalmente.' : 'Nenhuma falha encontrada.'}
            </Text>
          }
          refreshing={false}
          onRefresh={atualizar}
        />
      )}
    </View>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  filtros: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 4 },
  chip: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: cores.borda,
    backgroundColor: cores.card,
  },
  chipAtivo: { backgroundColor: cores.primaria, borderColor: cores.primaria },
  chipTexto: { color: cores.textoSecundario, fontWeight: '600' },
  chipTextoAtivo: { color: cores.texto },
  topo: { paddingHorizontal: 16, paddingTop: 8 },
  erroAcao: { color: cores.critico, marginBottom: 8 },
  lista: { padding: 16, paddingTop: 4, paddingBottom: 32 },
  vazio: { color: cores.textoSecundario, fontStyle: 'italic', textAlign: 'center', marginTop: 24 },
});

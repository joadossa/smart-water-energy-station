import React, { useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { useApiConfig } from '../context/ApiConfigContext';
import { useResumo } from '../context/ResumoContext';
import usePolling from '../hooks/usePolling';
import useAcoesCabecalho from '../hooks/useAcoesCabecalho';
import AlertaItem from '../components/AlertaItem';
import AvisoApiOffline from '../components/AvisoApiOffline';
import Carregando from '../components/Carregando';
import MensagemResultado from '../components/MensagemResultado';
import { cores, fontes, raio } from '../theme/cores';
import type { Falha, FiltroFalhas } from '../types/api';
import { formatarHora } from '../utils/formatar';
import type { PropsAba } from '../navigation/tipos';

const FILTROS: { valor: FiltroFalhas; rotulo: string }[] = [
  { valor: 'ABERTAS', rotulo: 'Abertas' },
  { valor: 'TODAS', rotulo: 'Todas' },
  { valor: 'RESOLVIDAS', rotulo: 'Resolvidas' },
];

export default function AlertasScreen({ navigation }: PropsAba<'Alertas'>) {
  const { api } = useApiConfig();
  const { definirFalhasAbertas } = useResumo();
  const [filtro, setFiltro] = useState<FiltroFalhas>('ABERTAS');
  const falhas = usePolling(() => api.listarFalhas(filtro), { intervaloMs: 5000, chave: `${api.baseUrl}|${filtro}` });
  const [resolvendo, setResolvendo] = useState<number | null>(null);
  const [resultado, setResultado] = useState<{ ok: boolean; mensagem: string } | null>(null);

  useAcoesCabecalho(falhas.atualizar);

  useEffect(() => {
    if (filtro === 'ABERTAS' && falhas.dados) definirFalhasAbertas(falhas.dados.length);
  }, [filtro, falhas.dados, definirFalhasAbertas]);

  async function resolver(falha: Falha) {
    setResolvendo(falha.id);
    setResultado(null);
    try {
      const atualizada = await api.resolverFalha(falha.id);
      setResultado(
        atualizada.resolvida
          ? { ok: true, mensagem: `Falha #${falha.id} (${falha.codigo}) resolvida às ${formatarHora(atualizada.resolvidaEm)}: confirmado pelo servidor.` }
          : { ok: false, mensagem: `O servidor não confirmou a resolução da falha #${falha.id}.` },
      );
    } catch (e) {
      setResultado({ ok: false, mensagem: `Não foi possível resolver a falha #${falha.id}: ${e instanceof Error ? e.message : String(e)}` });
    } finally {
      setResolvendo(null);
      await falhas.atualizar();
    }
  }

  const lista = falhas.dados ?? [];
  const abertas = lista.filter((f) => !f.resolvida).length;

  return (
    <View style={estilos.tela}>
      <View style={estilos.filtros}>
        {FILTROS.map((opcao) => {
          const ativo = filtro === opcao.valor;
          return (
            <Pressable
              key={opcao.valor}
              accessibilityRole="button"
              accessibilityState={{ selected: ativo }}
              onPress={() => setFiltro(opcao.valor)}
              style={[estilos.chip, ativo && estilos.chipAtivo]}
            >
              <Text style={[estilos.chipTexto, ativo && estilos.chipTextoAtivo]}>{opcao.rotulo}</Text>
            </Pressable>
          );
        })}
      </View>

      <View style={estilos.topo}>
        <AvisoApiOffline erro={falhas.erro} ultimaAtualizacao={falhas.ultimaAtualizacao} onTentarNovamente={falhas.atualizar} />
        <MensagemResultado resultado={resultado} onFechar={() => setResultado(null)} />
        {falhas.dados ? (
          <Text style={estilos.resumo}>
            {lista.length} {lista.length === 1 ? 'falha' : 'falhas'} · {abertas} {abertas === 1 ? 'aberta' : 'abertas'} · toque para ver os detalhes
          </Text>
        ) : null}
      </View>

      {falhas.carregando && !falhas.dados && !falhas.erro ? (
        <Carregando mensagem="Carregando alertas..." />
      ) : (
        <FlatList
          data={lista}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={estilos.lista}
          renderItem={({ item }) => (
            <AlertaItem
              falha={item}
              onPress={(falha) => navigation.navigate('DetalheFalha', { falha })}
              onResolver={falhas.erro ? null : resolver}
              resolvendo={resolvendo === item.id}
            />
          )}
          ListEmptyComponent={
            <Text style={estilos.vazio}>
              {filtro === 'ABERTAS' ? 'Nenhuma falha aberta. Tudo operando normalmente.' : 'Nenhuma falha encontrada.'}
            </Text>
          }
          refreshing={false}
          onRefresh={() => void falhas.atualizar()}
        />
      )}
    </View>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  filtros: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 4 },
  chip: {
    paddingVertical: 7,
    paddingHorizontal: 16,
    borderRadius: raio.pilula,
    borderWidth: 1,
    borderColor: cores.borda,
    backgroundColor: cores.card,
  },
  chipAtivo: { backgroundColor: cores.ciano, borderColor: cores.ciano },
  chipTexto: { color: cores.textoSecundario, fontFamily: fontes.seminegrito },
  chipTextoAtivo: { color: cores.fundo },
  topo: { paddingHorizontal: 16, paddingTop: 8, gap: 8 },
  resumo: { color: cores.textoSecundario, fontFamily: fontes.regular, fontSize: 12 },
  lista: { padding: 16, paddingTop: 8, paddingBottom: 32 },
  vazio: { color: cores.textoSecundario, fontFamily: fontes.regular, fontStyle: 'italic', textAlign: 'center', marginTop: 24 },
});

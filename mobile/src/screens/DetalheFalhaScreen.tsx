import React, { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useApiConfig } from '../context/ApiConfigContext';
import usePolling from '../hooks/usePolling';
import AvisoApiOffline from '../components/AvisoApiOffline';
import ConfirmacaoModal from '../components/ConfirmacaoModal';
import EtiquetaStatus from '../components/EtiquetaStatus';
import MensagemResultado from '../components/MensagemResultado';
import { cores, coresSeveridade, fontes, raio } from '../theme/cores';
import { formatarDataHora, formatarHora, nomeSensor } from '../utils/formatar';
import type { PropsPilha } from '../navigation/tipos';

const DESCRICAO_SEVERIDADE = {
  BAIXA: 'Baixa: acompanhar',
  MEDIA: 'Média: verificar em breve',
  ALTA: 'Alta: agir logo',
  CRITICA: 'Crítica: ação imediata',
} as const;

export default function DetalheFalhaScreen({ route }: PropsPilha<'DetalheFalha'>) {
  const { api } = useApiConfig();
  const inicial = route.params.falha;
  const consulta = usePolling(() => api.buscarFalha(inicial.id), { intervaloMs: 10000, chave: `${api.baseUrl}|${inicial.id}` });
  const falha = consulta.dados ?? inicial;
  const [confirmando, setConfirmando] = useState(false);
  const [resolvendo, setResolvendo] = useState(false);
  const [resultado, setResultado] = useState<{ ok: boolean; mensagem: string } | null>(null);
  const cor = coresSeveridade[falha.severidade] ?? cores.laranja;

  async function resolver() {
    setResolvendo(true);
    setResultado(null);
    try {
      const atualizada = await api.resolverFalha(falha.id);
      setResultado(
        atualizada.resolvida
          ? { ok: true, mensagem: `Falha resolvida às ${formatarHora(atualizada.resolvidaEm)}: confirmado pelo servidor.` }
          : { ok: false, mensagem: 'O servidor não confirmou a resolução.' },
      );
    } catch (e) {
      setResultado({ ok: false, mensagem: `Não foi possível resolver: ${e instanceof Error ? e.message : String(e)}` });
    } finally {
      setResolvendo(false);
      setConfirmando(false);
      await consulta.atualizar();
    }
  }

  return (
    <>
      <ScrollView style={estilos.tela} contentContainerStyle={estilos.conteudo}>
        <AvisoApiOffline erro={consulta.erro} ultimaAtualizacao={consulta.ultimaAtualizacao} onTentarNovamente={consulta.atualizar} />
        <MensagemResultado resultado={resultado} onFechar={() => setResultado(null)} />

        <View style={[estilos.card, { borderLeftColor: cor }]}>
          <View style={estilos.etiquetas}>
            <EtiquetaStatus texto={falha.severidade} cor={cor} />
            <EtiquetaStatus
              texto={falha.resolvida ? 'Resolvida' : 'Aberta'}
              cor={falha.resolvida ? cores.verde : cores.vermelho}
              icone={falha.resolvida ? 'checkmark-circle' : 'alert-circle'}
            />
          </View>
          <Text style={estilos.codigo}>{falha.codigo}</Text>
          <Text style={estilos.descricao}>{falha.descricao}</Text>
        </View>

        <View style={estilos.cardDetalhes}>
          <Linha rotulo="Origem" valor={`${nomeSensor(falha.origem)} (${falha.origem})`} />
          <Linha rotulo="Severidade" valor={DESCRICAO_SEVERIDADE[falha.severidade] ?? falha.severidade} />
          <Linha rotulo="Aberta em" valor={formatarDataHora(falha.dataHora)} />
          <Linha rotulo="Situação" valor={falha.resolvida ? 'Resolvida' : 'Aberta'} />
          <Linha rotulo="Resolvida em" valor={falha.resolvidaEm ? formatarDataHora(falha.resolvidaEm) : '—'} />
          <Linha rotulo="Identificador" valor={`#${falha.id}`} ultima />
        </View>

        {!falha.resolvida ? (
          <Pressable
            accessibilityRole="button"
            onPress={() => setConfirmando(true)}
            disabled={Boolean(consulta.erro) || resolvendo}
            style={({ pressed }) => [estilos.botao, (pressed || resolvendo || Boolean(consulta.erro)) && { opacity: 0.5 }]}
          >
            {resolvendo ? (
              <ActivityIndicator color={cores.fundo} />
            ) : (
              <>
                <Ionicons name="checkmark-done" size={18} color={cores.fundo} />
                <Text style={estilos.botaoTexto}>Marcar como resolvida</Text>
              </>
            )}
          </Pressable>
        ) : null}

        <Text style={estilos.nota}>
          Falhas automáticas voltam a ser abertas se a condição continuar (por exemplo, nível ainda abaixo do mínimo).
        </Text>
      </ScrollView>

      <ConfirmacaoModal
        visivel={confirmando}
        titulo="Resolver falha?"
        mensagem={`A falha ${falha.codigo} (${nomeSensor(falha.origem)}) será marcada como resolvida no servidor.`}
        textoConfirmar="Resolver"
        carregando={resolvendo}
        onConfirmar={() => void resolver()}
        onCancelar={() => setConfirmando(false)}
      />
    </>
  );
}

function Linha({ rotulo, valor, ultima = false }: { rotulo: string; valor: string; ultima?: boolean }) {
  return (
    <View style={[estilos.linha, !ultima && estilos.linhaDivisoria]}>
      <Text style={estilos.rotulo}>{rotulo}</Text>
      <Text style={estilos.valor}>{valor}</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  conteudo: { padding: 16, paddingBottom: 32, gap: 12 },
  card: {
    backgroundColor: cores.cardElevado,
    borderColor: cores.borda,
    borderWidth: 1,
    borderLeftWidth: 4,
    borderRadius: raio.card,
    padding: 16,
    gap: 8,
  },
  etiquetas: { flexDirection: 'row', gap: 8 },
  codigo: { color: cores.texto, fontFamily: fontes.titulo, fontSize: 20 },
  descricao: { color: cores.texto, fontFamily: fontes.regular, fontSize: 14, lineHeight: 20 },
  cardDetalhes: { backgroundColor: cores.card, borderColor: cores.borda, borderWidth: 1, borderRadius: raio.card, paddingHorizontal: 16 },
  linha: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, paddingVertical: 12 },
  linhaDivisoria: { borderBottomWidth: 1, borderBottomColor: cores.borda },
  rotulo: { color: cores.textoSecundario, fontFamily: fontes.media, fontSize: 13 },
  valor: { flex: 1, textAlign: 'right', color: cores.texto, fontFamily: fontes.regular, fontSize: 13 },
  botao: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: cores.ciano,
    borderRadius: raio.controle,
    paddingVertical: 13,
  },
  botaoTexto: { color: cores.fundo, fontFamily: fontes.seminegrito, fontSize: 15 },
  nota: { color: cores.textoFraco, fontFamily: fontes.regular, fontSize: 11, lineHeight: 16 },
});

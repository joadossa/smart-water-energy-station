import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import EtiquetaStatus from './EtiquetaStatus';
import { cores, coresSeveridade, fontes, raio } from '../theme/cores';
import type { Falha } from '../types/api';
import { formatarDataHora, nomeSensor } from '../utils/formatar';

interface Props {
  falha: Falha;
  /** Abre os detalhes da falha. */
  onPress?: (falha: Falha) => void;
  /** Resolve a falha. Se nulo (ex.: API fora do ar), o botão não aparece. */
  onResolver?: ((falha: Falha) => void) | null;
  resolvendo?: boolean;
}

/** Item da lista de falhas: abertas em destaque, resolvidas atenuadas. */
export default function AlertaItem({ falha, onPress, onResolver, resolvendo = false }: Props) {
  const cor = coresSeveridade[falha.severidade] ?? cores.laranja;

  return (
    <Pressable
      onPress={onPress ? () => onPress(falha) : undefined}
      disabled={!onPress}
      style={({ pressed }) => [
        estilos.card,
        { borderLeftColor: cor },
        falha.resolvida ? estilos.resolvida : estilos.aberta,
        pressed && { opacity: 0.85 },
      ]}
    >
      <View style={estilos.linha}>
        <EtiquetaStatus texto={falha.severidade} cor={cor} />
        <EtiquetaStatus
          texto={falha.resolvida ? 'Resolvida' : 'Aberta'}
          cor={falha.resolvida ? cores.verde : cores.vermelho}
          icone={falha.resolvida ? 'checkmark-circle' : 'alert-circle'}
        />
        <Text style={estilos.hora}>{formatarDataHora(falha.dataHora)}</Text>
      </View>

      <Text style={estilos.codigo}>{falha.codigo}</Text>
      <Text style={estilos.descricao}>{falha.descricao}</Text>

      <View style={estilos.linha}>
        <Text style={estilos.origem}>Origem: {nomeSensor(falha.origem)}</Text>
        {!falha.resolvida && onResolver ? (
          <Pressable
            onPress={() => onResolver(falha)}
            disabled={resolvendo}
            style={({ pressed }) => [estilos.botao, (pressed || resolvendo) && { opacity: 0.7 }]}
          >
            {resolvendo ? <ActivityIndicator size="small" color={cores.fundo} /> : <Text style={estilos.botaoTexto}>Resolver</Text>}
          </Pressable>
        ) : onPress ? (
          <Ionicons name="chevron-forward" size={18} color={cores.textoFraco} />
        ) : null}
      </View>
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  card: {
    backgroundColor: cores.card,
    borderColor: cores.borda,
    borderWidth: 1,
    borderLeftWidth: 4,
    borderRadius: raio.card,
    padding: 12,
    gap: 6,
    marginBottom: 10,
  },
  aberta: { backgroundColor: cores.cardElevado },
  resolvida: { opacity: 0.7 },
  linha: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  hora: { color: cores.textoSecundario, fontFamily: fontes.regular, fontSize: 11, marginLeft: 'auto' },
  codigo: { color: cores.texto, fontFamily: fontes.titulo, fontSize: 15 },
  descricao: { color: cores.texto, fontFamily: fontes.regular, fontSize: 13, lineHeight: 18 },
  origem: { color: cores.textoSecundario, fontFamily: fontes.regular, fontSize: 12, flex: 1 },
  botao: { backgroundColor: cores.ciano, borderRadius: raio.controle, paddingVertical: 7, paddingHorizontal: 12, minWidth: 84, alignItems: 'center' },
  botaoTexto: { color: cores.fundo, fontFamily: fontes.seminegrito, fontSize: 13 },
});

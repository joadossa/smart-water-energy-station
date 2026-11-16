import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { cores, fontes } from '../theme/cores';

/** Título do cabeçalho com o ícone de gota da estação. */
export default function TituloCabecalho({ titulo }: { titulo: string }) {
  return (
    <View style={estilos.linha}>
      <Ionicons name="water" size={20} color={cores.ciano} />
      <Text style={estilos.titulo} numberOfLines={1}>
        {titulo}
      </Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  linha: { flexDirection: 'row', alignItems: 'center', gap: 8, flexShrink: 1 },
  titulo: { color: cores.texto, fontFamily: fontes.titulo, fontSize: 17, flexShrink: 1 },
});

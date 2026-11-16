import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { cores } from '../theme/cores';

/** Card com um indicador numérico (ex.: "42,0 L/min"). */
export default function CardIndicador({ titulo, valor, unidade, icone, cor = cores.primaria, subtitulo, style }) {
  return (
    <View style={[estilos.card, style]}>
      <View style={estilos.topo}>
        {icone ? <Ionicons name={icone} size={18} color={cor} /> : null}
        <Text style={estilos.titulo} numberOfLines={1}>
          {titulo}
        </Text>
      </View>
      <Text style={[estilos.valor, { color: cor }]}>
        {valor}
        {unidade ? <Text style={estilos.unidade}> {unidade}</Text> : null}
      </Text>
      {subtitulo ? <Text style={estilos.subtitulo}>{subtitulo}</Text> : null}
    </View>
  );
}

const estilos = StyleSheet.create({
  card: {
    flexGrow: 1,
    flexBasis: '45%',
    backgroundColor: cores.card,
    borderColor: cores.borda,
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    gap: 6,
  },
  topo: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  titulo: { color: cores.textoSecundario, fontSize: 13, flexShrink: 1 },
  valor: { fontSize: 26, fontWeight: '700' },
  unidade: { fontSize: 14, fontWeight: '500', color: cores.textoSecundario },
  subtitulo: { color: cores.textoSecundario, fontSize: 12 },
});

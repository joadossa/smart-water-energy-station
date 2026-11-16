import React from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { cores, fontes, raio } from '../theme/cores';

type NomeIcone = React.ComponentProps<typeof Ionicons>['name'];

interface Props {
  titulo: string;
  valor: string;
  unidade?: string;
  icone?: NomeIcone;
  cor?: string;
  subtitulo?: string;
  style?: StyleProp<ViewStyle>;
}

/** Card com um indicador numérico (ex.: "24,6 L/min"). */
export default function CardIndicador({ titulo, valor, unidade, icone, cor = cores.ciano, subtitulo, style }: Props) {
  return (
    <View style={[estilos.card, style]}>
      <View style={estilos.topo}>
        {icone ? <Ionicons name={icone} size={16} color={cor} /> : null}
        <Text style={estilos.titulo} numberOfLines={1}>
          {titulo}
        </Text>
      </View>
      <Text style={estilos.valor}>
        <Text style={{ color: cor }}>{valor}</Text>
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
    borderRadius: raio.card,
    padding: 14,
    gap: 6,
  },
  topo: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  titulo: { color: cores.textoSecundario, fontFamily: fontes.media, fontSize: 12, flexShrink: 1 },
  valor: { fontFamily: fontes.titulo, fontSize: 26 },
  unidade: { fontFamily: fontes.media, fontSize: 13, color: cores.textoSecundario },
  subtitulo: { color: cores.textoSecundario, fontFamily: fontes.regular, fontSize: 12 },
});

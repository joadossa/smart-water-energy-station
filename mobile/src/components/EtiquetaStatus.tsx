import React from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { comAlfa, fontes, raio } from '../theme/cores';

type NomeIcone = React.ComponentProps<typeof Ionicons>['name'];

interface Props {
  texto: string;
  cor: string;
  icone?: NomeIcone;
  style?: StyleProp<ViewStyle>;
}

/** Pílula de status (ex.: "Normal", "Nível baixo", "Ligada"). */
export default function EtiquetaStatus({ texto, cor, icone, style }: Props) {
  return (
    <View style={[estilos.pilula, { backgroundColor: comAlfa(cor, 0.15), borderColor: comAlfa(cor, 0.45) }, style]}>
      {icone ? <Ionicons name={icone} size={12} color={cor} /> : null}
      <Text style={[estilos.texto, { color: cor }]} numberOfLines={1}>
        {texto}
      </Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  pilula: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
    borderWidth: 1,
    borderRadius: raio.pilula,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  texto: { fontFamily: fontes.seminegrito, fontSize: 11 },
});

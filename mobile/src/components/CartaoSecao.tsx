import React, { type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { cores, fontes, raio } from '../theme/cores';

interface Props {
  titulo: string;
  subtitulo?: string;
  acao?: { rotulo: string; onPress: () => void };
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}

/** Card de seção com título, subtítulo opcional e um link de ação à direita. */
export default function CartaoSecao({ titulo, subtitulo, acao, children, style }: Props) {
  return (
    <View style={[estilos.card, style]}>
      <View style={estilos.cabecalho}>
        <View style={estilos.textos}>
          <Text style={estilos.titulo}>{titulo}</Text>
          {subtitulo ? <Text style={estilos.subtitulo}>{subtitulo}</Text> : null}
        </View>
        {acao ? (
          <Pressable onPress={acao.onPress} hitSlop={8}>
            <Text style={estilos.acao}>{acao.rotulo}</Text>
          </Pressable>
        ) : null}
      </View>
      {children}
    </View>
  );
}

const estilos = StyleSheet.create({
  card: {
    backgroundColor: cores.card,
    borderColor: cores.borda,
    borderWidth: 1,
    borderRadius: raio.card,
    padding: 14,
    gap: 10,
  },
  cabecalho: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 },
  textos: { flex: 1, gap: 2 },
  titulo: { color: cores.texto, fontFamily: fontes.titulo, fontSize: 16 },
  subtitulo: { color: cores.textoSecundario, fontFamily: fontes.regular, fontSize: 12 },
  acao: { color: cores.ciano, fontFamily: fontes.seminegrito, fontSize: 13 },
});

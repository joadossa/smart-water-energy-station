import React from 'react';
import { ActivityIndicator, Image, StyleSheet, Text, View } from 'react-native';

import { cores, fontes } from '../theme/cores';
import { logoGota, PROPORCAO_GOTA } from '../theme/imagens';

export default function Carregando({ mensagem = 'Carregando...' }: { mensagem?: string }) {
  return (
    <View style={estilos.container}>
      <Image source={logoGota} resizeMode="contain" style={{ height: 56, width: 56 * PROPORCAO_GOTA }} />
      <ActivityIndicator size="small" color={cores.ciano} />
      <Text style={estilos.texto}>{mensagem}</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  container: { flex: 1, backgroundColor: cores.fundo, alignItems: 'center', justifyContent: 'center', gap: 12 },
  texto: { color: cores.textoSecundario, fontFamily: fontes.regular },
});

import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { cores } from '../theme/cores';

export default function Carregando({ mensagem = 'Carregando...' }) {
  return (
    <View style={estilos.container}>
      <ActivityIndicator size="large" color={cores.primaria} />
      <Text style={estilos.texto}>{mensagem}</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  container: { flex: 1, backgroundColor: cores.fundo, alignItems: 'center', justifyContent: 'center', gap: 12 },
  texto: { color: cores.textoSecundario },
});

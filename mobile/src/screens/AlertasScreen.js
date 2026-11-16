import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { cores } from '../theme/cores';

// Tela provisória: lista de falhas é implementada nos próximos commits
export default function AlertasScreen() {
  return (
    <View style={estilos.container}>
      <Text style={estilos.texto}>Alertas de falha em construção</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  container: { flex: 1, backgroundColor: cores.fundo, alignItems: 'center', justifyContent: 'center', padding: 24 },
  texto: { color: cores.textoSecundario },
});

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { cores } from '../theme/cores';

// Tela provisória: consumo elétrico simulado é implementado nos próximos commits
export default function EnergiaScreen() {
  return (
    <View style={estilos.container}>
      <Text style={estilos.texto}>Consumo elétrico em construção</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  container: { flex: 1, backgroundColor: cores.fundo, alignItems: 'center', justifyContent: 'center', padding: 24 },
  texto: { color: cores.textoSecundario },
});

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { cores } from '../theme/cores';

// Tela provisória: níveis, vazão e atuadores são implementados nos próximos commits
export default function AguaScreen() {
  return (
    <View style={estilos.container}>
      <Text style={estilos.texto}>Níveis, vazão e bombas em construção</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  container: { flex: 1, backgroundColor: cores.fundo, alignItems: 'center', justifyContent: 'center', padding: 24 },
  texto: { color: cores.textoSecundario },
});

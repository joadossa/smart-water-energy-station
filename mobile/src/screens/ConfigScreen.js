import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { cores } from '../theme/cores';

// Tela provisória: configuração da URL da API é implementada no próximo commit
export default function ConfigScreen() {
  return (
    <View style={estilos.container}>
      <Text style={estilos.texto}>Configurações em construção</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  container: { flex: 1, backgroundColor: cores.fundo, alignItems: 'center', justifyContent: 'center', padding: 24 },
  texto: { color: cores.textoSecundario },
});

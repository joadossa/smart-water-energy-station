import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { cores } from '../theme/cores';

// Tela provisória: o painel completo é implementado nos próximos commits
export default function PainelScreen() {
  return (
    <View style={estilos.container}>
      <Text style={estilos.titulo}>Smart Water & Energy Station</Text>
      <Text style={estilos.texto}>Painel geral em construção</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  container: { flex: 1, backgroundColor: cores.fundo, alignItems: 'center', justifyContent: 'center', padding: 24 },
  titulo: { color: cores.texto, fontSize: 20, fontWeight: '700', marginBottom: 8 },
  texto: { color: cores.textoSecundario },
});

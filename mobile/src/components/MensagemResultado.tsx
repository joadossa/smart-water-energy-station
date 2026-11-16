import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { comAlfa, cores, fontes, raio } from '../theme/cores';

interface Props {
  resultado: { ok: boolean; mensagem: string } | null;
  onFechar?: () => void;
}

/** Retorno de um comando enviado à API (sucesso confirmado pelo servidor ou erro). */
export default function MensagemResultado({ resultado, onFechar }: Props) {
  if (!resultado) return null;
  const cor = resultado.ok ? cores.verde : cores.vermelho;
  return (
    <View style={[estilos.caixa, { borderColor: comAlfa(cor, 0.6), backgroundColor: comAlfa(cor, 0.1) }]}>
      <Ionicons name={resultado.ok ? 'checkmark-circle' : 'close-circle'} size={20} color={cor} />
      <Text style={estilos.texto}>{resultado.mensagem}</Text>
      {onFechar ? (
        <Pressable accessibilityLabel="Fechar mensagem" hitSlop={8} onPress={onFechar}>
          <Ionicons name="close" size={18} color={cores.textoSecundario} />
        </Pressable>
      ) : null}
    </View>
  );
}

const estilos = StyleSheet.create({
  caixa: { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderRadius: raio.controle, padding: 10 },
  texto: { flex: 1, color: cores.texto, fontFamily: fontes.regular, fontSize: 13, lineHeight: 18 },
});

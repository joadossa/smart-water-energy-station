import React from 'react';
import { ActivityIndicator, Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { cores, fontes, raio } from '../theme/cores';

interface Props {
  visivel: boolean;
  titulo: string;
  mensagem: string;
  textoConfirmar?: string;
  corConfirmar?: string;
  carregando?: boolean;
  onConfirmar: () => void;
  onCancelar: () => void;
}

/** Janela de confirmação (funciona no Android, iOS e navegador). */
export default function ConfirmacaoModal({
  visivel,
  titulo,
  mensagem,
  textoConfirmar = 'Confirmar',
  corConfirmar = cores.ciano,
  carregando = false,
  onConfirmar,
  onCancelar,
}: Props) {
  return (
    <Modal visible={visivel} transparent animationType="fade" onRequestClose={onCancelar}>
      <View style={estilos.fundo}>
        <View style={estilos.caixa}>
          <Text style={estilos.titulo}>{titulo}</Text>
          <Text style={estilos.mensagem}>{mensagem}</Text>
          <View style={estilos.botoes}>
            <Pressable onPress={onCancelar} disabled={carregando} style={({ pressed }) => [estilos.botao, estilos.cancelar, pressed && { opacity: 0.7 }]}>
              <Text style={estilos.cancelarTexto}>Cancelar</Text>
            </Pressable>
            <Pressable
              onPress={onConfirmar}
              disabled={carregando}
              style={({ pressed }) => [estilos.botao, { backgroundColor: corConfirmar }, (pressed || carregando) && { opacity: 0.7 }]}
            >
              {carregando ? <ActivityIndicator color={cores.fundo} /> : <Text style={estilos.confirmarTexto}>{textoConfirmar}</Text>}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const estilos = StyleSheet.create({
  fundo: { flex: 1, backgroundColor: 'rgba(3, 7, 15, 0.75)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  caixa: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: cores.cardElevado,
    borderColor: cores.borda,
    borderWidth: 1,
    borderRadius: raio.card,
    padding: 20,
    gap: 10,
  },
  titulo: { color: cores.texto, fontFamily: fontes.titulo, fontSize: 18 },
  mensagem: { color: cores.textoSecundario, fontFamily: fontes.regular, fontSize: 14, lineHeight: 20 },
  botoes: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 8 },
  botao: { minWidth: 110, paddingVertical: 11, paddingHorizontal: 16, borderRadius: raio.controle, alignItems: 'center' },
  cancelar: { backgroundColor: cores.card, borderColor: cores.borda, borderWidth: 1 },
  cancelarTexto: { color: cores.texto, fontFamily: fontes.seminegrito },
  confirmarTexto: { color: cores.fundo, fontFamily: fontes.seminegrito },
});

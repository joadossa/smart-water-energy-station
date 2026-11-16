import React, { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { cores } from '../theme/cores';

interface Props {
  /** Se informado, mostra o botão de atualizar (busca os dados na API na hora). */
  onAtualizar?: () => unknown;
}

/** Botões do lado direito do cabeçalho: atualizar e configurações. */
export default function AcoesCabecalho({ onAtualizar }: Props) {
  const navigation = useNavigation();
  const [atualizando, setAtualizando] = useState(false);

  async function atualizar() {
    if (!onAtualizar || atualizando) return;
    setAtualizando(true);
    try {
      await onAtualizar();
    } finally {
      setAtualizando(false);
    }
  }

  return (
    <View style={estilos.linha}>
      {onAtualizar ? (
        <Pressable accessibilityRole="button" accessibilityLabel="Atualizar dados" hitSlop={10} onPress={atualizar} style={estilos.botao}>
          {atualizando ? <ActivityIndicator size="small" color={cores.ciano} /> : <Ionicons name="refresh" size={21} color={cores.texto} />}
        </Pressable>
      ) : null}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Configurações"
        hitSlop={10}
        onPress={() => navigation.navigate('Config')}
        style={estilos.botao}
      >
        <Ionicons name="settings-outline" size={21} color={cores.texto} />
      </Pressable>
    </View>
  );
}

const estilos = StyleSheet.create({
  linha: { flexDirection: 'row', alignItems: 'center', gap: 4, marginRight: 8 },
  botao: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center', borderRadius: 18 },
});

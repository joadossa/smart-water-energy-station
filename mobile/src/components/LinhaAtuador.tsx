import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import EtiquetaStatus from './EtiquetaStatus';
import { cores, fontes } from '../theme/cores';
import type { Atuador } from '../types/api';
import { corDoEstado, nomeAtuador, rotuloEstado } from '../utils/atuadores';

interface Props {
  atuador: Atuador;
}

/** Linha compacta (só leitura) com ícone, nome e estado do atuador; usada no Painel. */
export default function LinhaAtuador({ atuador }: Props) {
  const ligado = atuador.estado === 'LIGADO';
  const cor = corDoEstado(atuador.estado);

  return (
    <View style={estilos.linha}>
      <Ionicons name={atuador.tipo === 'VALVULA' ? 'git-compare-outline' : 'cog-outline'} size={20} color={cor} />
      <Text style={estilos.nome} numberOfLines={1}>
        {nomeAtuador(atuador)}
      </Text>
      <EtiquetaStatus texto={rotuloEstado(atuador, atuador.estado)} cor={cor} icone={ligado ? 'checkmark-circle' : 'close-circle'} />
    </View>
  );
}

const estilos = StyleSheet.create({
  linha: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  nome: { flex: 1, color: cores.texto, fontFamily: fontes.media, fontSize: 14 },
});

import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { cores } from '../theme/cores';
import { formatarNumero } from '../utils/formatar';

/**
 * Card de um atuador com botão para acionar.
 * Bomba: Ligar/Desligar. Válvula: Abrir/Fechar (LIGADO = aberta).
 * Se `onAlternar` for nulo (ex.: API fora do ar), o botão fica desabilitado.
 */
export default function BotaoAtuador({ atuador, onAlternar, ocupado = false }) {
  const ligado = atuador.estado === 'LIGADO';
  const valvula = atuador.tipo === 'VALVULA';

  const rotuloEstado = valvula ? (ligado ? 'Aberta' : 'Fechada') : ligado ? 'Ligada' : 'Desligada';
  const acao = valvula ? (ligado ? 'Fechar' : 'Abrir') : ligado ? 'Desligar' : 'Ligar';
  const corEstado = ligado ? cores.ok : cores.textoSecundario;
  const desabilitado = ocupado || !onAlternar;

  return (
    <View style={estilos.card}>
      <Ionicons name={valvula ? 'git-compare-outline' : 'cog-outline'} size={28} color={corEstado} />

      <View style={estilos.info}>
        <Text style={estilos.nome}>{atuador.nome}</Text>
        <Text style={estilos.detalhe}>
          {atuador.codigo} · {formatarNumero(atuador.potenciaKw)} kW
        </Text>
        <Text style={[estilos.estado, { color: corEstado }]}>● {rotuloEstado}</Text>
      </View>

      <Pressable
        onPress={() => onAlternar && onAlternar(atuador, ligado ? 'DESLIGADO' : 'LIGADO')}
        disabled={desabilitado}
        style={({ pressed }) => [
          estilos.botao,
          { backgroundColor: ligado ? cores.cardClaro : cores.primaria },
          (pressed || desabilitado) && { opacity: 0.5 },
        ]}
      >
        {ocupado ? <ActivityIndicator size="small" color={cores.texto} /> : <Text style={estilos.botaoTexto}>{acao}</Text>}
      </Pressable>
    </View>
  );
}

const estilos = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: cores.card,
    borderColor: cores.borda,
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },
  info: { flex: 1, gap: 2 },
  nome: { color: cores.texto, fontWeight: '600', fontSize: 14 },
  detalhe: { color: cores.textoSecundario, fontSize: 12 },
  estado: { fontSize: 13, fontWeight: '600' },
  botao: { borderRadius: 10, paddingVertical: 10, paddingHorizontal: 14, minWidth: 92, alignItems: 'center' },
  botaoTexto: { color: cores.texto, fontWeight: '700' },
});

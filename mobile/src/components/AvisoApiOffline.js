import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { cores } from '../theme/cores';
import { formatarHora } from '../utils/formatar';

/**
 * Faixa de aviso exibida quando a API não responde.
 * Não bloqueia a tela: os últimos dados recebidos continuam visíveis logo abaixo.
 */
export default function AvisoApiOffline({ erro, ultimaAtualizacao, onTentarNovamente }) {
  if (!erro) return null;

  const offline = erro.offline !== false; // erro de rede/timeout (ou desconhecido)
  const cor = offline ? cores.critico : cores.alerta;

  return (
    <View style={[estilos.caixa, { borderColor: cor }]}>
      <Ionicons name={offline ? 'cloud-offline-outline' : 'alert-circle-outline'} size={24} color={cor} />
      <View style={estilos.textos}>
        <Text style={[estilos.titulo, { color: cor }]}>{offline ? 'API fora do ar' : 'Erro na API'}</Text>
        <Text style={estilos.mensagem}>{erro.message}</Text>
        <Text style={estilos.mensagem}>
          {ultimaAtualizacao
            ? `Mostrando os últimos dados recebidos às ${formatarHora(ultimaAtualizacao)}.`
            : 'Ainda não há dados para mostrar.'}{' '}
          Tentando reconectar automaticamente...
        </Text>
      </View>
      {onTentarNovamente ? (
        <Pressable onPress={onTentarNovamente} style={({ pressed }) => [estilos.botao, pressed && { opacity: 0.7 }]}>
          <Text style={estilos.botaoTexto}>Tentar agora</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const estilos = StyleSheet.create({
  caixa: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#2A1318',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  textos: { flex: 1, gap: 2 },
  titulo: { fontWeight: '700', fontSize: 15 },
  mensagem: { color: cores.texto, fontSize: 12 },
  botao: { backgroundColor: cores.cardClaro, paddingVertical: 8, paddingHorizontal: 10, borderRadius: 8 },
  botaoTexto: { color: cores.texto, fontWeight: '600', fontSize: 12 },
});

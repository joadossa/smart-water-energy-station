import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { comAlfa, cores, fontes, raio } from '../theme/cores';
import { formatarHora } from '../utils/formatar';

interface Props {
  erro: (Error & { offline?: boolean }) | null;
  ultimaAtualizacao: Date | null;
  onTentarNovamente?: () => unknown;
}

/**
 * Faixa exibida quando a API não responde. Não bloqueia a tela: os dados abaixo
 * continuam visíveis, identificados como a última leitura disponível (não é tempo real).
 */
export default function AvisoApiOffline({ erro, ultimaAtualizacao, onTentarNovamente }: Props) {
  if (!erro) return null;

  const offline = erro.offline !== false; // erro de rede/timeout (ou desconhecido)
  const cor = offline ? cores.vermelho : cores.laranja;

  return (
    <View style={[estilos.caixa, { borderColor: comAlfa(cor, 0.6), backgroundColor: comAlfa(cor, 0.1) }]}>
      <Ionicons name={offline ? 'cloud-offline-outline' : 'alert-circle-outline'} size={26} color={cor} />
      <View style={estilos.textos}>
        <Text style={[estilos.titulo, { color: cor }]}>{offline ? 'API fora do ar' : 'Erro na API'}</Text>
        <Text style={estilos.mensagem}>
          {ultimaAtualizacao
            ? `Exibindo a última leitura disponível, recebida às ${formatarHora(ultimaAtualizacao)}. Os valores não estão em tempo real.`
            : 'Ainda não há dados para mostrar.'}
        </Text>
        <Text style={estilos.detalhe}>{erro.message} Tentando reconectar automaticamente...</Text>
      </View>
      {onTentarNovamente ? (
        <Pressable onPress={() => void onTentarNovamente()} style={({ pressed }) => [estilos.botao, pressed && { opacity: 0.7 }]}>
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
    borderWidth: 1,
    borderRadius: raio.card,
    padding: 12,
    marginBottom: 12,
  },
  textos: { flex: 1, gap: 2 },
  titulo: { fontFamily: fontes.titulo, fontSize: 15 },
  mensagem: { color: cores.texto, fontFamily: fontes.regular, fontSize: 12 },
  detalhe: { color: cores.textoSecundario, fontFamily: fontes.regular, fontSize: 11 },
  botao: { backgroundColor: cores.cardElevado, paddingVertical: 8, paddingHorizontal: 10, borderRadius: raio.controle },
  botaoTexto: { color: cores.texto, fontFamily: fontes.seminegrito, fontSize: 12 },
});

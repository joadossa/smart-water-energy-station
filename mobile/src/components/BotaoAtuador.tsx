import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import EtiquetaStatus from './EtiquetaStatus';
import { comAlfa, cores, fontes, raio } from '../theme/cores';
import type { Atuador, EstadoAtuador } from '../types/api';
import { acaoPara, corDaAcao, corDoEstado, estadoOposto, nomeAtuador, rotuloEstado } from '../utils/atuadores';
import { formatarHora, formatarNumero } from '../utils/formatar';

interface Props {
  atuador: Atuador;
  /** Chamado ao tocar no botão. Se nulo (ex.: API fora do ar), o botão fica desabilitado. */
  onAlternar?: ((atuador: Atuador, novoEstado: EstadoAtuador) => void) | null;
  ocupado?: boolean;
}

/** Linha de um atuador: estado atual e botão de comando (a confirmação fica com a tela). */
export default function BotaoAtuador({ atuador, onAlternar, ocupado = false }: Props) {
  const ligado = atuador.estado === 'LIGADO';
  const valvula = atuador.tipo === 'VALVULA';
  const novoEstado = estadoOposto(atuador.estado);
  const acao = acaoPara(atuador, novoEstado);
  // Desligada/fechada em vermelho; botão Desligar/Fechar em vermelho, Ligar/Abrir em ciano
  const corEstado = corDoEstado(atuador.estado);
  const corBotao = corDaAcao(novoEstado);
  const desabilitado = ocupado || !onAlternar;

  return (
    <View style={estilos.linha}>
      <View style={[estilos.icone, { backgroundColor: comAlfa(corEstado, 0.15) }]}>
        <Ionicons name={valvula ? 'git-compare-outline' : 'cog-outline'} size={22} color={corEstado} />
      </View>

      <View style={estilos.info}>
        <Text style={estilos.nome}>{nomeAtuador(atuador)}</Text>
        <Text style={estilos.detalhe}>
          {atuador.codigo} · {formatarNumero(atuador.potenciaKw)} kW · desde {formatarHora(atuador.atualizadoEm)}
        </Text>
        <EtiquetaStatus texto={rotuloEstado(atuador, atuador.estado)} cor={corEstado} icone={ligado ? 'checkmark-circle' : 'close-circle'} />
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${acao} ${nomeAtuador(atuador)}`}
        onPress={() => onAlternar && onAlternar(atuador, novoEstado)}
        disabled={desabilitado}
        style={({ pressed }) => [estilos.botao, { backgroundColor: corBotao }, (pressed || desabilitado) && { opacity: 0.45 }]}
      >
        {ocupado ? <ActivityIndicator size="small" color={cores.fundo} /> : <Text style={estilos.botaoTexto}>{acao}</Text>}
      </Pressable>
    </View>
  );
}

const estilos = StyleSheet.create({
  linha: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: cores.borda,
  },
  icone: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  info: { flex: 1, gap: 4 },
  nome: { color: cores.texto, fontFamily: fontes.seminegrito, fontSize: 14 },
  detalhe: { color: cores.textoSecundario, fontFamily: fontes.regular, fontSize: 11 },
  botao: { borderRadius: raio.controle, paddingVertical: 10, paddingHorizontal: 14, minWidth: 94, alignItems: 'center' },
  botaoTexto: { color: cores.fundo, fontFamily: fontes.seminegrito },
});

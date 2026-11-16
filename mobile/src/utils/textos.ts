// Textos e cores de situação derivados dos dados da API
import type { ComponentProps } from 'react';
import type { Ionicons } from '@expo/vector-icons';

import { cores } from '../theme/cores';
import type { Limites } from '../types/api';
import type { Tendencia } from './estatistica';
import { formatarNumero } from './formatar';

type NomeIcone = ComponentProps<typeof Ionicons>['name'];

export interface Situacao {
  texto: string;
  cor: string;
  icone: NomeIcone;
}

/** Situação do nível de um reservatório segundo os limites do backend. */
export function situacaoNivel(valor: number | null, limites: Limites): Situacao {
  if (valor === null) return { texto: 'Sem leitura', cor: cores.textoFraco, icone: 'help-circle-outline' };
  if (valor < limites.nivelMinimo) return { texto: 'Nível baixo', cor: cores.vermelho, icone: 'alert-circle' };
  if (valor > limites.nivelMaximo) return { texto: 'Risco de transbordo', cor: cores.amarelo, icone: 'warning' };
  return { texto: 'Normal', cor: cores.verde, icone: 'checkmark-circle' };
}

const SETAS: Record<Tendencia['classificacao'], string> = {
  subindo: '↑ subindo',
  estavel: '→ estável',
  descendo: '↓ descendo',
};

/** Ex.: "Tendência: ↑ subindo (+0,85 L/min por minuto, 90 leituras)". */
export function descreverTendencia(tendencia: Tendencia | null, unidade: string, rotulo = 'Tendência'): string {
  if (!tendencia) return `${rotulo}: leituras insuficientes para calcular`;
  const sinal = tendencia.variacaoPorMinuto >= 0 ? '+' : '−';
  return `${rotulo}: ${SETAS[tendencia.classificacao]} (${sinal}${formatarNumero(Math.abs(tendencia.variacaoPorMinuto), 2)} ${unidade} por minuto, ${tendencia.amostras} leituras)`;
}

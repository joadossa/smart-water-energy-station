// Cálculos feitos a partir das leituras reais da API (nunca valores fixos)
import type { Leitura } from '../types/api';
import { paraData } from './formatar';

/** Ponto de uma série temporal: t em milissegundos (epoch), v no valor da grandeza. */
export interface Ponto {
  t: number;
  v: number;
}

function instante(leitura: Leitura): number {
  return paraData(leitura.dataHora)?.getTime() ?? Number.NaN;
}

/** Leituras de um sensor como série temporal em ordem cronológica. */
export function pontosDoSensor(leituras: Leitura[] | null | undefined, sensor: string): Ponto[] {
  return (leituras ?? [])
    .filter((l) => l.sensor === sensor)
    .map((l) => ({ t: instante(l), v: l.valor }))
    .filter((p) => !Number.isNaN(p.t))
    .sort((a, b) => a.t - b.t);
}

/**
 * Soma as leituras feitas no mesmo ciclo de medição (ex.: consumo de todos os equipamentos),
 * agrupando leituras com até `toleranciaMs` de diferença.
 */
export function somarPorInstante(leituras: Leitura[] | null | undefined, toleranciaMs = 2000): Ponto[] {
  const ordenadas = (leituras ?? [])
    .map((l) => ({ t: instante(l), sensor: l.sensor, v: l.valor }))
    .filter((p) => !Number.isNaN(p.t))
    .sort((a, b) => a.t - b.t);

  const grupos: { t: number; valores: Map<string, number> }[] = [];
  for (const ponto of ordenadas) {
    const atual = grupos[grupos.length - 1];
    if (atual && ponto.t - atual.t <= toleranciaMs) {
      atual.valores.set(ponto.sensor, ponto.v);
    } else {
      grupos.push({ t: ponto.t, valores: new Map([[ponto.sensor, ponto.v]]) });
    }
  }
  return grupos.map((g) => ({ t: g.t, v: Array.from(g.valores.values()).reduce((soma, v) => soma + v, 0) }));
}

export type ClassificacaoTendencia = 'subindo' | 'estavel' | 'descendo';

export interface Tendencia {
  /** Inclinação da reta de regressão, em unidades da grandeza por minuto. */
  variacaoPorMinuto: number;
  classificacao: ClassificacaoTendencia;
  /** Quantidade de pontos usados no cálculo. */
  amostras: number;
}

/**
 * Tendência por regressão linear (mínimos quadrados) sobre os pontos.
 * Retorna null se houver menos de 3 pontos.
 * @param limiarPorMinuto abaixo deste módulo de variação, a tendência é "estável"
 */
export function calcularTendencia(pontos: Ponto[], limiarPorMinuto = 0.2): Tendencia | null {
  if (pontos.length < 3) return null;
  const t0 = pontos[0].t;
  const xs = pontos.map((p) => (p.t - t0) / 60000);
  const ys = pontos.map((p) => p.v);
  const mediaX = xs.reduce((s, x) => s + x, 0) / xs.length;
  const mediaY = ys.reduce((s, y) => s + y, 0) / ys.length;

  let numerador = 0;
  let denominador = 0;
  for (let i = 0; i < xs.length; i++) {
    numerador += (xs[i] - mediaX) * (ys[i] - mediaY);
    denominador += (xs[i] - mediaX) ** 2;
  }
  if (denominador === 0) return null;

  const inclinacao = numerador / denominador;
  let classificacao: ClassificacaoTendencia = 'estavel';
  if (Math.abs(inclinacao) >= limiarPorMinuto) {
    classificacao = inclinacao > 0 ? 'subindo' : 'descendo';
  }
  return { variacaoPorMinuto: inclinacao, classificacao, amostras: pontos.length };
}

export interface EnergiaEstimada {
  /** Energia estimada no período, em kWh. */
  kwh: number;
  /** Duração efetivamente integrada, em minutos. */
  duracaoMinutos: number;
}

/**
 * Estima a energia (kWh) integrando a potência (kW) no tempo pela regra dos trapézios.
 * Intervalos maiores que `maxIntervaloMs` (ex.: backend parado) não são integrados.
 */
export function integrarEnergiaKwh(pontosPotencia: Ponto[], maxIntervaloMs = 60000): EnergiaEstimada {
  let kwh = 0;
  let duracaoMs = 0;
  for (let i = 1; i < pontosPotencia.length; i++) {
    const anterior = pontosPotencia[i - 1];
    const atual = pontosPotencia[i];
    const dt = atual.t - anterior.t;
    if (dt <= 0 || dt > maxIntervaloMs) continue;
    kwh += ((anterior.v + atual.v) / 2) * (dt / 3600000);
    duracaoMs += dt;
  }
  return { kwh, duracaoMinutos: duracaoMs / 60000 };
}

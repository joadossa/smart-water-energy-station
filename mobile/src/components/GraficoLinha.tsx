import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Line, Polyline, Text as SvgText } from 'react-native-svg';

import { cores, fontes } from '../theme/cores';
import { formatarHoraCurta, formatarNumero } from '../utils/formatar';
import type { Ponto } from '../utils/estatistica';

export interface SerieGrafico {
  nome: string;
  cor: string;
  pontos: Ponto[];
}

export interface LinhaReferencia {
  valor: number;
  cor: string;
  rotulo?: string;
}

interface Props {
  series: SerieGrafico[];
  altura?: number;
  casas?: number;
  linhasReferencia?: LinhaReferencia[];
  /** Fixa o eixo Y (ex.: 0 a 100 para nível em %). */
  minimoY?: number;
  maximoY?: number;
  mensagemVazio?: string;
}

const MARGEM = { esquerda: 38, direita: 10, topo: 10, base: 10 };

/** Gráfico de linha simples em SVG, com uma ou mais séries temporais. */
export default function GraficoLinha({
  series,
  altura = 150,
  casas = 1,
  linhasReferencia = [],
  minimoY,
  maximoY,
  mensagemVazio = 'Sem leituras no período.',
}: Props) {
  const [largura, setLargura] = useState(0);
  const pontos = series.flatMap((s) => s.pontos);

  if (pontos.length === 0) {
    return (
      <View style={[estilos.vazio, { height: altura }]}>
        <Text style={estilos.vazioTexto}>{mensagemVazio}</Text>
      </View>
    );
  }

  const tempos = pontos.map((p) => p.t);
  const valores = [...pontos.map((p) => p.v), ...linhasReferencia.map((r) => r.valor)];
  const tMin = Math.min(...tempos);
  const tMax = Math.max(...tempos);
  let vMin = minimoY ?? Math.min(...valores);
  let vMax = maximoY ?? Math.max(...valores);
  if (minimoY === undefined || maximoY === undefined) {
    const folga = (vMax - vMin) * 0.1 || 1;
    if (minimoY === undefined) vMin = Math.max(0, vMin - folga);
    if (maximoY === undefined) vMax += folga;
  }
  if (vMax === vMin) vMax = vMin + 1;

  const larguraUtil = Math.max(0, largura - MARGEM.esquerda - MARGEM.direita);
  const alturaUtil = altura - MARGEM.topo - MARGEM.base;
  const x = (t: number) => MARGEM.esquerda + (tMax === tMin ? larguraUtil / 2 : ((t - tMin) / (tMax - tMin)) * larguraUtil);
  const y = (v: number) => MARGEM.topo + (1 - (v - vMin) / (vMax - vMin)) * alturaUtil;
  const grade = [vMin, (vMin + vMax) / 2, vMax];

  return (
    <View onLayout={(e) => setLargura(e.nativeEvent.layout.width)}>
      {largura > 0 ? (
        <Svg width={largura} height={altura}>
          {grade.map((valor, i) => (
            <React.Fragment key={`grade-${i}`}>
              <Line x1={MARGEM.esquerda} x2={largura - MARGEM.direita} y1={y(valor)} y2={y(valor)} stroke={cores.borda} strokeWidth={1} />
              <SvgText x={MARGEM.esquerda - 6} y={y(valor) + 4} fill={cores.textoFraco} fontSize={10} fontFamily={fontes.regular} textAnchor="end">
                {formatarNumero(valor, valor >= 100 ? 0 : casas)}
              </SvgText>
            </React.Fragment>
          ))}

          {linhasReferencia.map((ref, i) => (
            <Line
              key={`ref-${i}`}
              x1={MARGEM.esquerda}
              x2={largura - MARGEM.direita}
              y1={y(ref.valor)}
              y2={y(ref.valor)}
              stroke={ref.cor}
              strokeWidth={1}
              strokeDasharray="4 4"
            />
          ))}

          {series.map((serie) =>
            serie.pontos.length > 1 ? (
              <Polyline
                key={serie.nome}
                points={serie.pontos.map((p) => `${x(p.t).toFixed(1)},${y(p.v).toFixed(1)}`).join(' ')}
                fill="none"
                stroke={serie.cor}
                strokeWidth={2}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            ) : null,
          )}

          {series.map((serie) => {
            const ultimo = serie.pontos[serie.pontos.length - 1];
            return ultimo ? <Circle key={`ultimo-${serie.nome}`} cx={x(ultimo.t)} cy={y(ultimo.v)} r={3.5} fill={serie.cor} /> : null;
          })}
        </Svg>
      ) : (
        <View style={{ height: altura }} />
      )}

      <View style={estilos.eixoX}>
        <Text style={estilos.eixoTexto}>{formatarHoraCurta(new Date(tMin))}</Text>
        <Text style={estilos.eixoTexto}>{formatarHoraCurta(new Date(tMax))}</Text>
      </View>

      {series.length > 1 || linhasReferencia.some((r) => r.rotulo) ? (
        <View style={estilos.legenda}>
          {series.map((s) => (
            <View key={`leg-${s.nome}`} style={estilos.itemLegenda}>
              <View style={[estilos.marcador, { backgroundColor: s.cor }]} />
              <Text style={estilos.legendaTexto}>{s.nome}</Text>
            </View>
          ))}
          {linhasReferencia
            .filter((r) => r.rotulo)
            .map((r, i) => (
              <View key={`leg-ref-${i}`} style={estilos.itemLegenda}>
                <View style={[estilos.marcadorTracejado, { borderColor: r.cor }]} />
                <Text style={estilos.legendaTexto}>{r.rotulo}</Text>
              </View>
            ))}
        </View>
      ) : null}
    </View>
  );
}

const estilos = StyleSheet.create({
  vazio: { alignItems: 'center', justifyContent: 'center', borderRadius: 10, borderWidth: 1, borderColor: cores.borda, borderStyle: 'dashed' },
  vazioTexto: { color: cores.textoFraco, fontFamily: fontes.regular, fontSize: 12 },
  eixoX: { flexDirection: 'row', justifyContent: 'space-between', paddingLeft: MARGEM.esquerda, paddingRight: MARGEM.direita },
  eixoTexto: { color: cores.textoFraco, fontFamily: fontes.regular, fontSize: 10 },
  legenda: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 8 },
  itemLegenda: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  marcador: { width: 12, height: 3, borderRadius: 2 },
  marcadorTracejado: { width: 12, height: 0, borderTopWidth: 1, borderStyle: 'dashed' },
  legendaTexto: { color: cores.textoSecundario, fontFamily: fontes.regular, fontSize: 11 },
});

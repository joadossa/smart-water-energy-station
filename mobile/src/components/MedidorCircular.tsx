import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { cores, fontes } from '../theme/cores';
import { formatarNumero } from '../utils/formatar';

interface Props {
  /** 0 a 100. null quando ainda não há leitura. */
  percentual: number | null;
  cor: string;
  tamanho?: number;
  espessura?: number;
  /** Texto pequeno abaixo do valor (ex.: "6.700 L"). */
  legenda?: string;
}

/** Medidor circular de nível (anel que preenche de 0% a 100%). */
export default function MedidorCircular({ percentual, cor, tamanho = 120, espessura = 11, legenda }: Props) {
  const valor = percentual === null ? 0 : Math.max(0, Math.min(100, percentual));
  const centro = tamanho / 2;
  const raio = (tamanho - espessura) / 2;
  const circunferencia = 2 * Math.PI * raio;
  const preenchido = (valor / 100) * circunferencia;

  return (
    <View
      style={{ width: tamanho, height: tamanho, alignItems: 'center', justifyContent: 'center' }}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: Math.round(valor) }}
    >
      <Svg width={tamanho} height={tamanho} style={StyleSheet.absoluteFill}>
        <Circle cx={centro} cy={centro} r={raio} stroke={cores.borda} strokeWidth={espessura} fill="none" />
        {valor > 0 ? (
          <Circle
            cx={centro}
            cy={centro}
            r={raio}
            stroke={cor}
            strokeWidth={espessura}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={`${preenchido} ${circunferencia}`}
            rotation={-90}
            origin={`${centro}, ${centro}`}
          />
        ) : null}
      </Svg>
      <Text style={[estilos.valor, { fontSize: Math.round(tamanho * 0.22) }]}>
        {percentual === null ? '--' : `${formatarNumero(valor, 0)}%`}
      </Text>
      {legenda ? <Text style={estilos.legenda}>{legenda}</Text> : null}
    </View>
  );
}

const estilos = StyleSheet.create({
  valor: { color: cores.texto, fontFamily: fontes.titulo },
  legenda: { color: cores.textoSecundario, fontFamily: fontes.regular, fontSize: 11, marginTop: -2 },
});

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { cores } from '../theme/cores';
import { formatarHora, formatarNumero } from '../utils/formatar';

/**
 * Nível de um reservatório (0 a 100%).
 * As marcas verticais mostram os limites de alerta (mínimo e máximo) usados pelo backend.
 */
export default function BarraNivel({ nome, valor, minimo = 20, maximo = 95, atualizadoEm }) {
  const percentual = Math.max(0, Math.min(100, Number(valor) || 0));

  let cor = cores.agua;
  let situacao = 'Normal';
  if (percentual < minimo) {
    cor = cores.critico;
    situacao = 'Nível baixo';
  } else if (percentual > maximo) {
    cor = cores.alerta;
    situacao = 'Risco de transbordo';
  }

  return (
    <View style={estilos.card}>
      <View style={estilos.linha}>
        <Text style={estilos.nome}>{nome}</Text>
        <Text style={[estilos.valor, { color: cor }]}>{formatarNumero(percentual)}%</Text>
      </View>

      <View style={estilos.trilho}>
        <View style={[estilos.preenchimento, { width: `${percentual}%`, backgroundColor: cor }]} />
        <View style={[estilos.marca, { left: `${minimo}%` }]} />
        <View style={[estilos.marca, { left: `${maximo}%` }]} />
      </View>

      <View style={estilos.linha}>
        <Text style={[estilos.situacao, { color: cor }]}>{situacao}</Text>
        {atualizadoEm ? <Text style={estilos.hora}>às {formatarHora(atualizadoEm)}</Text> : null}
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  card: {
    backgroundColor: cores.card,
    borderColor: cores.borda,
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    gap: 10,
    marginBottom: 10,
  },
  linha: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  nome: { color: cores.texto, fontSize: 15, fontWeight: '600' },
  valor: { fontSize: 22, fontWeight: '700' },
  trilho: {
    height: 18,
    borderRadius: 9,
    backgroundColor: cores.cardClaro,
    overflow: 'hidden',
    position: 'relative',
  },
  preenchimento: { height: '100%', borderRadius: 9 },
  marca: { position: 'absolute', top: 0, bottom: 0, width: 2, backgroundColor: cores.textoSecundario, opacity: 0.6 },
  situacao: { fontSize: 13, fontWeight: '600' },
  hora: { color: cores.textoSecundario, fontSize: 12 },
});

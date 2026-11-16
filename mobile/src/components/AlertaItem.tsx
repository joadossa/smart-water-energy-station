import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { cores, coresSeveridade } from '../theme/cores';
import { formatarDataHora } from '../utils/formatar';

/** Item da lista de falhas (alertas). */
export default function AlertaItem({ falha, onResolver, resolvendo = false }) {
  const cor = coresSeveridade[falha.severidade] || cores.alerta;

  return (
    <View style={[estilos.card, { borderLeftColor: cor }]}>
      <View style={estilos.linha}>
        <View style={[estilos.badge, { backgroundColor: cor }]}>
          <Text style={estilos.badgeTexto}>{falha.severidade}</Text>
        </View>
        <Text style={estilos.codigo} numberOfLines={1}>
          {falha.codigo}
        </Text>
        <Text style={estilos.hora}>{formatarDataHora(falha.dataHora)}</Text>
      </View>

      <Text style={estilos.descricao}>{falha.descricao}</Text>

      <View style={estilos.linha}>
        <Text style={estilos.origem}>Origem: {falha.origem}</Text>
        {falha.resolvida ? (
          <Text style={estilos.resolvida}>Resolvida em {formatarDataHora(falha.resolvidaEm)}</Text>
        ) : onResolver ? (
          <Pressable
            onPress={() => onResolver(falha)}
            disabled={resolvendo}
            style={({ pressed }) => [estilos.botao, (pressed || resolvendo) && { opacity: 0.7 }]}
          >
            {resolvendo ? (
              <ActivityIndicator size="small" color={cores.texto} />
            ) : (
              <Text style={estilos.botaoTexto}>Resolver</Text>
            )}
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  card: {
    backgroundColor: cores.card,
    borderColor: cores.borda,
    borderWidth: 1,
    borderLeftWidth: 5,
    borderRadius: 12,
    padding: 12,
    gap: 8,
    marginBottom: 10,
  },
  linha: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  badge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 },
  badgeTexto: { color: '#0B1220', fontWeight: '700', fontSize: 11 },
  codigo: { color: cores.texto, fontWeight: '700', flex: 1 },
  hora: { color: cores.textoSecundario, fontSize: 12 },
  descricao: { color: cores.texto, fontSize: 14 },
  origem: { color: cores.textoSecundario, fontSize: 12 },
  resolvida: { color: cores.ok, fontSize: 12, fontWeight: '600' },
  botao: { backgroundColor: cores.primaria, borderRadius: 8, paddingVertical: 6, paddingHorizontal: 12, minWidth: 80, alignItems: 'center' },
  botaoTexto: { color: cores.texto, fontWeight: '600', fontSize: 13 },
});

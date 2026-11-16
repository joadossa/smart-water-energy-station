import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

import { cores, fontes } from '../theme/cores';
import { logoAquaPulse, logoGota, PROPORCAO_GOTA, PROPORCAO_LOGO } from '../theme/imagens';

interface Props {
  /** Texto ao lado da gota (abas internas). */
  titulo?: string;
  /** true = mostra o logo completo AquaPulse (aba Painel). */
  marca?: boolean;
}

const ALTURA_LOGO = 30;
const ALTURA_GOTA = 24;

/** Título do cabeçalho com a identidade visual AquaPulse. */
export default function TituloCabecalho({ titulo, marca = false }: Props) {
  if (marca) {
    return (
      <Image
        source={logoAquaPulse}
        accessibilityLabel="AquaPulse"
        resizeMode="contain"
        style={{ height: ALTURA_LOGO, width: ALTURA_LOGO * PROPORCAO_LOGO }}
      />
    );
  }

  return (
    <View style={estilos.linha}>
      <Image source={logoGota} resizeMode="contain" style={{ height: ALTURA_GOTA, width: ALTURA_GOTA * PROPORCAO_GOTA }} />
      <Text style={estilos.titulo} numberOfLines={1}>
        {titulo}
      </Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  linha: { flexDirection: 'row', alignItems: 'center', gap: 8, flexShrink: 1 },
  titulo: { color: cores.texto, fontFamily: fontes.titulo, fontSize: 17, flexShrink: 1 },
});

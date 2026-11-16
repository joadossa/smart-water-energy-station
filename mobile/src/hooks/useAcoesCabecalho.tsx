import React, { useLayoutEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';

import AcoesCabecalho from '../components/AcoesCabecalho';
import type { AbasParamList } from '../navigation/tipos';

/**
 * Coloca no cabeçalho da aba o botão de atualizar (ligado à função da tela) e o de configurações.
 * Use em telas das abas: useAcoesCabecalho(atualizar)
 */
export default function useAcoesCabecalho(onAtualizar: () => unknown) {
  const navigation = useNavigation<BottomTabNavigationProp<AbasParamList>>();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => <AcoesCabecalho onAtualizar={onAtualizar} />,
    });
  }, [navigation, onAtualizar]);
}

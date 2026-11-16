import type { CompositeScreenProps, NavigatorScreenParams } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { Falha } from '../types/api';

/** Abas da barra inferior. */
export type AbasParamList = {
  Painel: undefined;
  /** secao: 'valvula' rola a tela até o controle da válvula (atalho "Controlar" do Painel). */
  Agua: { secao?: 'valvula' } | undefined;
  Energia: undefined;
  Alertas: undefined;
};

/** Pilha raiz: as abas + telas abertas por cima delas. */
export type RaizParamList = {
  Abas: NavigatorScreenParams<AbasParamList>;
  Config: undefined;
  DetalheFalha: { falha: Falha };
};

export type PropsAba<Nome extends keyof AbasParamList> = CompositeScreenProps<
  BottomTabScreenProps<AbasParamList, Nome>,
  NativeStackScreenProps<RaizParamList>
>;

export type PropsPilha<Nome extends keyof RaizParamList> = NativeStackScreenProps<RaizParamList, Nome>;

declare global {
  namespace ReactNavigation {
    // Permite useNavigation() tipado em qualquer componente
    interface RootParamList extends RaizParamList {}
  }
}

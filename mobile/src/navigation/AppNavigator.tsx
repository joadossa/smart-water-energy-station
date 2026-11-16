import React from 'react';
import { StyleSheet, View } from 'react-native';
import { NavigationContainer, DarkTheme, type Theme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import PainelScreen from '../screens/PainelScreen';
import AguaScreen from '../screens/AguaScreen';
import EnergiaScreen from '../screens/EnergiaScreen';
import AlertasScreen from '../screens/AlertasScreen';
import ConfigScreen from '../screens/ConfigScreen';
import TituloCabecalho from '../components/TituloCabecalho';
import AcoesCabecalho from '../components/AcoesCabecalho';
import { useResumo } from '../context/ResumoContext';
import { cores, fontes } from '../theme/cores';
import type { AbasParamList, RaizParamList } from './tipos';

const Abas = createBottomTabNavigator<AbasParamList>();
const Pilha = createNativeStackNavigator<RaizParamList>();

const tema: Theme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: cores.ciano,
    background: cores.fundo,
    card: cores.card,
    text: cores.texto,
    border: cores.borda,
    notification: cores.vermelho,
  },
};

type NomeIcone = React.ComponentProps<typeof Ionicons>['name'];

const ICONES: Record<keyof AbasParamList, NomeIcone> = {
  Painel: 'speedometer-outline',
  Agua: 'water-outline',
  Energia: 'flash-outline',
  Alertas: 'warning-outline',
};

const TITULOS: Record<keyof AbasParamList, string> = {
  Painel: 'Smart Water & Energy Station',
  Agua: 'Água',
  Energia: 'Energia',
  Alertas: 'Alertas',
};

function AbasPrincipais() {
  const { falhasAbertas } = useResumo();

  return (
    <Abas.Navigator
      screenOptions={({ route }) => ({
        headerStyle: { backgroundColor: cores.card },
        headerShadowVisible: false,
        headerTintColor: cores.texto,
        headerTitleAlign: 'left',
        headerTitle: () => <TituloCabecalho titulo={TITULOS[route.name]} />,
        headerRight: () => <AcoesCabecalho />,
        tabBarActiveTintColor: cores.ciano,
        tabBarInactiveTintColor: cores.textoFraco,
        tabBarStyle: { backgroundColor: cores.card, borderTopColor: cores.borda },
        tabBarLabelStyle: { fontFamily: fontes.media, fontSize: 11 },
        tabBarIcon: ({ color, size, focused }) => (
          <View style={estilos.icone}>
            {focused ? <View style={estilos.indicador} /> : null}
            <Ionicons name={ICONES[route.name]} size={size} color={color} />
          </View>
        ),
      })}
    >
      <Abas.Screen name="Painel" component={PainelScreen} options={{ tabBarLabel: 'Painel' }} />
      <Abas.Screen name="Agua" component={AguaScreen} options={{ tabBarLabel: 'Água' }} />
      <Abas.Screen name="Energia" component={EnergiaScreen} options={{ tabBarLabel: 'Energia' }} />
      <Abas.Screen
        name="Alertas"
        component={AlertasScreen}
        options={{
          tabBarLabel: 'Alertas',
          tabBarBadge: falhasAbertas > 0 ? falhasAbertas : undefined,
          tabBarBadgeStyle: { backgroundColor: cores.vermelho, color: cores.texto, fontFamily: fontes.seminegrito, fontSize: 10 },
        }}
      />
    </Abas.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer theme={tema}>
      <Pilha.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: cores.card },
          headerTintColor: cores.texto,
          headerTitleStyle: { fontFamily: fontes.titulo },
          contentStyle: { backgroundColor: cores.fundo },
        }}
      >
        <Pilha.Screen name="Abas" component={AbasPrincipais} options={{ headerShown: false }} />
        <Pilha.Screen name="Config" component={ConfigScreen} options={{ title: 'Configurações' }} />
      </Pilha.Navigator>
    </NavigationContainer>
  );
}

const estilos = StyleSheet.create({
  icone: { alignItems: 'center', justifyContent: 'center' },
  indicador: {
    position: 'absolute',
    top: -9,
    width: 28,
    height: 3,
    borderRadius: 2,
    backgroundColor: cores.ciano,
  },
});

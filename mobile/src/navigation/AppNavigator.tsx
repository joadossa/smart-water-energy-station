import React from 'react';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import PainelScreen from '../screens/PainelScreen';
import AguaScreen from '../screens/AguaScreen';
import EnergiaScreen from '../screens/EnergiaScreen';
import AlertasScreen from '../screens/AlertasScreen';
import ConfigScreen from '../screens/ConfigScreen';
import { cores } from '../theme/cores';

const Tab = createBottomTabNavigator();

const tema = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: cores.primaria,
    background: cores.fundo,
    card: cores.card,
    text: cores.texto,
    border: cores.borda,
  },
};

const ICONES = {
  Painel: 'speedometer-outline',
  Agua: 'water-outline',
  Energia: 'flash-outline',
  Alertas: 'warning-outline',
  Config: 'settings-outline',
};

export default function AppNavigator() {
  return (
    <NavigationContainer theme={tema}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerStyle: { backgroundColor: cores.card },
          headerTintColor: cores.texto,
          tabBarActiveTintColor: cores.primaria,
          tabBarInactiveTintColor: cores.textoSecundario,
          tabBarStyle: { backgroundColor: cores.card, borderTopColor: cores.borda },
          tabBarIcon: ({ color, size }) => <Ionicons name={ICONES[route.name]} size={size} color={color} />,
        })}
      >
        <Tab.Screen name="Painel" component={PainelScreen} options={{ title: 'Painel da Estação', tabBarLabel: 'Painel' }} />
        <Tab.Screen name="Agua" component={AguaScreen} options={{ title: 'Água', tabBarLabel: 'Água' }} />
        <Tab.Screen name="Energia" component={EnergiaScreen} options={{ title: 'Energia', tabBarLabel: 'Energia' }} />
        <Tab.Screen name="Alertas" component={AlertasScreen} options={{ title: 'Alertas de Falha', tabBarLabel: 'Alertas' }} />
        <Tab.Screen name="Config" component={ConfigScreen} options={{ title: 'Configurações', tabBarLabel: 'Config' }} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

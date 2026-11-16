import React from 'react';
import { Image, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold } from '@expo-google-fonts/inter';
import { FiraSans_500Medium, FiraSans_600SemiBold } from '@expo-google-fonts/fira-sans';

import { ApiConfigProvider } from './src/context/ApiConfigContext';
import { ResumoProvider } from './src/context/ResumoContext';
import AppNavigator from './src/navigation/AppNavigator';
import { cores } from './src/theme/cores';
import { logoAquaPulse, PROPORCAO_LOGO } from './src/theme/imagens';

export default function App() {
  const [fontesCarregadas, erroFontes] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    FiraSans_500Medium,
    FiraSans_600SemiBold,
  });

  // Enquanto as fontes carregam, mostra o logo (se falharem, o app segue com a fonte do sistema)
  if (!fontesCarregadas && !erroFontes) {
    return (
      <View style={{ flex: 1, backgroundColor: cores.fundo, alignItems: 'center', justifyContent: 'center' }}>
        <Image source={logoAquaPulse} resizeMode="contain" style={{ width: 240, height: 240 / PROPORCAO_LOGO }} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <ApiConfigProvider>
        <ResumoProvider>
          <StatusBar style="light" />
          <AppNavigator />
        </ResumoProvider>
      </ApiConfigProvider>
    </SafeAreaProvider>
  );
}

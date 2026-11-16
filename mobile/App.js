import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ApiConfigProvider } from './src/context/ApiConfigContext';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <ApiConfigProvider>
        <StatusBar style="light" />
        <AppNavigator />
      </ApiConfigProvider>
    </SafeAreaProvider>
  );
}

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

import { criarEstacaoApi } from '../api/estacaoApi';

const CHAVE_URL = '@estacao:apiUrl';
const PORTA_API = 8080;

/**
 * URL padrão da API, nesta ordem:
 * 1) variável EXPO_PUBLIC_API_URL (arquivo mobile/.env), se existir;
 * 2) o mesmo IP do computador que está servindo o app pelo Expo (modo LAN);
 * 3) localhost (app aberto no navegador do próprio computador).
 */
export function urlPadrao() {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return normalizarUrl(process.env.EXPO_PUBLIC_API_URL);
  }
  const hostUri = Constants.expoConfig?.hostUri; // ex.: "192.168.0.10:8081"
  const host = hostUri ? hostUri.split(':')[0] : null;
  if (host && host !== 'localhost' && !host.endsWith('.exp.direct')) {
    return `http://${host}:${PORTA_API}`;
  }
  return `http://localhost:${PORTA_API}`;
}

/** Garante o formato http://host:porta, sem barra no final. */
export function normalizarUrl(url) {
  let valor = (url || '').trim();
  if (!valor) return '';
  if (!/^https?:\/\//i.test(valor)) valor = `http://${valor}`;
  return valor.replace(/\/+$/, '');
}

const ApiConfigContext = createContext(null);

export function ApiConfigProvider({ children }) {
  const [apiUrl, setApiUrl] = useState(urlPadrao);
  const [carregado, setCarregado] = useState(false);

  // Recupera a URL salva pelo usuário na tela Config
  useEffect(() => {
    AsyncStorage.getItem(CHAVE_URL)
      .then((salva) => {
        if (salva) setApiUrl(salva);
      })
      .catch(() => {})
      .finally(() => setCarregado(true));
  }, []);

  const salvarUrl = useCallback(async (novaUrl) => {
    const url = normalizarUrl(novaUrl);
    if (!url) throw new Error('Informe o endereço da API.');
    await AsyncStorage.setItem(CHAVE_URL, url);
    setApiUrl(url);
    return url;
  }, []);

  const restaurarPadrao = useCallback(async () => {
    await AsyncStorage.removeItem(CHAVE_URL);
    const url = urlPadrao();
    setApiUrl(url);
    return url;
  }, []);

  const api = useMemo(() => criarEstacaoApi(apiUrl), [apiUrl]);

  const valor = useMemo(
    () => ({ apiUrl, api, carregado, salvarUrl, restaurarPadrao }),
    [apiUrl, api, carregado, salvarUrl, restaurarPadrao],
  );

  return <ApiConfigContext.Provider value={valor}>{children}</ApiConfigContext.Provider>;
}

export function useApiConfig() {
  const contexto = useContext(ApiConfigContext);
  if (!contexto) {
    throw new Error('useApiConfig deve ser usado dentro de <ApiConfigProvider>');
  }
  return contexto;
}

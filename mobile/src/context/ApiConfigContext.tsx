import React, { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

import { criarEstacaoApi, type EstacaoApi } from '../api/estacaoApi';

const CHAVE_URL = '@estacao:apiUrl';
const PORTA_API = 8080;

// Variável lida do arquivo mobile/.env (prefixo EXPO_PUBLIC_), injetada pelo Expo no build.
// @ts-ignore -- a tipagem de process.env varia conforme o ambiente (Node/Expo)
const URL_DO_AMBIENTE: string | undefined = process.env.EXPO_PUBLIC_API_URL;

/** Garante o formato http://host:porta, sem barra no final. */
export function normalizarUrl(url: string | null | undefined): string {
  let valor = (url ?? '').trim();
  if (!valor) return '';
  if (!/^https?:\/\//i.test(valor)) valor = `http://${valor}`;
  return valor.replace(/\/+$/, '');
}

/**
 * URL padrão da API, nesta ordem:
 * 1) EXPO_PUBLIC_API_URL (arquivo mobile/.env), se existir;
 * 2) o mesmo IP do computador que está servindo o app pelo Expo (modo LAN);
 * 3) localhost (app aberto no navegador do próprio computador ou simulador iOS).
 */
export function urlPadrao(): string {
  if (URL_DO_AMBIENTE) {
    return normalizarUrl(URL_DO_AMBIENTE);
  }
  const hostUri = Constants.expoConfig?.hostUri; // ex.: "192.168.0.10:8081"
  const host = hostUri ? hostUri.split(':')[0] : null;
  if (host && host !== 'localhost' && !host.endsWith('.exp.direct')) {
    return `http://${host}:${PORTA_API}`;
  }
  return `http://localhost:${PORTA_API}`;
}

interface ValorApiConfig {
  apiUrl: string;
  api: EstacaoApi;
  carregado: boolean;
  salvarUrl: (novaUrl: string) => Promise<string>;
  restaurarPadrao: () => Promise<string>;
}

const ApiConfigContext = createContext<ValorApiConfig | null>(null);

export function ApiConfigProvider({ children }: { children: ReactNode }) {
  const [apiUrl, setApiUrl] = useState<string>(urlPadrao);
  const [carregado, setCarregado] = useState(false);

  // Recupera a URL salva pelo usuário na tela Config
  useEffect(() => {
    AsyncStorage.getItem(CHAVE_URL)
      .then((salva) => {
        if (salva) setApiUrl(salva);
      })
      .catch(() => undefined)
      .finally(() => setCarregado(true));
  }, []);

  const salvarUrl = useCallback(async (novaUrl: string) => {
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

  const valor = useMemo<ValorApiConfig>(
    () => ({ apiUrl, api, carregado, salvarUrl, restaurarPadrao }),
    [apiUrl, api, carregado, salvarUrl, restaurarPadrao],
  );

  return <ApiConfigContext.Provider value={valor}>{children}</ApiConfigContext.Provider>;
}

export function useApiConfig(): ValorApiConfig {
  const contexto = useContext(ApiConfigContext);
  if (!contexto) {
    throw new Error('useApiConfig deve ser usado dentro de <ApiConfigProvider>');
  }
  return contexto;
}

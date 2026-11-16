// Funções de acesso aos endpoints do backend Spring Boot
import { requisicao } from './client';
import type {
  Atuador,
  EstadoAtuador,
  Falha,
  FiltroFalhas,
  Leitura,
  NovaLeitura,
  StatusEstacao,
  TipoLeitura,
  UltimaLeitura,
} from '../types/api';

export interface FiltroLeituras {
  tipo?: TipoLeitura;
  sensor?: string;
  /** Somente leituras dos últimos N minutos (1 a 1440). */
  minutos?: number;
  /** Quantidade máxima de leituras (1 a 2000). */
  limite?: number;
}

function montarQuery(parametros: Record<string, string | number | undefined | null>): string {
  const partes = Object.entries(parametros)
    .filter(([, valor]) => valor !== undefined && valor !== null && valor !== '')
    .map(([chave, valor]) => `${encodeURIComponent(chave)}=${encodeURIComponent(String(valor))}`);
  return partes.length ? `?${partes.join('&')}` : '';
}

/** Cria o conjunto de chamadas para uma URL base (ex.: http://192.168.0.10:8080). */
export function criarEstacaoApi(baseUrl: string) {
  return {
    baseUrl,

    /** GET /api/status - estado operacional (níveis, vazão, consumo, atuadores, falhas e limites). */
    buscarStatus: () => requisicao<StatusEstacao>(baseUrl, '/api/status'),

    /** GET /api/leituras/ultima - leitura mais recente consolidada. */
    buscarUltimaLeitura: () => requisicao<UltimaLeitura>(baseUrl, '/api/leituras/ultima'),

    /** GET /api/leituras?tipo=&sensor=&minutos=&limite= - histórico (mais recentes primeiro). */
    listarLeituras: ({ tipo, sensor, minutos, limite }: FiltroLeituras = {}) =>
      requisicao<Leitura[]>(baseUrl, `/api/leituras${montarQuery({ tipo, sensor, minutos, limite })}`),

    /** POST /api/leituras */
    registrarLeitura: (leitura: NovaLeitura) =>
      requisicao<Leitura>(baseUrl, '/api/leituras', { method: 'POST', body: leitura }),

    /** GET /api/atuadores */
    listarAtuadores: () => requisicao<Atuador[]>(baseUrl, '/api/atuadores'),

    /** GET /api/atuadores/{id} - usado para confirmar o estado depois de um comando. */
    buscarAtuador: (id: number) => requisicao<Atuador>(baseUrl, `/api/atuadores/${id}`),

    /** PUT /api/atuadores/{id}  { estado: 'LIGADO' | 'DESLIGADO' } */
    acionarAtuador: (id: number, estado: EstadoAtuador) =>
      requisicao<Atuador>(baseUrl, `/api/atuadores/${id}`, { method: 'PUT', body: { estado } }),

    /** GET /api/falhas?status=ABERTAS|RESOLVIDAS|TODAS */
    listarFalhas: (status: FiltroFalhas = 'TODAS') =>
      requisicao<Falha[]>(baseUrl, `/api/falhas${montarQuery({ status })}`),

    /** GET /api/falhas/{id} */
    buscarFalha: (id: number) => requisicao<Falha>(baseUrl, `/api/falhas/${id}`),

    /** PATCH /api/falhas/{id}/resolver */
    resolverFalha: (id: number) => requisicao<Falha>(baseUrl, `/api/falhas/${id}/resolver`, { method: 'PATCH' }),
  };
}

export type EstacaoApi = ReturnType<typeof criarEstacaoApi>;

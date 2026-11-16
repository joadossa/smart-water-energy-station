// Funções de acesso aos endpoints do backend Spring Boot
import { requisicao } from './client';

function montarQuery(parametros) {
  const partes = Object.entries(parametros)
    .filter(([, valor]) => valor !== undefined && valor !== null && valor !== '')
    .map(([chave, valor]) => `${encodeURIComponent(chave)}=${encodeURIComponent(valor)}`);
  return partes.length ? `?${partes.join('&')}` : '';
}

/** Cria o conjunto de chamadas para uma URL base (ex.: http://192.168.0.10:8080). */
export function criarEstacaoApi(baseUrl) {
  return {
    baseUrl,

    // GET /api/status - resumo do painel (níveis, vazão, consumo, atuadores e falhas)
    buscarStatus: () => requisicao(baseUrl, '/api/status'),

    // GET /api/leituras?tipo=&sensor=&limite=
    listarLeituras: ({ tipo, sensor, limite } = {}) =>
      requisicao(baseUrl, `/api/leituras${montarQuery({ tipo, sensor, limite })}`),

    // POST /api/leituras
    registrarLeitura: (leitura) => requisicao(baseUrl, '/api/leituras', { method: 'POST', body: leitura }),

    // GET /api/atuadores
    listarAtuadores: () => requisicao(baseUrl, '/api/atuadores'),

    // POST /api/atuadores/{id}/acionar  { estado: 'LIGADO' | 'DESLIGADO' }
    acionarAtuador: (id, estado) =>
      requisicao(baseUrl, `/api/atuadores/${id}/acionar`, { method: 'POST', body: { estado } }),

    // GET /api/falhas?status=ABERTAS|RESOLVIDAS|TODAS
    listarFalhas: (status = 'TODAS') => requisicao(baseUrl, `/api/falhas${montarQuery({ status })}`),

    // PATCH /api/falhas/{id}/resolver
    resolverFalha: (id) => requisicao(baseUrl, `/api/falhas/${id}/resolver`, { method: 'PATCH' }),
  };
}

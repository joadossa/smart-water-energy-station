// Cliente HTTP da API da estação (fetch + timeout + tratamento de erros)

const TIMEOUT_PADRAO_MS = 5000;

type MetodoHttp = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface OpcoesRequisicao {
  method?: MetodoHttp;
  body?: unknown;
  timeoutMs?: number;
}

/**
 * Erro padronizado das chamadas à API.
 * - offline = true  -> não foi possível conectar (backend parado, IP errado, sem rede, timeout)
 * - offline = false -> a API respondeu, mas com erro HTTP (400, 404, 500...)
 */
export class ApiError extends Error {
  status: number | null;
  offline: boolean;

  constructor(mensagem: string, { status = null, offline = false }: { status?: number | null; offline?: boolean } = {}) {
    super(mensagem);
    this.name = 'ApiError';
    this.status = status;
    this.offline = offline;
  }
}

export async function requisicao<T>(
  baseUrl: string,
  caminho: string,
  { method = 'GET', body, timeoutMs = TIMEOUT_PADRAO_MS }: OpcoesRequisicao = {},
): Promise<T> {
  const controle = new AbortController();
  const timer = setTimeout(() => controle.abort(), timeoutMs);

  let resposta: Response;
  try {
    resposta = await fetch(`${baseUrl}${caminho}`, {
      method,
      headers: {
        Accept: 'application/json',
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: controle.signal,
    });
  } catch {
    // Falha de rede ou timeout: o app NÃO trava, apenas avisa que a API está fora do ar
    throw new ApiError('API fora do ar: não foi possível conectar ao servidor.', { offline: true });
  } finally {
    clearTimeout(timer);
  }

  const texto = await resposta.text();
  let dados: unknown = null;
  if (texto) {
    try {
      dados = JSON.parse(texto);
    } catch {
      dados = null;
    }
  }

  if (!resposta.ok) {
    const mensagem =
      dados && typeof dados === 'object' && 'mensagem' in dados && typeof dados.mensagem === 'string'
        ? dados.mensagem
        : `Erro ${resposta.status} ao chamar a API.`;
    throw new ApiError(mensagem, { status: resposta.status, offline: false });
  }
  return dados as T;
}

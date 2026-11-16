// Cliente HTTP da API da estação (fetch + timeout + tratamento de erros)

const TIMEOUT_PADRAO_MS = 5000;

/**
 * Erro padronizado das chamadas à API.
 * - offline = true  -> não foi possível conectar (backend parado, IP errado, sem rede, timeout)
 * - offline = false -> a API respondeu, mas com erro HTTP (400, 404, 500...)
 */
export class ApiError extends Error {
  constructor(mensagem, { status = null, offline = false } = {}) {
    super(mensagem);
    this.name = 'ApiError';
    this.status = status;
    this.offline = offline;
  }
}

export async function requisicao(baseUrl, caminho, { method = 'GET', body, timeoutMs = TIMEOUT_PADRAO_MS } = {}) {
  const controle = new AbortController();
  const timer = setTimeout(() => controle.abort(), timeoutMs);

  let resposta;
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
  } catch (e) {
    // Falha de rede ou timeout: o app NÃO trava, apenas avisa que a API está fora do ar
    throw new ApiError('API fora do ar: não foi possível conectar ao servidor.', { offline: true });
  } finally {
    clearTimeout(timer);
  }

  const texto = await resposta.text();
  let dados = null;
  if (texto) {
    try {
      dados = JSON.parse(texto);
    } catch {
      dados = null;
    }
  }

  if (!resposta.ok) {
    const mensagem = (dados && dados.mensagem) || `Erro ${resposta.status} ao chamar a API.`;
    throw new ApiError(mensagem, { status: resposta.status, offline: false });
  }
  return dados;
}

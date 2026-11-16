import { useCallback, useEffect, useRef, useState } from 'react';
import { useIsFocused } from '@react-navigation/native';

export interface ResultadoPolling<T> {
  /** Última resposta válida (continua disponível mesmo se a API cair). */
  dados: T | null;
  /** Motivo da última falha (ex.: ApiError com offline = true), ou null se a última chamada deu certo. */
  erro: (Error & { offline?: boolean }) | null;
  /** true só até a primeira resposta (ou erro). */
  carregando: boolean;
  /** Horário da última resposta válida. */
  ultimaAtualizacao: Date | null;
  /** Busca imediatamente, sem esperar o próximo ciclo. */
  atualizar: () => Promise<void>;
}

interface OpcoesPolling {
  intervaloMs?: number;
  /** Quando muda (ex.: URL da API, filtro), o ciclo é reiniciado. */
  chave?: unknown;
}

/**
 * Executa `buscar()` ao abrir a tela e depois a cada `intervaloMs`, enquanto a tela estiver em foco.
 * O timer é limpo ao sair da tela. Se a API cair, os últimos dados são mantidos e as tentativas continuam.
 */
export default function usePolling<T>(buscar: () => Promise<T>, { intervaloMs = 5000, chave }: OpcoesPolling = {}): ResultadoPolling<T> {
  const focado = useIsFocused();
  const [dados, setDados] = useState<T | null>(null);
  const [erro, setErro] = useState<(Error & { offline?: boolean }) | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [ultimaAtualizacao, setUltimaAtualizacao] = useState<Date | null>(null);

  const buscarRef = useRef(buscar);
  buscarRef.current = buscar;
  const ativo = useRef(true);

  const atualizar = useCallback(async () => {
    try {
      const resultado = await buscarRef.current();
      if (!ativo.current) return;
      setDados(resultado);
      setErro(null);
      setUltimaAtualizacao(new Date());
    } catch (e) {
      if (ativo.current) setErro(e instanceof Error ? e : new Error(String(e)));
    } finally {
      if (ativo.current) setCarregando(false);
    }
  }, []);

  useEffect(() => {
    if (!focado) return undefined;
    ativo.current = true;
    void atualizar();
    const id = setInterval(() => void atualizar(), intervaloMs);
    return () => {
      ativo.current = false;
      clearInterval(id);
    };
  }, [focado, intervaloMs, chave, atualizar]);

  return { dados, erro, carregando, ultimaAtualizacao, atualizar };
}

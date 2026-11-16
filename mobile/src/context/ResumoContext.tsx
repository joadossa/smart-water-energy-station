import React, { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

/**
 * Resumo compartilhado entre as telas: hoje, a quantidade de falhas abertas,
 * usada no contador da aba Alertas. As telas atualizam o valor a cada resposta da API.
 */
interface ValorResumo {
  falhasAbertas: number;
  definirFalhasAbertas: (quantidade: number) => void;
}

const ResumoContext = createContext<ValorResumo | null>(null);

export function ResumoProvider({ children }: { children: ReactNode }) {
  const [falhasAbertas, setFalhasAbertas] = useState(0);
  const definirFalhasAbertas = useCallback((quantidade: number) => setFalhasAbertas(quantidade), []);
  const valor = useMemo(() => ({ falhasAbertas, definirFalhasAbertas }), [falhasAbertas, definirFalhasAbertas]);
  return <ResumoContext.Provider value={valor}>{children}</ResumoContext.Provider>;
}

export function useResumo(): ValorResumo {
  const contexto = useContext(ResumoContext);
  if (!contexto) {
    throw new Error('useResumo deve ser usado dentro de <ResumoProvider>');
  }
  return contexto;
}

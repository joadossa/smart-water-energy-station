import { useCallback, useEffect, useRef, useState } from 'react';
import { useIsFocused } from '@react-navigation/native';

/**
 * Executa `buscar()` ao abrir a tela e depois a cada `intervaloMs`, enquanto a tela estiver em foco.
 *
 * Se a API cair:
 *  - `erro` passa a ter o motivo (ex.: ApiError com offline = true);
 *  - `dados` continua com a última resposta válida (o app não fica em branco nem trava);
 *  - as tentativas continuam automaticamente até a API voltar.
 *
 * @param {() => Promise<any>} buscar função que chama a API
 * @param {{ intervaloMs?: number, chave?: any }} opcoes `chave` reinicia o ciclo quando muda (ex.: URL da API, filtro)
 */
export default function usePolling(buscar, { intervaloMs = 5000, chave } = {}) {
  const focado = useIsFocused();
  const [dados, setDados] = useState(null);
  const [erro, setErro] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [ultimaAtualizacao, setUltimaAtualizacao] = useState(null);

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
      if (ativo.current) setErro(e);
    } finally {
      if (ativo.current) setCarregando(false);
    }
  }, []);

  useEffect(() => {
    if (!focado) return undefined;
    ativo.current = true;
    atualizar();
    const id = setInterval(atualizar, intervaloMs);
    return () => {
      ativo.current = false;
      clearInterval(id);
    };
  }, [focado, intervaloMs, chave, atualizar]);

  return { dados, erro, carregando, ultimaAtualizacao, atualizar };
}

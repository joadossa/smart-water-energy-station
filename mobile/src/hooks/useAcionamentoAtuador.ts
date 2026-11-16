import { useCallback, useState } from 'react';

import type { EstacaoApi } from '../api/estacaoApi';
import type { Atuador, EstadoAtuador } from '../types/api';
import { acaoPara, descreverEstado, nomeAtuador } from '../utils/atuadores';
import { formatarHora } from '../utils/formatar';

export interface PedidoAcionamento {
  atuador: Atuador;
  novoEstado: EstadoAtuador;
}

export interface ResultadoAcionamento {
  ok: boolean;
  mensagem: string;
}

/**
 * Fluxo de comando de um atuador:
 * 1) solicitar() abre a confirmação;
 * 2) confirmar() envia o PUT /api/atuadores/{id};
 * 3) consulta GET /api/atuadores/{id} para confirmar o estado no servidor;
 * 4) só informa sucesso se o servidor confirmar (erros nunca viram "sucesso").
 */
export default function useAcionamentoAtuador(api: EstacaoApi, aoConcluir: () => unknown) {
  const [pedido, setPedido] = useState<PedidoAcionamento | null>(null);
  const [executando, setExecutando] = useState(false);
  const [resultado, setResultado] = useState<ResultadoAcionamento | null>(null);

  const solicitar = useCallback((atuador: Atuador, novoEstado: EstadoAtuador) => {
    setResultado(null);
    setPedido({ atuador, novoEstado });
  }, []);

  const cancelar = useCallback(() => {
    if (!executando) setPedido(null);
  }, [executando]);

  const confirmar = useCallback(async () => {
    if (!pedido) return;
    const { atuador, novoEstado } = pedido;
    setExecutando(true);
    try {
      await api.acionarAtuador(atuador.id, novoEstado);
      const confirmado = await api.buscarAtuador(atuador.id);
      if (confirmado.estado === novoEstado) {
        setResultado({
          ok: true,
          mensagem: `${nomeAtuador(confirmado)} ${descreverEstado(confirmado, confirmado.estado)}: confirmado pelo servidor às ${formatarHora(new Date())}.`,
        });
      } else {
        setResultado({
          ok: false,
          mensagem: `O servidor informou ${nomeAtuador(confirmado)} como ${descreverEstado(confirmado, confirmado.estado)}. O comando não foi confirmado.`,
        });
      }
    } catch (e) {
      const motivo = e instanceof Error ? e.message : String(e);
      setResultado({
        ok: false,
        mensagem: `Comando "${acaoPara(atuador, novoEstado)}" em ${nomeAtuador(atuador)} não concluído: ${motivo} Nenhuma alteração foi confirmada.`,
      });
    } finally {
      setExecutando(false);
      setPedido(null);
      await aoConcluir();
    }
  }, [api, pedido, aoConcluir]);

  const limparResultado = useCallback(() => setResultado(null), []);

  return { pedido, executando, resultado, solicitar, confirmar, cancelar, limparResultado };
}

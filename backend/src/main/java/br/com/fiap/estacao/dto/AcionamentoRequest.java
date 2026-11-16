package br.com.fiap.estacao.dto;

import br.com.fiap.estacao.model.EstadoAtuador;
import jakarta.validation.constraints.NotNull;

/**
 * Corpo do POST /api/atuadores/{id}/acionar.
 * Exemplo: { "estado": "LIGADO" }
 */
public record AcionamentoRequest(
        @NotNull(message = "estado é obrigatório (LIGADO ou DESLIGADO)")
        EstadoAtuador estado
) {
}

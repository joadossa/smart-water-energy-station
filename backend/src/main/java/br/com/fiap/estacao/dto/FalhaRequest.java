package br.com.fiap.estacao.dto;

import br.com.fiap.estacao.model.Severidade;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * Corpo do POST /api/falhas (registro manual de falha).
 * Exemplo: { "codigo": "SENSOR_OFFLINE", "descricao": "Sensor sem resposta", "severidade": "ALTA", "origem": "RES-B" }
 */
public record FalhaRequest(
        @NotBlank(message = "codigo é obrigatório")
        @Size(max = 50, message = "codigo deve ter no máximo 50 caracteres")
        String codigo,

        @NotBlank(message = "descricao é obrigatória")
        @Size(max = 255, message = "descricao deve ter no máximo 255 caracteres")
        String descricao,

        @NotNull(message = "severidade é obrigatória (BAIXA, MEDIA, ALTA ou CRITICA)")
        Severidade severidade,

        @NotBlank(message = "origem é obrigatória")
        @Size(max = 50, message = "origem deve ter no máximo 50 caracteres")
        String origem
) {
}

package br.com.fiap.estacao.dto;

import br.com.fiap.estacao.model.TipoLeitura;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

/**
 * Corpo do POST /api/leituras.
 * Exemplo: { "tipo": "NIVEL", "sensor": "RES-A", "valor": 72.5 }
 * A unidade é opcional: se não for enviada, usa a unidade padrão do tipo (%, L/min ou kW).
 */
public record LeituraRequest(
        @NotNull(message = "tipo é obrigatório (NIVEL, VAZAO ou ENERGIA)")
        TipoLeitura tipo,

        @NotBlank(message = "sensor é obrigatório")
        @Size(max = 50, message = "sensor deve ter no máximo 50 caracteres")
        String sensor,

        @NotNull(message = "valor é obrigatório")
        @PositiveOrZero(message = "valor não pode ser negativo")
        Double valor,

        @Size(max = 20, message = "unidade deve ter no máximo 20 caracteres")
        String unidade
) {
}

package br.com.fiap.estacao.dto;

import java.time.LocalDateTime;

/**
 * Resposta do GET /api/leituras/ultima: a leitura mais recente de cada grandeza da estação,
 * consolidada em um único objeto. Campos ficam null enquanto não houver leitura daquele sensor.
 *
 * @param dataHora          horário da leitura mais recente entre todas as grandezas
 * @param potenciaTotalKw   soma do consumo atual de todos os equipamentos
 * @param simulacaoAtiva    true quando os valores vêm do simulador do backend
 */
public record UltimaLeituraResponse(
        LocalDateTime dataHora,
        Double nivelReservatorioA,
        Double nivelReservatorioB,
        Double vazaoEntrada,
        Double vazaoSaida,
        Double potenciaTotalKw,
        boolean simulacaoAtiva
) {
}

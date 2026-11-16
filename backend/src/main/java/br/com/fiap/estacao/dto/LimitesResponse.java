package br.com.fiap.estacao.dto;

/**
 * Limites que disparam falhas automáticas. Enviados ao app para colorir os indicadores
 * com as mesmas regras do backend.
 */
public record LimitesResponse(
        double nivelMinimo,
        double nivelMaximo,
        double vazaoMaxima,
        double consumoMaximo
) {
}

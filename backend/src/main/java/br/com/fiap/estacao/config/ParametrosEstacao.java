package br.com.fiap.estacao.config;

import br.com.fiap.estacao.dto.LimitesResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Parâmetros configuráveis da estação (application.properties), expostos ao app
 * pelo GET /api/status para que cores e mensagens sigam os mesmos limites do backend.
 */
@Component
public class ParametrosEstacao {

    private final double nivelMinimo;
    private final double nivelMaximo;
    private final double vazaoMaxima;
    private final double consumoMaximo;
    private final double capacidadeReservatorioA;
    private final double capacidadeReservatorioB;
    private final boolean simulacaoAtiva;

    public ParametrosEstacao(@Value("${estacao.limites.nivel-minimo:20}") double nivelMinimo,
                             @Value("${estacao.limites.nivel-maximo:95}") double nivelMaximo,
                             @Value("${estacao.limites.vazao-maxima:120}") double vazaoMaxima,
                             @Value("${estacao.limites.consumo-maximo:15}") double consumoMaximo,
                             @Value("${estacao.reservatorios.capacidade-a-litros:10000}") double capacidadeReservatorioA,
                             @Value("${estacao.reservatorios.capacidade-b-litros:8000}") double capacidadeReservatorioB,
                             @Value("${estacao.simulador.habilitado:false}") boolean simulacaoAtiva) {
        this.nivelMinimo = nivelMinimo;
        this.nivelMaximo = nivelMaximo;
        this.vazaoMaxima = vazaoMaxima;
        this.consumoMaximo = consumoMaximo;
        this.capacidadeReservatorioA = capacidadeReservatorioA;
        this.capacidadeReservatorioB = capacidadeReservatorioB;
        this.simulacaoAtiva = simulacaoAtiva;
    }

    public LimitesResponse limites() {
        return new LimitesResponse(nivelMinimo, nivelMaximo, vazaoMaxima, consumoMaximo);
    }

    /** Capacidade de cada reservatório em litros, indexada pelo código do sensor de nível. */
    public Map<String, Double> capacidadesLitros() {
        Map<String, Double> capacidades = new LinkedHashMap<>();
        capacidades.put("RES-A", capacidadeReservatorioA);
        capacidades.put("RES-B", capacidadeReservatorioB);
        return capacidades;
    }

    /** true quando as leituras estão sendo geradas pelo simulador (valores simulados). */
    public boolean isSimulacaoAtiva() {
        return simulacaoAtiva;
    }
}

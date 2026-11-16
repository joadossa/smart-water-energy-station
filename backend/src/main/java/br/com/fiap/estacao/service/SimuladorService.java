package br.com.fiap.estacao.service;

import br.com.fiap.estacao.dto.LeituraRequest;
import br.com.fiap.estacao.model.Atuador;
import br.com.fiap.estacao.model.Leitura;
import br.com.fiap.estacao.model.TipoLeitura;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.concurrent.ThreadLocalRandom;

/**
 * Simula os sensores físicos da estação. A cada ciclo:
 * <ul>
 *   <li>calcula o nível dos reservatórios A e B a partir da vazão de entrada (bombas)
 *       e da vazão de saída (válvula de distribuição);</li>
 *   <li>registra leituras de NIVEL, VAZAO e ENERGIA pelo mesmo serviço usado no POST /api/leituras,
 *       então as falhas são abertas automaticamente quando um limite é ultrapassado.</li>
 * </ul>
 * Ligar/desligar as bombas ou abrir/fechar a válvula pelo app muda o comportamento da simulação.
 * Para desligar o simulador: estacao.simulador.habilitado=false
 */
@Service
@ConditionalOnProperty(name = "estacao.simulador.habilitado", havingValue = "true")
public class SimuladorService {

    private static final Logger log = LoggerFactory.getLogger(SimuladorService.class);

    /** Quanto o nível (%) varia por ciclo para cada 1 L/min de diferença entre entrada e saída. */
    private static final double FATOR_NIVEL = 0.05;

    private final LeituraService leituraService;
    private final AtuadorService atuadorService;

    private Double nivelA;
    private Double nivelB;

    public SimuladorService(LeituraService leituraService, AtuadorService atuadorService) {
        this.leituraService = leituraService;
        this.atuadorService = atuadorService;
    }

    @Scheduled(fixedRateString = "${estacao.simulador.intervalo-ms:10000}",
               initialDelayString = "${estacao.simulador.atraso-inicial-ms:3000}")
    public void gerarLeituras() {
        try {
            // Continua de onde parou: o último nível gravado no banco (persistência)
            if (nivelA == null) {
                nivelA = ultimoNivel("RES-A", 65.0);
            }
            if (nivelB == null) {
                nivelB = ultimoNivel("RES-B", 45.0);
            }

            boolean bomba1 = atuadorService.estaLigado("BOMBA-01");
            boolean bomba2 = atuadorService.estaLigado("BOMBA-02");
            boolean valvula = atuadorService.estaLigado("VALVULA-01");

            double entradaA = bomba1 ? variar(42, 4) : 0;
            double entradaB = bomba2 ? variar(35, 4) : 0;
            double saida = valvula ? variar(55, 8) : 0;

            nivelA = limitar(nivelA + (entradaA - saida / 2) * FATOR_NIVEL);
            nivelB = limitar(nivelB + (entradaB - saida / 2) * FATOR_NIVEL);

            // Eventos raros para demonstrar os alertas de falha
            double saidaMedida = sorteio(0.01) ? saida + 80 : saida;        // pico de vazão (vazamento)
            double consumo1 = bomba1 ? potencia("BOMBA-01", 7.5) * variar(1.0, 0.05) : 0;
            if (bomba1 && sorteio(0.02)) {
                consumo1 *= 2.3;                                             // sobrecarga na bomba 1
            }
            double consumo2 = bomba2 ? potencia("BOMBA-02", 5.5) * variar(1.0, 0.05) : 0;
            double consumoPainel = variar(0.35, 0.05);                       // painel de controle

            registrar(TipoLeitura.NIVEL, "RES-A", nivelA);
            registrar(TipoLeitura.NIVEL, "RES-B", nivelB);
            registrar(TipoLeitura.VAZAO, "ENTRADA", entradaA + entradaB);
            registrar(TipoLeitura.VAZAO, "SAIDA", saidaMedida);
            registrar(TipoLeitura.ENERGIA, "BOMBA-01", consumo1);
            registrar(TipoLeitura.ENERGIA, "BOMBA-02", consumo2);
            registrar(TipoLeitura.ENERGIA, "PAINEL", consumoPainel);

            log.debug("Simulação: nivelA={} nivelB={} entrada={} saida={}",
                    nivelA, nivelB, entradaA + entradaB, saidaMedida);
        } catch (Exception e) {
            log.warn("Não foi possível gerar as leituras simuladas: {}", e.getMessage());
        }
    }

    private void registrar(TipoLeitura tipo, String sensor, double valor) {
        leituraService.registrar(new LeituraRequest(tipo, sensor, arredondar(valor), null));
    }

    private double ultimoNivel(String sensor, double padrao) {
        return leituraService.ultima(TipoLeitura.NIVEL, sensor).map(Leitura::getValor).orElse(padrao);
    }

    private double potencia(String codigo, double padrao) {
        return atuadorService.buscarPorCodigo(codigo).map(Atuador::getPotenciaKw).orElse(padrao);
    }

    private static double variar(double base, double amplitude) {
        return base + ThreadLocalRandom.current().nextDouble(-amplitude, amplitude);
    }

    private static boolean sorteio(double probabilidade) {
        return ThreadLocalRandom.current().nextDouble() < probabilidade;
    }

    private static double limitar(double valor) {
        return Math.max(0, Math.min(100, valor));
    }

    private static double arredondar(double valor) {
        return Math.round(valor * 100.0) / 100.0;
    }
}

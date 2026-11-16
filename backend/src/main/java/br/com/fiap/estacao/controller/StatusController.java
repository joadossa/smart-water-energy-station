package br.com.fiap.estacao.controller;

import br.com.fiap.estacao.dto.StatusResponse;
import br.com.fiap.estacao.model.Leitura;
import br.com.fiap.estacao.model.TipoLeitura;
import br.com.fiap.estacao.service.AtuadorService;
import br.com.fiap.estacao.service.FalhaService;
import br.com.fiap.estacao.service.LeituraService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

/**
 * Resumo da estação para o painel do app (uma chamada traz tudo).
 */
@RestController
@RequestMapping("/api/status")
public class StatusController {

    private final LeituraService leituraService;
    private final AtuadorService atuadorService;
    private final FalhaService falhaService;

    public StatusController(LeituraService leituraService, AtuadorService atuadorService, FalhaService falhaService) {
        this.leituraService = leituraService;
        this.atuadorService = atuadorService;
        this.falhaService = falhaService;
    }

    @GetMapping
    public StatusResponse status() {
        List<Leitura> consumos = leituraService.ultimasPorSensor(TipoLeitura.ENERGIA);
        double total = consumos.stream().mapToDouble(Leitura::getValor).sum();

        return new StatusResponse(
                LocalDateTime.now().truncatedTo(ChronoUnit.SECONDS),
                leituraService.ultimasPorSensor(TipoLeitura.NIVEL),
                leituraService.ultimasPorSensor(TipoLeitura.VAZAO),
                consumos,
                Math.round(total * 100.0) / 100.0,
                atuadorService.listar(),
                falhaService.contarAbertas(),
                falhaService.ultimasAbertas(5));
    }
}

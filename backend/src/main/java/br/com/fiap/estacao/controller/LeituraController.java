package br.com.fiap.estacao.controller;

import br.com.fiap.estacao.dto.LeituraRequest;
import br.com.fiap.estacao.model.Leitura;
import br.com.fiap.estacao.model.TipoLeitura;
import br.com.fiap.estacao.service.LeituraService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.net.URI;
import java.util.List;

/**
 * Leituras dos sensores: nível (%), vazão (L/min) e consumo elétrico (kW).
 */
@RestController
@RequestMapping("/api/leituras")
public class LeituraController {

    private final LeituraService service;

    public LeituraController(LeituraService service) {
        this.service = service;
    }

    /** Registra uma leitura. Se ultrapassar um limite, uma falha é aberta automaticamente. */
    @PostMapping
    public ResponseEntity<Leitura> registrar(@Valid @RequestBody LeituraRequest request) {
        Leitura salva = service.registrar(request);
        return ResponseEntity.created(URI.create("/api/leituras/" + salva.getId())).body(salva);
    }

    /** Lista as leituras mais recentes. Filtros opcionais: tipo, sensor e limite (1 a 500, padrão 50). */
    @GetMapping
    public List<Leitura> listar(@RequestParam(name = "tipo", required = false) TipoLeitura tipo,
                                @RequestParam(name = "sensor", required = false) String sensor,
                                @RequestParam(name = "limite", required = false) Integer limite) {
        return service.listar(tipo, sensor, limite);
    }

    @GetMapping("/{id}")
    public Leitura buscar(@PathVariable("id") Long id) {
        return service.buscar(id);
    }
}

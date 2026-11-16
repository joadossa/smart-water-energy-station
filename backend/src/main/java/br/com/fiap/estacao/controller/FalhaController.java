package br.com.fiap.estacao.controller;

import br.com.fiap.estacao.dto.FalhaRequest;
import br.com.fiap.estacao.model.Falha;
import br.com.fiap.estacao.service.FalhaService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.net.URI;
import java.util.List;

/**
 * Falhas (alertas) da estação.
 */
@RestController
@RequestMapping("/api/falhas")
public class FalhaController {

    private final FalhaService service;

    public FalhaController(FalhaService service) {
        this.service = service;
    }

    /** Lista falhas. status: ABERTAS, RESOLVIDAS ou TODAS (padrão). limite: 1 a 500 (padrão 100). */
    @GetMapping
    public List<Falha> listar(@RequestParam(name = "status", required = false) String status,
                              @RequestParam(name = "limite", required = false) Integer limite) {
        return service.listar(status, limite);
    }

    @GetMapping("/{id}")
    public Falha buscar(@PathVariable("id") Long id) {
        return service.buscar(id);
    }

    /** Registro manual de uma falha. */
    @PostMapping
    public ResponseEntity<Falha> registrar(@Valid @RequestBody FalhaRequest request) {
        Falha salva = service.registrar(request);
        return ResponseEntity.created(URI.create("/api/falhas/" + salva.getId())).body(salva);
    }

    /** Marca a falha como resolvida. */
    @PatchMapping("/{id}/resolver")
    public Falha resolver(@PathVariable("id") Long id) {
        return service.resolver(id);
    }
}

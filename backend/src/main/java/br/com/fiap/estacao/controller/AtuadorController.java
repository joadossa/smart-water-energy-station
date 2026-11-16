package br.com.fiap.estacao.controller;

import br.com.fiap.estacao.dto.AcionamentoRequest;
import br.com.fiap.estacao.model.Atuador;
import br.com.fiap.estacao.service.AtuadorService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Atuadores da estação: bombas de recalque e válvula de distribuição.
 */
@RestController
@RequestMapping("/api/atuadores")
public class AtuadorController {

    private final AtuadorService service;

    public AtuadorController(AtuadorService service) {
        this.service = service;
    }

    @GetMapping
    public List<Atuador> listar() {
        return service.listar();
    }

    @GetMapping("/{id}")
    public Atuador buscar(@PathVariable("id") Long id) {
        return service.buscar(id);
    }

    /** Liga/desliga o atuador. Corpo: { "estado": "LIGADO" } ou { "estado": "DESLIGADO" }. */
    @PutMapping("/{id}")
    public Atuador atualizarEstado(@PathVariable("id") Long id, @Valid @RequestBody AcionamentoRequest request) {
        return service.acionar(id, request.estado());
    }

    /** Mesmo efeito do PUT, mantido por compatibilidade com a primeira versão da API. */
    @PostMapping("/{id}/acionar")
    public Atuador acionar(@PathVariable("id") Long id, @Valid @RequestBody AcionamentoRequest request) {
        return service.acionar(id, request.estado());
    }
}

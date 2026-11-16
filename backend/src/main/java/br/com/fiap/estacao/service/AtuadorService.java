package br.com.fiap.estacao.service;

import br.com.fiap.estacao.exception.RecursoNaoEncontradoException;
import br.com.fiap.estacao.model.Atuador;
import br.com.fiap.estacao.model.EstadoAtuador;
import br.com.fiap.estacao.repository.AtuadorRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class AtuadorService {

    private final AtuadorRepository repository;

    public AtuadorService(AtuadorRepository repository) {
        this.repository = repository;
    }

    public List<Atuador> listar() {
        return repository.findAllByOrderByIdAsc();
    }

    public Atuador buscar(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Atuador " + id + " não encontrado"));
    }

    public Optional<Atuador> buscarPorCodigo(String codigo) {
        return repository.findByCodigo(codigo);
    }

    /** Liga/desliga uma bomba ou abre/fecha uma válvula. */
    @Transactional
    public Atuador acionar(Long id, EstadoAtuador estado) {
        Atuador atuador = buscar(id);
        atuador.alterarEstado(estado);
        return repository.save(atuador);
    }

    public boolean estaLigado(String codigo) {
        return repository.findByCodigo(codigo).map(Atuador::isLigado).orElse(false);
    }
}

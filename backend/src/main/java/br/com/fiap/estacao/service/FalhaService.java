package br.com.fiap.estacao.service;

import br.com.fiap.estacao.dto.FalhaRequest;
import br.com.fiap.estacao.exception.RecursoNaoEncontradoException;
import br.com.fiap.estacao.model.Falha;
import br.com.fiap.estacao.model.Severidade;
import br.com.fiap.estacao.repository.FalhaRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;

@Service
public class FalhaService {

    private static final int LIMITE_PADRAO = 100;
    private static final int LIMITE_MAXIMO = 500;

    private final FalhaRepository repository;

    public FalhaService(FalhaRepository repository) {
        this.repository = repository;
    }

    /**
     * Lista falhas da mais recente para a mais antiga.
     *
     * @param status ABERTAS, RESOLVIDAS ou TODAS (padrão)
     */
    public List<Falha> listar(String status, Integer limite) {
        Pageable pagina = PageRequest.of(0, normalizarLimite(limite));
        String filtro = (status == null || status.isBlank()) ? "TODAS" : status.trim().toUpperCase(Locale.ROOT);
        return switch (filtro) {
            case "ABERTAS" -> repository.findByResolvidaOrderByIdDesc(false, pagina);
            case "RESOLVIDAS" -> repository.findByResolvidaOrderByIdDesc(true, pagina);
            case "TODAS" -> repository.findAllByOrderByIdDesc(pagina);
            default -> throw new IllegalArgumentException("status deve ser ABERTAS, RESOLVIDAS ou TODAS");
        };
    }

    public Falha buscar(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Falha " + id + " não encontrada"));
    }

    /** Registro manual de uma falha (POST /api/falhas). */
    @Transactional
    public Falha registrar(FalhaRequest request) {
        Falha falha = new Falha(
                request.codigo().trim().toUpperCase(Locale.ROOT),
                request.descricao().trim(),
                request.severidade(),
                request.origem().trim().toUpperCase(Locale.ROOT));
        return repository.save(falha);
    }

    /**
     * Abre uma falha automática, a menos que já exista uma falha igual (mesmo código e origem)
     * ainda aberta. Assim o alerta não se repete a cada leitura.
     */
    @Transactional
    public void registrarSeNaoAberta(String codigo, String descricao, Severidade severidade, String origem) {
        if (!repository.existsByCodigoAndOrigemAndResolvidaFalse(codigo, origem)) {
            repository.save(new Falha(codigo, descricao, severidade, origem));
        }
    }

    @Transactional
    public Falha resolver(Long id) {
        Falha falha = buscar(id);
        falha.resolver();
        return repository.save(falha);
    }

    public long contarAbertas() {
        return repository.countByResolvidaFalse();
    }

    public List<Falha> ultimasAbertas(int quantidade) {
        return repository.findByResolvidaOrderByIdDesc(false, PageRequest.of(0, quantidade));
    }

    private int normalizarLimite(Integer limite) {
        if (limite == null) {
            return LIMITE_PADRAO;
        }
        if (limite < 1 || limite > LIMITE_MAXIMO) {
            throw new IllegalArgumentException("limite deve estar entre 1 e " + LIMITE_MAXIMO);
        }
        return limite;
    }
}

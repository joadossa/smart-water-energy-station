package br.com.fiap.estacao.repository;

import br.com.fiap.estacao.model.Falha;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FalhaRepository extends JpaRepository<Falha, Long> {

    List<Falha> findAllByOrderByIdDesc(Pageable pageable);

    List<Falha> findByResolvidaOrderByIdDesc(boolean resolvida, Pageable pageable);

    long countByResolvidaFalse();

    /** Evita abrir a mesma falha várias vezes enquanto ela ainda não foi resolvida. */
    boolean existsByCodigoAndOrigemAndResolvidaFalse(String codigo, String origem);
}

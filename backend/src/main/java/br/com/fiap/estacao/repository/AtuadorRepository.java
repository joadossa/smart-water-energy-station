package br.com.fiap.estacao.repository;

import br.com.fiap.estacao.model.Atuador;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AtuadorRepository extends JpaRepository<Atuador, Long> {

    Optional<Atuador> findByCodigo(String codigo);

    List<Atuador> findAllByOrderByIdAsc();
}

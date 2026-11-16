package br.com.fiap.estacao.repository;

import br.com.fiap.estacao.model.Leitura;
import br.com.fiap.estacao.model.TipoLeitura;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface LeituraRepository extends JpaRepository<Leitura, Long> {

    List<Leitura> findAllByOrderByIdDesc(Pageable pageable);

    List<Leitura> findByTipoOrderByIdDesc(TipoLeitura tipo, Pageable pageable);

    List<Leitura> findBySensorOrderByIdDesc(String sensor, Pageable pageable);

    List<Leitura> findByTipoAndSensorOrderByIdDesc(TipoLeitura tipo, String sensor, Pageable pageable);

    // ---- Histórico por período (?minutos=N) ----

    List<Leitura> findByDataHoraGreaterThanEqualOrderByIdDesc(LocalDateTime desde, Pageable pageable);

    List<Leitura> findByTipoAndDataHoraGreaterThanEqualOrderByIdDesc(TipoLeitura tipo, LocalDateTime desde, Pageable pageable);

    List<Leitura> findBySensorAndDataHoraGreaterThanEqualOrderByIdDesc(String sensor, LocalDateTime desde, Pageable pageable);

    List<Leitura> findByTipoAndSensorAndDataHoraGreaterThanEqualOrderByIdDesc(TipoLeitura tipo, String sensor,
                                                                             LocalDateTime desde, Pageable pageable);

    /** Leitura mais recente de um sensor. */
    Optional<Leitura> findTopByTipoAndSensorOrderByIdDesc(TipoLeitura tipo, String sensor);

    /** Sensores que já enviaram leituras de um determinado tipo. */
    @Query("select distinct l.sensor from Leitura l where l.tipo = :tipo order by l.sensor")
    List<String> listarSensoresPorTipo(@Param("tipo") TipoLeitura tipo);
}

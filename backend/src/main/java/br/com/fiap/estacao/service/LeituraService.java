package br.com.fiap.estacao.service;

import br.com.fiap.estacao.dto.LeituraRequest;
import br.com.fiap.estacao.dto.UltimaLeituraResponse;
import br.com.fiap.estacao.exception.RecursoNaoEncontradoException;
import br.com.fiap.estacao.model.Leitura;
import br.com.fiap.estacao.model.Severidade;
import br.com.fiap.estacao.model.TipoLeitura;
import br.com.fiap.estacao.repository.LeituraRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.stream.Stream;

@Service
public class LeituraService {

    private static final int LIMITE_PADRAO = 50;
    private static final int LIMITE_MAXIMO = 2000;
    private static final int MINUTOS_MAXIMO = 1440;
    private static final Locale PT_BR = Locale.forLanguageTag("pt-BR");

    private final LeituraRepository repository;
    private final FalhaService falhaService;
    private final double nivelMinimo;
    private final double nivelMaximo;
    private final double vazaoMaxima;
    private final double consumoMaximo;

    public LeituraService(LeituraRepository repository,
                          FalhaService falhaService,
                          @Value("${estacao.limites.nivel-minimo:20}") double nivelMinimo,
                          @Value("${estacao.limites.nivel-maximo:95}") double nivelMaximo,
                          @Value("${estacao.limites.vazao-maxima:120}") double vazaoMaxima,
                          @Value("${estacao.limites.consumo-maximo:15}") double consumoMaximo) {
        this.repository = repository;
        this.falhaService = falhaService;
        this.nivelMinimo = nivelMinimo;
        this.nivelMaximo = nivelMaximo;
        this.vazaoMaxima = vazaoMaxima;
        this.consumoMaximo = consumoMaximo;
    }

    /** Grava a leitura e, se passar de um limite, abre uma falha automaticamente. */
    @Transactional
    public Leitura registrar(LeituraRequest request) {
        String unidade = (request.unidade() == null || request.unidade().isBlank())
                ? request.tipo().getUnidadePadrao()
                : request.unidade().trim();
        Leitura leitura = new Leitura(request.tipo(), normalizar(request.sensor()), request.valor(), unidade);
        Leitura salva = repository.save(leitura);
        verificarLimites(salva);
        return salva;
    }

    public Leitura buscar(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Leitura " + id + " não encontrada"));
    }

    /**
     * Lista leituras da mais recente para a mais antiga.
     *
     * @param tipo    filtro opcional por tipo
     * @param sensor  filtro opcional por sensor
     * @param minutos opcional: só leituras dos últimos N minutos (1 a 1440)
     * @param limite  quantidade máxima (1 a 2000, padrão 50)
     */
    public List<Leitura> listar(TipoLeitura tipo, String sensor, Integer minutos, Integer limite) {
        Pageable pagina = PageRequest.of(0, normalizarLimite(limite));
        String filtroSensor = (sensor == null || sensor.isBlank()) ? null : normalizar(sensor);

        if (minutos != null) {
            LocalDateTime desde = LocalDateTime.now().minusMinutes(normalizarMinutos(minutos));
            if (tipo != null && filtroSensor != null) {
                return repository.findByTipoAndSensorAndDataHoraGreaterThanEqualOrderByIdDesc(tipo, filtroSensor, desde, pagina);
            }
            if (tipo != null) {
                return repository.findByTipoAndDataHoraGreaterThanEqualOrderByIdDesc(tipo, desde, pagina);
            }
            if (filtroSensor != null) {
                return repository.findBySensorAndDataHoraGreaterThanEqualOrderByIdDesc(filtroSensor, desde, pagina);
            }
            return repository.findByDataHoraGreaterThanEqualOrderByIdDesc(desde, pagina);
        }

        if (tipo != null && filtroSensor != null) {
            return repository.findByTipoAndSensorOrderByIdDesc(tipo, filtroSensor, pagina);
        }
        if (tipo != null) {
            return repository.findByTipoOrderByIdDesc(tipo, pagina);
        }
        if (filtroSensor != null) {
            return repository.findBySensorOrderByIdDesc(filtroSensor, pagina);
        }
        return repository.findAllByOrderByIdDesc(pagina);
    }

    /** Última leitura de cada sensor do tipo informado. */
    public List<Leitura> ultimasPorSensor(TipoLeitura tipo) {
        return repository.listarSensoresPorTipo(tipo).stream()
                .map(sensor -> repository.findTopByTipoAndSensorOrderByIdDesc(tipo, sensor))
                .flatMap(Optional::stream)
                .toList();
    }

    public Optional<Leitura> ultima(TipoLeitura tipo, String sensor) {
        return repository.findTopByTipoAndSensorOrderByIdDesc(tipo, normalizar(sensor));
    }

    /** Leitura mais recente de cada grandeza, consolidada (GET /api/leituras/ultima). */
    public UltimaLeituraResponse ultimaConsolidada(boolean simulacaoAtiva) {
        Optional<Leitura> nivelA = ultima(TipoLeitura.NIVEL, "RES-A");
        Optional<Leitura> nivelB = ultima(TipoLeitura.NIVEL, "RES-B");
        Optional<Leitura> entrada = ultima(TipoLeitura.VAZAO, "ENTRADA");
        Optional<Leitura> saida = ultima(TipoLeitura.VAZAO, "SAIDA");
        List<Leitura> consumos = ultimasPorSensor(TipoLeitura.ENERGIA);

        Double potenciaTotal = consumos.isEmpty()
                ? null
                : Math.round(consumos.stream().mapToDouble(Leitura::getValor).sum() * 100.0) / 100.0;

        LocalDateTime maisRecente = Stream.concat(
                        Stream.of(nivelA, nivelB, entrada, saida).flatMap(Optional::stream),
                        consumos.stream())
                .map(Leitura::getDataHora)
                .max(Comparator.naturalOrder())
                .orElse(null);

        return new UltimaLeituraResponse(
                maisRecente,
                nivelA.map(Leitura::getValor).orElse(null),
                nivelB.map(Leitura::getValor).orElse(null),
                entrada.map(Leitura::getValor).orElse(null),
                saida.map(Leitura::getValor).orElse(null),
                potenciaTotal,
                simulacaoAtiva);
    }

    private void verificarLimites(Leitura leitura) {
        double valor = leitura.getValor();
        String sensor = leitura.getSensor();

        switch (leitura.getTipo()) {
            case NIVEL -> {
                if (valor < nivelMinimo) {
                    falhaService.registrarSeNaoAberta("NIVEL_BAIXO",
                            String.format(PT_BR, "Nível do %s em %.1f%% (mínimo %.0f%%). Risco de falta de água.",
                                    sensor, valor, nivelMinimo),
                            Severidade.ALTA, sensor);
                } else if (valor > nivelMaximo) {
                    falhaService.registrarSeNaoAberta("NIVEL_ALTO",
                            String.format(PT_BR, "Nível do %s em %.1f%% (máximo %.0f%%). Risco de transbordo.",
                                    sensor, valor, nivelMaximo),
                            Severidade.MEDIA, sensor);
                }
            }
            case VAZAO -> {
                if (valor > vazaoMaxima) {
                    falhaService.registrarSeNaoAberta("VAZAO_ALTA",
                            String.format(PT_BR, "Vazão de %.1f L/min em %s (máximo %.0f L/min). Possível vazamento.",
                                    valor, sensor, vazaoMaxima),
                            Severidade.MEDIA, sensor);
                }
            }
            case ENERGIA -> {
                if (valor > consumoMaximo) {
                    falhaService.registrarSeNaoAberta("SOBRECARGA",
                            String.format(PT_BR, "Consumo de %.2f kW em %s (máximo %.0f kW). Sobrecarga elétrica.",
                                    valor, sensor, consumoMaximo),
                            Severidade.CRITICA, sensor);
                }
            }
        }
    }

    private static String normalizar(String texto) {
        return texto.trim().toUpperCase(Locale.ROOT);
    }

    private static int normalizarLimite(Integer limite) {
        if (limite == null) {
            return LIMITE_PADRAO;
        }
        if (limite < 1 || limite > LIMITE_MAXIMO) {
            throw new IllegalArgumentException("limite deve estar entre 1 e " + LIMITE_MAXIMO);
        }
        return limite;
    }

    private static int normalizarMinutos(int minutos) {
        if (minutos < 1 || minutos > MINUTOS_MAXIMO) {
            throw new IllegalArgumentException("minutos deve estar entre 1 e " + MINUTOS_MAXIMO);
        }
        return minutos;
    }
}

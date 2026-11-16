package br.com.fiap.estacao.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

/**
 * Leitura registrada por um sensor da estação (nível, vazão ou consumo elétrico).
 */
@Entity
@Table(name = "leituras")
public class Leitura {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TipoLeitura tipo;

    /** Identificação do sensor, ex.: RES-A, ENTRADA, BOMBA-01. */
    @Column(nullable = false, length = 50)
    private String sensor;

    @Column(nullable = false)
    private Double valor;

    @Column(nullable = false, length = 20)
    private String unidade;

    @Column(nullable = false)
    private LocalDateTime dataHora;

    /** Construtor exigido pelo JPA. */
    protected Leitura() {
    }

    public Leitura(TipoLeitura tipo, String sensor, Double valor, String unidade) {
        this.tipo = tipo;
        this.sensor = sensor;
        this.valor = valor;
        this.unidade = unidade;
        this.dataHora = LocalDateTime.now().truncatedTo(ChronoUnit.SECONDS);
    }

    public Long getId() {
        return id;
    }

    public TipoLeitura getTipo() {
        return tipo;
    }

    public String getSensor() {
        return sensor;
    }

    public Double getValor() {
        return valor;
    }

    public String getUnidade() {
        return unidade;
    }

    public LocalDateTime getDataHora() {
        return dataHora;
    }
}

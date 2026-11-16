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
 * Equipamento acionável da estação (bomba ou válvula).
 */
@Entity
@Table(name = "atuadores")
public class Atuador {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Código único do equipamento, ex.: BOMBA-01. */
    @Column(nullable = false, unique = true, length = 30)
    private String codigo;

    @Column(nullable = false, length = 100)
    private String nome;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TipoAtuador tipo;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private EstadoAtuador estado;

    /** Potência nominal, usada para simular o consumo elétrico. */
    @Column(nullable = false)
    private Double potenciaKw;

    @Column(nullable = false)
    private LocalDateTime atualizadoEm;

    /** Construtor exigido pelo JPA. */
    protected Atuador() {
    }

    public Atuador(String codigo, String nome, TipoAtuador tipo, EstadoAtuador estado, Double potenciaKw) {
        this.codigo = codigo;
        this.nome = nome;
        this.tipo = tipo;
        this.estado = estado;
        this.potenciaKw = potenciaKw;
        this.atualizadoEm = LocalDateTime.now().truncatedTo(ChronoUnit.SECONDS);
    }

    /** Liga/desliga (ou abre/fecha) o equipamento. */
    public void alterarEstado(EstadoAtuador novoEstado) {
        this.estado = novoEstado;
        this.atualizadoEm = LocalDateTime.now().truncatedTo(ChronoUnit.SECONDS);
    }

    public boolean isLigado() {
        return estado == EstadoAtuador.LIGADO;
    }

    public Long getId() {
        return id;
    }

    public String getCodigo() {
        return codigo;
    }

    public String getNome() {
        return nome;
    }

    public TipoAtuador getTipo() {
        return tipo;
    }

    public EstadoAtuador getEstado() {
        return estado;
    }

    public Double getPotenciaKw() {
        return potenciaKw;
    }

    public LocalDateTime getAtualizadoEm() {
        return atualizadoEm;
    }
}

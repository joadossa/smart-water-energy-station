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
 * Falha (alerta) detectada na estação, aberta automaticamente pelas regras
 * de limite ou registrada manualmente pela API.
 */
@Entity
@Table(name = "falhas")
public class Falha {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Código da falha, ex.: NIVEL_BAIXO, SOBRECARGA. */
    @Column(nullable = false, length = 50)
    private String codigo;

    @Column(nullable = false, length = 255)
    private String descricao;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Severidade severidade;

    /** Sensor ou equipamento de origem, ex.: RES-A, BOMBA-01. */
    @Column(nullable = false, length = 50)
    private String origem;

    @Column(nullable = false)
    private LocalDateTime dataHora;

    @Column(nullable = false)
    private boolean resolvida;

    private LocalDateTime resolvidaEm;

    /** Construtor exigido pelo JPA. */
    protected Falha() {
    }

    public Falha(String codigo, String descricao, Severidade severidade, String origem) {
        this.codigo = codigo;
        this.descricao = descricao;
        this.severidade = severidade;
        this.origem = origem;
        this.resolvida = false;
        this.dataHora = LocalDateTime.now().truncatedTo(ChronoUnit.SECONDS);
    }

    /** Marca a falha como resolvida (operação idempotente). */
    public void resolver() {
        if (!resolvida) {
            this.resolvida = true;
            this.resolvidaEm = LocalDateTime.now().truncatedTo(ChronoUnit.SECONDS);
        }
    }

    public Long getId() {
        return id;
    }

    public String getCodigo() {
        return codigo;
    }

    public String getDescricao() {
        return descricao;
    }

    public Severidade getSeveridade() {
        return severidade;
    }

    public String getOrigem() {
        return origem;
    }

    public LocalDateTime getDataHora() {
        return dataHora;
    }

    public boolean isResolvida() {
        return resolvida;
    }

    public LocalDateTime getResolvidaEm() {
        return resolvidaEm;
    }
}

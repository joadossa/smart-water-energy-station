package br.com.fiap.estacao.model;

/**
 * Tipos de leitura enviados pelos sensores da estação.
 */
public enum TipoLeitura {

    /** Nível do reservatório, em porcentagem. */
    NIVEL("%"),

    /** Vazão de água, em litros por minuto. */
    VAZAO("L/min"),

    /** Consumo elétrico (simulado), em quilowatts. */
    ENERGIA("kW");

    private final String unidadePadrao;

    TipoLeitura(String unidadePadrao) {
        this.unidadePadrao = unidadePadrao;
    }

    public String getUnidadePadrao() {
        return unidadePadrao;
    }
}

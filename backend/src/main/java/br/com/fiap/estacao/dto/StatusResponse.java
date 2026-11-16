package br.com.fiap.estacao.dto;

import br.com.fiap.estacao.model.Atuador;
import br.com.fiap.estacao.model.Falha;
import br.com.fiap.estacao.model.Leitura;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Resposta do GET /api/status: tudo que o painel do app precisa em uma única chamada.
 *
 * @param niveis         última leitura de nível de cada reservatório
 * @param vazoes         última leitura de cada sensor de vazão
 * @param consumos       última leitura de consumo de cada equipamento
 * @param consumoTotalKw soma dos consumos atuais
 * @param falhasAbertas  quantidade de falhas ainda não resolvidas
 * @param ultimasFalhas  até 5 falhas abertas mais recentes
 */
public record StatusResponse(
        LocalDateTime dataHora,
        List<Leitura> niveis,
        List<Leitura> vazoes,
        List<Leitura> consumos,
        double consumoTotalKw,
        List<Atuador> atuadores,
        long falhasAbertas,
        List<Falha> ultimasFalhas
) {
}

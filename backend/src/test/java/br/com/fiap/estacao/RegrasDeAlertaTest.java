package br.com.fiap.estacao;

import br.com.fiap.estacao.dto.LeituraRequest;
import br.com.fiap.estacao.model.Falha;
import br.com.fiap.estacao.model.Severidade;
import br.com.fiap.estacao.model.TipoLeitura;
import br.com.fiap.estacao.repository.FalhaRepository;
import br.com.fiap.estacao.repository.LeituraRepository;
import br.com.fiap.estacao.service.FalhaService;
import br.com.fiap.estacao.service.LeituraService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * Regras que abrem falhas automaticamente a partir das leituras (limites do application.properties).
 */
@SpringBootTest
class RegrasDeAlertaTest {

    @Autowired
    private LeituraService leituraService;

    @Autowired
    private FalhaService falhaService;

    @Autowired
    private FalhaRepository falhaRepository;

    @Autowired
    private LeituraRepository leituraRepository;

    @BeforeEach
    void limparBanco() {
        falhaRepository.deleteAll();
        leituraRepository.deleteAll();
    }

    @Test
    void nivelAbaixoDoMinimoAbreFalhaDeNivelBaixo() {
        leituraService.registrar(new LeituraRequest(TipoLeitura.NIVEL, "RES-B", 12.0, null));

        List<Falha> falhas = falhaRepository.findAll();
        assertEquals(1, falhas.size());
        assertEquals("NIVEL_BAIXO", falhas.get(0).getCodigo());
        assertEquals(Severidade.ALTA, falhas.get(0).getSeveridade());
        assertEquals("RES-B", falhas.get(0).getOrigem());
    }

    @Test
    void leituraDentroDosLimitesNaoAbreFalha() {
        leituraService.registrar(new LeituraRequest(TipoLeitura.NIVEL, "RES-A", 55.0, null));
        leituraService.registrar(new LeituraRequest(TipoLeitura.VAZAO, "SAIDA", 50.0, null));
        leituraService.registrar(new LeituraRequest(TipoLeitura.ENERGIA, "BOMBA-01", 7.5, null));

        assertEquals(0, falhaRepository.count());
    }

    @Test
    void naoDuplicaFalhaEnquantoElaEstiverAberta() {
        leituraService.registrar(new LeituraRequest(TipoLeitura.NIVEL, "RES-B", 15.0, null));
        leituraService.registrar(new LeituraRequest(TipoLeitura.NIVEL, "RES-B", 14.0, null));
        leituraService.registrar(new LeituraRequest(TipoLeitura.NIVEL, "RES-B", 13.0, null));

        assertEquals(1, falhaRepository.count());
    }

    @Test
    void aposResolverUmaNovaLeituraCriticaAbreOutraFalha() {
        leituraService.registrar(new LeituraRequest(TipoLeitura.NIVEL, "RES-B", 15.0, null));
        Falha primeira = falhaRepository.findAll().get(0);

        Falha resolvida = falhaService.resolver(primeira.getId());
        assertTrue(resolvida.isResolvida());

        leituraService.registrar(new LeituraRequest(TipoLeitura.NIVEL, "RES-B", 14.0, null));
        assertEquals(2, falhaRepository.count());
        assertEquals(1, falhaService.contarAbertas());
    }

    @Test
    void consumoAcimaDoLimiteAbreFalhaCriticaDeSobrecarga() {
        leituraService.registrar(new LeituraRequest(TipoLeitura.ENERGIA, "BOMBA-01", 17.3, null));

        Falha falha = falhaRepository.findAll().get(0);
        assertEquals("SOBRECARGA", falha.getCodigo());
        assertEquals(Severidade.CRITICA, falha.getSeveridade());
    }

    @Test
    void unidadePadraoEhPreenchidaQuandoNaoInformada() {
        assertEquals("L/min",
                leituraService.registrar(new LeituraRequest(TipoLeitura.VAZAO, "entrada", 40.0, null)).getUnidade());
        assertEquals("ENTRADA", leituraService.ultima(TipoLeitura.VAZAO, "ENTRADA").orElseThrow().getSensor());
    }
}

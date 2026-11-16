package br.com.fiap.estacao;

import br.com.fiap.estacao.repository.AtuadorRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.context.SpringBootTest;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * Sobe a API em uma porta aleatória e faz requisições HTTP reais aos endpoints.
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class ApiEndpointsTest {

    private final HttpClient http = HttpClient.newHttpClient();

    @Value("${local.server.port}")
    private int porta;

    @Autowired
    private AtuadorRepository atuadorRepository;

    @Test
    void statusRetornaAtuadoresLimitesECapacidades() throws Exception {
        HttpResponse<String> resposta = enviar("GET", "/api/status", null);

        assertEquals(200, resposta.statusCode());
        assertTrue(resposta.body().contains("BOMBA-01"), resposta.body());
        assertTrue(resposta.body().contains("\"limites\""), resposta.body());
        assertTrue(resposta.body().contains("\"capacidadesLitros\""), resposta.body());
    }

    @Test
    void registrarLeituraValidaRetorna201() throws Exception {
        HttpResponse<String> resposta = enviar("POST", "/api/leituras",
                "{\"tipo\":\"NIVEL\",\"sensor\":\"RES-A\",\"valor\":55.5}");

        assertEquals(201, resposta.statusCode(), resposta.body());
        assertTrue(resposta.body().contains("\"sensor\":\"RES-A\""), resposta.body());
        assertTrue(resposta.body().contains("\"unidade\":\"%\""), resposta.body());
    }

    @Test
    void registrarLeituraInvalidaRetorna400ComOsCampos() throws Exception {
        HttpResponse<String> resposta = enviar("POST", "/api/leituras",
                "{\"tipo\":\"NIVEL\",\"valor\":-1}");

        assertEquals(400, resposta.statusCode(), resposta.body());
        assertTrue(resposta.body().contains("\"campos\""), resposta.body());
        assertTrue(resposta.body().contains("sensor"), resposta.body());
    }

    @Test
    void tipoDeLeituraInexistenteRetorna400() throws Exception {
        HttpResponse<String> resposta = enviar("POST", "/api/leituras",
                "{\"tipo\":\"PRESSAO\",\"sensor\":\"X\",\"valor\":1}");

        assertEquals(400, resposta.statusCode(), resposta.body());
    }

    @Test
    void ultimaLeituraConsolidaOsValoresMaisRecentes() throws Exception {
        enviar("POST", "/api/leituras", "{\"tipo\":\"NIVEL\",\"sensor\":\"RES-B\",\"valor\":33.3}");
        enviar("POST", "/api/leituras", "{\"tipo\":\"VAZAO\",\"sensor\":\"SAIDA\",\"valor\":24.6}");

        HttpResponse<String> resposta = enviar("GET", "/api/leituras/ultima", null);

        assertEquals(200, resposta.statusCode(), resposta.body());
        assertTrue(resposta.body().contains("\"nivelReservatorioB\":33.3"), resposta.body());
        assertTrue(resposta.body().contains("\"vazaoSaida\":24.6"), resposta.body());
    }

    @Test
    void historicoPorPeriodoFiltraPorTipoESensor() throws Exception {
        enviar("POST", "/api/leituras", "{\"tipo\":\"VAZAO\",\"sensor\":\"ENTRADA\",\"valor\":41.0}");

        HttpResponse<String> resposta = enviar("GET", "/api/leituras?tipo=VAZAO&sensor=ENTRADA&minutos=15", null);

        assertEquals(200, resposta.statusCode(), resposta.body());
        assertTrue(resposta.body().contains("\"sensor\":\"ENTRADA\""), resposta.body());
    }

    @Test
    void putAtuadorAlteraEOEstadoFicaGravado() throws Exception {
        Long id = atuadorRepository.findByCodigo("BOMBA-02").orElseThrow().getId();

        HttpResponse<String> resposta = enviar("PUT", "/api/atuadores/" + id, "{\"estado\":\"LIGADO\"}");
        assertEquals(200, resposta.statusCode(), resposta.body());
        assertTrue(resposta.body().contains("\"estado\":\"LIGADO\""), resposta.body());

        HttpResponse<String> consulta = enviar("GET", "/api/atuadores/" + id, null);
        assertTrue(consulta.body().contains("\"estado\":\"LIGADO\""), consulta.body());

        enviar("PUT", "/api/atuadores/" + id, "{\"estado\":\"DESLIGADO\"}");
    }

    @Test
    void atuadorInexistenteRetorna404() throws Exception {
        HttpResponse<String> resposta = enviar("PUT", "/api/atuadores/999999", "{\"estado\":\"LIGADO\"}");

        assertEquals(404, resposta.statusCode(), resposta.body());
    }

    @Test
    void resolverFalhaInexistenteRetorna404() throws Exception {
        HttpResponse<String> resposta = enviar("PATCH", "/api/falhas/999999/resolver", null);

        assertEquals(404, resposta.statusCode(), resposta.body());
    }

    private HttpResponse<String> enviar(String metodo, String caminho, String json) throws Exception {
        HttpRequest.Builder requisicao = HttpRequest.newBuilder(URI.create("http://localhost:" + porta + caminho))
                .header("Accept", "application/json");
        if (json != null) {
            requisicao.header("Content-Type", "application/json")
                    .method(metodo, HttpRequest.BodyPublishers.ofString(json));
        } else {
            requisicao.method(metodo, HttpRequest.BodyPublishers.noBody());
        }
        return http.send(requisicao.build(), HttpResponse.BodyHandlers.ofString());
    }
}

package br.com.fiap.estacao.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Metadados exibidos no Swagger UI (http://localhost:8080/swagger-ui.html).
 */
@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI documentacaoAquaPulse() {
        return new OpenAPI().info(new Info()
                .title("AquaPulse API — Smart Water & Energy Station")
                .version("1.0")
                .description("API REST da estação: leituras dos sensores (nível, vazão e consumo elétrico simulado), "
                        + "acionamento de bombas e válvula e gestão de falhas. "
                        + "Dados persistidos em H2 modo arquivo (jdbc:h2:file:./data/estacao)."));
    }
}

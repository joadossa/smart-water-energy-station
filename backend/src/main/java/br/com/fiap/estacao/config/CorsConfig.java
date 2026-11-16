package br.com.fiap.estacao.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * CORS para o ambiente de desenvolvimento: libera apenas as origens configuradas em
 * estacao.cors.origens (padrão: localhost e 127.0.0.1 em qualquer porta).
 * Necessário só quando o app roda no navegador (Expo web); apps nativos não usam CORS.
 */
@Configuration
public class CorsConfig implements WebMvcConfigurer {

    private final String[] origens;

    public CorsConfig(@Value("${estacao.cors.origens:http://localhost:[*],http://127.0.0.1:[*]}") String[] origens) {
        this.origens = origens;
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOriginPatterns(origens)
                .allowedMethods("GET", "POST", "PUT", "PATCH", "OPTIONS")
                .allowedHeaders("*");
    }
}

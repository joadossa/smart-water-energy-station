package br.com.fiap.estacao;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

import java.util.TimeZone;

@SpringBootApplication
@EnableScheduling
public class EstacaoApplication {

    public static void main(String[] args) {
        // Datas das leituras e falhas no horário de Brasília
        TimeZone.setDefault(TimeZone.getTimeZone("America/Sao_Paulo"));
        SpringApplication.run(EstacaoApplication.class, args);
    }
}

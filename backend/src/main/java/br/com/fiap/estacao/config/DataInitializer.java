package br.com.fiap.estacao.config;

import br.com.fiap.estacao.model.Atuador;
import br.com.fiap.estacao.model.EstadoAtuador;
import br.com.fiap.estacao.model.TipoAtuador;
import br.com.fiap.estacao.repository.AtuadorRepository;
import br.com.fiap.estacao.repository.FalhaRepository;
import br.com.fiap.estacao.repository.LeituraRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Na primeira execução (banco vazio) cadastra os atuadores da estação.
 * Nas execuções seguintes apenas informa no log o que já está gravado no arquivo H2,
 * o que ajuda a demonstrar a persistência após reiniciar a aplicação.
 */
@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final AtuadorRepository atuadorRepository;
    private final LeituraRepository leituraRepository;
    private final FalhaRepository falhaRepository;

    public DataInitializer(AtuadorRepository atuadorRepository,
                           LeituraRepository leituraRepository,
                           FalhaRepository falhaRepository) {
        this.atuadorRepository = atuadorRepository;
        this.leituraRepository = leituraRepository;
        this.falhaRepository = falhaRepository;
    }

    @Override
    public void run(String... args) {
        if (atuadorRepository.count() == 0) {
            atuadorRepository.saveAll(List.of(
                    new Atuador("BOMBA-01", "Bomba de recalque - Reservatório A", TipoAtuador.BOMBA, EstadoAtuador.LIGADO, 7.5),
                    new Atuador("BOMBA-02", "Bomba de recalque - Reservatório B", TipoAtuador.BOMBA, EstadoAtuador.DESLIGADO, 5.5),
                    new Atuador("VALVULA-01", "Válvula de distribuição", TipoAtuador.VALVULA, EstadoAtuador.LIGADO, 0.2)));
            log.info("Banco novo: atuadores iniciais cadastrados (BOMBA-01, BOMBA-02, VALVULA-01)");
        } else {
            log.info("Dados persistidos encontrados no H2 (./data/estacao): {} atuadores, {} leituras, {} falhas",
                    atuadorRepository.count(), leituraRepository.count(), falhaRepository.count());
        }
    }
}

<p align="center"><img src="../docs/aquapulse-banner.png" alt="AquaPulse" width="560"></p>

# AquaPulse — Backend (API REST)

Backend da *Smart Water & Energy Station*, uma API em **Spring Boot (Java 21)**. Ela registra as leituras dos sensores da estação (níveis, vazão e consumo elétrico), aciona os atuadores (bombas e válvula) e controla as falhas. Os dados ficam em um **banco H2 em modo arquivo** (`jdbc:h2:file:./data/estacao`) e continuam lá depois de reiniciar a aplicação.

Disciplina: **Técnicas Avançadas de Programação** — Global Solution 2026.2 (FIAP)

## Integrantes

| Nome completo | RM |
|---|---|
| João Victor Pereira | 550306 |
| *(integrante 2 — preencher)* | *(RM)* |
| *(integrante 3 — preencher)* | *(RM)* |

## Tecnologias

- Java 21 + Spring Boot 4 (Spring Web MVC, Spring Data JPA, Bean Validation)
- H2 Database em modo arquivo + console web do H2
- springdoc-openapi (Swagger UI) para a documentação interativa
- JUnit 5 + Spring Boot Test (testes de regras e de endpoints)
- Maven Wrapper (`mvnw` / `mvnw.cmd`): não é preciso instalar o Maven

## Como executar

Pré-requisito: **JDK 21** (`java -version` deve mostrar 21).

**WSL / Linux / macOS**

```bash
cd backend
./mvnw spring-boot:run
```

**Windows (PowerShell ou CMD)**

```powershell
cd backend
.\mvnw.cmd spring-boot:run
```

A API sobe em **http://localhost:8080**. Na primeira execução o log mostra:

```
Banco novo: atuadores iniciais cadastrados (BOMBA-01, BOMBA-02, VALVULA-01)
```

| Recurso | URL |
|---|---|
| Estado da estação | http://localhost:8080/api/status |
| Swagger UI (documentação interativa, "AquaPulse API") | http://localhost:8080/swagger-ui.html |
| OpenAPI (JSON) | http://localhost:8080/v3/api-docs |
| Console do H2 | http://localhost:8080/h2-console |

Para rodar **sem o simulador** (apenas os dados enviados pela API):

```bash
./mvnw spring-boot:run -Dspring-boot.run.arguments=--estacao.simulador.habilitado=false
```

### Testes automatizados

```bash
./mvnw test          # Windows: .\mvnw.cmd test
```

Os testes usam um banco em memória e não alteram o arquivo `./data/estacao`.

| Classe | O que testa |
|---|---|
| `RegrasDeAlertaTest` | Nível baixo abre falha, falha aberta não duplica, reabre após resolver, sobrecarga gera falha crítica |
| `ApiEndpointsTest` | Sobe a API em porta aleatória e faz requisições HTTP reais: status, POST de leitura (201/400), leitura consolidada, histórico por período, PUT de atuador e respostas 404 |
| `EstacaoApplicationTests` | O contexto do Spring sobe sem erros |

## Banco de dados e persistência

- URL: `jdbc:h2:file:./data/estacao` → arquivo `backend/data/estacao.mv.db`. É relativo à pasta de onde o backend é iniciado, por isso rode sempre a partir de `backend/`.
- `spring.jpa.hibernate.ddl-auto=update`: as tabelas são criadas e atualizadas **sem apagar** os dados.
- Os dados iniciais (3 atuadores) são inseridos **apenas na primeira execução**.
- O arquivo do banco **não** vai para o Git (`.gitignore`). Ele é gerado ao rodar.

**Console do H2:** abra http://localhost:8080/h2-console e use
JDBC URL `jdbc:h2:file:./data/estacao`, usuário `sa`, senha em branco.

### Como comprovar a persistência

1. Suba a API e registre uma leitura. Anote o `id` retornado:
   ```bash
   curl -X POST http://localhost:8080/api/leituras -H "Content-Type: application/json" \
        -d '{"tipo":"NIVEL","sensor":"RES-A","valor":77.7}'
   ```
2. Ligue a Bomba 02: `curl -X PUT http://localhost:8080/api/atuadores/2 -H "Content-Type: application/json" -d '{"estado":"LIGADO"}'`
3. Pare a aplicação (**Ctrl+C**) e suba de novo.
4. O log mostra o que foi encontrado no arquivo:
   ```
   Dados persistidos encontrados no H2 (./data/estacao): 3 atuadores, N leituras, M falhas
   ```
5. `curl http://localhost:8080/api/leituras/<id>`: a leitura continua lá.
   `curl http://localhost:8080/api/atuadores/2`: a bomba continua `LIGADO`.

## Endpoints

Base: `http://localhost:8080/api`. Todas as respostas são JSON.

| Método | Endpoint | Descrição |
|---|---|---|
| `GET` | `/status` | Estado operacional: última leitura de cada sensor, consumo total, atuadores, falhas abertas, limites, capacidades e se os dados são simulados |
| `GET` | `/leituras/ultima` | Leitura mais recente consolidada (nível A/B, vazões, potência total) |
| `GET` | `/leituras?tipo=&sensor=&minutos=&limite=` | Histórico (mais recentes primeiro). `minutos` de 1 a 1440, `limite` de 1 a 2000 (padrão 50) |
| `GET` | `/leituras/{id}` | Busca uma leitura |
| `POST` | `/leituras` | **Registra uma leitura**. Abre falha automática se passar do limite |
| `GET` | `/atuadores` | Lista bombas e válvula |
| `GET` | `/atuadores/{id}` | Busca um atuador |
| `PUT` | `/atuadores/{id}` | **Liga/desliga** o atuador (válvula: LIGADO = aberta) |
| `POST` | `/atuadores/{id}/acionar` | Mesmo efeito do PUT (compatibilidade) |
| `GET` | `/falhas?status=&limite=` | Lista falhas: `ABERTAS`, `RESOLVIDAS` ou `TODAS` (padrão) |
| `GET` | `/falhas/{id}` | Busca uma falha |
| `POST` | `/falhas` | Registra uma falha manualmente |
| `PATCH` | `/falhas/{id}/resolver` | Marca a falha como resolvida |

Exemplos prontos de todas as chamadas: [`requests.http`](requests.http).

### POST /api/leituras

```json
{ "tipo": "NIVEL", "sensor": "RES-A", "valor": 72.5 }
```

- `tipo`: `NIVEL` (%), `VAZAO` (L/min) ou `ENERGIA` (kW)
- `sensor`: `RES-A`, `RES-B`, `ENTRADA`, `SAIDA`, `BOMBA-01`, `BOMBA-02`, `PAINEL` (ou outro identificador)
- `valor`: número ≥ 0. `unidade` é opcional (usa a padrão do tipo)

Resposta **201 Created**:

```json
{ "id": 15, "tipo": "NIVEL", "sensor": "RES-A", "valor": 72.5, "unidade": "%", "dataHora": "2026-11-16T10:20:30" }
```

### GET /api/leituras/ultima

```json
{ "dataHora": "2026-11-16T10:20:30", "nivelReservatorioA": 67.0, "nivelReservatorioB": 18.4,
  "vazaoEntrada": 42.1, "vazaoSaida": 24.6, "potenciaTotalKw": 7.9, "simulacaoAtiva": true }
```

### PUT /api/atuadores/{id}

```json
{ "estado": "LIGADO" }
```

Resposta **200 OK** com o atuador atualizado, ou **404** se o id não existir:

```json
{ "id": 2, "codigo": "BOMBA-02", "nome": "Bomba de recalque - Reservatório B", "tipo": "BOMBA",
  "estado": "LIGADO", "potenciaKw": 5.5, "atualizadoEm": "2026-11-16T10:21:02", "ligado": true }
```

### GET /api/status (trecho)

```json
{
  "falhasAbertas": 1,
  "limites": { "nivelMinimo": 20.0, "nivelMaximo": 95.0, "vazaoMaxima": 120.0, "consumoMaximo": 15.0 },
  "capacidadesLitros": { "RES-A": 10000.0, "RES-B": 8000.0 },
  "simulacaoAtiva": true,
  "niveis": [ { "sensor": "RES-A", "valor": 67.0, "unidade": "%", "dataHora": "2026-11-16T10:20:30" } ]
}
```

### Erros

```json
{ "timestamp": "2026-11-16T10:30:00", "status": 400, "erro": "Bad Request",
  "mensagem": "Dados inválidos", "campos": { "sensor": "sensor é obrigatório" } }
```

| Status | Quando |
|---|---|
| 400 | Campos inválidos, JSON malformado, enum inexistente, `limite`/`minutos` fora da faixa |
| 404 | Leitura, atuador ou falha não encontrado |

## Configuração (`application.properties`)

| Propriedade | Padrão | Função |
|---|---|---|
| `estacao.limites.nivel-minimo` / `nivel-maximo` | 20 / 95 | Abrem `NIVEL_BAIXO` (ALTA) / `NIVEL_ALTO` (MEDIA) |
| `estacao.limites.vazao-maxima` | 120 | Abre `VAZAO_ALTA` (MEDIA) |
| `estacao.limites.consumo-maximo` | 15 | Abre `SOBRECARGA` (CRITICA) por equipamento |
| `estacao.reservatorios.capacidade-a-litros` / `-b-litros` | 10000 / 8000 | Volume em litros exibido no app |
| `estacao.simulador.habilitado` | true | Liga o simulador de sensores |
| `estacao.simulador.intervalo-ms` | 10000 | Intervalo entre leituras simuladas |
| `estacao.cors.origens` | `http://localhost:[*],http://127.0.0.1:[*]` | Origens liberadas para o app no navegador |

Uma falha **não é duplicada** enquanto a anterior (mesmo código e origem) estiver aberta. Depois de resolvida, uma nova leitura fora do limite abre outra.

## Simulador de sensores (valores simulados)

Com `estacao.simulador.habilitado=true`, a cada 10 s o backend gera leituras **simuladas**:

- **Nível** de `RES-A` e `RES-B`: sobe com a bomba correspondente ligada e desce com a válvula aberta
- **Vazão** de `ENTRADA` (bombas) e `SAIDA` (válvula)
- **Consumo elétrico** de `BOMBA-01`, `BOMBA-02` e `PAINEL`

O campo `simulacaoAtiva` em `/api/status` e `/api/leituras/ultima` indica que os valores são simulados. Acionar os atuadores muda a simulação. Por exemplo, com a `BOMBA-02` desligada e a válvula aberta, o reservatório B esvazia até abrir `NIVEL_BAIXO`.

## Solução de problemas

| Sintoma | Causa provável / solução |
|---|---|
| `404` em `/api/status` | Versão antiga em execução. Pare (Ctrl+C), atualize o código e suba de novo |
| `Port 8080 was already in use` | Outra instância rodando. Feche-a (Linux: `ss -ltnp \| grep 8080`; Windows: `netstat -ano \| findstr 8080`) |
| `Database may be already in use` | Duas instâncias abrindo o mesmo arquivo H2. Deixe só uma rodando |
| Dados "sumiram" | O backend foi iniciado de outra pasta, e `./data` é relativo. Rode a partir de `backend/` |
| `Invalid character found in method name` no log | O navegador tentou **https**. Use `http://localhost:8080` |
| App no navegador com erro de CORS | Inclua a origem em `estacao.cors.origens` |

## Estrutura

```
backend/
├── data/                         # arquivo do banco H2 (gerado ao rodar)
├── requests.http                 # exemplos de requisições
└── src/
    ├── main/java/br/com/fiap/estacao/
    │   ├── config/      CorsConfig, DataInitializer, ParametrosEstacao, OpenApiConfig
    │   ├── controller/  Leitura, Atuador, Falha e Status
    │   ├── dto/         objetos de entrada/saída da API
    │   ├── exception/   tratamento global de erros
    │   ├── model/       entidades JPA e enums
    │   ├── repository/  Spring Data JPA
    │   └── service/     regras de negócio + simulador
    └── test/java/...    RegrasDeAlertaTest, ApiEndpointsTest
```

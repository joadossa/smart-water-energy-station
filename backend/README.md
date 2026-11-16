# Smart Water & Energy Station — Backend (API REST)

API em **Spring Boot (Java 21)** que registra as leituras dos sensores da estação (níveis, vazão e consumo elétrico), aciona os atuadores (bombas e válvula) e lista as falhas. Os dados ficam gravados em um **banco H2 em modo arquivo** (`jdbc:h2:file:./data/estacao`) e continuam lá depois de reiniciar a aplicação.

Disciplina: **Técnicas Avançadas de Programação** — Global Solution 2026.2 (FIAP)

## Integrantes

| Nome completo | RM |
|---|---|
| João Victor Pereira | 550306 |

## Tecnologias

- Java 21 + Spring Boot 4 (Spring Web MVC, Spring Data JPA, Bean Validation)
- H2 Database em modo arquivo + console web do H2
- springdoc-openapi (Swagger UI) para a documentação interativa dos endpoints
- Maven (wrapper `./mvnw` incluído, não precisa instalar o Maven)

## Como executar

Pré-requisito: **JDK 21** instalado (`java -version`).

```bash
cd backend
./mvnw spring-boot:run          # Linux / macOS / WSL
# mvnw.cmd spring-boot:run      # Windows (PowerShell/CMD)
```

A API sobe em **http://localhost:8080**. Na primeira execução o log mostra:

```
Banco novo: atuadores iniciais cadastrados (BOMBA-01, BOMBA-02, VALVULA-01)
```

| Recurso | URL |
|---|---|
| Resumo da estação | http://localhost:8080/api/status |
| Swagger UI (documentação interativa) | http://localhost:8080/swagger-ui.html |
| OpenAPI (JSON) | http://localhost:8080/v3/api-docs |
| Console do H2 | http://localhost:8080/h2-console |

Para rodar **sem o simulador** de sensores (só dados enviados pela API):

```bash
./mvnw spring-boot:run -Dspring-boot.run.arguments=--estacao.simulador.habilitado=false
```

Testes automatizados (usam banco em memória, não mexem no arquivo):

```bash
./mvnw test
```

## Banco de dados e persistência

- URL: `jdbc:h2:file:./data/estacao` → arquivo `backend/data/estacao.mv.db`
- `spring.jpa.hibernate.ddl-auto=update`: as tabelas são criadas/atualizadas **sem apagar** os dados
- O arquivo do banco **não** vai para o Git (`.gitignore`), é gerado ao rodar

**Console do H2:** abra http://localhost:8080/h2-console e use
JDBC URL `jdbc:h2:file:./data/estacao`, usuário `sa`, senha em branco.

### Como comprovar que os dados persistem após reiniciar

1. Suba a API: `./mvnw spring-boot:run`
2. Registre uma leitura e anote o `id` retornado:
   ```bash
   curl -X POST http://localhost:8080/api/leituras \
        -H "Content-Type: application/json" \
        -d '{"tipo":"NIVEL","sensor":"RES-A","valor":77.7}'
   ```
3. Pare a aplicação (**Ctrl+C**) e suba de novo.
4. O log mostra o que foi encontrado no arquivo:
   ```
   Dados persistidos encontrados no H2 (./data/estacao): 3 atuadores, N leituras, M falhas
   ```
5. Busque a leitura pelo id e veja que ela continua lá:
   ```bash
   curl http://localhost:8080/api/leituras/<id>
   ```

O estado das bombas e válvulas também é mantido. Se você desligar uma bomba e reiniciar, ela continua desligada. O simulador retoma os níveis a partir da última leitura gravada.

## Endpoints

Base: `http://localhost:8080/api`

| Método | Endpoint | Descrição |
|---|---|---|
| `GET` | `/status` | Resumo para o painel: última leitura de cada sensor, consumo total, atuadores, falhas abertas |
| `POST` | `/leituras` | **Registra uma leitura** (nível, vazão ou energia). Abre falha automática se passar do limite |
| `GET` | `/leituras?tipo=&sensor=&limite=` | Lista leituras (mais recentes primeiro). Filtros opcionais |
| `GET` | `/leituras/{id}` | Busca uma leitura |
| `GET` | `/atuadores` | Lista bombas e válvula |
| `GET` | `/atuadores/{id}` | Busca um atuador |
| `POST` | `/atuadores/{id}/acionar` | **Aciona o atuador**: `LIGADO` / `DESLIGADO` (válvula: aberta / fechada) |
| `GET` | `/falhas?status=&limite=` | **Lista falhas**: `ABERTAS`, `RESOLVIDAS` ou `TODAS` (padrão) |
| `GET` | `/falhas/{id}` | Busca uma falha |
| `POST` | `/falhas` | Registra uma falha manualmente |
| `PATCH` | `/falhas/{id}/resolver` | Marca a falha como resolvida |

Exemplos prontos de todas as chamadas: [`requests.http`](requests.http).

### POST /api/leituras

```json
{ "tipo": "NIVEL", "sensor": "RES-A", "valor": 72.5 }
```

- `tipo`: `NIVEL` (%), `VAZAO` (L/min) ou `ENERGIA` (kW)
- `sensor`: identificação do sensor (ex.: `RES-A`, `RES-B`, `ENTRADA`, `SAIDA`, `BOMBA-01`)
- `valor`: número maior ou igual a zero
- `unidade` (opcional): se omitida, usa a unidade padrão do tipo

Resposta **201 Created**:

```json
{ "id": 15, "tipo": "NIVEL", "sensor": "RES-A", "valor": 72.5, "unidade": "%", "dataHora": "2026-11-16T10:20:30" }
```

### POST /api/atuadores/{id}/acionar

```json
{ "estado": "LIGADO" }
```

Resposta **200 OK** com o atuador atualizado:

```json
{ "id": 2, "codigo": "BOMBA-02", "nome": "Bomba de recalque - Reservatório B", "tipo": "BOMBA",
  "estado": "LIGADO", "potenciaKw": 5.5, "atualizadoEm": "2026-11-16T10:21:02", "ligado": true }
```

### GET /api/falhas?status=ABERTAS

```json
[
  { "id": 4, "codigo": "NIVEL_BAIXO", "descricao": "Nível do RES-B em 18,6% (mínimo 20%). Risco de falta de água.",
    "severidade": "ALTA", "origem": "RES-B", "dataHora": "2026-11-16T10:25:10", "resolvida": false, "resolvidaEm": null }
]
```

### Erros

As respostas de erro seguem o mesmo formato:

```json
{ "timestamp": "2026-11-16T10:30:00", "status": 400, "erro": "Bad Request",
  "mensagem": "Dados inválidos", "campos": { "sensor": "sensor é obrigatório" } }
```

| Status | Quando |
|---|---|
| 400 | Campos inválidos, JSON malformado ou valor de enum inexistente |
| 404 | Leitura, atuador ou falha não encontrado |

## Regras de alerta (falhas automáticas)

Cada leitura registrada é comparada com os limites do `application.properties`. Se passar do limite, uma falha é aberta. Ela **não é duplicada** enquanto a anterior (mesmo código e origem) não for resolvida.

| Código | Condição | Severidade |
|---|---|---|
| `NIVEL_BAIXO` | nível < 20 % | ALTA |
| `NIVEL_ALTO` | nível > 95 % (risco de transbordo) | MEDIA |
| `VAZAO_ALTA` | vazão > 120 L/min (possível vazamento) | MEDIA |
| `SOBRECARGA` | consumo > 15 kW em um equipamento | CRITICA |

## Simulador de sensores

Com `estacao.simulador.habilitado=true` (padrão), a cada 10 segundos o backend gera leituras de:

- **Nível** dos reservatórios `RES-A` e `RES-B`, que sobem com as bombas ligadas e descem com a válvula aberta
- **Vazão** de `ENTRADA` (bombas) e `SAIDA` (válvula)
- **Consumo elétrico simulado** de `BOMBA-01`, `BOMBA-02` e `PAINEL`

Acionar os atuadores pelo app ou pela API muda a simulação. Por exemplo, com a `BOMBA-02` desligada e a válvula aberta, o reservatório B esvazia até gerar o alerta `NIVEL_BAIXO`. De vez em quando ocorre uma sobrecarga ou um pico de vazão, para demonstrar os alertas.

## Estrutura

```
backend/
├── data/                         # arquivo do banco H2 (gerado ao rodar)
├── requests.http                 # exemplos de requisições
└── src/main/java/br/com/fiap/estacao/
    ├── config/      CorsConfig, DataInitializer
    ├── controller/  Leitura, Atuador, Falha e Status
    ├── dto/         objetos de entrada/saída da API
    ├── exception/   tratamento global de erros
    ├── model/       entidades JPA e enums
    ├── repository/  Spring Data JPA
    └── service/     regras de negócio + simulador
```

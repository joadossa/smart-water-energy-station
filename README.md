# Smart Water & Energy Station

Painel de operação de uma estação inteligente de **água e energia**. O sistema tem duas partes:

- um **backend em Spring Boot** que registra as leituras dos sensores (níveis dos reservatórios, vazão e consumo elétrico simulado), aciona bombas e válvula e controla as falhas, com persistência em **H2 modo arquivo**;
- um **app mobile em React Native (Expo + TypeScript)**, no visual **Industrial Dark**, que consome a API e mostra tudo em tempo real.

**Global Solution 2026.2 — FIAP · Engenharia Mecatrônica (2º ano)**
Disciplinas: *Advanced Programming and Mobile Dev* (app) e *Técnicas Avançadas de Programação* (backend)

## Integrantes

| Nome completo | RM |
|---|---|
| João Victor Pereira | 550306 |
| *(integrante 2 — preencher)* | *(RM)* |
| *(integrante 3 — preencher)* | *(RM)* |

## Arquitetura

```
┌───────────────────────────────────┐   HTTP/JSON (polling ~5 s)   ┌──────────────────────────────────┐
│  App mobile · Expo + TypeScript   │ ───────────────────────────▶ │  API REST · Spring Boot (Java 21) │
│  Painel · Água · Energia · Alertas│ ◀─────────────────────────── │  /api/status   /api/leituras      │
│  medidores, gráficos, comandos    │                              │  /api/atuadores /api/falhas       │
│  aviso "API fora do ar"           │                              │  regras de alerta + simulador     │
└───────────────────────────────────┘                              └────────────────┬─────────────────┘
                                                                                     │ JPA
                                                                   ┌─────────────────▼─────────────────┐
                                                                   │  H2 modo arquivo                   │
                                                                   │  jdbc:h2:file:./data/estacao       │
                                                                   └───────────────────────────────────┘
```

| Pasta | Conteúdo | Documentação |
|---|---|---|
| [`backend/`](backend) | API REST (controller, service, repository, model, dto, config) + testes | [backend/README.md](backend/README.md) |
| [`mobile/`](mobile) | App Expo em TypeScript com React Navigation | [mobile/README.md](mobile/README.md) |

## Funcionalidades

**App**
- **Painel:** conectividade ("Estação online" / "API fora do ar"), banner da falha aberta, medidores circulares dos reservatórios A e B, vazão atual, consumo elétrico, bombas ("1 de 2 ligada") e gráfico de vazão dos últimos 15 min com tendência calculada
- **Água:** volume em litros sobre a capacidade configurada, histórico de níveis, mensagens de nível crítico, vazões e válvula
- **Energia:** potência instantânea (kW), histórico, energia estimada (kWh por integração potência × tempo) e controle das bombas com confirmação
- **Alertas:** falhas com origem, severidade, horário e estado; filtro, detalhes e resolução
- Contador de falhas abertas na aba, atualização automática e manual, e app que **não trava** sem a API

**Backend**
- Registra leituras, aciona atuadores, lista, registra e resolve falhas
- Falhas automáticas por limite configurável, sem duplicar falha aberta
- Simulador de sensores (valores identificados como simulados) e dados iniciais só na primeira execução
- Persistência em `jdbc:h2:file:./data/estacao`, comprovável reiniciando a API
- Endpoints documentados no README e no Swagger UI, com testes automatizados

## Pré-requisitos

| Ferramenta | Versão | Verificar |
|---|---|---|
| JDK | 21 | `java -version` |
| Node.js | 22 LTS ou mais novo | `node -v` |
| Git | qualquer recente | `git --version` |
| Expo Go (celular) | versão atual da loja | ou use o navegador/emulador |

O Maven não precisa ser instalado: o projeto usa o Maven Wrapper (`mvnw` / `mvnw.cmd`).

## Como executar

### Windows (PowerShell)

```powershell
git clone https://github.com/joadossa/smart-water-energy-station.git
cd smart-water-energy-station

# Terminal 1 - backend
cd backend
.\mvnw.cmd spring-boot:run

# Terminal 2 - app
cd mobile
npm install
npx expo start
```

Na primeira vez, o Windows pode pedir permissão de firewall para o **Java** e o **Node.js**. Permita em **redes privadas**.

### Linux / macOS / WSL

```bash
cd backend && ./mvnw spring-boot:run          # terminal 1
cd mobile && npm install && npx expo start    # terminal 2
```

Com o Expo rodando: leia o **QR code** com o Expo Go, ou aperte **`w`** para abrir no navegador, ou **`a`** para o emulador Android.

## Conexão do app com a API

O endereço da API fica centralizado em `src/context/ApiConfigContext.tsx`. O app escolhe o padrão nesta ordem:
1. a variável `EXPO_PUBLIC_API_URL`, se existir o arquivo `mobile/.env` (veja `mobile/.env.example`);
2. o IP do computador que está servindo o Expo, na porta 8080;
3. `http://localhost:8080`.

O endereço também pode ser trocado no app: **ícone de engrenagem → Configurações → Testar conexão → Salvar**.

| Onde o app roda | Endereço da API |
|---|---|
| Navegador no mesmo computador | `http://localhost:8080` |
| Simulador iOS (macOS) | `http://localhost:8080` |
| Emulador Android | `http://10.0.2.2:8080` (10.0.2.2 é o computador visto de dentro do emulador) |
| Celular físico (Expo Go) | `http://<IP-do-computador>:8080`, com celular e computador na **mesma rede Wi-Fi** |

**Backend no WSL e celular físico:** no modo de rede padrão do WSL2 (NAT), o celular não alcança o WSL diretamente. Ative o modo espelhado criando `%UserProfile%\.wslconfig` com:

```ini
[wsl2]
networkingMode=mirrored
```

Depois rode `wsl --shutdown` no PowerShell e abra o WSL de novo. Se o celular ainda não conectar, libere as portas 8080 e 8081 no firewall do Hyper-V/Windows. Detalhes em [Rede no WSL (Microsoft)](https://learn.microsoft.com/windows/wsl/networking). Como alternativa, faça a demonstração no navegador ou no emulador Android.

## Endpoints (resumo)

Base `http://localhost:8080/api`. Detalhes, exemplos de request/response e erros estão em [backend/README.md](backend/README.md). Uma coleção pronta está em [backend/requests.http](backend/requests.http).

| Método | Endpoint | Função |
|---|---|---|
| GET | `/status` | Estado operacional da estação |
| GET | `/leituras/ultima` | Leitura mais recente consolidada |
| GET | `/leituras?tipo=&sensor=&minutos=&limite=` | Histórico de leituras |
| POST | `/leituras` | Registrar leitura |
| GET | `/atuadores` | Consultar bombas e válvula |
| PUT | `/atuadores/{id}` | Ligar/desligar |
| GET | `/falhas?status=` | Listar falhas |
| PATCH | `/falhas/{id}/resolver` | Resolver falha |

Exemplo rápido com curl:

```bash
curl http://localhost:8080/api/leituras/ultima
curl -X POST http://localhost:8080/api/leituras -H "Content-Type: application/json" -d '{"tipo":"NIVEL","sensor":"RES-B","valor":12}'
curl -X PUT http://localhost:8080/api/atuadores/2 -H "Content-Type: application/json" -d '{"estado":"LIGADO"}'
```

Testes do backend: `cd backend && ./mvnw test` (Windows: `.\mvnw.cmd test`).

## Roteiro de demonstração

1. **Iniciar** o Spring Boot (`./mvnw spring-boot:run`) e o app (`npx expo start`).
2. **Visão geral:** o Painel mostra os dados vindos da API (medidores, vazão, consumo, bombas) e o horário da atualização.
3. **Nova leitura:** registre uma leitura (`POST /api/leituras`, via `requests.http` ou curl). Os indicadores e o gráfico mudam na próxima atualização, ou na hora pelo botão ↻.
4. **Acionar bomba:** em Energia, toque em **Ligar** na Bomba 2 e confirme. O app mostra "confirmado pelo servidor", e `GET /api/atuadores/2` também mostra `LIGADO`.
5. **Falha de nível baixo:** com a Bomba 2 desligada, o Reservatório B esvazia até abrir `NIVEL_BAIXO`, que aparece no banner do Painel, no contador e em Alertas. Para forçar, use `POST /api/leituras` com `{"tipo":"NIVEL","sensor":"RES-B","valor":12}`.
6. **Persistência:** pare e suba o backend. O log mostra `Dados persistidos encontrados no H2...`, e leituras, falhas e estado das bombas continuam lá.
7. **API fora do ar:** pare o backend (Ctrl+C). O app **não trava**: mostra "API fora do ar", identifica os dados como "última leitura disponível" e desabilita os comandos.
8. **Recuperação:** suba o backend de novo. O app reconecta sozinho em poucos segundos.

## Solução de problemas

| Sintoma | Solução |
|---|---|
| App mostra "API fora do ar" com o backend rodando | Confira o endereço em Configurações → Testar conexão. No celular use o IP do computador, não `localhost` |
| Celular não abre o app pelo QR code | Celular e computador na mesma rede. No WSL, veja a seção sobre modo espelhado |
| `404` em `/api/status` | Versão antiga da API em execução. Pare, atualize e suba de novo |
| `Port 8080 was already in use` | Já existe uma instância rodando. Feche-a antes de iniciar outra |
| Expo Go diz que a versão do SDK não é compatível | Atualize o Expo Go pela loja (o projeto usa o SDK 58) |
| Erro de CORS no navegador | Inclua a origem em `estacao.cors.origens` (backend `application.properties`) |
| Dados "sumiram" após reiniciar | Inicie o backend sempre a partir da pasta `backend/` (o banco é `./data/estacao`) |

## Histórico de desenvolvimento

O projeto foi construído em etapas, cada uma registrada em commits no GitHub:
1. estrutura inicial, configuração do H2 e entidades;
2. repositórios, serviços com regras de alerta e endpoints;
3. simulador e documentação da API;
4. app com navegação, consumo da API e tratamento de API fora do ar;
5. endpoints complementares e testes;
6. migração para TypeScript e redesenho Industrial Dark.

Veja o histórico completo em **Commits** no repositório.

## Tecnologias

- **Backend:** Java 21, Spring Boot 4 (Web MVC, Data JPA, Validation), H2, springdoc-openapi, JUnit 5
- **Mobile:** React Native, Expo SDK 58, TypeScript, React Navigation 7 (abas + pilha), react-native-svg, AsyncStorage, Inter e Fira Sans (@expo-google-fonts)

# Smart Water & Energy Station

Painel de operação de uma estação inteligente de **água e energia**. Um **backend em Spring Boot** registra as leituras dos sensores (níveis dos reservatórios, vazão e consumo elétrico simulado), aciona os atuadores (bombas e válvula) e controla as falhas. Um **app mobile em React Native (Expo)** mostra tudo em tempo real e emite alertas.

**Global Solution 2026.2 — FIAP · Engenharia Mecatrônica (2º ano)**
Disciplinas: *Advanced Programming and Mobile Dev* (app) e *Técnicas Avançadas de Programação* (backend)

## Integrantes

| Nome completo | RM |
|---|---|
| João Victor Pereira | 550306 |

## Arquitetura

```
┌──────────────────────────────┐        HTTP / JSON        ┌───────────────────────────────┐
│  App mobile (Expo / RN)      │ ───────────────────────▶ │  API REST (Spring Boot)        │
│  Painel · Água · Energia     │ ◀─────────────────────── │  /api/leituras /api/atuadores  │
│  Alertas · Config            │   polling a cada ~5 s     │  /api/falhas   /api/status     │
│  aviso "API fora do ar"      │                           │  simulador de sensores         │
└──────────────────────────────┘                           └───────────────┬───────────────┘
                                                                           │ JPA
                                                           ┌───────────────▼───────────────┐
                                                           │  H2 em modo arquivo            │
                                                           │  jdbc:h2:file:./data/estacao   │
                                                           └───────────────────────────────┘
```

| Pasta | Conteúdo | Documentação |
|---|---|---|
| [`backend/`](backend) | API REST em Java 21 + Spring Boot 4 + H2 (arquivo) | [backend/README.md](backend/README.md) |
| [`mobile/`](mobile) | App React Native com Expo + React Navigation | [mobile/README.md](mobile/README.md) |

## Funcionalidades

**App (painel de operação)**
- **Níveis** dos reservatórios A e B com barras e faixas de alerta
- **Vazão** de entrada (bombas) e de saída (distribuição)
- **Consumo elétrico simulado** total e por equipamento, com histórico recente
- **Alertas de falha**: abertas, resolvidas, severidade e botão para resolver
- Acionamento de **bombas e válvula** direto pelo app
- Atualização automática e aviso **"API fora do ar"** sem travar quando o backend para

**Backend (API REST)**
- Registrar leituras, acionar atuadores e listar/registrar/resolver falhas
- Falhas abertas automaticamente quando uma leitura passa do limite (nível baixo/alto, vazão alta, sobrecarga)
- Persistência em **H2 modo arquivo**: os dados continuam após reiniciar a aplicação
- Endpoints documentados no README e no **Swagger UI**

## Como executar

Pré-requisitos: **JDK 21**, **Node.js 22+** e o app **Expo Go** no celular (ou um navegador).

**1. Backend** (terminal 1)

```bash
cd backend
./mvnw spring-boot:run
```

API em http://localhost:8080 · Swagger em http://localhost:8080/swagger-ui.html

**2. App mobile** (terminal 2)

```bash
cd mobile
npm install
npx expo start          # leia o QR code com o Expo Go
# ou: npx expo start --web   (abre no navegador)
```

No app, abra a aba **Config** e confirme o endereço da API: o IP do computador (ex.: `http://192.168.0.10:8080`) no celular, ou `http://localhost:8080` no navegador. Mais detalhes em [mobile/README.md](mobile/README.md).

## Roteiro da demonstração

1. **Backend alimentando o app:** com o backend rodando, o Painel mostra níveis, vazão, consumo e falhas, atualizando sozinho.
2. **Acionar atuadores:** na aba Água, ligue a Bomba 02 e veja o nível do Reservatório B subir. Feche a válvula e veja a vazão de saída zerar.
3. **Alertas:** com a Bomba 02 desligada, o Reservatório B esvazia até abrir a falha `NIVEL_BAIXO`. Na aba Alertas é possível resolvê-la.
4. **API fora do ar:** pare o backend (Ctrl+C). O app **não trava**: mostra o aviso "API fora do ar", mantém os últimos dados na tela e continua tentando reconectar.
5. **Persistência:** suba o backend de novo. O log mostra `Dados persistidos encontrados no H2...`, e o app volta a funcionar com o histórico, os atuadores e as falhas preservados.

## Tecnologias

- **Backend:** Java 21, Spring Boot 4 (Web MVC, Data JPA, Validation), H2 Database, springdoc-openapi, Maven
- **Mobile:** React Native, Expo SDK 58, React Navigation 7 (bottom tabs), AsyncStorage, Fetch API

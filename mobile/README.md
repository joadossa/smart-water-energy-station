# Smart Water & Energy Station — App Mobile

App em **React Native com Expo** que funciona como o **painel de operação** da Smart Water & Energy Station. Ele consome a API REST do backend Spring Boot e mostra níveis, vazão, consumo elétrico simulado e alertas de falha.

Disciplina: **Advanced Programming and Mobile Dev** — Global Solution 2026.2 (FIAP)

## Integrantes

| Nome completo | RM |
|---|---|
| João Victor Pereira | 550306 |

## Telas

| Aba | O que mostra |
|---|---|
| **Painel** | Visão geral: nível médio, vazão de entrada/saída, consumo total, falhas abertas, atuadores ligados e últimos alertas |
| **Água** | Nível de cada reservatório (barra com limites), vazões e botões para ligar/desligar bombas e abrir/fechar a válvula |
| **Energia** | Consumo elétrico simulado total e por equipamento, custo estimado e histórico recente em barras |
| **Alertas** | Falhas filtradas por Abertas / Todas / Resolvidas, com severidade, origem e botão **Resolver** |
| **Config** | Endereço da API (salvo no aparelho), teste de conexão e restauração do padrão |

## Padrões utilizados

- **Componentes** reutilizáveis em `src/components` (CardIndicador, BarraNivel, AlertaItem, BotaoAtuador, AvisoApiOffline)
- **Navegação** com React Navigation (bottom tabs) em `src/navigation/AppNavigator.js`
- **Consumo de dados** com `fetch` em `src/api`. O hook `usePolling` atualiza as telas a cada poucos segundos
- **Estado global** da URL da API com Context API (`src/context/ApiConfigContext.js`) + AsyncStorage

### Tratamento de API indisponível

Toda chamada tem **timeout de 5 s**. Se o backend estiver parado ou inacessível:

- a tela **não trava nem fica em branco**: continua mostrando os últimos dados recebidos;
- aparece o aviso **"API fora do ar"**, com o horário dos últimos dados e o botão **Tentar agora**;
- o app continua tentando reconectar sozinho e volta ao normal quando a API retorna;
- os botões de ação (acionar bomba, resolver falha) ficam desabilitados enquanto a API estiver fora.

## Como executar

Pré-requisitos: **Node.js 22+** e o backend rodando (veja [../backend/README.md](../backend/README.md)).

```bash
cd mobile
npm install
npx expo start
```

- **Celular:** instale o **Expo Go** (Play Store / App Store) e leia o QR code exibido no terminal.
- **Navegador:** `npx expo start --web` (ou aperte `w` no terminal do Expo).

### Endereço da API

O app tenta descobrir sozinho o endereço do backend:

1. `EXPO_PUBLIC_API_URL`, se existir um arquivo `mobile/.env` (veja `.env.example`);
2. o mesmo IP do computador que está servindo o app pelo Expo, na porta 8080;
3. `http://localhost:8080` (navegador no próprio computador).

Se precisar, ajuste na aba **Config**, toque em **Testar conexão** e depois em **Salvar**:

- no celular: `http://<IP-do-computador>:8080`, por exemplo `http://192.168.0.10:8080`. No Windows, o IP aparece em `ipconfig`, no adaptador Wi-Fi;
- no navegador do computador: `http://localhost:8080`.

Celular e computador precisam estar na **mesma rede Wi-Fi**.

## Estrutura

```
mobile/
├── App.js                      # providers + navegação
└── src/
    ├── api/          client.js (fetch + timeout + ApiError), estacaoApi.js (endpoints)
    ├── components/   componentes visuais reutilizáveis
    ├── context/      ApiConfigContext (URL da API)
    ├── hooks/        usePolling (atualização automática)
    ├── navigation/   AppNavigator (abas)
    ├── screens/      Painel, Água, Energia, Alertas, Config
    ├── theme/        cores
    └── utils/        formatação de datas, números e sensores
```

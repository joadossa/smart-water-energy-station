<p align="center"><img src="../docs/aquapulse-banner.png" alt="AquaPulse" width="560"></p>

# AquaPulse — App Mobile

**AquaPulse** é o app em **React Native com Expo e TypeScript** que funciona como o **painel de operação** da *Smart Water & Energy Station*, no visual **Industrial Dark**. Ele consome a API REST do backend Spring Boot (dados reais, nada fixo no app) e mostra níveis, vazão, consumo elétrico simulado, bombas e alertas de falha.

Disciplina: **Advanced Programming and Mobile Dev** — Global Solution 2026.2 (FIAP)

## Integrantes

| Nome completo | RM |
|---|---|
| João Victor Pereira | 550306 |
| *(integrante 2 — preencher)* | *(RM)* |
| *(integrante 3 — preencher)* | *(RM)* |

## Telas

| Tela | Conteúdo |
|---|---|
| **Painel** | Cabeçalho com gota, título e botão ↻. Estado "Estação online" / "API fora do ar" com horário. Banner clicável da falha aberta. Medidores circulares dos reservatórios A e B. Vazão atual e consumo elétrico. Bombas ("1 de 2 ligada"). Gráfico de vazão dos últimos 15 min com tendência por regressão linear |
| **Água** | Volume em litros sobre a capacidade (configurada no backend), estado, última leitura, mensagens de nível crítico, histórico de 30 min com linhas de mínimo/máximo, vazões e comando da válvula |
| **Energia** | Potência instantânea (kW), gráfico de 30 min, energia estimada em **kWh** (integração potência × tempo, marcada como estimativa simulada), consumo por equipamento e ligar/desligar bombas com confirmação |
| **Alertas** | Falhas com origem, descrição, severidade, horário e estado; abertas em destaque; filtro Abertas/Todas/Resolvidas; toque para os detalhes |
| **Detalhe da falha** | Todos os campos da falha e botão para resolvê-la (`PATCH /api/falhas/{id}/resolver`) |
| **Configurações** (engrenagem) | Endereço da API, teste de conexão e dicas para celular, emulador e navegador |

A barra inferior tem **Painel, Água, Energia e Alertas**, com indicador da aba ativa e **contador de falhas abertas**.

## Integração com a API

- Os dados são buscados ao abrir a tela, pelo botão ↻, ao puxar a tela para baixo e periodicamente (5 a 15 s). Os timers param ao sair da tela (`usePolling` + `useIsFocused`).
- Toda chamada tem **timeout de 5 s** (`src/api/client.ts`). Erros de rede viram `ApiError` com `offline = true`.
- **API fora do ar:** o app não trava. Mostra o aviso, identifica os valores como **"última leitura disponível"** com o horário, sem fingir tempo real, e desabilita os comandos.
- **Comandos de bomba/válvula:** confirmação → `PUT /api/atuadores/{id}` → nova consulta `GET /api/atuadores/{id}`. Só aparece "confirmado pelo servidor" se o estado retornado for o pedido. Erros nunca são mostrados como sucesso.
- Limites de alerta e capacidades vêm do `GET /api/status`, então cores e mensagens seguem as mesmas regras do backend.

## Como executar

Pré-requisitos: **Node.js 22+** e o backend rodando (veja [../backend/README.md](../backend/README.md)).

```bash
cd mobile
npm install
npx expo start      # QR code para o Expo Go | w = navegador | a = emulador Android
```

Checagem de tipos: `npx tsc --noEmit`

### Endereço da API

Fica centralizado em `src/context/ApiConfigContext.tsx`. A ordem de prioridade é:
1. `EXPO_PUBLIC_API_URL` no arquivo `mobile/.env` (copie de `.env.example`);
2. o IP do computador que está servindo o Expo, na porta 8080;
3. `http://localhost:8080`.

Para alterar no app: **engrenagem → Configurações → Testar conexão → Salvar**.

| Onde o app roda | Endereço |
|---|---|
| Navegador no computador / simulador iOS | `http://localhost:8080` |
| Emulador Android | `http://10.0.2.2:8080` |
| Celular físico (mesma rede Wi-Fi) | `http://<IP-do-computador>:8080` |

## Estrutura

```
mobile/
├── App.tsx                      # fontes, providers e navegação
├── .env.example                 # EXPO_PUBLIC_API_URL (opcional)
└── src/
    ├── api/          client.ts (fetch + timeout + ApiError), estacaoApi.ts (endpoints tipados)
    ├── components/   MedidorCircular, GraficoLinha, BotaoAtuador, AlertaItem, ConfirmacaoModal, ...
    ├── context/      ApiConfigContext (URL da API), ResumoContext (contador de alertas)
    ├── hooks/        usePolling, useAcionamentoAtuador, useAcoesCabecalho
    ├── navigation/   AppNavigator (pilha + abas) e tipos das rotas
    ├── screens/      Painel, Água, Energia, Alertas, DetalheFalha, Config
    ├── theme/        paleta Industrial Dark e fontes
    ├── types/        tipos dos dados da API
    └── utils/        formatação, tendência (regressão linear), kWh (trapézios) e textos
```

## Visual

- Paleta: fundo `#0B1220`, cartões `#111C2E`, ciano `#16D9E3`, azul `#648CFF`, verde `#22C55E`, amarelo `#F5B942`, vermelho `#F26464`, texto `#F8FAFC` / `#A8B4C8`
- Fontes: **Inter** (texto) e **Fira Sans** (títulos e números), via `@expo-google-fonts`
- Bombas e válvula: estado **verde** quando ligada/aberta e **vermelho** quando desligada/fechada; botões **Desligar/Fechar** em vermelho e **Ligar/Abrir** em ciano (também no botão de confirmação)
- Medidores e gráficos em SVG (`react-native-svg`)
- Logo AquaPulse no cabeçalho do Painel, gota da marca nas outras abas, além de ícone, splash e favicon gerados do logo (`assets/aquapulse/`)

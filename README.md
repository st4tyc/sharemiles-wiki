# ShareMiles Wiki

Repositório de documentação de produto da plataforma **ShareMiles** — marketplace de milhas aéreas.

Contém o agente de IA **pm-expert-sharemiles**, um Expert Sênior em Product Management treinado no contexto completo da plataforma.

---

## Como usar o agente

1. Abra este repositório no **Claude Code**
2. Acesse o menu de agentes: `/agents`
3. Selecione **pm-expert-sharemiles**
4. O agente lê automaticamente o estado da documentação e apresenta um resumo

---

## Passo a passo por funcionalidade

### Ativar o agente

1. Abra o terminal e navegue até este repositório:
   ```bash
   cd sharemiles-wiki
   claude .
   ```
2. No Claude Code, digite:
   ```
   /agents
   ```
3. Selecione **pm-expert-sharemiles** na lista
4. O agente inicia automaticamente o protocolo de retomada de sessão

---

### Criar um PRD

1. Ative o agente (passos acima)
2. Descreva a funcionalidade que deseja documentar — pode ser vaga:
   ```
   Quero documentar o fluxo de cancelamento de transação pelo comprador
   ```
3. O agente conduz o **protocolo de descoberta**: responda as 7 perguntas
4. Confirme o entendimento quando o agente apresentar o resumo:
   ```
   Pode prosseguir
   ```
5. O agente gera o PRD completo e salva automaticamente em `visao-produto/prd-[modulo]-[nome].md`

---

### Criar uma User Story

1. Ative o agente
2. Especifique a história que deseja:
   ```
   Crie uma user story para o vendedor fazer upload do comprovante de transferência
   ```
3. O agente confirma o entendimento e gera a história com critérios de aceite Gherkin
4. O arquivo é salvo em `visao-produto/us-[modulo]-[nome].md`

---

### Mapear a jornada de uma persona

1. Ative o agente
2. Peça o mapeamento:
   ```
   Mapeie a jornada completa do Vendedor desde a criação da listagem até o saque
   ```
3. O agente produz o fluxo AS-IS (como é hoje) e propõe o TO-BE se houver problemas a resolver
4. O arquivo é salvo em `visao-produto/jornada-vendedor.md`

---

### Analisar impacto de uma mudança no produto

1. Ative o agente
2. Descreva a mudança que foi feita ou que está sendo considerada:
   ```
   Estamos pensando em adicionar um prazo de 72h (ao invés de 48h) para o vendedor aprovar a transação
   ```
3. O agente mapeia automaticamente todos os impactos: módulos, Firebase Functions, Pagar.me, telas e notificações
4. Solicite o documento de análise:
   ```
   Gere um documento de análise de impacto
   ```

---

### Atualizar documentação após mudança no código

1. Ative o agente
2. Informe o que mudou:
   ```
   Adicionei o status DISPUTED no TransactionsController. Atualize a documentação afetada.
   ```
3. O agente lê o arquivo alterado diretamente no repositório, identifica os documentos impactados e os atualiza
4. Registra a decisão em `visao-produto/decisoes-produto.md`

---

### Registrar uma decisão de produto

1. Ative o agente
2. Informe a decisão tomada:
   ```
   Decidimos não suportar pagamento por boleto na primeira versão. Registre isso.
   ```
3. O agente adiciona a entrada em `visao-produto/decisoes-produto.md` com data e justificativa

---

### Registrar ou resolver um gap

**Registrar gap:**
1. Ative o agente
2. Descreva o item em aberto:
   ```
   Ainda não decidimos se o comprador pode cancelar uma transação já aprovada pelo vendedor. Registre como gap.
   ```
3. O agente adiciona o item em `visao-produto/gaps-e-decisoes-abertas.md`

**Resolver gap:**
1. Ative o agente
2. Informe a resolução:
   ```
   Decidimos que o comprador NÃO pode cancelar após aprovação do vendedor. Feche o gap.
   ```
3. O agente atualiza o status do item e move a decisão para `decisoes-produto.md`

---

### Priorizar o backlog

1. Ative o agente
2. Liste os itens ou peça uma análise:
   ```
   Temos 3 iniciativas em discussão: sistema de avaliações, notificações push e relatório financeiro para o vendedor. Me ajude a priorizar.
   ```
3. O agente conduz a análise por impacto, esforço e alinhamento estratégico e documenta em `visao-produto/backlog-macro.md`

---

### Construir a base de conhecimento do produto (primeira vez)

Se `visao-produto/` ainda não existe, siga esta ordem recomendada:

1. Ative o agente — ele detecta que não há arquivos e orienta o início
2. **Passo 1 — Glossário:**
   ```
   Vamos começar pelo glossário da plataforma
   ```
3. **Passo 2 — Contexto da plataforma:**
   ```
   Agora crie o contexto-plataforma.md
   ```
4. **Passo 3 — Mapa de módulos:**
   ```
   Crie o mapa-modulos.md com base no que já documentamos
   ```
5. **Passo 4 — Personas:**
   ```
   Detalhe as personas em personas-detalhadas.md
   ```
6. Continue com backlog, decisões e gaps conforme necessário

---

## Funcionalidades do agente

### Retomada de sessão automática
Ao ser ativado, o agente lê os arquivos de `visao-produto/` e apresenta:
- Resumo do que já está documentado
- Lista dos arquivos ainda não criados
- 2–3 sugestões de próximos passos com base no estado atual

Se nenhum arquivo existir, orienta por onde começar a construir a base de conhecimento do produto.

---

### Criação de PRDs (Product Requirements Documents)
Gera documentos completos de requisitos no padrão da plataforma, com 11 seções obrigatórias:
- Cabeçalho (módulo, personas, status, versão, data)
- Contexto e problema com evidências
- Objetivo e métricas de sucesso
- Jornada AS-IS e TO-BE por persona
- Tabela de requisitos funcionais com entidades e controllers mapeados
- Critérios de aceite no formato Gherkin (PT-BR)
- Regras de negócio com IDs rastreáveis (RN-XX)
- Fluxos de exceção e tratamento de erros
- Impacto em outros módulos, Firebase Functions e notificações
- Considerações de UX por tela/componente
- Perguntas em aberto com opções e impactos

---

### Criação de User Stories
Produz histórias de usuário isoladas com contexto de persona, critérios de aceite Gherkin e mapeamento das entidades do domínio afetadas.

---

### Protocolo de descoberta
Antes de criar qualquer documento, conduz uma entrevista estruturada com 7 perguntas obrigatórias para garantir que o problema está bem entendido:
1. Qual é o problema real e qual persona é afetada?
2. Qual o impacto se não for resolvido?
3. Quem solicitou e qual o contexto?
4. Já existe algo no sistema que resolve parcialmente?
5. Quais personas são afetadas (primária e secundária)?
6. Qual é a restrição técnica mais óbvia?
7. Como o sucesso será medido?

---

### Análise de jornada de usuário
Mapeia o fluxo passo a passo de qualquer persona (Comprador, Vendedor, Agência ou Admin) no estado atual (AS-IS) e propõe o fluxo futuro (TO-BE) com base nos requisitos levantados.

---

### Análise de impacto de mudanças
Ao receber uma proposta de mudança, avalia e documenta:
- Quais módulos são afetados (M1–M8)
- Impacto no fluxo de status de transação
- Impacto no gateway Pagar.me (cancelamento vs reembolso)
- Firebase Functions que precisam ser criadas ou alteradas
- Notificações/e-mails impactados
- Telas e componentes do frontend afetados

---

### Atualização de documentação existente
Lê arquivos já existentes em `visao-produto/` antes de modificar, preserva decisões anteriores e registra mudanças em `decisoes-produto.md` com justificativa.

---

### Gestão de decisões e gaps
- Registra decisões tomadas em `visao-produto/decisoes-produto.md`
- Mantém lista de itens bloqueantes em `visao-produto/gaps-e-decisoes-abertas.md`
- Atualiza o status de gaps ao serem resolvidos
- Consulta gaps existentes antes de documentar qualquer módulo

---

### Suporte a priorização
Ajuda a estruturar o backlog macro em épicos e iniciativas, avaliando cada item por impacto, esforço e alinhamento estratégico. Documenta em `visao-produto/backlog-macro.md`.

---

### Checklist de qualidade
Antes de entregar qualquer documento, verifica 14 itens obrigatórios:
- Cabeçalho completo
- Problema embasado em evidências
- Personas nomeadas explicitamente
- Requisitos com verbos no infinitivo e testáveis
- Critérios de aceite presentes
- Regras de negócio com IDs
- Entidades do domínio identificadas com nome exato do código
- Fora de escopo preenchido
- Fluxos de exceção cobertos
- Impacto no Pagar.me considerado (cancelamento vs reembolso)
- Impacto nas Firebase Functions considerado
- Notificações mencionadas onde relevante
- Perguntas em aberto listadas
- Arquivo salvo com nome no padrão correto

---

### Leitura do código-fonte
Quando necessário, lê diretamente os repositórios da plataforma para embasar a documentação:
- `ShareMiles.Api/src/ShareMiles.Api/Controllers/`
- `ShareMiles.Api/src/ShareMiles.Infrastructure/ExternalServices/`
- `Sharemiles.Pagarme.Api/Services/PagarmeProxyService.cs`
- `sharemilesapp/functions/`
- `sharemilesapp/pages/` e `sharemilesapp/services/api/`

---

## Estrutura do repositório

```
sharemiles-wiki/
├── .claude/
│   └── agents/
│       └── pm-expert-sharemiles.md   # Definição completa do agente
└── visao-produto/                    # Criada e mantida pelo agente
    ├── contexto-plataforma.md
    ├── mapa-modulos.md
    ├── personas-detalhadas.md
    ├── backlog-macro.md
    ├── glossario.md
    ├── decisoes-produto.md
    ├── gaps-e-decisoes-abertas.md
    └── prd-*.md / us-*.md / ...
```

---

## Convenção de nomes dos documentos

| Tipo | Padrão | Exemplo |
|---|---|---|
| PRD | `prd-[modulo]-[nome].md` | `prd-transacoes-timeout-comprovante.md` |
| User Story | `us-[modulo]-[nome].md` | `us-pagamento-reembolso-cancelamento.md` |
| Análise | `analise-[tema].md` | `analise-abandono-transacao.md` |
| Jornada | `jornada-[persona].md` | `jornada-vendedor.md` |

**Módulos:** `usuarios` · `listagens` · `transacoes` · `pagamento` · `pix` · `carteira` · `notificacoes` · `admin`

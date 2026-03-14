# ShareMiles Wiki

Repositório de documentação de produto da plataforma **ShareMiles** — marketplace de milhas aéreas.

Contém o agente de IA **pm-expert-sharemiles** e um **MCP Server público** que expõe toda a documentação e capacidades do agente para uso no **Claude Code** e no **GitHub Copilot**.

---

## MCP Server — Integração com Claude Code e GitHub Copilot

O servidor MCP expõe a documentação e o agente `pm-expert-sharemiles` como ferramentas padronizadas (Model Context Protocol), compatíveis com qualquer cliente MCP.

### Instalação rápida

```bash
# 1. Instale as dependências
cd mcp && npm install

# 2. Compile o TypeScript
npm run build
```

### Modo stdio — uso local (Claude Code e GitHub Copilot no VS Code)

**Claude Code** — adicione ao `.claude/mcp.json` do seu projeto ou ao `~/.claude/mcp.json` global:

```json
{
  "mcpServers": {
    "sharemiles-wiki": {
      "command": "node",
      "args": ["/caminho/para/sharemiles-wiki/mcp/dist/index.js"],
      "env": {
        "WIKI_ROOT": "/caminho/para/sharemiles-wiki"
      }
    }
  }
}
```

**GitHub Copilot (VS Code)** — o arquivo `.vscode/mcp.json` já está configurado neste repositório. Basta abrir o projeto no VS Code com a extensão GitHub Copilot instalada.

### Modo HTTP — servidor público remoto

```bash
# Inicia o servidor HTTP na porta 3000
cd mcp && npm run start:http

# Porta customizada
node dist/index.js --http --port 8080
```

Após iniciar, configure os clientes com a URL:

```json
{
  "mcpServers": {
    "sharemiles-wiki": {
      "url": "http://seu-servidor:3000/mcp"
    }
  }
}
```

### Ferramentas disponíveis

| Ferramenta | Descrição |
|---|---|
| `list_docs` | Lista todos os documentos da wiki |
| `read_doc` | Lê um documento pelo caminho relativo |
| `search_docs` | Busca um termo em toda a documentação |
| `write_doc` | Cria ou atualiza um documento (PRD, US, etc.) |
| `get_platform_context` | Retorna contexto completo da plataforma ShareMiles |
| `get_all_context` | Carrega toda a wiki de uma vez (plataforma, módulos, personas, decisões, gaps) |
| `get_agent_prompt` | Retorna o system prompt do pm-expert-sharemiles |
| `analyze_change_impact` | Analisa impacto de uma mudança proposta |

### Recursos MCP (Resources)

Todos os arquivos `.md` da wiki ficam disponíveis como recursos no esquema `sharemiles://docs/{caminho}`.

### Prompt MCP

O prompt `pm_expert_sharemiles` ativa o agente completo com todo o protocolo de descoberta, criação de PRDs e análise de impacto.

---

## Como usar o agente (Claude Code)

1. Abra este repositório no **Claude Code**
2. Acesse o menu de agentes: `/agents`
3. Selecione **pm-expert-sharemiles**
4. O agente lê automaticamente o estado da documentação e apresenta um resumo

---

## Usar o agente como Copilot — rastrear impactos antes de alterar o código

O **pm-expert-sharemiles** pode ser invocado diretamente pelo Claude Code (sem abrir o repositório wiki manualmente) como um copilot de impacto. Antes de fazer qualquer alteração no código, você pede ao Claude Code que consulte o agente e ele analisa os riscos e impactos automaticamente.

### Como funciona

No Claude Code (em qualquer repositório do projeto), você usa o comando `/agents` para invocar o pm-expert-sharemiles passando o contexto da mudança que pretende fazer. O agente lê a documentação de `visao-produto/`, lê o código-fonte afetado e retorna uma análise de impacto antes de você escrever uma linha.

---

### Prompts de exemplo — análise de impacto antes de alterar o código

**Antes de alterar o fluxo de status de transação:**
```
@pm-expert-sharemiles Antes de eu modificar o TransactionsController para adicionar
um novo status DISPUTED, analise os impactos no produto: quais módulos são afetados,
quais Firebase Functions precisam ser atualizadas, quais notificações disparam e
o que precisa mudar no Pagar.me proxy.
```

---

**Antes de mudar um prazo crítico:**
```
@pm-expert-sharemiles Estou pensando em alterar o prazo de timeout do comprovante
de 48h para 72h no checkProofDeadline. Quais são os impactos de negócio, quais
regras de negócio são afetadas e o que precisa ser atualizado na documentação?
```

---

**Antes de alterar o fluxo de pagamento:**
```
@pm-expert-sharemiles Vou modificar o PagarMeService para suportar pagamento por
boleto. Antes de implementar, me diga: quais personas são afetadas, quais módulos
precisam mudar, quais regras de negócio existem sobre formas de pagamento e
há algum gap em aberto sobre isso na documentação?
```

---

**Antes de adicionar um novo campo a uma entidade central:**
```
@pm-expert-sharemiles Preciso adicionar o campo cancellationReason na entidade
Transaction. Analise os impactos: quais telas do frontend precisam ser atualizadas,
quais controllers são afetados e existe documentação de produto que cobre
cenários de cancelamento que precisaria ser revisada?
```

---

**Antes de refatorar o fluxo de saque:**
```
@pm-expert-sharemiles Vou refatorar o WithdrawalsController para adicionar aprovação
em dois níveis antes do saque ser processado. Me dê a análise de impacto completa:
jornada atual do Vendedor, regras de negócio existentes, o que muda para o Admin
e quais notificações precisam ser criadas ou alteradas.
```

---

**Antes de criar uma nova Firebase Function:**
```
@pm-expert-sharemiles Vou criar uma Firebase Function para notificar o Comprador
quando o Vendedor visualizar a transação mas não tiver aprovado em 24h. Antes de
implementar, valide se isso está alinhado com as personas documentadas, se há
regra de negócio que proíba e quais outros fluxos de notificação existentes podem
ser afetados.
```

---

**Antes de alterar o painel administrativo:**
```
@pm-expert-sharemiles Vou adicionar uma aba de relatório financeiro consolidado
no AdminDashboard. Analise: quais dados estão disponíveis hoje nos controllers,
quais personas admin são afetadas, há alguma iniciativa no backlog que já cobria
isso e como isso se relaciona com o módulo de carteira e saques?
```

---

**Análise genérica antes de qualquer mudança:**
```
@pm-expert-sharemiles Antes de eu implementar [descreva a mudança], faça uma
análise de impacto completa respondendo:
1. Quais módulos (M1–M8) são afetados?
2. Quais personas têm a jornada impactada?
3. Quais regras de negócio existentes precisam ser revisadas?
4. Há algum gap em aberto relacionado?
5. O que precisa ser atualizado na documentação após a implementação?
```

---

### Dica — fluxo recomendado antes de codar

```
1. Descreva o que vai implementar ao @pm-expert-sharemiles
      ↓
2. Receba a análise de impacto (módulos, personas, regras, gaps)
      ↓
3. Implemente com segurança sabendo o que pode quebrar
      ↓
4. Após implementar, peça ao agente para atualizar a documentação
```

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

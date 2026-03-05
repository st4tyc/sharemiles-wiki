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

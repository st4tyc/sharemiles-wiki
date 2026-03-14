# Personas Detalhadas — ShareMiles

> Detalhamento profundo de cada persona da plataforma ShareMiles, com motivações, jornadas, dores e entidades associadas.
> Versão: 1.0 | Data: 2026-03-14

---

## Visão Geral das Personas

| Persona | Role | Motivação principal | Principal dor hoje |
|---|---|---|---|
| Comprador | `buyer` | Emitir passagens com desconto | Insegurança na transação com desconhecidos |
| Vendedor | `seller` | Monetizar milhas paradas | Demora no recebimento (D+30) |
| Agência | `agency` | Volume de intermediação profissional | Gestão simultânea de múltiplas transações |
| Administrador | `admin` | Operação saudável do marketplace | Fraudes e disputas que exigem intervenção manual |

---

## Persona 1 — Comprador (Buyer)

### Perfil

- **Quem é:** Pessoa física, viajante frequente ou ocasional, que busca emitir passagens aéreas a custo inferior ao praticado pelas companhias
- **Faixa etária predominante:** 25–45 anos
- **Comportamento digital:** Pesquisa preços antes de comprar, está acostumado com marketplaces (Mercado Livre, Amazon), desconfia de desconhecidos online
- **Familiaridade com programas de fidelidade:** Tem ou já teve milhas, entende o conceito, mas não necessariamente tem quantidade suficiente para emitir

### Motivações

- Economizar entre 30% e 60% no valor da passagem aérea
- Usar milhas de um programa que não possui (ex: comprar milhas Smiles para emitir voo Gol)
- Aproveitar promoções de passagens que exigem milhas rapidamente
- Acesso a classes superiores (executiva, premium) que seriam inacessíveis pelo preço cheio

### Dores e Frustrações

- **Insegurança:** Medo de pagar e não receber as milhas
- **Opacidade do processo:** Não saber em que etapa a transação está
- **Dependência do Vendedor:** Precisa aguardar aprovação e transferência de um terceiro
- **Tempo de espera:** A transação não é instantânea como uma compra num e-commerce convencional
- **Suporte em caso de problemas:** Não sabe a quem recorrer se algo der errado

### Jornada do Comprador

**Etapa 1: Descoberta e Pesquisa**
1. Acessa o marketplace da ShareMiles
2. Busca listagens filtradas por programa de fidelidade, quantidade e preço por milha
3. Compara opções disponíveis (preço, reputação do vendedor, prazo estimado)
4. Seleciona a listagem mais adequada

**Etapa 2: Criação da Transação**
1. Informa quantidade de milhas desejada
2. Confirma dados do perfil do programa de fidelidade destino
3. Escolhe forma de pagamento (cartão de crédito ou PIX)
4. Realiza o pagamento

**Etapa 3: Aguarda o Processo**
1. Recebe confirmação de pagamento
2. Aguarda aprovação do Vendedor (até 48h)
3. Recebe notificação de aprovação ou rejeição
4. [Se aprovado] Aguarda transferência das milhas e envio do comprovante

**Etapa 4: Recebimento e Conclusão**
1. Verifica recebimento das milhas no programa de fidelidade
2. Transação marcada como `COMPLETED`
3. Opcionalmente avalia o Vendedor (funcionalidade futura)

### Entidades e Controllers Principais
- `Transaction` — [Controller: TransactionsController]
- `User` — [Controller: UsersController]
- `Listing` — [Controller: ListingsController]

### Momentos de Verdade

| Momento | Expectativa do Comprador | Risco se falhar |
|---|---|---|
| Pagamento confirmado | Receber confirmação imediata | Abandono, desconfiança |
| Aprovação do Vendedor | Notificação rápida (< 2h) | Ansiedade, contato com suporte |
| Recebimento das milhas | Milhas na conta em até 24h | Disputa, reembolso, NPS negativo |

---

## Persona 2 — Vendedor (Seller)

### Perfil

- **Quem é:** Pessoa física que acumula milhas em quantidade superior ao que consegue usar (grande viajante corporativo, colecionador de milhas, beneficiário de cartão premium)
- **Faixa etária predominante:** 30–55 anos
- **Comportamento:** Procura renda extra ou liquidez imediata para milhas que perderiam validade
- **Volume típico:** Vende entre 10.000 e 200.000 milhas por mês

### Motivações

- Converter milhas em dinheiro antes que vençam
- Gerar renda recorrente a partir de acúmulo sistemático de milhas
- Operar com segurança garantida pela plataforma (não precisa confiar cegamente no Comprador)

### Dores e Frustrações

- **Espera pelo saldo (D+30):** O dinheiro fica preso por 30 dias após a conclusão da transação
- **Risco de rejeição pelo Comprador:** Após transferir as milhas, tem medo de não receber o pagamento
- **Complexidade do processo de saque:** Necessidade de aprovação manual pelo Admin introduz incerteza
- **Falta de visibilidade:** Dificuldade em acompanhar o status das múltiplas transações em andamento
- **Sem feedback do Comprador:** Não sabe se o Comprador recebeu as milhas corretamente

### Jornada do Vendedor

**Etapa 1: Cadastro e Habilitação**
1. Cria conta na plataforma
2. Preenche perfil completo (nome, CPF, telefone, endereço)
3. Passa pelo processo de KYC (envio de documentos)
4. Após aprovação, fica habilitado a criar listagens

**Etapa 2: Criação de Listagem**
1. Acessa o painel de Vendedor
2. Cria nova listagem: escolhe programa de fidelidade, quantidade disponível e preço por milha
3. Publica a listagem (status: ativa)
4. Aguarda Compradores

**Etapa 3: Gerenciamento de Transação**
1. Recebe notificação de nova transação
2. Analisa os detalhes: quantidade, valor, dados do Comprador
3. Decide: aprova ou rejeita (prazo 48h)
4. [Se aprovar] Realiza a transferência das milhas no programa de fidelidade
5. Faz upload do comprovante de transferência na plataforma (prazo 48h)

**Etapa 4: Aguarda Liberação**
1. Transação marcada como `COMPLETED`
2. Aguarda D+30 para saldo ser liberado
3. Solicita saque informando conta bancária
4. Aguarda aprovação do Admin
5. Recebe o valor via TED ou PIX

### Entidades e Controllers Principais
- `Listing` — [Controller: ListingsController]
- `Transaction` — [Controller: TransactionsController]
- `Withdrawal` — [Controller: WithdrawalsController]
- `BankAccount` — [Controller: WithdrawalsController]

### Momentos de Verdade

| Momento | Expectativa do Vendedor | Risco se falhar |
|---|---|---|
| Receber notificação de nova transação | Notificação imediata e clara | Timeout de 48h sem ação = cancelamento automático |
| Upload do comprovante aceito | Confirmação rápida sem burocracia | Cancelamento por timeout, perda do pagamento |
| Liberação do saldo (D+30) | Notificação proativa da liberação | Vendedor não sabe que pode sacar |
| Saque aprovado e processado | Dinheiro na conta em até 1 dia útil | Desconfiança na plataforma |

---

## Persona 3 — Agência (Agency)

### Perfil

- **Quem é:** Empresa ou pessoa que opera profissionalmente como intermediadora de milhas, com volume muito superior ao Vendedor individual
- **Características:** Múltiplos programas de fidelidade gerenciados simultaneamente, equipe própria para operação
- **Volume típico:** Acima de 1.000.000 de milhas por mês
- **Role no sistema:** `agency`

### Motivações

- Operar em escala com a garantia financeira da plataforma
- Ter visibilidade consolidada de todas as transações (painel gerencial)
- Processar aprovações e comprovantes em lote, sem tratar uma a uma manualmente
- Integrar a ShareMiles com seus sistemas internos de gestão (futuro)

### Dores e Frustrações

- **Interface construída para Vendedor individual:** Falta de visão consolidada de múltiplas transações simultâneas
- **Aprovação um a um:** Sem funcionalidade de aprovação em lote
- **Gestão de saldo:** Com muitas transações em D+30 simultâneas, o fluxo de caixa é complexo de prever
- **Múltiplos saques fragmentados:** Cada transação gera um saldo separado, dificultando a consolidação

### Diferenças em relação ao Vendedor Individual

| Aspecto | Vendedor | Agência |
|---|---|---|
| Volume de milhas | Pequeno/médio | Alto |
| Número de listagens simultâneas | Poucos | Muitos |
| Número de transações simultâneas | Poucos | Dezenas ou centenas |
| Necessidade de aprovação em lote | Não | Sim |
| Necessidade de relatórios | Básico | Avançado |
| Integração com sistemas externos | Não | Possível (futuro) |

### Entidades e Controllers Principais
- `Listing` — [Controller: ListingsController]
- `Transaction` — [Controller: TransactionsController]
- `User` (role: agency) — [Controller: UsersController]

### Gaps da Persona Agência

A persona Agência tem o menor nível de especificação de produto. Os seguintes aspectos não estão definidos:
- Diferença de permissões entre `agency` e `seller` no sistema atual
- Se Agência tem painel diferenciado ou usa o mesmo do Vendedor
- Se há aprovação em lote implementada
- Limites e regras específicas para o role `agency`

---

## Persona 4 — Administrador (Admin)

### Perfil

- **Quem é:** Membro da equipe interna da ShareMiles responsável pela operação do marketplace
- **Subdivisão possível:** Admin Operacional (foco em transações e usuários) e Admin Financeiro (foco em saques e relatórios) — *não implementado formalmente*
- **Role no sistema:** `admin`

### Motivações

- Garantir a saúde operacional do marketplace
- Prevenir e resolver fraudes antes que causem prejuízo financeiro
- Aprovar saques com segurança e velocidade adequada
- Monitorar KPIs do negócio em tempo real

### Dores e Frustrações

- **Aprovação manual de saques:** Processo 100% manual sem automação ou pré-aprovação baseada em critérios
- **Falta de alertas proativos:** Depende de verificação ativa para identificar transações problemáticas
- **Sem auditoria de ações:** Não há log rastreável de quem fez o que no painel admin
- **Relatórios limitados:** Ausência de relatórios financeiros automatizados

### Jornada do Administrador

**Monitoramento Diário**
1. Acessa `AdminDashboard`
2. Verifica transações em status `PENDING_SELLER_APPROVAL` há mais de 24h (sinal de alerta)
3. Verifica transações com comprovante pendente próximas do timeout de 48h
4. Monitora saques na fila de aprovação

**Aprovação de Saques**
1. Recebe ou verifica lista de saques `PENDING`
2. Valida: conta bancária verificada, saldo liberado, identidade do Vendedor confirmada
3. Aprova ou rejeita o saque com justificativa
4. Processa a transferência bancária (TED/PIX)
5. Marca o saque como `PROCESSED`

**Gestão de Disputas**
1. Recebe alerta de transação problemática (Comprador não recebeu milhas, Vendedor alega ter transferido)
2. Analisa o comprovante de transferência
3. Solicita documentação adicional se necessário
4. Resolve a disputa: finaliza em `COMPLETED` ou inicia reembolso

**Gestão de Usuários**
1. Revisa documentos de KYC de novos Vendedores
2. Aprova ou rejeita verificação de identidade
3. Suspende usuários fraudulentos

### Entidades e Controllers Principais
- Todos os controllers com rotas `admin`
- `AdminDashboard.tsx` — frontend principal

### Momentos de Verdade

| Momento | Expectativa do Admin | Risco se falhar |
|---|---|---|
| Identificar transação problemática | Alerta proativo antes que vire disputa | Fraude não detectada, prejuízo financeiro |
| Aprovar saque legítimo | Processar rapidamente (< 1 dia útil) | Vendedor insatisfeito, abandono da plataforma |
| Rejeitar saque suspeito | Ter evidência clara para justificar | Conflito com Vendedor, processos |
| Resolver disputa | Decisão justa baseada em evidências | Perda de confiança de Comprador ou Vendedor |

---

## Matriz de Interação entre Personas

| | Comprador | Vendedor | Agência | Admin |
|---|---|---|---|---|
| **Comprador** | — | Inicia transação que o Vendedor aprova | Inicia transação que a Agência aprova | Recorre ao Admin em caso de disputa |
| **Vendedor** | Aprova/rejeita transação do Comprador | — | Competem por Compradores no marketplace | Solicita saque ao Admin aprovar |
| **Agência** | Aprova/rejeita transação do Comprador | Competem no marketplace | — | Solicita saques em volume |
| **Admin** | Resolve disputas a favor do Comprador | Aprova saques, resolve disputas | Aprova saques em volume | — |

---

## Histórico de Versões

| Versão | Data | Alteração |
|---|---|---|
| 1.0 | 2026-03-14 | Criação do documento inicial |

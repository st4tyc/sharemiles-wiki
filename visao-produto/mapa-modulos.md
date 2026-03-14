# Mapa de Módulos — ShareMiles

> Mapeamento detalhado de todos os módulos da plataforma, com entidades, controllers, serviços e responsabilidades.
> Versão: 1.0 | Data: 2026-03-14

---

## Visão Geral dos Módulos

| Módulo | Código | Controllers | Entidades principais | Status da documentação |
|---|---|---|---|---|
| Usuários e Autenticação | M1 | `UsersController` | `User`, `UserProfile` | Parcial |
| Listagens de Milhas | M2 | `ListingsController` | `Listing` | Parcial |
| Transações | M3 | `TransactionsController` | `Transaction` | Parcial |
| Gateway de Pagamento | M4 | — | — | Parcial |
| PIX | M5 | — | — | Rascunho |
| Carteira e Saques | M6 | `WithdrawalsController` | `Withdrawal`, `BankAccount` | Parcial |
| Notificações | M7 | — | — | Rascunho |
| Painel Administrativo | M8 | Todos (rotas admin) | Todos | Rascunho |

---

## M1 — Usuários e Autenticação

### Responsabilidade
Gestão do ciclo de vida dos usuários: cadastro, autenticação, perfil, roles e verificação de identidade (KYC).

### Entidades

| Entidade | Descrição | Campos principais |
|---|---|---|
| `User` | Usuário da plataforma | `id`, `name`, `email`, `cpf`, `phone`, `address`, `role`, `createdAt` |
| `UserProfile` | Informações complementares e documentos de KYC | `userId`, `documentType`, `documentNumber`, `documentFrontUrl`, `documentBackUrl`, `verificationStatus` |

### Controllers
- `UsersController` — CRUD de usuários, atualização de perfil, gestão de roles

### Serviços e Integrações
- **Firebase Auth** — autenticação e geração de tokens JWT
- Verificação de identidade (KYC) — processo de validação antes de operar como Vendedor

### Roles do Sistema

| Role | Descrição | Permissões especiais |
|---|---|---|
| `buyer` | Comprador | Criar transações, visualizar listagens |
| `seller` | Vendedor | Criar listagens, aprovar/rejeitar transações, solicitar saques |
| `agency` | Agência | Permissões de Vendedor com maior volume operacional |
| `admin` | Administrador | Acesso total à plataforma |

### Fluxo de Cadastro e Verificação

```
Cadastro (e-mail + senha via Firebase Auth)
         ↓
Preenchimento do perfil (nome, CPF, telefone, endereço)
         ↓
Escolha do role inicial (buyer ou seller)
         ↓
[Se seller] → KYC obrigatório (envio de documento)
         ↓
[Se seller] → Verificação pela equipe (ou automática)
         ↓
Conta ativa para operar
```

### Gaps Conhecidos
- Regras de upgrade de role (buyer → seller) não documentadas
- Fluxo detalhado de KYC não especificado
- Gestão de suspensão/banimento de usuários não mapeada

---

## M2 — Listagens de Milhas

### Responsabilidade
Permite que Vendedores e Agências publiquem ofertas de milhas no marketplace para que Compradores possam visualizar, filtrar e selecionar.

### Entidades

| Entidade | Descrição | Campos principais |
|---|---|---|
| `Listing` | Oferta de milhas criada pelo Vendedor | `id`, `sellerId`, `loyaltyProgram`, `milesQuantity`, `pricePerMile`, `status`, `createdAt`, `updatedAt` |

### Status da Listagem

| Status | Descrição |
|---|---|
| `ativa` | Disponível para Compradores |
| `pausada` | Temporariamente indisponível (decisão do Vendedor) |
| `esgotada` | Quantidade de milhas zerada após transação(ões) |

### Programas de Fidelidade Suportados

| Programa | Companhia | Termo correto |
|---|---|---|
| Smiles | Gol | milhas |
| Latam Pass | LATAM Airlines | pontos |
| TudoAzul | Azul Airlines | pontos |

### Controllers
- `ListingsController` — CRUD de listagens, busca e filtro

### Fluxo da Listagem

```
Vendedor cria listagem (programa, quantidade, preço)
         ↓
Listagem publicada (status: ativa)
         ↓
Comprador busca e seleciona listagem
         ↓
Transação criada a partir da listagem
         ↓
[Após conclusão] Quantidade disponível decrementada
         ↓
[Se quantidade = 0] status: esgotada
```

### Gaps Conhecidos
- Regra de atualização de preço em listagens com transações em andamento não especificada
- Não documentado se um Comprador pode comprar fração da quantidade disponível
- Regras de moderação de listagens (conteúdo, preço mínimo/máximo) não definidas

---

## M3 — Transações

### Responsabilidade
Módulo central da plataforma. Gerencia o ciclo completo de compra e venda de milhas, desde a criação do pedido até a conclusão ou cancelamento.

### Entidades

| Entidade | Descrição | Campos principais |
|---|---|---|
| `Transaction` | Negociação completa de milhas | `id`, `buyerId`, `sellerId`, `listingId`, `milesQuantity`, `totalAmount`, `status`, `sellerApprovalStatus`, `gatewayStatus`, `gatewayOrderId`, `gatewayChargeId`, `proofUploadUrl`, `createdAt`, `updatedAt` |

### Status de Transação

| Status | Descrição | Gatilho |
|---|---|---|
| `PENDING` | Transação criada, aguardando confirmação do gateway | Criação pelo Comprador |
| `PENDING_SELLER_APPROVAL` | Pagamento processado, aguardando decisão do Vendedor | Webhook de pagamento confirmado |
| `COMPLETED` | Milhas transferidas e comprovante aceito | Comprovante validado |
| `CANCELLED` | Encerrada sem conclusão | Rejeição do Vendedor, timeout, ou cancelamento |

### Status de Aprovação do Vendedor (sellerApprovalStatus)

| Valor | Descrição |
|---|---|
| `PENDING` | Aguardando decisão do Vendedor |
| `APPROVED` | Vendedor aprovou a transação |
| `REJECTED` | Vendedor rejeitou a transação |

### Status do Gateway (gatewayStatus)

| Valor | Descrição | Forma de pagamento |
|---|---|---|
| `pre_authorized` | Valor bloqueado no cartão, aguardando captura | Cartão de crédito |
| `paid` | Pagamento confirmado/capturado | Cartão (após captura) ou PIX |
| `cancelled` | Cobrança cancelada antes da captura | Cartão (pre_authorized não capturado) |
| `refunded` | Pagamento devolvido ao Comprador | Cartão (após captura) ou PIX |

### Transições de Status

```
PENDING
  └── [pagamento confirmado] → PENDING_SELLER_APPROVAL
        ├── [Vendedor rejeita] → CANCELLED
        │     └── gatewayStatus: cancelled (se pre_authorized) ou refunded (se paid)
        ├── [timeout 48h sem decisão] → CANCELLED
        │     └── gatewayStatus: cancelled (se pre_authorized) ou refunded (se paid)
        └── [Vendedor aprova] → captura (gatewayStatus: paid)
              └── [comprovante enviado e aceito] → COMPLETED
                    └── [timeout 48h sem comprovante] → CANCELLED + reembolso
```

### Controllers
- `TransactionsController` — criação, consulta, atualização de status, upload de comprovante

### Firebase Functions Relacionadas

| Function | Gatilho | Ação |
|---|---|---|
| `checkProofDeadline` | Cron / evento de prazo | Cancela transação se comprovante não enviado em 48h |
| `onTransactionStatusFix` | Webhook do gateway | Corrige inconsistências de status |
| `releaseWithdrawalBalance` | Cron D+30 | Libera saldo para saque |

### Regras de Negócio Críticas

- **RN-M3-01:** O pagamento deve ser processado antes de qualquer compromisso do Vendedor
- **RN-M3-02:** O Vendedor tem 48h após `PENDING_SELLER_APPROVAL` para aprovar ou rejeitar
- **RN-M3-03:** Após aprovação, o Vendedor tem 48h para enviar o comprovante de transferência
- **RN-M3-04:** Cancelamento de transação com `gatewayStatus = pre_authorized` usa `CancelAsync` (não reembolso)
- **RN-M3-05:** Cancelamento de transação com `gatewayStatus = paid` usa `RefundAsync`

---

## M4 — Gateway de Pagamento (Pagar.me)

### Responsabilidade
Integração com o gateway Pagar.me para processamento de pagamentos via cartão de crédito, com pre-autorização e captura diferenciada. O backend principal nunca acessa o Pagar.me diretamente — toda comunicação passa pelo proxy.

### Arquitetura da Integração

```
ShareMiles.Api (PagarMeService)
         ↓ HTTP
Sharemiles.Pagarme.Api (PagarmeProxyService)
         ↓ HTTPS
Pagar.me API (gateway externo)
```

### Serviços

| Serviço | Localização | Responsabilidade |
|---|---|---|
| `PagarMeService` | `ShareMiles.Api/Infrastructure/ExternalServices/` | Orchestra chamadas ao proxy |
| `PagarmeProxyService` | `Sharemiles.Pagarme.Api/Services/` | Comunica diretamente com Pagar.me |

### Modelos

| Modelo | Localização | Descrição |
|---|---|---|
| `PagarmeModels` | `Sharemiles.Pagarme.Api/Models/` | Request/response da API Pagar.me |

### Endpoints do Proxy

| Método | Endpoint | Operação | Quando usar |
|---|---|---|---|
| `POST` | `/orders` | Criar order com charge | Criação da transação |
| `POST` | `/charges/{id}/capture` | Capturar cobrança | Após aprovação do Vendedor |
| `DELETE` | `/charges/{id}` | Cancelar cobrança | Cancelamento de pre_authorized |
| `POST` | `/charges/{id}/refund` | Reembolsar | Cancelamento de paid |

### Fluxo Cartão de Crédito

```
Comprador informa dados do cartão
         ↓
PagarMeService → PagarmeProxyService → POST /orders
         ↓
gatewayStatus: pre_authorized (valor bloqueado)
         ↓
[Vendedor aprova]
         ↓
PagarMeService → PagarmeProxyService → POST /charges/{id}/capture
         ↓
gatewayStatus: paid
```

### Fluxo de Cancelamento — Dois Cenários

**Cenário A: Pagamento pré-autorizado (não capturado)**
```
Transaction.gatewayStatus = pre_authorized
         ↓
DELETE /charges/{id} via proxy
         ↓
gatewayStatus: cancelled
Transaction.status: CANCELLED
```

**Cenário B: Pagamento capturado**
```
Transaction.gatewayStatus = paid
         ↓
POST /charges/{id}/refund via proxy
         ↓
gatewayStatus: refunded
Transaction.status: CANCELLED
```

### Gaps Conhecidos
- Tratamento de falhas de comunicação com o proxy não documentado
- Política de retry em caso de timeout de gateway não especificada
- Tratamento de chargeback não documentado

---

## M5 — PIX

### Responsabilidade
Processamento de pagamentos instantâneos via PIX, com geração de QR Code e recebimento de confirmações via webhook.

### API
- `ShareMilesPixApi/` — API dedicada ao processamento PIX

### Diferenças em relação ao Cartão de Crédito

| Aspecto | Cartão de Crédito | PIX |
|---|---|---|
| Pre-autorização | Sim (`pre_authorized`) | Não |
| Tempo de confirmação | Imediato (pré-auth) | Imediato |
| Captura separada | Sim | Não (confirmação = pagamento) |
| Cancelamento antes de PENDING_SELLER_APPROVAL | `DELETE /charges/{id}` | Não se aplica |
| Reembolso após PENDING_SELLER_APPROVAL | `POST /charges/{id}/refund` | `POST /charges/{id}/refund` |

### Fluxo PIX

```
Comprador seleciona PIX como forma de pagamento
         ↓
ShareMilesPixApi gera QR Code PIX
         ↓
Comprador realiza pagamento no app do banco
         ↓
Webhook de confirmação → ShareMilesPixApi
         ↓
Transaction.gatewayStatus = paid
Transaction.status = PENDING_SELLER_APPROVAL
```

### Gaps Conhecidos
- Prazo de expiração do QR Code PIX não documentado
- Comportamento quando QR Code expira sem pagamento não especificado
- Integração entre ShareMilesPixApi e o proxy Pagar.me não totalmente mapeada

---

## M6 — Carteira e Saques

### Responsabilidade
Gestão do saldo do Vendedor e processamento de saques para contas bancárias verificadas.

### Entidades

| Entidade | Descrição | Campos principais |
|---|---|---|
| `Withdrawal` | Solicitação de saque do Vendedor | `id`, `sellerId`, `amount`, `bankAccountId`, `status`, `availableForWithdrawal`, `requestedAt`, `processedAt` |
| `BankAccount` | Conta bancária do Vendedor | `id`, `sellerId`, `bankCode`, `agency`, `accountNumber`, `accountType`, `holderName`, `holderCpfCnpj`, `verified` |

### Status de Saque

| Status | Descrição |
|---|---|
| `PENDING` | Solicitado, aguardando aprovação do Admin |
| `APPROVED` | Aprovado pelo Admin, aguardando processamento |
| `PROCESSED` | TED/PIX enviado ao Vendedor |
| `REJECTED` | Rejeitado pelo Admin |

### Controllers
- `WithdrawalsController` — solicitação de saque, consulta de saldo, cadastro de conta bancária

### Firebase Functions Relacionadas

| Function | Gatilho | Ação |
|---|---|---|
| `releaseWithdrawalBalance` | Cron (D+30 após COMPLETED) | Define `availableForWithdrawal = true` |

### Regras de Negócio

- **RN-M6-01:** O saldo só fica disponível D+30 após a conclusão da transação (`COMPLETED`)
- **RN-M6-02:** O Vendedor deve ter pelo menos uma `BankAccount` verificada para solicitar saque
- **RN-M6-03:** Todo saque requer aprovação manual do Administrador antes de ser processado

### Gaps Conhecidos
- Valor mínimo de saque não definido
- Limite máximo de saque por período não documentado
- Processo de verificação de conta bancária não especificado
- Forma de processamento do saque (TED, PIX, transferência interna) não detalhada

---

## M7 — Notificações

### Responsabilidade
Comunicação proativa com usuários sobre eventos críticos da plataforma, via e-mail transacional e notificações em tempo real.

### Implementação
- **Firebase Functions** — triggers em eventos de status de transação
- **E-mail transacional** — provedor a confirmar

### Eventos Notificados

| Evento | Destinatário | Canal | Gatilho |
|---|---|---|---|
| Nova transação criada | Vendedor | E-mail | `PENDING_SELLER_APPROVAL` |
| Transação aprovada | Comprador | E-mail | `sellerApprovalStatus = APPROVED` |
| Transação rejeitada | Comprador | E-mail | `sellerApprovalStatus = REJECTED` |
| Comprovante enviado | Comprador | E-mail | Upload do comprovante |
| Transação concluída | Comprador + Vendedor | E-mail | `COMPLETED` |
| Saque aprovado | Vendedor | E-mail | `Withdrawal.status = APPROVED` |
| Saque processado | Vendedor | E-mail | `Withdrawal.status = PROCESSED` |
| Prazo expirando (48h) | Vendedor | E-mail / push | Antes do timeout |

### Gaps Conhecidos
- Provedor de e-mail transacional não documentado
- Templates de e-mail não especificados
- Notificações push (mobile) não mapeadas
- Preferências de notificação do usuário (opt-out) não documentadas
- Notificação de prazo expirando (aviso antes do timeout) não implementada formalmente

---

## M8 — Painel Administrativo

### Responsabilidade
Interface para o Administrador gerenciar todas as operações da plataforma: transações, usuários, listagens, saques e relatórios.

### Frontend
- `sharemilesapp/pages/AdminDashboard.tsx` — componente principal do painel

### Funcionalidades

| Área | Descrição | Entidades |
|---|---|---|
| Monitoramento de transações | Visão consolidada em tempo real | `Transaction` |
| Gestão de usuários | Consulta, edição, suspensão, KYC | `User`, `UserProfile` |
| Gestão de listagens | Moderação e aprovação | `Listing` |
| Gestão de saques | Aprovação/rejeição de saques | `Withdrawal`, `BankAccount` |
| Relatórios financeiros | Volume, receita, métricas | Todos |
| Alertas operacionais | Transações problemáticas | `Transaction` |

### Controllers Utilizados
O painel administrativo consome todos os controllers com rotas de acesso restrito a `role = admin`:
- `TransactionsController` (rotas admin)
- `UsersController` (rotas admin)
- `ListingsController` (rotas admin)
- `WithdrawalsController` (rotas admin)

### Gaps Conhecidos
- Permissões granulares dentro do role admin não documentadas (ex: admin financeiro vs admin operacional)
- Auditoria de ações administrativas não especificada
- Relatórios financeiros e suas métricas não detalhadas
- Processo de moderação de listagens não documentado
- Dashboard de métricas em tempo real não especificado

---

## Dependências entre Módulos

```
M1 (Usuários) ←── M2 (Listagens) ←── M3 (Transações)
                                             │
                                    ┌────────┼────────┐
                                    │        │        │
                                   M4       M5       M6
                                (Pagar.me) (PIX)  (Saques)
                                    │        │        │
                                    └────────┴────────┘
                                             │
                                       M7 (Notificações)
                                             │
                                       M8 (Admin) ←── todos os módulos
```

---

## Histórico de Versões

| Versão | Data | Alteração |
|---|---|---|
| 1.0 | 2026-03-14 | Criação do documento inicial |

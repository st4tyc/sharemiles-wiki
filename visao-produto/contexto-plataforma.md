# Contexto da Plataforma — ShareMiles

> Visão geral estratégica da plataforma ShareMiles, premissas de negócio e arquitetura funcional.
> Versão: 1.0 | Data: 2026-03-14

---

## Visão do Produto

A **ShareMiles** é um marketplace de milhas aéreas que conecta pessoas físicas que possuem milhas/pontos acumulados em programas de fidelidade (Smiles, Latam Pass, TudoAzul) com compradores interessados em emitir passagens aéreas com desconto.

A plataforma resolve um problema de liquidez bilateral: de um lado, milhões de brasileiros acumulam milhas que não conseguem usar ou deixam vencer; do outro, viajantes buscam passagens mais baratas do que as oferecidas pelas companhias aéreas diretamente.

---

## Proposta de Valor

**Para o Comprador:**
- Acesso a milhas de terceiros a preços abaixo do mercado
- Pagamento seguro via cartão de crédito ou PIX
- Garantia da transação intermediada pela plataforma

**Para o Vendedor:**
- Monetização de milhas que seriam desperdiçadas
- Recebimento garantido após conclusão da transferência
- Interface simples para gerenciar listagens e transações

**Para a Plataforma:**
- Comissão sobre cada transação concluída
- Volume de transações como principal métrica de crescimento
- Diferencial competitivo via confiança e segurança

---

## Modelo de Negócio

A ShareMiles opera como um **marketplace de intermediação**, onde:

1. O Vendedor cria uma listagem com preço por milha
2. O Comprador seleciona a listagem e inicia uma transação
3. O pagamento é processado e garantido pela plataforma antes da transferência
4. O Vendedor transfere as milhas e comprova a transferência
5. A plataforma libera o saldo ao Vendedor após o período de carência (D+30)

A plataforma retém uma comissão sobre o valor da transação. O período D+30 protege o Comprador em caso de disputas pós-conclusão.

---

## Premissas Estratégicas

### PS-01: Confiança como diferencial central
Em um mercado sem regulamentação específica, a confiança na intermediação é o principal diferencial. A plataforma deve garantir que o Comprador receba as milhas antes do Vendedor receber o pagamento integral.

### PS-02: Segurança financeira via pre-autorização
O mecanismo de pre-autorização de cartão de crédito é fundamental: o valor é bloqueado no cartão do Comprador antes do Vendedor se comprometer. Isso elimina o risco de o Vendedor não receber após transferir as milhas.

### PS-03: Automação como escala
Prazos de timeout (48h para aprovação, 48h para comprovante) e liberação automática de saldo (D+30) reduzem o trabalho manual do time operacional e permitem escalar o volume de transações sem aumentar proporcionalmente o time.

### PS-04: Compliance financeiro
A integração exclusiva via gateway Pagar.me (nunca acesso direto) e o período D+30 existem parcialmente para conformidade com regulações financeiras e proteção contra fraudes e chargebacks.

### PS-05: KYC obrigatório para vendedores
Vendedores precisam ter identidade verificada antes de operar. Isso reduz fraudes e viabiliza o registro de operações financeiras.

---

## Arquitetura Funcional

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React/TS)                       │
│  sharemilesapp/pages/  │  AdminDashboard  │  Área Comprador/Vendedor │
└───────────────────────────────────┬─────────────────────────────┘
                                    │ HTTP
┌───────────────────────────────────▼─────────────────────────────┐
│                    BACKEND PRINCIPAL (ASP.NET Core)              │
│                        ShareMiles.Api                           │
│  TransactionsController │ UsersController │ ListingsController  │
│  WithdrawalsController  │ PagarMeService                        │
└──────────────────────────────┬──────────────────────────────────┘
                               │ HTTP (interno)
        ┌──────────────────────┼──────────────────────┐
        │                      │                      │
┌───────▼──────┐    ┌──────────▼──────────┐  ┌───────▼──────────┐
│ Pagar.me     │    │  Firebase Functions  │  │  ShareMilesPixApi │
│ Proxy API    │    │  (Node.js)           │  │  (PIX)            │
│ Sharemiles.  │    │  - checkProofDeadline│  │                  │
│ Pagarme.Api  │    │  - releaseWithdrawal │  │                  │
└──────┬───────┘    │  - onStatusFix       │  └──────────────────┘
       │            └──────────────────────┘
┌──────▼───────┐
│  Pagar.me    │
│  (Gateway)   │
└──────────────┘
```

---

## Stack Tecnológica

| Camada | Tecnologia | Localização |
|---|---|---|
| Frontend | React + TypeScript | `sharemilesapp/` |
| Backend principal | ASP.NET Core C# | `ShareMiles.Api/` |
| Proxy Pagar.me | ASP.NET Core Minimal API | `Sharemiles.Pagarme.Api/` |
| PIX API | ASP.NET Core | `ShareMilesPixApi/` |
| Automações | Firebase Functions (Node.js) | `sharemilesapp/functions/` |
| Autenticação | Firebase Auth | — |
| Gateway principal | Pagar.me | API externa |

---

## Módulos Funcionais

| Código | Módulo | Responsabilidade principal |
|---|---|---|
| M1 | Usuários e Autenticação | Cadastro, login, perfil, roles, KYC |
| M2 | Listagens de Milhas | Criação e gestão de ofertas de milhas |
| M3 | Transações | Ciclo completo de compra/venda de milhas |
| M4 | Gateway de Pagamento | Integração com Pagar.me (cartão + PIX via proxy) |
| M5 | PIX | Pagamento instantâneo, QR Code, webhook |
| M6 | Carteira e Saques | Saldo do Vendedor, saques, contas bancárias |
| M7 | Notificações | E-mails transacionais, notificações em tempo real |
| M8 | Painel Administrativo | Gestão operacional, relatórios, aprovações |

---

## Fluxo Central de Transação

```
Comprador seleciona listagem
         ↓
Cria transação (Transaction.status = PENDING)
         ↓
Pagamento processado pelo Pagar.me
  ├── Cartão → pre_autorizado (gatewayStatus: pre_authorized)
  └── PIX → pago imediatamente (gatewayStatus: paid)
         ↓
Transaction.status = PENDING_SELLER_APPROVAL
         ↓
Vendedor decide em até 48h
  ├── REJEITA → gatewayStatus: cancelled/refunded → status: CANCELLED
  └── APROVA → captura do pagamento (gatewayStatus: paid)
         ↓
Vendedor transfere milhas + faz upload do comprovante (prazo: 48h)
         ↓
Comprovante aceito → Transaction.status = COMPLETED
         ↓
D+30 → Withdrawal.availableForWithdrawal = true
         ↓
Vendedor solicita saque → Admin aprova → TED/PIX ao Vendedor
```

---

## Personas

| Persona | Role no sistema | Responsabilidade principal |
|---|---|---|
| Comprador | `buyer` | Busca, compra e recebe milhas |
| Vendedor | `seller` | Cria listagens, aprova e transfere milhas |
| Agência | `agency` | Opera como Vendedor em maior volume |
| Administrador | `admin` | Gestão operacional completa da plataforma |

---

## Métricas-Chave do Produto

| Métrica | Descrição | Módulo associado |
|---|---|---|
| Taxa de conclusão de transações | % de transações que chegam a COMPLETED | M3 |
| Tempo médio de conclusão | Horas da criação ao COMPLETED | M3 |
| Taxa de cancelamento | % de transações que chegam a CANCELLED | M3 |
| Taxa de timeout de comprovante | % de cancelamentos por prazo expirado | M3, M7 |
| Volume de saques aprovados | Valor total processado em saques | M6 |
| Tempo de aprovação do Vendedor | Horas entre PENDING_SELLER_APPROVAL e decisão | M3 |
| NPS do Comprador | Satisfação pós-transação | M3 |
| Listagens ativas | Quantidade de listagens com status ativo | M2 |

---

## Restrições e Limitações Conhecidas

### RL-01: Pre-autorização apenas para cartão de crédito
PIX não possui mecanismo de pre-autorização. Transações PIX avançam imediatamente para `PENDING_SELLER_APPROVAL` sem a garantia financeira da pre-autorização. O risco é mitigado pela velocidade da transação PIX (instantâneo) e pela política de reembolso.

### RL-02: D+30 não é configurável por transação
O período de carência é fixo em 30 dias para todas as transações. Não há mecanismo para reduzir ou aumentar esse prazo individualmente.

### RL-03: Saque requer aprovação manual do Administrador
Não há aprovação automática de saques. Todo saque passa por revisão humana, o que limita a escala operacional.

### RL-04: Um role por usuário
O sistema de roles (`buyer`, `seller`, `agency`, `admin`) não suporta múltiplos papéis simultâneos para o mesmo usuário. Um Vendedor não pode operar como Comprador na mesma conta.

---

## Histórico de Versões

| Versão | Data | Alteração |
|---|---|---|
| 1.0 | 2026-03-14 | Criação do documento inicial |

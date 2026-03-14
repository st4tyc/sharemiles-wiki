# Jornada do Vendedor — ShareMiles

> Mapeamento detalhado da jornada do Vendedor (Seller) na plataforma ShareMiles.
> Versão: 1.0 | Data: 2026-03-14

---

## Cabeçalho

```
Persona: Vendedor (Seller)
Role: seller
Módulos envolvidos: M1, M2, M3, M6, M7
Versão: 1.0
Data: 2026-03-14
```

---

## Visão Geral da Jornada

A jornada do Vendedor compreende 5 etapas principais, do onboarding até o recebimento do saque.

```
[1. Onboarding + KYC] → [2. Criação de Listagem] → [3. Gestão de Transação] → [4. Espera D+30] → [5. Saque]
```

---

## Etapa 1 — Onboarding e KYC

### Objetivo
O Vendedor cria sua conta, passa pela verificação de identidade obrigatória e fica habilitado para vender.

### Fluxo AS-IS

1. Acessa a plataforma ShareMiles
2. Clica em "Criar conta como Vendedor"
3. Informa e-mail e senha (Firebase Auth)
4. Confirma e-mail
5. Preenche perfil completo:
   - Nome completo
   - CPF
   - Telefone
   - Endereço
6. Seleciona role: `seller`
7. Inicia processo de KYC:
   - Envia foto do documento de identidade (frente e verso)
   - Realiza selfie com documento (se exigido)
8. Aguarda verificação (manual pelo Admin ou automática)
9. Recebe aprovação → conta habilitada para criar listagens

### Pontos de Fricção Identificados

| Ponto | Descrição | Impacto |
|---|---|---|
| Tempo de aprovação KYC | Processo manual pode levar dias | Vendedor começa a operar tarde |
| Clareza dos requisitos de documento | Formato aceitável de documento não documentado | Envio de documentos inválidos, retrabalho |
| Sem feedback durante análise | Vendedor não sabe o andamento do KYC | Ansiedade, contatos desnecessários ao suporte |

### Regras de Negócio Aplicáveis

- RN-J1-01: KYC aprovado é obrigatório antes de criar qualquer listagem (DP-05)
- RN-J1-02: `UserProfile.verificationStatus` deve ser `approved` para habilitar criação de listagens

### Entidades e Controllers
- [Entidade: User] — [Controller: UsersController]
- [Entidade: UserProfile] — [Controller: UsersController]

---

## Etapa 2 — Criação e Gestão de Listagem

### Objetivo
O Vendedor publica uma oferta de milhas no marketplace com preço e quantidade definidos.

### Fluxo AS-IS

1. Acessa painel do Vendedor
2. Clica em "Nova Listagem"
3. Preenche os campos:
   - Programa de fidelidade (Smiles, Latam Pass, TudoAzul)
   - Quantidade de milhas disponíveis
   - Preço por milha (R$)
4. Confirma e publica a listagem (status: `ativa`)
5. Listagem aparece no marketplace para Compradores
6. Vendedor pode:
   - Pausar a listagem (status: `pausada`)
   - Editar preço ou quantidade (regras não totalmente documentadas — GAP-06)
   - Remover a listagem

### Gestão de Múltiplas Listagens

O Vendedor pode ter múltiplas listagens ativas simultaneamente, em diferentes programas de fidelidade.

### Pontos de Fricção Identificados

| Ponto | Descrição | Impacto |
|---|---|---|
| Sem referência de preço | Vendedor não sabe se seu preço está competitivo | Pode precificar fora do mercado |
| Atualização de listagem com transação em andamento | Comportamento não documentado (GAP-06) | Confusão sobre qual preço se aplica |
| Sem gestão em lote | Cada listagem precisa ser gerenciada individualmente | Fricção para Vendedores com muitas listagens |

### Regras de Negócio Aplicáveis

- RN-J2-01: Apenas Vendedores com KYC aprovado podem criar listagens
- RN-J2-02: Uma listagem com quantidade zero deve ter status alterado para `esgotada`
- RN-J2-03: Regras de edição de listagens com transações em andamento — indefinidas (GAP-06)

### Entidades e Controllers
- [Entidade: Listing] — [Controller: ListingsController]

---

## Etapa 3 — Gestão da Transação

### Objetivo
O Vendedor recebe a notificação de nova transação, decide se aprova ou rejeita e, se aprovar, realiza a transferência das milhas com comprovante.

### Fluxo AS-IS

**Sub-etapa 3A: Recebimento e Decisão**

1. Comprador inicia transação e realiza pagamento
2. Vendedor recebe notificação (e-mail): "Nova transação recebida — R$ X por Y milhas [Programa]"
3. Acessa painel de transações
4. Visualiza detalhes: Comprador, quantidade, valor total, programa de fidelidade, dados para transferência
5. **Prazo: 48h para decidir**
6. Decide:
   - **Rejeitar:** Informa motivo (opcional) → `sellerApprovalStatus` → `REJECTED` → `Transaction.status` → `CANCELLED` → reembolso ao Comprador
   - **Aprovar:** `sellerApprovalStatus` → `APPROVED` → captura do pagamento no Pagar.me (se cartão) → avança para sub-etapa 3B

**Sub-etapa 3B: Transferência de Milhas e Comprovante**

1. Vendedor recebe confirmação de aprovação
2. Acessa o programa de fidelidade (externo à plataforma — Smiles, Latam Pass, etc.)
3. Realiza a transferência de milhas para o programa/CPF do Comprador
4. Obtém o comprovante de transferência (screenshot do programa ou e-mail de confirmação)
5. **Prazo: 48h para enviar o comprovante**
6. Acessa a transação na plataforma
7. Faz upload do comprovante
8. `Transaction.status` → `COMPLETED`
9. Vendedor recebe confirmação: "Transação concluída! Saldo disponível em D+30."

### Pontos de Fricção Identificados

| Ponto | Descrição | Impacto |
|---|---|---|
| Processo manual nos programas de fidelidade | Vendedor precisa acessar cada programa individualmente para transferir | Lento, propenso a erro |
| Sem aviso antes do timeout | Não há alerta quando o prazo de 48h está próximo de expirar (GAP-08) | Vendedor pode perder o prazo sem perceber |
| Comprovante em formato livre | Não há validação do comprovante enviado | Risco de fraude (GAP-03 relacionado) |
| Sem rastreamento do status de transferência | Plataforma não confirma automaticamente se as milhas chegaram | Depende do Comprador para confirmar |

### Regras de Negócio Aplicáveis

- RN-J3-01: Vendedor tem exatamente 48h após `PENDING_SELLER_APPROVAL` para decidir
- RN-J3-02: Após aprovação, Vendedor tem 48h para enviar o comprovante
- RN-J3-03: Aprovação do Vendedor aciona a captura do pagamento no Pagar.me (para cartão de crédito)
- RN-J3-04: Rejeição do Vendedor aciona cancelamento da pre-autorização (cartão) ou reembolso (PIX)
- RN-J3-05: Upload do comprovante conclui a transação (`COMPLETED`)
- RN-J3-06: Firebase Function `checkProofDeadline` cancela automaticamente se prazo expirar

### Entidades e Controllers
- [Entidade: Transaction] — [Controller: TransactionsController]
- [Service: PagarMeService]
- [Service: PagarmeProxyService]
- Firebase Function: `checkProofDeadline`

---

## Etapa 4 — Período de Carência (D+30)

### Objetivo
O Vendedor aguarda a liberação do saldo após a conclusão da transação.

### Fluxo AS-IS

1. `Transaction.status` → `COMPLETED`
2. Vendedor vê saldo como "pendente" ou "a liberar"
3. Firebase Function `releaseWithdrawalBalance` executa em D+30
4. `Withdrawal.availableForWithdrawal` → `true`
5. Vendedor recebe notificação: "Saldo de R$ X disponível para saque"
6. Avança para etapa 5 (Saque)

### Pontos de Fricção Identificados

| Ponto | Descrição | Impacto |
|---|---|---|
| D+30 sem transparência | Vendedor não sabe a data exata em que o saldo será liberado | Incerteza sobre fluxo de caixa |
| Sem notificação proativa de liberação | Vendedor precisa verificar manualmente se o saldo foi liberado (GAP documentado) | Experiência ruim |
| Múltiplos D+30 simultâneos | Com muitas transações, é difícil rastrear qual saldo libera quando | Gestão financeira complexa para Vendedores ativos |

### Regras de Negócio Aplicáveis

- RN-J4-01: D+30 contado a partir da data de `COMPLETED` (não da data de criação da transação)
- RN-J4-02: `availableForWithdrawal = true` é definido pela Firebase Function `releaseWithdrawalBalance`
- RN-J4-03: D+30 não é configurável por transação (DP-03)

### Entidades e Controllers
- [Entidade: Withdrawal] — [Controller: WithdrawalsController]
- Firebase Function: `releaseWithdrawalBalance`

---

## Etapa 5 — Saque

### Objetivo
O Vendedor transfere o saldo disponível para sua conta bancária.

### Fluxo AS-IS

1. Vendedor acessa "Carteira" no painel
2. Visualiza saldo disponível para saque
3. [Primeira vez] Cadastra conta bancária (`BankAccount`): banco, agência, conta, tipo, CPF/CNPJ do titular
4. Conta bancária passa por verificação (processo não totalmente documentado — GAP-07)
5. Vendedor seleciona valor a sacar (total ou parcial)
6. Seleciona conta bancária de destino
7. Confirma a solicitação de saque
8. `Withdrawal.status` → `PENDING`
9. Admin recebe alerta de saque pendente
10. Admin analisa e aprova ou rejeita
11. [Se aprovado] `Withdrawal.status` → `APPROVED`
12. Admin processa a transferência bancária (TED ou PIX)
13. `Withdrawal.status` → `PROCESSED`
14. Vendedor recebe notificação: "Saque de R$ X processado. Previsão de creditamento: D+1"

### Pontos de Fricção Identificados

| Ponto | Descrição | Impacto |
|---|---|---|
| Aprovação manual | Todo saque requer revisão manual do Admin (DP-06) | Atraso, pode levar dias úteis |
| Sem limite documentado | Valor mínimo e máximo de saque não definidos (GAP-09) | Inconsistência na operação |
| Verificação de conta bancária | Processo não documentado (GAP-07) | Pode bloquear o saque inesperadamente |
| Sem previsão de prazo | Vendedor não sabe quando receberá após aprovação do Admin | Incerteza |

### Regras de Negócio Aplicáveis

- RN-J5-01: Saque só pode ser solicitado com `availableForWithdrawal = true`
- RN-J5-02: Vendedor precisa ter ao menos uma `BankAccount` verificada para sacar
- RN-J5-03: Todo saque passa por aprovação manual do Admin antes de ser processado (DP-06)

### Entidades e Controllers
- [Entidade: Withdrawal] — [Controller: WithdrawalsController]
- [Entidade: BankAccount] — [Controller: WithdrawalsController]

---

## Mapa de Emoções do Vendedor

| Etapa | Emoção predominante | Nível de ansiedade | Ação esperada |
|---|---|---|---|
| Onboarding + KYC | Motivado / Paciente | Médio | Completar documentação |
| Aguardando KYC | Ansioso | Médio-alto | Verificar status diariamente |
| Criando listagem | Confiante | Baixo | Publicar a listagem |
| Aguardando Comprador | Neutro | Baixo | Aguardar passivamente |
| Aprovando transação | Focado / Cuidadoso | Médio | Analisar antes de decidir |
| Transferindo milhas | Concentrado / Tenso | Alto | Não errar o CPF/conta de destino |
| Aguardando D+30 | Impaciente / Ansioso | Médio-alto | Verificar calendário de liberação |
| Solicitando saque | Aliviado / Esperançoso | Médio | Aguardar aprovação do Admin |
| Saque processado | Satisfeito | Baixo | Verificar conta bancária |

---

## Oportunidades de Melhoria Identificadas

| Oportunidade | Etapa afetada | Prioridade no backlog |
|---|---|---|
| KYC automatizado | Onboarding | E2-01 |
| Previsão de data de liberação D+30 | Espera D+30 | E4-05 |
| Notificação proativa de saldo liberado | Espera D+30 | M7 |
| Alerta preventivo de prazo de comprovante expirando | Gestão da transação | GAP-08, E4-02 |
| Pré-aprovação automática de saques | Saque | E5-05 |
| Extrato financeiro consolidado | Saque, Espera D+30 | E4-06 |
| Aprovação em lote (para Agências) | Gestão da transação | E6-02 |

---

## Histórico de Versões

| Versão | Data | Alteração |
|---|---|---|
| 1.0 | 2026-03-14 | Criação do documento inicial |

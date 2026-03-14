# Jornada do Comprador — ShareMiles

> Mapeamento detalhado da jornada do Comprador (Buyer) na plataforma ShareMiles.
> Versão: 1.0 | Data: 2026-03-14

---

## Cabeçalho

```
Persona: Comprador (Buyer)
Role: buyer
Módulos envolvidos: M1, M2, M3, M4, M5, M7
Versão: 1.0
Data: 2026-03-14
```

---

## Visão Geral da Jornada

A jornada do Comprador compreende 5 etapas principais, do primeiro acesso à plataforma até o recebimento das milhas e conclusão da transação.

```
[1. Onboarding] → [2. Busca e Seleção] → [3. Pagamento] → [4. Acompanhamento] → [5. Recebimento]
```

---

## Etapa 1 — Onboarding (Cadastro e Configuração)

### Objetivo
O Comprador cria sua conta e configura o perfil mínimo necessário para realizar uma compra.

### Fluxo AS-IS

1. Acessa a plataforma ShareMiles
2. Clica em "Criar conta" ou "Cadastrar"
3. Informa e-mail e senha (cadastro via Firebase Auth)
4. Confirma e-mail (link de verificação)
5. Preenche perfil básico: nome completo, CPF, telefone
6. Seleciona role: `buyer`
7. Conta ativada — pronto para comprar

### Pontos de Fricção Identificados

| Ponto | Descrição | Impacto |
|---|---|---|
| Confirmação de e-mail | Interrompe o fluxo imediatamente após cadastro | Pode causar abandono |
| Dados obrigatórios | CPF solicitado no cadastro pode aumentar desconfiança | Fricção no início |

### Regras de Negócio Aplicáveis

- RN-J1-01: O Comprador não precisa passar por KYC para realizar compras (apenas Vendedores precisam)
- RN-J1-02: CPF é obrigatório para compliance (prevenção de fraude e LGPD)

### Entidades e Controllers
- [Entidade: User] — [Controller: UsersController]
- Firebase Auth — autenticação

---

## Etapa 2 — Busca e Seleção de Listagem

### Objetivo
O Comprador encontra a listagem que melhor atende às suas necessidades (programa, quantidade, preço).

### Fluxo AS-IS

1. Acessa o marketplace (página principal ou de busca)
2. Filtra listagens por:
   - Programa de fidelidade (Smiles, Latam Pass, TudoAzul)
   - Quantidade de milhas disponível
   - Preço por milha (crescente/decrescente)
3. Visualiza card da listagem com: nome do programa, quantidade disponível, preço por milha, reputação do Vendedor (se disponível)
4. Seleciona a listagem desejada
5. Define a quantidade de milhas a comprar (até o limite da listagem)
6. Visualiza o resumo: quantidade, preço unitário, total a pagar
7. Clica em "Comprar" para iniciar a transação

### Pontos de Fricção Identificados

| Ponto | Descrição | Impacto |
|---|---|---|
| Falta de avaliações | Comprador não tem informação sobre reputação do Vendedor | Insegurança na escolha |
| Sem estimativa de prazo | Comprador não sabe quanto tempo levará para receber as milhas | Expectativa não gerenciada |
| Preços variados | Sem orientação de preço justo de mercado | Dificuldade de decisão |

### Regras de Negócio Aplicáveis

- RN-J2-01: Apenas listagens com status `ativa` aparecem na busca
- RN-J2-02: A quantidade selecionada pelo Comprador não pode exceder `milesQuantity` da listagem
- RN-J2-03: Comprador deve estar autenticado para iniciar uma transação

### Entidades e Controllers
- [Entidade: Listing] — [Controller: ListingsController]

---

## Etapa 3 — Pagamento

### Objetivo
O Comprador realiza o pagamento com segurança, usando cartão de crédito ou PIX.

### Fluxo AS-IS — Cartão de Crédito

1. Comprador seleciona "Cartão de Crédito" como forma de pagamento
2. Informa dados do cartão (número, validade, CVV, nome impresso)
3. Clica em "Confirmar pagamento"
4. `TransactionsController` cria `Transaction` com status `PENDING`
5. `PagarMeService` → `PagarmeProxyService` → `POST /orders` no Pagar.me (pre_auth)
6. Pagar.me realiza pre-autorização (valor bloqueado, não capturado)
7. `Transaction.gatewayStatus` → `pre_authorized`
8. `Transaction.status` → `PENDING_SELLER_APPROVAL`
9. Comprador vê tela de confirmação: "Pagamento pré-autorizado. Aguardando aprovação do Vendedor."
10. Notificação enviada ao Vendedor

### Fluxo AS-IS — PIX

1. Comprador seleciona "PIX" como forma de pagamento
2. `ShareMilesPixApi` gera QR Code PIX
3. Comprador copia código PIX ou escaneia QR Code no app do banco
4. Comprador realiza o pagamento
5. Webhook de confirmação chega na `ShareMilesPixApi`
6. `Transaction.gatewayStatus` → `paid`
7. `Transaction.status` → `PENDING_SELLER_APPROVAL`
8. Comprador vê confirmação: "Pagamento confirmado via PIX. Aguardando aprovação do Vendedor."
9. Notificação enviada ao Vendedor

### Pontos de Fricção Identificados

| Ponto | Descrição | Impacto |
|---|---|---|
| Expiry do QR Code PIX | Prazo de expiração não comunicado claramente | Comprador pode perder o prazo (GAP-03) |
| Dados de cartão | Comprador precisa digitar dados a cada transação | Fricção repetida para clientes recorrentes |
| Erro de pagamento | Mensagem de erro genérica pode confundir | Abandono na etapa mais crítica |

### Regras de Negócio Aplicáveis

- RN-J3-01: Cartão de crédito sempre usa pre-autorização — nunca captura direta
- RN-J3-02: PIX não tem pre-autorização — pagamento = confirmação imediata
- RN-J3-03: `Transaction` só avança para `PENDING_SELLER_APPROVAL` após confirmação do gateway

### Entidades e Controllers
- [Entidade: Transaction] — [Controller: TransactionsController]
- [Service: PagarMeService] — [Service: PagarmeProxyService]
- [API: ShareMilesPixApi]

---

## Etapa 4 — Acompanhamento

### Objetivo
O Comprador acompanha o progresso da transação até o recebimento das milhas.

### Fluxo AS-IS

**Sub-etapa 4A: Aguardando aprovação do Vendedor**
1. Comprador recebe notificação de pagamento processado
2. Acessa "Minhas Transações" para acompanhar o status
3. Status visível: "Aguardando aprovação do Vendedor"
4. Prazo exibido: até 48h para o Vendedor decidir
5. [Vendedor rejeita] → Comprador recebe notificação + `Transaction.status` → `CANCELLED` + reembolso iniciado
6. [Vendedor aprova] → Comprador recebe notificação → avança para sub-etapa 4B

**Sub-etapa 4B: Aguardando transferência das milhas**
1. Comprador recebe notificação de aprovação
2. Status visível: "Vendedor aprovado. Aguardando transferência das milhas."
3. Prazo exibido: até 48h para o Vendedor enviar o comprovante
4. [Comprovante enviado] → Comprador recebe notificação com link do comprovante
5. [Timeout 48h] → Transação cancelada automaticamente → reembolso iniciado

### Pontos de Fricção Identificados

| Ponto | Descrição | Impacto |
|---|---|---|
| Passividade forçada | Comprador não pode fazer nada — apenas aguardar | Ansiedade, contatos desnecessários ao suporte |
| Sem chat/contato | Não há canal direto com o Vendedor | Opacidade no processo |
| Status genérico | Texto de status pode ser pouco informativo | Sensação de falta de controle |
| Sem estimativa atualizada | Prazo de 48h não é personalizado ao Vendedor | Expectativa mal gerenciada |

### Regras de Negócio Aplicáveis

- RN-J4-01: O Comprador não pode alterar o status da transação após o pagamento
- RN-J4-02: Em caso de cancelamento por timeout, o reembolso é iniciado automaticamente
- RN-J4-03: Cancelamento com `gatewayStatus = pre_authorized` → `CancelAsync` (não reembolso)
- RN-J4-04: Cancelamento com `gatewayStatus = paid` → `RefundAsync`

### Entidades e Controllers
- [Entidade: Transaction] — [Controller: TransactionsController]
- Firebase Function: `checkProofDeadline`

---

## Etapa 5 — Recebimento e Conclusão

### Objetivo
O Comprador verifica o recebimento das milhas e a transação é finalizada com sucesso.

### Fluxo AS-IS

1. Comprador recebe notificação de que o comprovante foi enviado pelo Vendedor
2. Acessa a transação para ver o comprovante
3. Verifica o recebimento das milhas no programa de fidelidade (externo à plataforma)
4. [Milhas recebidas] → `Transaction.status` → `COMPLETED`
5. Comprador vê tela de conclusão: "Transação concluída com sucesso!"

### Lacunas no Fluxo Atual

| Lacuna | Descrição | Gap relacionado |
|---|---|---|
| Confirmação ativa pelo Comprador | Atualmente não está documentado se o Comprador precisa confirmar o recebimento ou se o sistema confirma automaticamente | GAP-02 |
| Disputa pós-conclusão | Se as milhas não foram recebidas, não há fluxo documentado | GAP-02, GAP-10 |
| Avaliação do Vendedor | Não há sistema de avaliação implementado | E2-02 no backlog |

### Regras de Negócio Aplicáveis

- RN-J5-01: `COMPLETED` é um status terminal — não há reversão automática
- RN-J5-02: Disputas pós-conclusão são tratadas pelo Admin (fluxo a definir — GAP-02)

---

## Mapa de Emoções do Comprador

| Etapa | Emoção predominante | Nível de ansiedade | Ação esperada |
|---|---|---|---|
| Cadastro | Neutro / Curioso | Baixo | Completar o cadastro |
| Busca | Animado / Indeciso | Baixo | Comparar opções |
| Pagamento | Confiante / Receoso | Médio | Confirmar pagamento |
| Aguardando aprovação | Ansioso | Alto | Aguardar passivamente |
| Aguardando transferência | Muito ansioso | Muito alto | Verificar status repetidamente |
| Recebimento | Aliviado / Satisfeito | Baixo | Confirmar e avaliar |

---

## Oportunidades de Melhoria Identificadas

| Oportunidade | Etapa afetada | Prioridade no backlog |
|---|---|---|
| Sistema de avaliações de Vendedores | Seleção (E2) | E2-02 |
| Estimativa de prazo de entrega | Seleção, Acompanhamento | E3-05 |
| Notificações push em tempo real | Acompanhamento | E3-06 |
| Cancelamento pelo Comprador antes da aprovação | Pagamento, Acompanhamento | GAP-01, E3-04 |
| Tracking visual do progresso da transação | Acompanhamento | E3-03 |
| Chat entre Comprador e Vendedor | Acompanhamento | E3-07 |
| Confirmação ativa de recebimento pelo Comprador | Conclusão | GAP-02 |

---

## Histórico de Versões

| Versão | Data | Alteração |
|---|---|---|
| 1.0 | 2026-03-14 | Criação do documento inicial |

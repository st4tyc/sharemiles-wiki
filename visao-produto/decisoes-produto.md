# Log de Decisões de Produto — ShareMiles

> Registro cronológico de decisões de produto tomadas, com justificativas e impactos.
> Versão: 1.0 | Data: 2026-03-14

---

## Formato de Cada Entrada

```
### [DP-XX] Título da decisão
Data: YYYY-MM-DD
Status: Ativa | Revisada | Descartada
Módulos afetados: [M1–M8]
Tomada por: [Time / Persona responsável]

**Contexto:** O que motivou esta decisão?
**Decisão:** O que foi decidido (de forma clara e não-ambígua)?
**Justificativa:** Por que esta opção foi escolhida em detrimento das alternativas?
**Alternativas consideradas:** Quais outras opções foram avaliadas?
**Impacto:** O que muda no produto, no fluxo ou na arquitetura?
**Restrições criadas:** O que esta decisão proíbe ou limita no futuro?
```

---

## Decisões Ativas

### [DP-01] Pre-autorização obrigatória para cartão de crédito

Data: anterior a 2026-03-14 (data exata não registrada)
Status: Ativa
Módulos afetados: M3, M4
Tomada por: Fundadores / Time técnico

**Contexto:** Em um marketplace onde o Comprador paga antes de receber as milhas, é necessário garantir que o dinheiro está disponível sem transferi-lo ao Vendedor prematuramente.

**Decisão:** Todas as transações com cartão de crédito usam pre-autorização (`pre_auth`). O valor é capturado apenas após o Vendedor aprovar a transação, não no momento do pagamento.

**Justificativa:** A pre-autorização garante que o Comprador não precise confiar cegamente no Vendedor: o dinheiro está bloqueado mas não saiu da conta. O Vendedor só recebe após se comprometer com a transferência.

**Alternativas consideradas:**
- Captura imediata com reembolso em caso de rejeição: rejeitada por criar fluxo de dinheiro desnecessário e aumentar o risco de chargeback
- Pagamento condicionado a escrow externo: rejeitado por complexidade e custo

**Impacto:** `PagarMeService` sempre cria orders com `pre_auth`. `PagarmeProxyService` expõe endpoint de captura separado do de criação.

**Restrições criadas:** Não é possível criar uma transação de cartão que capture o pagamento diretamente sem pre-autorização.

---

### [DP-02] Acesso ao Pagar.me exclusivamente via proxy

Data: anterior a 2026-03-14 (data exata não registrada)
Status: Ativa
Módulos afetados: M4
Tomada por: Time técnico

**Contexto:** Credenciais do Pagar.me e lógica de integração precisam estar isoladas do backend principal para segurança e manutenibilidade.

**Decisão:** `ShareMiles.Api` nunca acessa o Pagar.me diretamente. Toda comunicação passa obrigatoriamente pelo proxy `Sharemiles.Pagarme.Api`.

**Justificativa:** Isola as credenciais do gateway em um único serviço. Permite substituir o gateway de pagamento sem alterar o backend principal. Facilita auditoria de chamadas ao gateway.

**Alternativas consideradas:**
- Acesso direto do `ShareMiles.Api` ao Pagar.me: rejeitado por acoplamento e risco de credenciais expostas

**Impacto:** `PagarMeService` faz chamadas HTTP para o proxy em vez de chamar o SDK do Pagar.me diretamente.

**Restrições criadas:** Toda nova integração com o Pagar.me deve ser implementada no proxy primeiro.

---

### [DP-03] Período de carência de D+30 para liberação de saldo

Data: anterior a 2026-03-14 (data exata não registrada)
Status: Ativa
Módulos afetados: M6
Tomada por: Fundadores / Jurídico

**Contexto:** Após a conclusão de uma transação, existe risco de disputas (Comprador alega não ter recebido as milhas, programas de fidelidade estornam transferências). O Vendedor não deve receber o dinheiro antes que o risco seja mitigado.

**Decisão:** O saldo do Vendedor só é liberado para saque 30 dias corridos após a conclusão (`COMPLETED`) da transação.

**Justificativa:** 30 dias cobre a maioria dos prazos de contestação de programas de fidelidade e chargebacks de cartão. Alinha-se com práticas de marketplaces similares no Brasil.

**Alternativas consideradas:**
- D+7: rejeitado por não cobrir prazo de chargeback
- D+15: considerado insuficiente para contestações de programas de fidelidade
- D+45: rejeitado por impacto negativo na experiência do Vendedor

**Impacto:** Firebase Function `releaseWithdrawalBalance` executa em D+30 e define `availableForWithdrawal = true` na entidade `Withdrawal`.

**Restrições criadas:** Vendedores com alto volume de vendas têm capital de giro comprometido. Reduzir este prazo no futuro exigiria negociação com o gateway e avaliação de risco.

---

### [DP-04] Timeout de 48h para aprovação do Vendedor e para envio de comprovante

Data: anterior a 2026-03-14 (data exata não registrada)
Status: Ativa
Módulos afetados: M3, M7
Tomada por: Fundadores / Time de produto

**Contexto:** Sem um prazo definido, um Vendedor poderia deixar uma transação em `PENDING_SELLER_APPROVAL` indefinidamente, bloqueando o dinheiro do Comprador e causando uma experiência negativa.

**Decisão:** Dois prazos de 48 horas:
1. Vendedor tem 48h após `PENDING_SELLER_APPROVAL` para aprovar ou rejeitar
2. Após aprovação, Vendedor tem 48h para enviar o comprovante de transferência

**Justificativa:** 48h é suficiente para que um Vendedor atencioso realize a transferência e colete o comprovante, mesmo com processos manuais nos programas de fidelidade. É curto o suficiente para não manter o dinheiro do Comprador bloqueado por muito tempo.

**Alternativas consideradas:**
- 24h: rejeitado por ser muito curto para transferências em programas com processamento lento
- 72h: rejeitado por manter o dinheiro do Comprador bloqueado por muito tempo
- Prazo configurável por Vendedor: rejeitado por complexidade e risco de abuso

**Impacto:** Firebase Function `checkProofDeadline` monitora o prazo. Cancelamento automático aciona o fluxo de cancelamento ou reembolso conforme o `gatewayStatus`.

**Restrições criadas:** Vendedores que operam com programas de fidelidade com processamento lento podem ter dificuldade em cumprir o prazo.

---

### [DP-05] KYC obrigatório para Vendedores antes de criar listagens

Data: anterior a 2026-03-14 (data exata não registrada)
Status: Ativa
Módulos afetados: M1, M2
Tomada por: Fundadores / Jurídico

**Contexto:** Vendedores precisam ser verificados para evitar fraudes e para conformidade com regulações financeiras. Um Vendedor anônimo poderia criar listagens fictícias e nunca transferir as milhas.

**Decisão:** Todo usuário com role `seller` ou `agency` deve ter a identidade verificada (KYC) antes de criar listagens ou aprovar transações.

**Justificativa:** Reduz fraudes. Cria responsabilidade legal para o Vendedor. Viabiliza o registro de operações financeiras para compliance.

**Alternativas consideradas:**
- KYC opcional: rejeitado por risco de fraude inaceitável
- KYC após primeira venda: rejeitado por criar brecha de fraude na primeira transação

**Impacto:** `UsersController` verifica status KYC antes de permitir criação de listagens. `ListingsController` bloqueia criação para usuários sem KYC aprovado.

**Restrições criadas:** Aumenta o atrito do onboarding do Vendedor. Pode reduzir conversão de novos Vendedores se o processo for burocrático.

---

### [DP-06] Saque requer aprovação manual do Administrador

Data: anterior a 2026-03-14 (data exata não registrada)
Status: Ativa (candidata a revisão — ver E5-05 no backlog)
Módulos afetados: M6, M8
Tomada por: Fundadores

**Contexto:** Em uma fase inicial, com volume desconhecido e risco de fraude ainda não mapeado, aprovar saques manualmente permite detectar padrões suspeitos antes de o dinheiro sair da plataforma.

**Decisão:** Todo saque passa por aprovação manual do Administrador antes de ser processado, independentemente do valor ou do histórico do Vendedor.

**Justificativa:** Controle máximo sobre saídas de caixa na fase inicial. Permite identificar padrões de fraude.

**Alternativas consideradas:**
- Aprovação automática para Vendedores verificados: considerada para fase futura (E5-05)
- Aprovação automática acima de threshold de confiança: considerada para fase futura

**Impacto:** Cria gargalo operacional no time de Admin. Potencialmente atrasa o recebimento pelo Vendedor além do D+30.

**Restrições criadas:** Não escala bem com o crescimento do volume de transações. Candidata a ser substituída por pré-aprovação automática.

---

### [DP-07] Um role por usuário — sem múltiplos papéis simultâneos

Data: anterior a 2026-03-14 (data exata não registrada)
Status: Ativa
Módulos afetados: M1
Tomada por: Time técnico

**Contexto:** Simplificar o modelo de permissões na fase inicial evita complexidade de autorização e casos extremos de conflito de interesse (ex: um usuário comprando suas próprias milhas).

**Decisão:** Cada usuário tem exatamente um role. Um Vendedor não pode operar como Comprador na mesma conta.

**Justificativa:** Simplifica autorização. Previne conflito de interesses. Reduz complexidade de testes e manutenção.

**Alternativas consideradas:**
- Múltiplos roles por usuário: rejeitado por complexidade e risco de conflito
- Role `buyer+seller` combinado: rejeitado por abrir brecha de compra das próprias milhas

**Impacto:** Usuários que desejam comprar E vender milhas precisam de duas contas separadas.

**Restrições criadas:** Experiência fragmentada para usuários que querem operar nos dois lados do marketplace.

---

### [DP-08] Cancelamento de transação pelo Comprador limitado à janela pré-aprovação com prazo de 24h

Data: 2026-03-14
Status: Ativa — aguarda implementação
Módulos afetados: M3, M4, M5, M7
Tomada por: Time de produto

**Contexto:** Após o pagamento ser processado, o Comprador pode se arrepender da compra antes que o Vendedor tenha se comprometido com a transferência de milhas. Sem uma saída formal dentro da plataforma, o Comprador recorre ao chargeback diretamente na operadora do cartão.

**Decisão:** O Comprador pode cancelar uma transação se, e somente se, as duas condições forem atendidas simultaneamente:
1. `sellerApprovalStatus = PENDING` (o Vendedor ainda não aprovou nem rejeitou)
2. O cancelamento ocorre dentro de 24h a partir da confirmação do pagamento

Se o Vendedor aprovar a transação antes das 24h, o Comprador perde a janela de cancelamento imediatamente. Reembolso integral, sem taxa.

**Fluxo por método de pagamento:**
- Cartão pré-autorizado (`gatewayStatus = pre_authorized`): operação `CancelAsync` no gateway
- Cartão capturado (`gatewayStatus = paid`): operação `RefundAsync` no gateway
- PIX (`gatewayStatus = paid`): operação `RefundAsync` no gateway

**Alternativas rejeitadas:**
- Cancelamento sem prazo: rejeitado por não dar previsibilidade ao Vendedor
- Cancelamento com taxa: rejeitado nesta fase; pode ser reavaliado se houver evidência de abuso
- Cancelamento após aprovação do Vendedor: rejeitado — transferências de milhas são irreversíveis

**Nota de implementação:** Feature depende da resolução do GAP-03 para comportamento consistente em transações PIX com pagamento demorado.

---

### [DP-09] Regeneração de QR Code PIX com prazo total de 24h e cancelamento automático por esgotamento

Data: 2026-03-14
Status: Ativa — aguarda implementação
Módulos afetados: M3, M5, M7
Tomada por: Time de produto

**Contexto:** QR Codes PIX têm prazo de validade. Se o Comprador não paga dentro do prazo do QR Code, a transação ficaria em `PENDING` indefinidamente sem desfecho, bloqueando a listagem do Vendedor e criando estados zumbi no sistema.

**Decisão:** Adotar a seguinte política para transações PIX com QR Code expirado:

1. O Comprador pode regenerar o QR Code após a expiração, sem necessidade de criar uma nova transação.
2. Fica estabelecido um prazo total máximo de 24 horas contados desde a criação da transação para que o pagamento PIX seja confirmado, independentemente de quantos QR Codes foram gerados.
3. Dentro desse prazo de 24h, o Comprador pode regenerar o QR Code até 3 (três) vezes.
4. Se o prazo total de 24h expirar sem pagamento confirmado, ou se o Comprador esgotar as 3 tentativas sem pagar, a transação é cancelada automaticamente. Não há movimentação financeira neste cancelamento, pois nenhum pagamento foi capturado.
5. O Comprador pode encerrar voluntariamente a transação a qualquer momento enquanto `gatewayStatus != paid`. Essa ação é denominada **cancelamento pelo Comprador**, não "rejeição" (termo reservado à ação do Vendedor sobre `sellerApprovalStatus`). Como não há pagamento capturado, não há reembolso — a transação é simplesmente encerrada.
6. A aprovação da transação para o Vendedor (avanço para `PENDING_SELLER_APPROVAL`) só ocorre após a confirmação do pagamento pelo webhook PIX, ou seja, quando `gatewayStatus = paid`. O Vendedor nunca visualiza nem age sobre uma transação com pagamento PIX pendente.

**Fluxo técnico de regeneração (a verificar na implementação):**
- A regeneração de QR Code implica a criação de uma nova cobrança PIX via `ShareMilesPixApi`, com atualização do `gatewayChargeId` na entidade `Transaction`.
- O webhook de confirmação de pagamento deve sempre referenciar o `gatewayChargeId` mais recente. Cobranças antigas (QR Codes expirados) não devem acionar transição de status.
- Uma nova Firebase Function de monitoramento (`checkPixPaymentDeadline` ou equivalente) deve monitorar transações PIX em `PENDING` e acionar o cancelamento automático ao atingir o limite de 24h ou 3 tentativas.

**Justificativa das escolhas:**
- Prazo de 24h: amplo o suficiente para que o Comprador resolva imprevistos, sem bloquear a listagem do Vendedor por período excessivo.
- Limite de 3 regenerações: previne uso do QR Code como mecanismo de reserva de listagem sem intenção de pagamento.
- Cancelamento sem reembolso quando `gatewayStatus != paid`: correto do ponto de vista financeiro — não há captura, logo não há valor a devolver.

**Alternativas rejeitadas:**
- Cancelamento automático na primeira expiração (Opção A do GAP-03): rejeitado por penalizar Compradores com imprevistos pontuais e aumentar abandono de transação.
- QR Code com validade de 24h sem regeneração (Opção B do GAP-03): rejeitado por manter transações abertas por longo período sem mecanismo de controle.
- Regenerações ilimitadas sem prazo total: rejeitado por criar estados zumbi e bloquear listagens indefinidamente.

**Restrições criadas:**
- Transações PIX têm um ciclo de vida máximo de 24h na fase `PENDING`. Após isso, são encerradas independentemente da vontade do Comprador.
- O `gatewayChargeId` da `Transaction` pode mudar ao longo do ciclo de vida da transação PIX — implementações que assumem imutabilidade deste campo devem ser revisadas.

**Pendências para implementação:**
- Verificar se o `PagarmeProxyService` suporta criação de nova cobrança PIX vinculada a uma order existente, ou se é necessário criar uma nova order.
- Definir o comportamento da `ShareMilesPixApi` para invalidar cobranças PIX anteriores ao emitir uma nova para a mesma transação.
- Confirmar com o time técnico o nome e a lógica da Firebase Function responsável pelo monitoramento do prazo de 24h.

---

## Histórico de Versões

| Versão | Data | Alteração |
|---|---|---|
| 1.0 | 2026-03-14 | Criação do documento com decisões identificadas retroativamente |
| 1.1 | 2026-03-14 | Adição de DP-08 (cancelamento pelo Comprador) e DP-09 (regeneração de QR Code PIX) |

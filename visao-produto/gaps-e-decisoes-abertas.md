# Gaps e Decisões Abertas — ShareMiles

> Itens bloqueantes e decisões ainda não tomadas que afetam a documentação e o desenvolvimento do produto.
> Versão: 1.0 | Data: 2026-03-14

---

## Formato de Cada Item

```
### [GAP-XX] Título do gap
Data de identificação: YYYY-MM-DD
Status: Aberto | Em análise | Resolvido
Módulos afetados: [M1–M8]
Impacto: [Alto / Médio / Baixo]
Bloqueio: [Sim/Não — indica se bloqueia desenvolvimento de outro item]

**Descrição:** O que está indefinido ou em aberto?
**Contexto:** Por que este gap existe?
**Opções identificadas:** Quais as alternativas disponíveis?
**Impacto de cada opção:** Quais as consequências de cada escolha?
**Próximo passo:** Quem decide? Quando?
```

---

## Gaps Abertos — Alta Prioridade

### [GAP-01] Cancelamento de transação pelo Comprador antes da aprovação do Vendedor

Data de identificação: 2026-03-14
Status: Resolvido — ver DP-08
Módulos afetados: M3, M4
Impacto: Alto
Bloqueio: Sim (bloqueia documentação do fluxo completo de cancelamento)

**Descrição:** Não está definido se o Comprador pode cancelar uma transação após o pagamento ser processado, mas antes do Vendedor aprovar ou rejeitar.

**Contexto:** O Comprador pode se arrepender da compra ou ter encontrado uma oferta melhor. O Vendedor ainda não se comprometeu (não houve captura do pagamento para cartão).

**Opções identificadas:**
- **Opção A:** Comprador pode cancelar livremente enquanto status = `PENDING_SELLER_APPROVAL`
- **Opção B:** Comprador não pode cancelar após o pagamento ser processado (apenas o Vendedor decide)
- **Opção C:** Comprador pode cancelar, mas paga uma taxa de cancelamento

**Impacto de cada opção:**
- Opção A: Melhora experiência do Comprador, mas pode gerar abuso (Compradores bloqueando Vendedores com transações fake e cancelando)
- Opção B: Protege o Vendedor de má-fé do Comprador, mas pode frustrar Compradores legítimos
- Opção C: Equilibra os interesses, mas aumenta complexidade do fluxo financeiro

**Próximo passo:** Decisão do time de produto com input do time operacional (volume atual de solicitações de cancelamento).

---

### [GAP-02] Processo formal de disputa entre Comprador e Vendedor

Data de identificação: 2026-03-14
Status: Aberto
Módulos afetados: M3, M8
Impacto: Alto
Bloqueio: Sim (bloqueia documentação de fluxo de exceção de transação)

**Descrição:** Não existe um processo documentado para quando o Comprador alega não ter recebido as milhas após o Vendedor ter enviado o comprovante e a transação ter sido marcada como `COMPLETED`.

**Contexto:** O sistema atual parece não ter um status `DISPUTED`. Após `COMPLETED`, não há fluxo de revisão.

**Opções identificadas:**
- **Opção A:** Criar status `DISPUTED` na `Transaction` com fluxo de mediação pelo Admin
- **Opção B:** Tratar disputas fora do sistema (suporte por e-mail, sem status específico)
- **Opção C:** Criar uma entidade separada `Dispute` vinculada à `Transaction`

**Impacto de cada opção:**
- Opção A: Impacta o fluxo de status (sagrado), requer mudanças em `TransactionsController` e Firebase Functions
- Opção B: Não requer mudança técnica, mas não escala e não tem rastreabilidade
- Opção C: Mais complexo, mas separa bem os domínios

**Próximo passo:** Levantamento do volume atual de disputas recebidas pelo suporte.

---

### [GAP-03] Prazo de expiração do QR Code PIX

Data de identificação: 2026-03-14
Status: Resolvido — ver DP-09
Módulos afetados: M5, M3
Impacto: Alto
Bloqueio: Sim (bloqueia documentação completa do fluxo PIX)

**Descrição:** Não está documentado qual é o prazo de expiração do QR Code PIX gerado pela `ShareMilesPixApi`. Também não está definido o comportamento quando o QR Code expira sem pagamento.

**Contexto:** QR Codes PIX têm prazo de validade configurável. Se o Comprador não pagar dentro do prazo, a transação fica em `PENDING` indefinidamente.

**Opções identificadas:**
- **Opção A:** QR Code expira em 30 minutos; transação cancelada automaticamente
- **Opção B:** QR Code expira em 24h; Comprador pode gerar novo QR Code
- **Opção C:** QR Code expira em 30 minutos; Comprador pode gerar novo QR Code para a mesma transação

**Impacto de cada opção:**
- Opção A: Mais simples, mas Compradores que demoram podem ter experiência ruim
- Opção B: Melhor experiência, mas transações ficam abertas por longo período
- Opção C: Flexível para o Comprador, mas aumenta complexidade do fluxo de regeação de QR Code

**Próximo passo:** Verificar implementação atual na `ShareMilesPixApi` e definir comportamento esperado.

---

### [GAP-04] Detalhamento das permissões diferenciadas para role `agency`

Data de identificação: 2026-03-14
Status: Aberto
Módulos afetados: M1, M2, M3
Impacto: Alto
Bloqueio: Sim (bloqueia documentação da persona Agência)

**Descrição:** Não está documentado o que diferencia o role `agency` do role `seller` em termos de permissões, limites e funcionalidades acessíveis.

**Contexto:** O role `agency` existe no sistema, mas não há especificação de produto que defina o que este role pode fazer além (ou diferente) de um `seller` regular.

**Opções identificadas:**
- **Opção A:** `agency` tem exatamente as mesmas permissões que `seller`, diferindo apenas no label e possíveis limites maiores
- **Opção B:** `agency` tem funcionalidades adicionais (painel diferenciado, aprovação em lote, relatórios avançados)
- **Opção C:** `agency` é tratado como um tier premium do `seller`, com onboarding diferenciado

**Próximo passo:** Entrevistar Agências atuais (se houver) para entender necessidades específicas.

---

### [GAP-05] Fluxo de upgrade de role de Comprador para Vendedor

Data de identificação: 2026-03-14
Status: Aberto
Módulos afetados: M1
Impacto: Médio
Bloqueio: Não

**Descrição:** Não está documentado o fluxo para um usuário com role `buyer` solicitar e receber o upgrade para role `seller`. Dado que o sistema tem um role por usuário (DP-07), isso afeta diretamente a experiência de onboarding de novos Vendedores.

**Contexto:** Um Comprador que decide começar a vender milhas precisaria de um fluxo para alterar seu role ou criar uma nova conta.

**Opções identificadas:**
- **Opção A:** Upgrade de role via painel do usuário (solicita → Admin aprova → role alterado)
- **Opção B:** Criação de nova conta como Vendedor (atual DP-07 implica isso)
- **Opção C:** Revisão da DP-07 para permitir múltiplos roles (Comprador + Vendedor)

**Próximo passo:** Avaliar com o time de produto se DP-07 deve ser revisada.

---

## Gaps Abertos — Média Prioridade

### [GAP-06] Regras de moderação de listagens

Data de identificação: 2026-03-14
Status: Aberto
Módulos afetados: M2, M8
Impacto: Médio
Bloqueio: Não

**Descrição:** Não estão definidas as regras de moderação de listagens: preço mínimo/máximo por milha, quantidade mínima/máxima, critérios de rejeição pelo Admin.

**Próximo passo:** Definir com o time de negócio os limites aceitáveis de preço e quantidade.

---

### [GAP-07] Processo de verificação de conta bancária (BankAccount)

Data de identificação: 2026-03-14
Status: Aberto
Módulos afetados: M6
Impacto: Médio
Bloqueio: Não

**Descrição:** A entidade `BankAccount` tem um campo `verified`, mas não está documentado qual é o processo de verificação: é manual pelo Admin, automático via integração bancária, ou via depósito de centavos para confirmação?

**Próximo passo:** Verificar implementação atual no `WithdrawalsController` e definir o fluxo esperado.

---

### [GAP-08] Notificação proativa de prazo de comprovante expirando

Data de identificação: 2026-03-14
Status: Aberto
Módulos afetados: M7, M3
Impacto: Médio
Bloqueio: Não

**Descrição:** Não está documentado se a plataforma envia uma notificação ao Vendedor quando o prazo de 48h para envio do comprovante está próximo de expirar (ex: aviso com 12h de antecedência). A Firebase Function `checkProofDeadline` cancela a transação ao espirar, mas não há registro de alerta preventivo.

**Impacto se não resolvido:** Vendedores que esquecem podem ter transações canceladas automaticamente, causando insatisfação e abandono da plataforma.

**Próximo passo:** Definir política de aviso preventivo (horário, canal) e implementar Firebase Function de alerta.

---

### [GAP-09] Valor mínimo e máximo de saque

Data de identificação: 2026-03-14
Status: Aberto
Módulos afetados: M6
Impacto: Médio
Bloqueio: Não

**Descrição:** Não estão definidos os limites de valor mínimo e máximo para solicitação de saque.

**Contexto:** Um valor mínimo evita processamento de saques não-econômicos (custo de TED maior que o valor). Um valor máximo pode ser relevante para compliance.

**Próximo passo:** Definir com o time financeiro os limites adequados.

---

### [GAP-10] Política de reembolso em disputas pós-COMPLETED

Data de identificação: 2026-03-14
Status: Aberto
Módulos afetados: M3, M4, M8
Impacto: Alto
Bloqueio: Sim (relacionado ao GAP-02)

**Descrição:** Quando uma disputa é resolvida a favor do Comprador após a transação já ter sido marcada como `COMPLETED` (e o pagamento capturado), qual é o fluxo de reembolso? O `gatewayStatus` já é `paid` e pode ter passado dos 30 dias do prazo de reembolso do Pagar.me.

**Opções identificadas:**
- **Opção A:** Reembolso via Pagar.me se dentro do prazo (prazo do gateway)
- **Opção B:** Reembolso manual via transferência bancária avulsa
- **Opção C:** Crédito na conta da plataforma (não devolução ao cartão original)

**Próximo passo:** Verificar prazo de reembolso do Pagar.me e definir política com time financeiro.

---

## Gaps Abertos — Baixa Prioridade

### [GAP-11] Emissão de recibos e notas fiscais

Data de identificação: 2026-03-14
Status: Aberto
Módulos afetados: M3
Impacto: Médio
Bloqueio: Não

**Descrição:** Não está definido se a plataforma emite recibo ou nota fiscal para Compradores e/ou Vendedores após a conclusão de uma transação.

**Próximo passo:** Consultar jurídico sobre obrigatoriedade e definir escopo.

---

### [GAP-12] Regras de retenção de IR na fonte sobre saques

Data de identificação: 2026-03-14
Status: Aberto
Módulos afetados: M6
Impacto: Médio
Bloqueio: Não

**Descrição:** Não está documentado se há obrigação de retenção de Imposto de Renda na fonte sobre saques acima de determinado valor.

**Próximo passo:** Consultar jurídico/contabilidade.

---

### [GAP-13] Política de opt-out de notificações

Data de identificação: 2026-03-14
Status: Aberto
Módulos afetados: M7, M1
Impacto: Baixo
Bloqueio: Não

**Descrição:** Não está definido se usuários podem desativar tipos específicos de notificação. LGPD pode exigir controle do usuário sobre comunicações não-essenciais.

**Próximo passo:** Avaliar com jurídico quais notificações são obrigatórias (transacionais) e quais são opcionais (marketing).

---

### [GAP-14] Comportamento de listagem quando Vendedor é suspenso

Data de identificação: 2026-03-14
Status: Aberto
Módulos afetados: M1, M2, M3
Impacto: Médio
Bloqueio: Não

**Descrição:** Quando um Vendedor é suspenso pelo Admin, não está documentado o que acontece com suas listagens ativas e transações em andamento.

**Opções identificadas:**
- Listagens pausadas automaticamente
- Transações em andamento canceladas automaticamente com reembolso
- Transações em andamento continuam, mas novas não podem ser criadas

**Próximo passo:** Definir com o time de produto e jurídico.

---

### [GAP-15] Tratamento de chargeback iniciado pelo Comprador no cartão

Data de identificação: 2026-03-14
Status: Aberto
Módulos afetados: M4, M3, M6
Impacto: Alto
Bloqueio: Não (mas crítico para saúde financeira)

**Descrição:** Não está documentado o fluxo quando um Comprador contesta a cobrança diretamente com a operadora do cartão (chargeback), especialmente para transações já `COMPLETED` onde o saldo do Vendedor já foi liberado (D+30).

**Próximo passo:** Verificar política de chargeback do Pagar.me e definir processo interno.

---

## Gaps Resolvidos

### [GAP-01] Cancelamento de transação pelo Comprador antes da aprovação do Vendedor

Data de identificação: 2026-03-14
Data de resolução: 2026-03-14
Status: Resolvido — ver DP-08
Módulos afetados: M3, M4, M5, M7
Decisão correspondente: DP-08

**Resumo da resolução:** O Comprador pode cancelar uma transação somente enquanto `sellerApprovalStatus = PENDING` e dentro de 24h após a confirmação do pagamento. A janela de cancelamento é encerrada imediatamente se o Vendedor aprovar antes do prazo. Reembolso integral sem taxa. O fluxo de reembolso varia conforme o `gatewayStatus` no momento do cancelamento: pré-autorização não capturada usa `CancelAsync`; pagamento capturado (cartão ou PIX) usa `RefundAsync`.

**Situação de implementação:** Decisão tomada em nível de produto. Aguarda implementação técnica.

---

### [GAP-03] Prazo de expiração do QR Code PIX

Data de identificação: 2026-03-14
Data de resolução: 2026-03-14
Status: Resolvido — ver DP-09
Módulos afetados: M3, M5, M7
Decisão correspondente: DP-09

**Resumo da resolução:** O Comprador pode regenerar o QR Code PIX após expiração, com prazo total de 24h desde a criação da transação e limite de 3 regenerações. Esgotado o prazo ou as tentativas, a transação é cancelada automaticamente sem movimentação financeira (nenhum pagamento foi capturado). O cancelamento voluntário pelo Comprador antes do pagamento também encerra a transação sem reembolso. A transação só avança para `PENDING_SELLER_APPROVAL` após confirmação do pagamento via webhook (`gatewayStatus = paid`).

**Situação de implementação:** Decisão tomada em nível de produto. Aguarda implementação técnica. Há pendências técnicas a verificar antes do início do desenvolvimento — ver seção "Pendências para implementação" na DP-09.

---

## Histórico de Versões

| Versão | Data | Alteração |
|---|---|---|
| 1.0 | 2026-03-14 | Criação do documento com gaps identificados na análise inicial |
| 1.1 | 2026-03-14 | GAP-01 e GAP-03 marcados como resolvidos (DP-08 e DP-09); adição de entradas na seção Gaps Resolvidos |

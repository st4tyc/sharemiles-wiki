# Análise de Gaps de Documentação — ShareMiles

> Levantamento completo dos gaps identificados na documentação de produto da plataforma ShareMiles.
> Versão: 1.0 | Data: 2026-03-14

---

## Contexto da Análise

Esta análise foi realizada em 2026-03-14 com base em:
- Leitura do agente de produto (`pm-expert-sharemiles.md`)
- Estado inicial do repositório (apenas `glossario.md` existia)
- Conhecimento do domínio da plataforma ShareMiles

O objetivo é catalogar todos os gaps de documentação encontrados, classificados por criticidade, para guiar as próximas iniciativas de documentação e desenvolvimento.

---

## Resumo Executivo

| Categoria | Total identificado | Alta prioridade | Média prioridade | Baixa prioridade |
|---|---|---|---|---|
| Gaps de produto (funcionalidades indefinidas) | 15 | 5 | 6 | 4 |
| Gaps de documentação (docs faltantes) | 7 | 4 | 3 | 0 |
| Gaps de processo operacional | 5 | 3 | 2 | 0 |
| **Total** | **27** | **12** | **11** | **4** |

---

## Categoria 1 — Gaps de Produto (Funcionalidades Indefinidas)

Estes gaps representam funcionalidades ou comportamentos do produto que ainda não foram especificados. Impactam diretamente o desenvolvimento e a operação.

### GAP-P01: Cancelamento de transação pelo Comprador [ALTA]

**Módulos:** M3, M4
**Descrição:** Não há especificação de se o Comprador pode cancelar uma transação após o pagamento, enquanto ainda está em `PENDING_SELLER_APPROVAL`. Este é um gap de alta criticidade porque afeta diretamente o fluxo de reembolso e a experiência do Comprador.

**Impacto se não resolvido:**
- Compradores que se arrependem ficam presos na transação
- Possível aumento de chargebacks (Comprador contesta diretamente com a operadora)
- Falta de clareza na documentação do fluxo de cancelamento

**Opções:** Ver [GAP-01] em `gaps-e-decisoes-abertas.md`

---

### GAP-P02: Processo formal de disputa pós-transação [ALTA]

**Módulos:** M3, M8
**Descrição:** Não existe um fluxo documentado para disputas entre Comprador e Vendedor. O que acontece quando o Comprador alega não ter recebido as milhas após a transação ser marcada como `COMPLETED`?

**Impacto se não resolvido:**
- Disputas resolvidas ad hoc sem rastreabilidade
- Risco legal para a plataforma (intermediadora sem processo de resolução)
- Possíveis chargebacks não gerenciados

**Opções:** Ver [GAP-02] em `gaps-e-decisoes-abertas.md`

---

### GAP-P03: Prazo e comportamento de expiração do QR Code PIX [ALTA]

**Módulos:** M5, M3
**Descrição:** O prazo de validade do QR Code PIX gerado pela `ShareMilesPixApi` não está documentado. O comportamento quando expira sem pagamento também está indefinido.

**Impacto se não resolvido:**
- Transações em `PENDING` indefinidamente
- Compradores que tentam pagar após expiração recebem erro sem explicação
- Acúmulo de transações zumbis no banco de dados

---

### GAP-P04: Permissões diferenciadas para role `agency` [ALTA]

**Módulos:** M1, M2, M3
**Descrição:** O role `agency` existe no código mas não há especificação do que o diferencia do role `seller`.

**Impacto se não resolvido:**
- Agências usando a mesma interface de Vendedor individual sem funcionalidades adequadas ao volume
- Impossibilidade de documentar a persona Agência com precisão

---

### GAP-P05: Notificação preventiva de prazo de comprovante expirando [ALTA]

**Módulos:** M7, M3
**Descrição:** A plataforma cancela automaticamente a transação se o Vendedor não enviar o comprovante em 48h, mas não há evidência de que um aviso preventivo seja enviado (ex: com 12h de antecedência).

**Impacto se não resolvido:**
- Vendedores perdem o prazo sem perceber
- Cancelamentos automáticos desnecessários
- Insatisfação do Vendedor, potencial abandono da plataforma

---

### GAP-P06: Fluxo de upgrade de role (buyer → seller) [MÉDIA]

**Módulos:** M1
**Descrição:** Um usuário Comprador que deseja começar a vender milhas precisa de um fluxo para alterar seu role. A DP-07 (um role por usuário) implica que seria necessário criar uma nova conta, mas isso não está comunicado ao usuário.

---

### GAP-P07: Regras de moderação de listagens [MÉDIA]

**Módulos:** M2, M8
**Descrição:** Não estão definidos os critérios de moderação: preço mínimo/máximo por milha, quantidade mínima/máxima, prazos de análise pelo Admin.

---

### GAP-P08: Processo de verificação de conta bancária [MÉDIA]

**Módulos:** M6
**Descrição:** A entidade `BankAccount` tem campo `verified`, mas o processo de verificação não está especificado.

---

### GAP-P09: Limites de valor de saque (mínimo e máximo) [MÉDIA]

**Módulos:** M6
**Descrição:** Não há definição de valor mínimo de saque (economicamente viável) nem máximo (compliance).

---

### GAP-P10: Reembolso em disputas pós-COMPLETED [ALTA]

**Módulos:** M3, M4, M8
**Descrição:** Quando uma disputa é resolvida a favor do Comprador após `COMPLETED` (e o pagamento já capturado), qual é o fluxo? O prazo de reembolso do gateway pode ter expirado.

---

### GAP-P11: Tratamento de chargeback [ALTA]

**Módulos:** M4, M3, M6
**Descrição:** Não há fluxo documentado para chargebacks iniciados pelo Comprador na operadora do cartão, especialmente para transações em que o Vendedor já recebeu o saldo (após D+30).

---

### GAP-P12: Comportamento de listagem quando Vendedor é suspenso [MÉDIA]

**Módulos:** M1, M2, M3
**Descrição:** O que acontece com as listagens ativas e transações em andamento quando o Admin suspende um Vendedor?

---

### GAP-P13: Emissão de recibos e notas fiscais [MÉDIA]

**Módulos:** M3
**Descrição:** Não está definido se a plataforma emite recibo/NF para Compradores e Vendedores.

---

### GAP-P14: Retenção de IR na fonte sobre saques [BAIXA]

**Módulos:** M6
**Descrição:** Obrigatoriedade de retenção de Imposto de Renda na fonte para saques acima de determinado valor não está avaliada.

---

### GAP-P15: Política de opt-out de notificações [BAIXA]

**Módulos:** M7, M1
**Descrição:** Usuários não têm controle sobre quais notificações recebem. LGPD pode exigir controle para comunicações não-essenciais.

---

## Categoria 2 — Gaps de Documentação (Docs Faltantes)

Estes gaps representam documentos que deveriam existir mas ainda não foram criados.

### GAP-D01: `contexto-plataforma.md` [ALTA]
**Status:** CRIADO nesta sessão (2026-03-14)
**Descrição:** Visão geral estratégica da plataforma, premissas e arquitetura funcional.

### GAP-D02: `mapa-modulos.md` [ALTA]
**Status:** CRIADO nesta sessão (2026-03-14)
**Descrição:** Mapeamento de todos os módulos com entidades, controllers e serviços.

### GAP-D03: `personas-detalhadas.md` [ALTA]
**Status:** CRIADO nesta sessão (2026-03-14)
**Descrição:** Detalhamento profundo de cada persona.

### GAP-D04: `backlog-macro.md` [ALTA]
**Status:** CRIADO nesta sessão (2026-03-14)
**Descrição:** Épicos e iniciativas priorizadas.

### GAP-D05: `decisoes-produto.md` [ALTA]
**Status:** CRIADO nesta sessão (2026-03-14)
**Descrição:** Log de decisões tomadas com justificativas.

### GAP-D06: `gaps-e-decisoes-abertas.md` [ALTA]
**Status:** CRIADO nesta sessão (2026-03-14)
**Descrição:** Lista de itens bloqueantes e decisões em aberto.

### GAP-D07: PRDs dos módulos principais [ALTA]
**Status:** A criar
**Descrição:** Não há nenhum PRD documentado para os módulos M3 (Transações), M4 (Pagamento), M5 (PIX) e M6 (Carteira e Saques) — os mais críticos da plataforma.

**Documentos a criar (por ordem de prioridade):**
1. `prd-transacoes-fluxo-principal.md` — Fluxo completo de criação à conclusão
2. `prd-transacoes-cancelamento-reembolso.md` — Fluxo de cancelamento e reembolso
3. `prd-pagamento-cartao-credito.md` — Pre-autorização e captura
4. `prd-pix-pagamento-webhook.md` — Fluxo PIX com webhook
5. `prd-carteira-saques.md` — Saldo, D+30 e saques
6. `prd-usuarios-kyc.md` — Verificação de identidade

---

## Categoria 3 — Gaps de Processo Operacional

Estes gaps afetam como a equipe operacional gerencia a plataforma.

### GAP-O01: Processo de revisão de KYC [ALTA]

**Módulos:** M1, M8
**Descrição:** O processo de revisão de documentos KYC pelo Admin não está documentado: critérios de aprovação/rejeição, prazo esperado de análise, notificação ao Vendedor sobre o resultado.

**Impacto:** Inconsistência na aprovação de KYC, Vendedores sem expectativa de prazo.

---

### GAP-O02: SLA de aprovação de saques [ALTA]

**Módulos:** M6, M8
**Descrição:** Não há SLA definido para aprovação de saques pelo Admin. O Vendedor não tem expectativa de quando receberá após solicitar o saque.

**Impacto:** Insatisfação do Vendedor, aumento de tickets de suporte.

---

### GAP-O03: Protocolo de resposta a disputas [ALTA]

**Módulos:** M3, M8
**Descrição:** Não há protocolo documentado para o Admin resolver disputas entre Comprador e Vendedor: critérios de decisão, documentação requerida, prazos.

---

### GAP-O04: Monitoramento de saúde da plataforma [MÉDIA]

**Módulos:** M8
**Descrição:** Não há definição de quais métricas o Admin monitora diariamente e quais são os alertas configurados para situações anormais (ex: muitas transações em timeout, volume incomum de cancelamentos).

---

### GAP-O05: Processo de suspensão de usuários [MÉDIA]

**Módulos:** M1, M8
**Descrição:** Não está documentado o processo para suspender ou banir usuários: critérios, aprovações necessárias, impacto nas transações em andamento.

---

## Resumo de Ações Recomendadas

### Imediato (esta semana)

1. Resolver GAP-P01 (cancelamento pelo Comprador) — decisão de produto, sem desenvolvimento
2. Resolver GAP-P03 (expiração do QR Code PIX) — verificar implementação existente
3. Resolver GAP-P05 (alerta preventivo de prazo) — pequena Firebase Function

### Curto prazo (próximas 2 semanas)

4. Criar PRD do fluxo de disputa (GAP-P02, GAP-P10)
5. Documentar permissões do role `agency` (GAP-P04)
6. Definir SLA de aprovação de saques (GAP-O02)
7. Criar `prd-transacoes-fluxo-principal.md`

### Médio prazo (próximo mês)

8. Criar PRDs dos módulos M3, M4, M5, M6 (GAP-D07)
9. Definir processo de moderação de listagens (GAP-P07)
10. Documentar processo de KYC (GAP-O01)
11. Criar PRD para sistema de disputas (GAP-P02)

---

## Estado da Documentação Após Esta Sessão

| Arquivo | Status antes | Status após |
|---|---|---|
| `glossario.md` | Existia | Mantido |
| `contexto-plataforma.md` | Não existia | Criado |
| `mapa-modulos.md` | Não existia | Criado |
| `personas-detalhadas.md` | Não existia | Criado |
| `backlog-macro.md` | Não existia | Criado |
| `decisoes-produto.md` | Não existia | Criado |
| `gaps-e-decisoes-abertas.md` | Não existia | Criado |
| `jornada-comprador.md` | Não existia | Criado |
| `jornada-vendedor.md` | Não existia | Criado |
| `analise-gaps-documentacao.md` | Não existia | Criado (este arquivo) |
| PRDs dos módulos | Nenhum existia | Pendente |

---

## Histórico de Versões

| Versão | Data | Alteração |
|---|---|---|
| 1.0 | 2026-03-14 | Criação do documento de análise inicial |

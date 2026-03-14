# Backlog Macro — ShareMiles

> Épicos e iniciativas priorizadas para a plataforma ShareMiles.
> Versão: 1.0 | Data: 2026-03-14

---

## Framework de Priorização

Cada iniciativa é avaliada em três dimensões:

| Dimensão | Descrição |
|---|---|
| **Impacto** | Efeito nas métricas-chave (taxa de conclusão, volume, confiança) |
| **Esforço** | Complexidade técnica e operacional estimada |
| **Urgência** | Risco de não entregar no curto prazo (fraude, compliance, abandono) |

Prioridades: **P0** (crítico, bloqueia operação) | **P1** (alta, afeta crescimento) | **P2** (média, melhoria significativa) | **P3** (baixa, desejável no futuro)

---

## Épico 1 — Núcleo do Marketplace (Fundação)

**Objetivo:** Garantir que o fluxo central de transação funcione com confiabilidade e segurança.

| ID | Iniciativa | Prioridade | Módulo | Status |
|---|---|---|---|---|
| E1-01 | Fluxo completo de transação (PENDING → COMPLETED) | P0 | M3 | Implementado |
| E1-02 | Pre-autorização de cartão de crédito via Pagar.me | P0 | M4 | Implementado |
| E1-03 | Pagamento via PIX com confirmação por webhook | P0 | M5 | Implementado |
| E1-04 | Timeout automático de 48h para comprovante | P0 | M3 | Implementado |
| E1-05 | Cancelamento automático com reembolso/cancelamento de pre-auth | P0 | M3, M4 | Implementado |
| E1-06 | Liberação automática de saldo D+30 | P0 | M6 | Implementado |
| E1-07 | Upload e validação de comprovante de transferência | P0 | M3 | Implementado |
| E1-08 | Correção automática de status inconsistente (onTransactionStatusFix) | P0 | M3 | Implementado |

---

## Épico 2 — Confiança e Segurança

**Objetivo:** Aumentar a confiança de Compradores e Vendedores, reduzindo o risco de fraude.

| ID | Iniciativa | Prioridade | Módulo | Status |
|---|---|---|---|---|
| E2-01 | KYC obrigatório para Vendedores (verificação de identidade) | P0 | M1 | Parcialmente implementado |
| E2-02 | Sistema de avaliações Comprador ↔ Vendedor | P1 | M3 | Não iniciado |
| E2-03 | Detecção de comprovantes fraudulentos (análise de imagem) | P1 | M3 | Não iniciado |
| E2-04 | Limite de transações simultâneas por usuário não verificado | P1 | M3, M1 | Não documentado |
| E2-05 | Processo formal de disputa Comprador vs Vendedor | P1 | M3, M8 | Gap aberto |
| E2-06 | Auditoria de ações administrativas | P2 | M8 | Não iniciado |
| E2-07 | Score de reputação de Vendedores | P2 | M1, M2 | Não iniciado |
| E2-08 | Blacklist de usuários fraudulentos | P2 | M1, M8 | Não documentado |

---

## Épico 3 — Experiência do Comprador

**Objetivo:** Reduzir a ansiedade do Comprador e aumentar a taxa de conclusão.

| ID | Iniciativa | Prioridade | Módulo | Status |
|---|---|---|---|---|
| E3-01 | Notificações em tempo real por e-mail (eventos críticos) | P0 | M7 | Parcialmente implementado |
| E3-02 | Histórico detalhado de transações para o Comprador | P1 | M3 | Implementado (básico) |
| E3-03 | Tracking em tempo real do status da transação | P1 | M3 | Parcialmente implementado |
| E3-04 | Cancelamento de transação pelo Comprador (antes da aprovação) | P1 | M3 | Gap aberto |
| E3-05 | Estimativa de prazo de entrega das milhas | P2 | M2, M3 | Não iniciado |
| E3-06 | Notificações push (mobile) | P2 | M7 | Não iniciado |
| E3-07 | Chat de suporte integrado | P2 | — | Não iniciado |
| E3-08 | Avaliação pós-transação pelo Comprador | P2 | M3 | Não iniciado |

---

## Épico 4 — Experiência do Vendedor

**Objetivo:** Reduzir a fricção operacional do Vendedor e aumentar a satisfação com o processo de saque.

| ID | Iniciativa | Prioridade | Módulo | Status |
|---|---|---|---|---|
| E4-01 | Painel do Vendedor com visão consolidada de transações | P1 | M3 | Implementado (básico) |
| E4-02 | Notificação proativa de prazo de comprovante expirando | P1 | M7 | Gap aberto |
| E4-03 | Gestão de múltiplas listagens simultâneas | P1 | M2 | Implementado |
| E4-04 | Histórico de saques e saldo disponível | P1 | M6 | Implementado (básico) |
| E4-05 | Previsão de liberação de saldo (data D+30 visível) | P1 | M6 | Não implementado |
| E4-06 | Extrato financeiro do Vendedor | P2 | M6 | Não iniciado |
| E4-07 | Pausa e reativação de listagens em lote | P2 | M2 | Não iniciado |
| E4-08 | Cancelamento da própria listagem sem perder saldo | P2 | M2 | Gap aberto |

---

## Épico 5 — Operação Administrativa

**Objetivo:** Reduzir esforço manual do Admin e escalar as operações sem crescimento linear de equipe.

| ID | Iniciativa | Prioridade | Módulo | Status |
|---|---|---|---|---|
| E5-01 | Painel administrativo com visão consolidada | P0 | M8 | Implementado (básico) |
| E5-02 | Aprovação/rejeição de saques pelo Admin | P0 | M6, M8 | Implementado |
| E5-03 | Revisão de KYC no painel admin | P1 | M1, M8 | Parcialmente implementado |
| E5-04 | Alertas automáticos de transações problemáticas | P1 | M8, M7 | Não implementado |
| E5-05 | Pré-aprovação automática de saques por critérios (Vendedor verificado, histórico limpo) | P1 | M6, M8 | Não iniciado |
| E5-06 | Relatórios financeiros exportáveis (CSV, PDF) | P1 | M8 | Não iniciado |
| E5-07 | Dashboard de métricas em tempo real | P1 | M8 | Não iniciado |
| E5-08 | Log de auditoria de ações admin | P2 | M8 | Não iniciado |
| E5-09 | Moderação de listagens com workflow de aprovação | P2 | M2, M8 | Não documentado |

---

## Épico 6 — Agências e Operações em Volume

**Objetivo:** Habilitar Agências a operar eficientemente em escala.

| ID | Iniciativa | Prioridade | Módulo | Status |
|---|---|---|---|---|
| E6-01 | Painel diferenciado para Agências (visão consolidada) | P2 | M8, M3 | Não iniciado |
| E6-02 | Aprovação em lote de transações | P2 | M3 | Não iniciado |
| E6-03 | Relatório financeiro consolidado por Agência | P2 | M6, M8 | Não iniciado |
| E6-04 | Limites e permissões específicas para role `agency` | P2 | M1 | Gap aberto |
| E6-05 | API para integração de sistemas externos (Agências) | P3 | M3, M2 | Não iniciado |

---

## Épico 7 — Compliance e Regulação

**Objetivo:** Garantir conformidade com regulações financeiras e fiscais brasileiras.

| ID | Iniciativa | Prioridade | Módulo | Status |
|---|---|---|---|---|
| E7-01 | LGPD — política de privacidade e gestão de dados pessoais | P0 | M1 | Parcialmente implementado |
| E7-02 | Emissão de notas fiscais / recibos para Compradores | P1 | M3 | Gap aberto |
| E7-03 | Declaração de impostos sobre rendimentos do Vendedor | P2 | M6 | Não documentado |
| E7-04 | Compliance com regulação do Banco Central (pagamentos) | P1 | M4, M5 | Parcialmente implementado |
| E7-05 | Retenção de IR na fonte sobre saques acima de threshold | P2 | M6 | Gap aberto |

---

## Épico 8 — Plataforma Técnica e Infraestrutura

**Objetivo:** Garantir resiliência, escalabilidade e manutenibilidade da plataforma.

| ID | Iniciativa | Prioridade | Módulo | Status |
|---|---|---|---|---|
| E8-01 | Retry automático em falhas de comunicação com Pagar.me | P1 | M4 | Gap aberto |
| E8-02 | Monitoramento de webhooks com reprocessamento | P1 | M4, M5 | Gap aberto |
| E8-03 | Rate limiting e proteção contra abuso de API | P1 | Todos | Não documentado |
| E8-04 | Testes automatizados de fluxo de transação (e2e) | P1 | M3, M4 | Não documentado |
| E8-05 | Separação de ambientes (produção / staging / desenvolvimento) | P1 | Todos | Não documentado |

---

## Roadmap Sugerido (Horizonte 12 meses)

### Horizonte 1 — Próximos 3 meses (Estabilização)
Foco: resolver gaps críticos de produto que afetam operação atual

- E2-05 — Processo formal de disputa (P1)
- E3-04 — Cancelamento pelo Comprador antes da aprovação (P1)
- E4-02 — Notificação de prazo de comprovante expirando (P1)
- E4-05 — Previsão de liberação de saldo D+30 visível para Vendedor (P1)
- E5-04 — Alertas automáticos de transações problemáticas (P1)

### Horizonte 2 — Meses 4–6 (Escala)
Foco: features que aumentam volume e reduzem esforço operacional

- E2-02 — Sistema de avaliações Comprador ↔ Vendedor (P1)
- E5-05 — Pré-aprovação automática de saques (P1)
- E5-06 — Relatórios financeiros exportáveis (P1)
- E4-06 — Extrato financeiro do Vendedor (P2)
- E5-07 — Dashboard de métricas em tempo real (P1)

### Horizonte 3 — Meses 7–12 (Diferenciação)
Foco: funcionalidades que criam vantagem competitiva

- E6-01 — Painel diferenciado para Agências (P2)
- E6-02 — Aprovação em lote de transações (P2)
- E2-03 — Detecção de comprovantes fraudulentos (P1)
- E7-02 — Emissão de recibos para Compradores (P1)
- E6-05 — API para integração de sistemas externos (P3)

---

## Iniciativas em Discussão (Não Priorizadas Formalmente)

| Iniciativa | Contexto | Próximo passo |
|---|---|---|
| Pagamento por boleto | Solicitado por usuários sem cartão/PIX disponível | Avaliação de viabilidade com Pagar.me |
| Programa de fidelidade interno ShareMiles | Gamificação para Compradores frequentes | Requer definição de modelo de negócio |
| App mobile nativo (iOS/Android) | Frontend atual é web responsiva | Depende de volume de usuários justificar investimento |
| Transferência automática de milhas (API dos programas) | Eliminaria o processo manual de comprovante | Depende de parcerias com programas de fidelidade |

---

## Histórico de Versões

| Versão | Data | Alteração |
|---|---|---|
| 1.0 | 2026-03-14 | Criação do documento inicial com base no estado atual da plataforma |

# Glossário — ShareMiles

> Termos do domínio da plataforma ShareMiles, marketplace de milhas aéreas.
> Versão: 1.0 | Data: 2026-03-14

---

## A

**Agência**
Persona da plataforma que opera como intermediadora profissional de milhas. Diferencia-se do Vendedor individual por atuar com maior volume de transações, podendo gerenciar múltiplas listagens e transações simultaneamente. Possui role `agency` no sistema.

**availableForWithdrawal**
Flag booleana na entidade `Withdrawal` que indica se o saldo proveniente de uma transação concluída já está liberado para saque pelo Vendedor. Torna-se `true` após o período de carência de D+30 a partir da conclusão da transação, disparado pela Firebase Function `releaseWithdrawalBalance`.

---

## B

**BankAccount**
Entidade que representa a conta bancária cadastrada pelo Vendedor para recebimento de saques. Contém dados como banco, agência, número da conta, tipo (corrente/poupança) e CPF/CNPJ do titular. Deve ser verificada antes de ser usada em saques.

**Buyer**
Ver *Comprador*.

---

## C

**Cancelamento**
Operação realizada no gateway Pagar.me para encerrar uma cobrança que ainda não foi capturada (status `pre_authorized`). Tecnicamente corresponde à chamada `CancelAsync` via `DELETE /charges/{id}` no proxy `Sharemiles.Pagarme.Api`. Distinto de *Reembolso*.

**Captura**
Operação do gateway Pagar.me que efetiva a cobrança de um cartão de crédito previamente pré-autorizado. Ocorre quando o Vendedor aprova a transação. Tecnicamente corresponde à chamada `POST /charges/{id}/capture` no proxy. Após a captura, o `gatewayStatus` muda para `paid`.

**checkProofDeadline**
Firebase Function que monitora o prazo de 48 horas para o Vendedor fazer o upload do comprovante de transferência de milhas. Ao atingir o prazo sem comprovante, cancela a transação automaticamente e inicia o processo de reembolso ao Comprador.

**Comprador (Buyer)**
Persona primária da plataforma. Pessoa física que busca e adquire milhas de outros usuários para emitir passagens aéreas com desconto. Interage principalmente com os módulos de Listagens (M2), Transações (M3) e Pagamento (M4/M5).

**Comprovante de Transferência**
Documento (geralmente imagem ou PDF) que o Vendedor faz upload na plataforma como evidência de que as milhas foram transferidas para o programa de fidelidade do Comprador. Sua ausência dentro de 48h após aprovação da transação aciona o cancelamento automático via `checkProofDeadline`.

---

## D

**D+30**
Período de carência de 30 dias corridos após a conclusão (`COMPLETED`) de uma transação, após o qual o saldo do Vendedor é liberado para saque. Implementado pela Firebase Function `releaseWithdrawalBalance`.

---

## G

**gatewayChargeId**
Identificador da cobrança (charge) no sistema Pagar.me. Armazenado na entidade `Transaction` e usado para operações de captura, cancelamento e reembolso via proxy.

**gatewayOrderId**
Identificador do pedido (order) no sistema Pagar.me. Armazenado na entidade `Transaction` e corresponde ao agrupamento de cobranças associado a uma transação.

**gatewayStatus**
Campo da entidade `Transaction` que espelha o status da cobrança no Pagar.me. Valores possíveis:
- `pre_authorized`: pré-autorização criada, aguardando captura (apenas cartão de crédito)
- `paid`: pagamento capturado ou confirmado (cartão capturado ou PIX confirmado)
- `cancelled`: cobrança cancelada antes da captura
- `refunded`: pagamento reembolsado após captura

---

## L

**Latam Pass**
Programa de fidelidade da companhia aérea LATAM Airlines. Utiliza o termo **pontos** (não milhas). Uma das fontes de milhas negociadas na plataforma.

**Listagem**
Entidade (`Listing`) criada pelo Vendedor ou Agência que representa uma oferta de milhas disponível no marketplace. Contém: programa de fidelidade, quantidade de milhas disponíveis, preço por milha e status (ativa, pausada, esgotada).

---

## M

**Marketplace**
Modelo de negócio da plataforma ShareMiles, onde a plataforma conecta Compradores e Vendedores, gerencia as transações e garante a segurança financeira por meio da intermediação do pagamento.

**Milhas**
Unidade de medida dos pontos de fidelidade em programas como Smiles e TudoAzul. No contexto genérico da plataforma, "milhas" é o termo preferido para se referir a qualquer ponto de programa de fidelidade negociado, a menos que o contexto exija precisão (ex: "pontos Latam Pass").

---

## O

**onTransactionStatusFix**
Firebase Function responsável por corrigir automaticamente inconsistências de status de transação, especialmente quando há divergência entre o `gatewayStatus` retornado pelo Pagar.me e o status interno da `Transaction`.

---

## P

**Pagar.me**
Gateway de pagamento principal da plataforma. Processa cobranças via cartão de crédito (com pré-autorização) e PIX. Acessado exclusivamente via o proxy `Sharemiles.Pagarme.Api` — o backend principal `ShareMiles.Api` nunca acessa o Pagar.me diretamente.

**PagarMeService**
Serviço no backend principal (`ShareMiles.Api/src/ShareMiles.Infrastructure/ExternalServices/`) responsável por orchestrar as chamadas ao proxy Pagar.me. Não acessa o Pagar.me diretamente.

**PagarmeProxyService**
Serviço no projeto `Sharemiles.Pagarme.Api/Services/` que implementa a comunicação direta com a API do Pagar.me. Recebe requisições do `PagarMeService` e as encaminha ao gateway.

**PENDING**
Primeiro status de uma `Transaction` recém-criada, aguardando a confirmação de pagamento pelo gateway.

**PENDING_SELLER_APPROVAL**
Status da `Transaction` após o pagamento ser processado com sucesso (PIX pago ou cartão pré-autorizado). Indica que a transação aguarda a decisão do Vendedor (aprovar ou rejeitar).

**PIX**
Modalidade de pagamento instantâneo do Banco Central do Brasil. Na plataforma, o fluxo PIX não usa pré-autorização — o pagamento é confirmado imediatamente via webhook, avançando a transação diretamente para `PENDING_SELLER_APPROVAL`. Gerenciado pela `ShareMilesPixApi/`.

**Pontos**
Unidade de medida dos programas de fidelidade que não usam o termo "milhas" (ex: Latam Pass). Ver também *Milhas*.

**Pre-autorização (pre_auth)**
Mecanismo do Pagar.me para cartão de crédito que bloqueia o valor no cartão do Comprador sem capturá-lo imediatamente. Garante que o dinheiro está disponível antes do Vendedor se comprometer com a transferência. Capturado apenas após aprovação do Vendedor.

**Programa de Fidelidade**
Sistema de pontos de companhias aéreas ou bancos. Exemplos: Smiles (LATAM/Gol), Latam Pass, TudoAzul.

---

## R

**Reembolso**
Operação realizada no gateway Pagar.me para devolver um pagamento já capturado ao Comprador. Tecnicamente corresponde à chamada `RefundAsync` via `POST /charges/{id}/refund` no proxy. Distinto de *Cancelamento* (que opera sobre cobranças não capturadas).

**releaseWithdrawalBalance**
Firebase Function que libera o saldo do Vendedor para saque após o período D+30, definindo `availableForWithdrawal = true` na entidade `Withdrawal`.

**Role**
Papel do usuário na plataforma. Valores possíveis: `buyer` (Comprador), `seller` (Vendedor), `agency` (Agência), `admin` (Administrador). Armazenado na entidade `User` e usado para controle de acesso.

---

## S

**Saque**
Operação pela qual o Vendedor solicita a transferência do saldo disponível em sua carteira para uma conta bancária cadastrada (`BankAccount`). Requer aprovação do Administrador antes de ser processado. Gerenciado pelo `WithdrawalsController`.

**sellerApprovalStatus**
Campo da entidade `Transaction` que indica o estado da decisão do Vendedor. Valores: `PENDING` (aguardando), `APPROVED` (aprovado), `REJECTED` (rejeitado).

**Seller**
Ver *Vendedor*.

**ShareMiles.Api**
Backend principal da plataforma, desenvolvido em ASP.NET Core C#. Contém os controllers, domínio e infraestrutura da aplicação.

**ShareMilesPixApi**
API dedicada ao processamento de pagamentos via PIX, incluindo geração de QR Code e recebimento de webhooks de confirmação.

**Sharemiles.Pagarme.Api**
Proxy ASP.NET Core minimal API que intermedia todas as chamadas ao gateway Pagar.me. Isola as credenciais e a lógica de integração do backend principal.

**Smiles**
Programa de fidelidade da companhia aérea Gol. Utiliza o termo **milhas**. Uma das principais fontes de milhas negociadas na plataforma.

---

## T

**Transaction**
Entidade central da plataforma que representa o ciclo completo de uma negociação de milhas, desde a criação do pedido pelo Comprador até a liberação do saldo para o Vendedor. Gerenciada pelo `TransactionsController`.

**TudoAzul**
Programa de fidelidade da companhia aérea Azul Airlines. Uma das fontes de milhas negociadas na plataforma.

---

## U

**User**
Entidade que representa um usuário da plataforma, com campos de perfil (nome, CPF, telefone, endereço) e role de acesso. Autenticação gerenciada via Firebase Auth. Gerenciada pelo `UsersController`.

**UserProfile**
Entidade que armazena informações complementares do perfil do usuário, como documentos de verificação de identidade.

---

## V

**Vendedor (Seller)**
Persona que cria listagens de milhas para venda no marketplace. Responsável por aprovar transações, transferir as milhas e fazer upload do comprovante. Aguarda D+30 para receber o saldo via saque.

---

## W

**Withdrawal**
Entidade que representa uma solicitação de saque do Vendedor. Contém valor, conta bancária de destino, status de aprovação e flag `availableForWithdrawal`. Gerenciada pelo `WithdrawalsController`.

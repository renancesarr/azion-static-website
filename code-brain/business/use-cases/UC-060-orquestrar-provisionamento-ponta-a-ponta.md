---
id: UC-060
title: Orquestrar provisionamento ponta-a-ponta
derived_from: BACKLOG:T-040..T-047
created_at: 2025-10-22T14:23:46Z
status: draft
---

## Objetivo
Executar o fluxo completo bucket→upload→app→connector→rule→domain→deploy→waf com persistência de IDs.

## Atores
- Principal: Dev
- Secundários: Agente MCP

## Fluxo Principal
1. Receber parâmetros do usuário (domain, bucket, local_dir, etc.).
2. Executar passos em ordem com dry-run opcional.
3. Gerar summary.json e artefatos em .mcp-state/.

## Exceções
- Falta de envs obrigatórios → falhar cedo com mensagem clara.
- Inconsistência de estados → abortar com resumo do que foi feito.

## Valor de Negócio
Provisionamento repetível e auditável com um comando.

## Relações
- **TO-DOs:** [T-040, T-041, T-042, T-043, T-044, T-045, T-046, T-047]

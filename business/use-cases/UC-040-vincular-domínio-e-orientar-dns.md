---
id: UC-040
title: Vincular domínio e orientar DNS
derived_from: BACKLOG:T-032..T-035,T-121..T-129
created_at: 2025-10-22T14:23:46Z
status: draft
---

## Objetivo
Criar domínio (workload), fazer deployment para a aplicação e orientar configuração DNS/CNAME.

## Atores
- Principal: DevOps
- Secundários: API Workloads/Deployments, Operador DNS

## Fluxo Principal
1. Criar workload/domain ativo com protocolos HTTP/2.
2. Criar deployment associando o domain ao edge_application_id.
3. Gerar instruções de DNS (CNAME e/ou registros raiz) e validar endpoint provisório.

## Exceções
- Domínio inválido ou não verificado → pausar e registrar instruções.
- Propagação DNS lenta → manter verificação com TTL adequado.

## Valor de Negócio
O site fica acessível via domínio do usuário.

## Relações
- **TO-DOs:** [T-032, T-033, T-034, T-035, T-121, T-122, T-123, T-124, T-125, T-129]

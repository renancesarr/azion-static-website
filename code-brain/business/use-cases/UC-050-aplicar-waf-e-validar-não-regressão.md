---
id: UC-050
title: Aplicar WAF e validar não-regressão
derived_from: BACKLOG:T-036..T-039,T-199..T-201,T-203..T-204
created_at: 2025-10-22T14:23:46Z
status: draft
---

## Objetivo
Criar firewall, aplicar ruleset WAF em modo adequado e validar que estáticos funcionam.

## Atores
- Principal: SecOps
- Secundários: API Firewall/WAF, Observabilidade

## Fluxo Principal
1. Criar firewall (WAF on) e associar ao domínio.
2. Criar ruleset WAF (modo blocking) e aplicar ao firewall.
3. Executar validações de acessos estáticos e monitorar falsos positivos.

## Exceções
- Bloqueios indevidos (FP) → registrar e ajustar sensibilidade.
- Endpoint sem resposta → verificar ordem de deploy/domínio.

## Valor de Negócio
Aumenta a segurança sem quebrar a entrega de conteúdo.

## Relações
- **TO-DOs:** [T-036, T-037, T-038, T-039, T-199, T-200, T-201, T-203, T-204]

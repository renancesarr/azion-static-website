---
id: UC-080
title: Observabilidade e relatórios
derived_from: BACKLOG:T-053..T-055,T-174,T-195..T-196
created_at: 2025-10-22T14:23:46Z
status: draft
---

## Objetivo
Gerar logs estruturados, relatórios de desempenho e exportações (JSONL/CSV/artifacts).

## Atores
- Principal: DevOps
- Secundários: Ferramentas CI/CD

## Fluxo Principal
1. Escrever uploads.log em JSONL com métricas por arquivo.
2. Exportar sumários CSV e artifacts de pipeline.
3. Coletar latências p95/p99 e cache-hit ratio.

## Exceções
- Log truncado → rotacionar e manter integridade.
- Métricas ausentes → acionar validações adicionais.

## Valor de Negócio
Visibilidade do sistema e base para tuning contínuo.

## Relações
- **TO-DOs:** [T-053, T-054, T-055, T-174, T-195, T-196]

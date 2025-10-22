---
id: UC-020
title: Criar Edge Application para conteúdo estático
derived_from: BACKLOG:T-028
created_at: 2025-10-22T14:23:46Z
status: draft
---

## Objetivo
Criar aplicação de borda com Edge Cache habilitado para servir conteúdo estático.

## Atores
- Principal: Dev
- Secundários: API Azion Edge Application

## Fluxo Principal
1. Agente recebe nome da aplicação.
2. Cria app com modules.edge_cache=true (edge_functions opcional).
3. Retorna edge_application_id e salva em .mcp-state/.

## Exceções
- Conflito de nome → sugerir nome derivado.
- Erro 5xx na API → retry e log.

## Valor de Negócio
Base para entregar ativos com baixa latência via edge.

## Relações
- **TO-DOs:** [T-028]

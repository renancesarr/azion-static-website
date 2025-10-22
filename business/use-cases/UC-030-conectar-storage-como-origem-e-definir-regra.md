---
id: UC-030
title: Conectar Storage como origem e definir regra
derived_from: BACKLOG:T-029..T-031
created_at: 2025-10-22T14:23:46Z
status: draft
---

## Objetivo
Associar o bucket à aplicação via Edge Connector e criar uma regra de origem para todas as URLs.

## Atores
- Principal: Dev
- Secundários: API Edge Connector, API Rules Engine

## Fluxo Principal
1. Criar Edge Connector type=edge_storage apontando para o bucket.
2. Criar regra com criteria ${uri} starts_with '/' e behavior set_edge_connector.
3. Validar regra recuperando a lista de regras e conferindo atributos.

## Exceções
- Bucket inexistente → abortar e instruir a criar UC-010.
- Regra já existente → atualizar/confirmar behavior.

## Valor de Negócio
A aplicação passa a servir o conteúdo publicado no Storage.

## Relações
- **TO-DOs:** [T-029, T-030, T-031]

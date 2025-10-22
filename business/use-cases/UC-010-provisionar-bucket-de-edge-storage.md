---
id: UC-010
title: Provisionar bucket de Edge Storage
derived_from: BACKLOG:T-021..T-027
created_at: 2025-10-22T14:23:46Z
status: draft
---

## Objetivo
Criar bucket de armazenamento com acesso de borda e realizar upload idempotente dos arquivos estáticos do site.

## Atores
- Principal: Dev (no VSCode)
- Secundários: API Azion Storage

## Fluxo Principal
1. Iniciar o agente MCP e informar nome do bucket e diretório local de estáticos.
2. Agente cria bucket com edge_access=read_only.
3. Agente calcula hashes e realiza upload concorrente respeitando MIME e gzip.
4. Agente registra log/relatório de enviados, pulados e falhas.

## Exceções
- Token inválido ou sem escopo → retornar erro com dica de permissão.
- Bucket já existe → retornar estado/ID existente (idempotência).
- Upload falha por timeout → retry com backoff; reportar no resumo.

## Valor de Negócio
Sem fricção para publicar o conteúdo com segurança e repetibilidade.

## Relações
- **TO-DOs:** [T-021, T-022, T-023, T-024, T-025, T-026, T-027]

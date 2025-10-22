---
id: UC-070
title: Validar publicação e comportamento HTTP
derived_from: BACKLOG:T-048..T-052,T-185
created_at: 2025-10-22T14:23:46Z
status: draft
---

## Objetivo
Executar checks de integridade (bucket/app/rule/domain/firewall) e validar MIME/encoding/HTTP 200.

## Atores
- Principal: QA
- Secundários: CLI de Validação

## Fluxo Principal
1. Checar existência de cada recurso na plataforma.
2. Requisitar endpoints chave (index.html, CSS, JS) e validar MIME/headers.
3. Testar casos de erro forçado para diagnóstico.

## Exceções
- Mismatch de MIME → atualizar mapeador e reprocessar uploads.
- Token/escopo insuficiente → retornar instruções de permissão.

## Valor de Negócio
Confiança operacional e menos surpresas em produção.

## Relações
- **TO-DOs:** [T-048, T-049, T-050, T-051, T-052, T-185]

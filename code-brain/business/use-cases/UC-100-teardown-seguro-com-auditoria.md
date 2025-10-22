---
id: UC-100
title: Teardown seguro com auditoria
derived_from: BACKLOG:T-131..T-166
created_at: 2025-10-22T14:23:46Z
status: draft
---

## Objetivo
Remover recursos na ordem correta com confirmações e backups, mantendo trilha de auditoria.

## Atores
- Principal: DevOps
- Secundários: -

## Fluxo Principal
1. Gerar backup .mcp-state e exigir confirmação dupla.
2. Remover regras, conector, desativar e apagar app, objetos e bucket.
3. Remover domain/deploy e firewall/WAF; validar ausência de resposta.

## Exceções
- Dependências ainda vinculadas → abortar com instruções e IDs.
- Ambiente marcado como prod → requer override explícito.

## Valor de Negócio
Encerramento controlado sem deixar resíduos nem riscos.

## Relações
- **TO-DOs:** [T-131, T-132, T-133, T-134, T-135, T-136, T-137, T-138, T-139, T-140, T-141, T-142, T-143, T-144, T-145, T-146, T-147, T-148, T-149, T-150, T-151, T-152, T-153, T-154, T-155, T-156, T-157, T-158, T-159, T-160, T-161, T-162, T-163, T-164, T-165, T-166]

---
id: UC-090
title: Pipeline CI/CD para build e deploy
derived_from: BACKLOG:T-167..T-186,T-170..T-183
created_at: 2025-10-22T14:23:46Z
status: draft
---

## Objetivo
Construir, versionar e publicar o site através de workflows com gates e secrets.

## Atores
- Principal: DevOps
- Secundários: GitHub Actions (ou semelhante)

## Fluxo Principal
1. Configurar workflow de build com cache de dependências.
2. Executar orquestrador com secrets (AZION_TOKEN, DOMAIN, BUCKET).
3. Publicar artifacts e realizar checks HTTP pós-deploy.

## Exceções
- Falha de secret → bloquear logs de credenciais e orientar correção.
- Gate de aprovação pendente → notificar responsáveis.

## Valor de Negócio
Entrega contínua segura e auditável.

## Relações
- **TO-DOs:** [T-167, T-168, T-169, T-170, T-171, T-172, T-173, T-174, T-175, T-176, T-177, T-178, T-179, T-180, T-181, T-182, T-183, T-184, T-185, T-186]

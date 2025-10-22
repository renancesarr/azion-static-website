---
id: UC-001
title: Autenticação via link mágico
derived_from: IN-001
created_at: 2025-10-22T12:10:00Z
status: approved
---

## Objetivo
Permitir login sem senha via link temporário enviado por email.

## Atores
- Principal: Usuário
- Secundários: Serviço de Email, Serviço de Autenticação

## Fluxo Principal
1. Usuário informa email.
2. Sistema envia link com token temporário.
3. Usuário clica no link e é autenticado.

## Exceções
- Email não cadastrado.
- Link expirado.

## Valor de Negócio
Redução de abandono no onboarding e aumento de conversão.

## Relações
- **Insight:** IN-001
- **TO-DOs:** [T001]

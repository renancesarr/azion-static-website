# DevLog — UC-001 / T001

## Propósito
Implementar autenticação via link mágico derivado do caso de uso UC-001.

## Contexto Cognitivo
- Insight é impulso criativo (IN-001).
- Use-case organiza a intenção (UC-001).
- To-do é o ato técnico (T001).

## Decisões Técnicas
- JWT com expiração de 15 minutos.
- Rota: `POST /auth/magic-link/request` e `GET /auth/magic-link/:token`.
- Proteção contra reuso de token (blacklist em memória/redis).

## Riscos & Mitigações
- Reenvio de link: limitar frequência por email.
- Link vazado: expiração curta + revogação ao uso.

## Testes
- Unitários: geração/validação de token.
- Integração: fluxo completo de request→click→login.

## Autoavaliação
confiança: 0.88
pendências: tornar expiração configurável.

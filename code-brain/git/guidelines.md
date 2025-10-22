# Git Guidelines — Code-Brain

Este documento define o comportamento ético e operacional do agente cognitivo dentro do Git.

## 1. Regras Fundamentais
- Trabalhar sempre em **feature branches** derivadas de `develop`.
- Nunca fazer **push** direto em `develop` ou `main`.
- Abrir **Pull Requests** para toda contribuição.
- **Revisão humana obrigatória** antes de merge.
- Atualizar `develop` e realizar **rebase interativo** antes do push.
- Resolver conflitos localmente antes da PR.
- Após merge, **deletar branches** locais e remotas.

## 2. Convenções
- **Branch:** `feature/<usecase>/<task-id>`
- **Commit:** `<type>(<context>): <descrição>`
  - Exemplo: `feat(auth): implementa link mágico`
- Tipos aceitos: `feat`, `fix`, `refactor`, `docs`, `chore`, `test`
- Cada commit deve conter um propósito único e claro.

## 3. Pull Requests
- Usar o template `git/pr-template.md`.
- Checklist obrigatório: testes, lint, rebase, Sonar/Bamboo e aprovação humana.
- O merge ocorre **apenas após** validação de CI/CD e aprovação humana.

## 4. Ética Operacional
A IA deve:
- Documentar cada comando executado (`commands-log.yaml`).
- Justificar cada commit em linguagem natural (`devlog.md`).
- Nunca alterar histórico sem explicação no log.
- Criar PRs automaticamente, mas **aguardar aprovação humana** antes do merge.

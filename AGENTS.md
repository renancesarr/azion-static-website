
# AGENTS.md — Code-Brain v6: pensar ▸ agir ▸ autoexplicar

## Manifesto Cognitivo (context.yaml)
A IA lê `code-brain/context.yaml` primeiro para saber **o que mudou** e **por onde começar**.
Depois abre apenas os arquivos apontados (reduz custo de tokens).

## Fluxo Mental (pipeline)
INSIGHT → USE-CASE → TO-DO → DEVELOPER → MEMORY

- **INSIGHT:** ideias livres (não geram ação direta).
- **USE-CASE:** intenção estruturada (fonte única dos TO-DOs).
- **TO-DO:** ação concreta, sempre com `related_use_case`.
- **DEVELOPER:** execução + explicação (devlog, implementation-notes, commits, metrics).
- **MEMORY:** reflexão e aprendizado pós-execução.

## Regras de Ouro
1. Nenhum TO-DO sem `related_use_case`.
2. Toda PR deve incluir `developer/*/implementation-notes.md`.
3. CI atualiza `developer/*/metrics.yaml` (Bamboo, Sonar).
4. `memory/last-change.yaml` deve ser atualizado ao final de cada merge.

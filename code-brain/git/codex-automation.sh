#!/usr/bin/env bash
# Code-Brain Codex — Automação IA de fluxo Git

USECASE=$1
TASK=$2
BRANCH="feature/${USECASE}/${TASK}"

echo "[Code-Brain] Criando branch ${BRANCH}..."
git checkout develop && git pull
git checkout -b ${BRANCH}

echo "[Code-Brain] Executando alterações..."
# IA executa mudanças aqui
git add .
git commit -m "feat(${USECASE}): entrega automática da tarefa ${TASK}"

echo "[Code-Brain] Rebasing e validando..."
git checkout develop && git pull
git checkout ${BRANCH}
git rebase -i --autosquash develop

npm run lint && npm run test

echo "[Code-Brain] Publicando e criando Pull Request..."
git push -f origin ${BRANCH}
gh pr create --title "Entrega ${TASK}" --body "PR gerada automaticamente pela IA (aguardando revisão humana)" --base develop

echo "[Code-Brain] PR criada com sucesso. Aguardando aprovação."

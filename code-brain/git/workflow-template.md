# Workflow Template — Git do Code-Brain

```bash
# Criar branch da tarefa
git checkout develop && git pull
git checkout -b feature/<usecase>/<task-id>

# Trabalhar e commitar
git add <files>
git commit -m "feat(<context>): <descrição>"

# Validar e rebasear
git checkout develop && git pull
git checkout feature/<usecase>/<task-id>
git rebase -i --autosquash develop

# Testes + Lint + CI
npm run test && npm run lint

# Push forçado e PR automática
git push -f origin feature/<usecase>/<task-id>

# IA cria PR aguardando revisão humana
```

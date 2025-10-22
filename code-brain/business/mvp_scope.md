---
id: T-001
title: Escopo do MVP — Automação de Provisionamento Azion
related_use_case: UC-001
created_at: 2025-10-22
status: draft
---

## Objetivo
Estabelecer limite claro para a primeira iteração da automação de provisionamento estático na Azion, garantindo valor demonstrável: provisionar um site estático completo (storage → entrega → proteção) com um único fluxo orquestrado.

## Premissas
- Utilizar APIs públicas Azion (Edge Storage, Edge Application, Domains, WAF, Rules Engine) autenticadas via token pessoal (`AZION_TOKEN`).
- Operar como ferramenta MCP em Node.js/TypeScript, integrável com agentes/IDEs.
- Artefatos persistidos sob `.mcp-state/` para idempotência e auditoria.

## Escopo Funcional
1. **Storage**: criar bucket dedicado e realizar upload de diretório local, inferindo MIME/encoding e preservando hash de cada objeto.
2. **Entrega**: criar Edge Application com comportamento de cache padrão para conteúdo estático e conectar ao bucket via Edge Connector.
3. **Regras**: aplicar regras mínimas (cache forçado para assets, bypass para HTML dinâmico quando necessário) e suportar cabeçalhos básicos (cache-control, gzip).
4. **Domínio**: provisionar Domain apontando para a Edge Application e expor instruções de DNS (CNAME) para delegação.
5. **Segurança**: habilitar WAF com política default Azion e registrar surface de ajustes futuros.
6. **Orquestração**: expor tool MCP de alto nível que coordena a sequência completa, grava estados intermediários e gera relatório final.

## Fora de Escopo (MVP)
- Integração com pipelines CI/CD ou GitOps.
- Suporte a múltiplos ambientes (apenas `production`).
- Configurações avançadas de WAF, Edge Functions customizadas ou regras condicionais complexas.
- Upload incremental baseado em diff remoto (usar hash local apenas).

## Definition of Done
- Documentação de variáveis de ambiente (.env.example) e fluxo operacional no README.
- Execução `upload_dir` gera relatório com estatísticas, log de erros e `index.json` para idempotência.
- Edge Application ativa, Domain associado e WAF habilitado após orquestração completa.
- Todos os artefatos persistentes identificados por TO-DO (ex.: `.mcp-state/storage_bucket.json`, `edge_application.json`).
- DevLog/Implementation notes atualizados descrevendo decisões e trade-offs.

## Métricas de Sucesso
- Provisionamento completo em < 5 minutos com apenas um comando/tool MCP.
- Upload idempotente: reexecução subsequente pula ≥ 90% dos objetos inalterados.
- Zero erros não tratados durante fluxo nominal (logs com status claro).

## Próximos Passos
- [ ] Criar estrutura Node/TypeScript do projeto MCP (T-002 a T-006).
- [ ] Definir variáveis de ambiente e documentação operacional (T-008, T-009).
- [ ] Implementar tools de storage, entrega e orquestração seguindo escopo acima.

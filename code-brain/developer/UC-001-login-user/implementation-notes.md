# Implementation Notes — UC-001 / T001

## Objetivo da PR
Entregar fluxo de autenticação via link mágico (login sem senha).

## Arquivos Modificados
- `api/auth/magic-link-request.js`
- `api/auth/magic-link-consume.js`
- `lib/jwt.js`

## Cobertura de Testes (pré-CI)
- Unit: ~92%
- Integration: ~80%

## Métricas (pré-Sonar)
- Complexidade ciclomática média: ~3
- Duplicação: <1%

## Pendências
- [ ] Parametrizar expiração via env.
- [ ] Ajustar logs de segurança.

---

## Atualização — 2025-10-22
- **Scope**: preparação do ambiente MCP (T-001 a T-006) para provisionamento Azion.
- **Instalações**: `@modelcontextprotocol/sdk` como dependência runtime; `typescript` e `tsx` como dev deps para compilar/rodar via ES Modules.
- **Configuração**: `tsconfig.json` define `moduleResolution: NodeNext`, `outDir: dist/`, `rootDir: src/`, `strict` ativo para detectar inconsistências cedo.
- **Observações**: optado por remover `node_modules/` via script Python (restrições a `rm -rf`) para garantir instalação limpa após falhas de rename em npm 10.
- **Infra Cognitiva**: `.mcp-state/` versionada com `.gitkeep`, `.env.example` documentando credenciais obrigatórias e `README.md` orientando setup e scripts (`build`, `dev`, `start`).
- **Bootstrap MCP**: `src/server.ts` utiliza `McpServer` + `StdioServerTransport`, faz short-circuit se `AZION_TOKEN` faltante, registra tool `azion.health_check` e broadcast de logging após conexão; instalados handlers para `SIGINT/SIGTERM`.
- **Utils**: `requiredEnv`/`MissingEnvError` isolam validação de env (T-014), `http()` padroniza fetch com JSON, token Bearer e erros ricos (T-015), `lookupMimeType`/`inferEncoding` cuidam de MIME/encoding gzip (T-016/T-017); `tsconfig` inclui libs DOM p/ `fetch`.
- **FS & Concorrência**: `walkDirectory` (FS recursivo POSIX), `hashFileSHA256` (idempotência), `runWithPool` (limite + retries) preparam upload massivo.
- **Storage Tools**: `azion.create_bucket` usa schema `zod`, persistência em `.mcp-state/storage/storage_buckets.json`, fallback GET quando POST conflita e logs via MCP.
- **Uploads**: `azion.put_object` aceita conteúdo base64 com headers coerentes, atualiza índice e reforça SHA256; `azion.upload_dir` combina hashing incremental, reaproveitamento por índice, relatório JSON por execução e suporta `dry_run`, `prefix` e `stripGzip`.
- **Edge Stack**: `azion.create_edge_application`, `azion.create_edge_connector` e `azion.create_cache_rule` seguem padrão idempotente, armazenando metadados em `.mcp-state/edge/*.json` para reaproveitar execuções e facilitar orquestração futura.
- **Domains**: `azion.create_domain` e `azion.dns_instructions` centralizam provisioning e instruções DNS, mantendo cache em `.mcp-state/edge/domains.json` com sincronização automática quando a API retorna dados mais recentes.
- **Segurança**: `azion.configure_waf` liga a Edge Application a políticas WAF (modo learning/blocking) e persiste estado em `.mcp-state/security/waf_policies.json`; `azion.waf_status` sincroniza com a API sob demanda.
- **Orquestração**: `azion.provision_static_site` coordena etapas (bucket → edge app → connector → rules → domain → WAF), persiste relatório em `.mcp-state/orchestration/runs/` e utiliza funções `ensure*` para manter idempotência; upload agora é incorporado via `processUploadDir`, com métricas (planejado, enviado, pulado, log) acopladas ao relatório final, e bloco `postDeploy` dispara smoke HTTP (asserts de headers/body) reaproveitando o módulo `postDeploy`.
- **WAF**: `azion.create_firewall`, `azion.create_waf_ruleset` e `azion.apply_waf_ruleset` conversam com os endpoints `/v4/edge_firewall/*` e `/v4/waf/rulesets`, persistindo estado em `.mcp-state/security/` para idempotência e permitindo reaproveitamento pelo orchestrator.
- **Dry-run/relatórios**: orquestrador registra estados intermediários em `.mcp-state/` (bucket/app/connector/domain/firewall/waf) e exporta relatórios resumidos, garantindo cumprimento dos critérios T-041/T-043.
- **Observabilidade**: `azion.post_deploy_check` executa GET em endpoints críticos, registra status/latência e armazena relatórios em `.mcp-state/post-deploy/checks/`, servindo como smoke test pós-provisionamento.

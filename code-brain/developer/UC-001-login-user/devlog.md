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

---

## Atualização — 2025-10-22

- **T-001**: criado `code-brain/business/mvp_scope.md` consolidando escopo do MVP para provisionamento completo (storage → edge application → domain → WAF → orquestração).
- **T-002/T-004**: inicializada a estrutura do projeto MCP com diretórios `src/`, `dist/`, `.mcp-state/` e `package.json` contendo scripts `build`, `dev` e `start`, além da restrição `engines.node >= 18.18.0`.
- **T-003**: ambiente atual inicialmente sem Node; após instalação, validado `node v22.21.0`, viabilizando setup posterior.
- **T-005/T-006**: instaladas dependências (`@modelcontextprotocol/sdk`, `typescript`, `tsx`), regenerado `node_modules/` limpo e criado `tsconfig.json` com `module/moduleResolution` em `NodeNext`, `outDir` em `dist/` e `strict` habilitado.
- **T-007/T-008/T-009**: formalizada `.mcp-state/` (com `.gitkeep`), disponibilizado `.env.example` com variáveis críticas (`AZION_TOKEN`, `CONTEXT7_API`, `UPLOAD_CONCURRENCY`) e redactado `README.md` descrevendo pré-requisitos, scripts e próximos passos do MVP.
- **T-010/T-011/T-012/T-013**: `src/server.ts` conecta via `StdioServerTransport`, registra tool `azion.health_check`, propaga logs de inicialização, valida `AZION_TOKEN` e instala tratadores globais de exceção/sinal.
- **T-014/T-015**: `src/utils/env.ts` expõe `requiredEnv`/`optionalEnv` com erro específico (`MissingEnvError`; falha rápida), enquanto `src/utils/http.ts` centraliza chamadas REST (Bearer token, Accept JSON, erro rich com payload).
- **T-016/T-017**: `src/utils/mime.ts` resolve MIME + encoding gzip (deriva Content-Type da base sem `.gz`), garantindo cabeçalhos consistentes para uploads.
- **T-018/T-019/T-020**: adicionados utilitários `walkDirectory`, `hashFileSHA256`, `runWithPool` para preparar leitura de diretórios, hashing de objetos e concorrência controlada.
- **T-021/T-022**: implementada `azion.create_bucket` (`src/tools/storage.ts`) com schema `zod`, idempotência baseada em `.mcp-state/storage/storage_buckets.json`, fallback para GET em caso de 409 e logs no MCP.
- **T-023/T-027**: `azion.put_object` e `azion.upload_dir` publicados com validações `zod`, controle de concorrência, idempotência via índice (`.mcp-state/storage/uploads/index-*.json`), relatórios detalhados de execução (`logs/upload-*.json`) e suporte a `dry_run`/`stripGzip`.
- **T-028/T-030**: adicionadas ferramentas de Edge Application (`azion.create_edge_application`), Connector (`azion.create_edge_connector`) e Rules Engine (`azion.create_cache_rule`) com schemas `zod`, sincronização idempotente e estados em `.mcp-state/edge/*.json`.
- **T-031/T-033**: `azion.create_domain` e `azion.dns_instructions` incorporam provisioning + instruções DNS com cache em `.mcp-state/edge/domains.json`, sincronizando com a API quando necessário.
- **T-034/T-035**: `azion.configure_waf` e `azion.waf_status` implementam ativação/consulta de WAF com idempotência e estado em `.mcp-state/security/waf_policies.json`.
- **T-036/T-038**: `azion.provision_static_site` orquestra bucket→edge application→connector→rules→domain→WAF, gera relatório em `.mcp-state/orchestration/runs/` e reutiliza ensures para manter idempotência; upload automático integrado reaproveita `processUploadDir` com métricas no relatório, e `postDeploy` opcional executa smoke HTTP com asserts de headers/body.
- **T-041/T-043**: fluxo completo do orquestrador validado (passo-a-passo, persistência das saídas em `.mcp-state/`, suporte a dry-run, relatórios resumidos) garantindo que cada reexecução seja idempotente e auditável.
- **T-036/T-038 (WAF)**: criadas ferramentas `azion.create_firewall`, `azion.create_waf_ruleset` e `azion.apply_waf_ruleset`, armazenando artefatos em `.mcp-state/security/*.json` e habilitando idempotência de firewall/ruleset no orchestrator.
- **T-043/T-044**: `azion.post_deploy_check` adiciona verificação pós-deploy (HTTP), persiste métricas em `.mcp-state/post-deploy/` e emite logs com latência/erros.
- **T-048**: `azion.validate_stack` confere artefatos persistidos em `.mcp-state/` e realiza GET simples no domínio provisionado.

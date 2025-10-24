
# Funcionalidades Atuais — Azion MCP Provisioner

## Storage & Upload
- `azion.create_bucket`: provisionamento idempotente de buckets via API (persistência em `.mcp-state/storage/storage_buckets.json`).
- `azion.upload_dir`: upload de diretórios com índice de hashes, suporte a `dryRun`, `stripGzipExtension` e logs em `.mcp-state/storage/uploads/logs/`.
- `azion.put_object`: upload individual com validação de Content-Type/Encoding e atualização do índice local.

## Edge Application & Routing
- `azion.create_edge_application`: criação idempotente de aplicações com cache configurável.
- `azion.create_edge_connector`: vincula o bucket como origem da edge application.
- `azion.create_cache_rule`: aplica regras customizadas no Rules Engine.

## Domain & DNS
- `azion.create_domain`: provisiona domínio e grava dados em `.mcp-state/edge/domains.json`.
- `azion.dns_instructions`: gera instruções de CNAME a partir da API/estado.

## Firewall & WAF
- `azion.create_firewall`: cria edge firewall associado a domínios.
- `azion.create_waf_ruleset`: provisiona ruleset em modo blocking/learning.
- `azion.apply_waf_ruleset`: vincula ruleset ao firewall (reuso idempotente).
- `azion.configure_waf` / `azion.waf_status`: ativa, consulta e sincroniza a política WAF da edge application.

## Orquestração
- `azion.provision_static_site`: executa o fluxo completo (bucket → upload → edge app → connector → rules → domain → firewall/WAF → post-deploy), gera relatório em `.mcp-state/orchestration/runs/` e suporta `dryRun` com plano textual.

## Validações
- `azion.validate_stack`: checa recursos persistidos e faz GET simples no domínio.
- `azion.validate_mimetypes`: compara Content-Type esperado x registrado.
- `azion.validate_upload_idempotency`: verifica hashes/duplicatas no índice.
- `azion.inspect_upload_logs`: resume os logs recentes.
- `azion.verify_bucket_conflict` / `azion.verify_domain_conflict`: confirma reuso de recursos para evitar conflitos 409.
- `azion.post_deploy_check`: smoke test HTTP com asserts por path (status, headers, body) e métricas de latência.

## Convenções & Documentação
- Interfaces isoladas em `src/models/` e schemas Zod em `src/constants/`.
- `docs/specs/azion.provision_static_site.md` documenta entradas/saídas/fluxo.
- `code-brain` centraliza business/to-do/requirements/devlogs atualizados.

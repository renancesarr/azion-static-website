# Especificação — Tool `azion.provision_static_site`

## Visão Geral
Tool responsável por provisionar ponta a ponta o ambiente de site estático na Azion, coordenando storage, upload, edge application, regras, domínio, firewall/WAF e checks pós-deploy.

## Entradas (`inputSchema`)

| Campo | Tipo | Obrigatório | Descrição |
| --- | --- | --- | --- |
| `project` | `string` | não | Identificador amigável usado para nome padrão de recursos e relatórios. |
| `bucket` | `object` | sim | Replicado do `create_bucket` (campos `name`, `edgeAccess`, etc.). |
| `upload` | `object` | não | Configura `azion.upload_dir` (campos: `localDir`, `prefix`, `concurrency`, `dryRun`, `stripGzipExtension`). |
| `edgeApplication` | `object` | sim | Parâmetros para `azion.create_edge_application`. |
| `connector` | `object` | sim | Parâmetros para `azion.create_edge_connector` (usa bucket resolvido). |
| `cacheRules` | `array` | não | Lista de regras adicionais (cada objeto possui `phase`, `behaviors`, `criteria`, `description`, `order`). |
| `domain` | `object` | sim | Parâmetros para `azion.create_domain` (obrigatório `name`). |
| `firewall` | `object` | não | Permite sobrescrever nome/domínios do firewall; default deriva do projeto/domínio. |
| `wafRuleset` | `object` | não | Customiza nome/mode/descrição do ruleset. |
| `firewallRule` | `object` | não | Permite definir `order` da regra WAF no firewall (default 0). |
| `waf` | `object` | não | Configurações adicionais de `azion.configure_waf` (campos `enable`, `mode`, `wafId`). |
| `postDeploy` | `object` | não | Configura `azion.post_deploy_check` (domínio, múltiplos paths, asserts de headers e body, timeout). |

## Sequência de Execução

1. **Bucket**: chama `ensureBucket` → cria ou reaproveita.
2. **Upload (opcional)**: aciona `processUploadDir` e agrega métricas/log.
3. **Edge Application**: `ensureEdgeApplication`.
4. **Connector**: `ensureEdgeConnector` usando bucket id e prefix.
5. **Cache Rules**: `ensureCacheRule` para cada entrada (ou padrão cache).
6. **Domain**: `ensureDomain` associando edgeApp.
7. **Firewall/WAF**:
   - `ensureFirewall` (domínios ligados).
   - `ensureWafRuleset` (modo blocking por padrão).
   - `ensureFirewallRule` ligando ruleset ao firewall.
   - `ensureWaf` para edge application.
8. **Post-deploy** (opcional): `executePostDeployCheck` com multiplos paths/asserts.
9. **Relatório**: compõe objeto final e salva em `.mcp-state/orchestration/runs/`.

## Saídas
- **Relatório final** (`StackReport`): inclui estados criados/reutilizados, métricas de upload, bindings firewall/WAF, resumo post-deploy.
- **Logs MCP**: mensagens informativas/erros por etapa.
- **Arquivos persistidos**: índices atualizados em `.mcp-state/` (storage, edge, security, orchestration).

## Considerações de Idempotência
- Funções `ensure*` consultam estado local/API antes de criar recursos.
- Upload usa índice (hash) para evitar reenvio.
- Firewall/ruleset/Rule guardam bindings em `.mcp-state/security/`.
- Post-deploy e validações são somente leitura.

## Pontos de Atenção
- Requer variáveis de ambiente (`AZION_TOKEN`, etc.) já validadas em `src/server.ts`.
- Sequência assume domínio já apontado para edge (post-deploy pode falhar antes de propagação DNS).
- Erros durante upload ou checks são logados e aparecem no relatório final.

## Extensões Futuras
- Adicionar modo "dryRun" global (planejamento sem executar).
- Permitir múltiplos domínios por execução (multi-site).
- Integrar validações adicionais (analytics, headers de segurança).

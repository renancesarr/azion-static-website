# Azion MCP Static Site Provisioner

Automação em Node.js/TypeScript para provisionar sites estáticos na Azion via Model Context Protocol (MCP). O agente orquestra criação de buckets no Edge Storage, Edge Applications, Domains e WAF a partir de scripts declarativos.

## Pré-requisitos
- Node.js `>= 18.18.0` (ESM habilitado).
- Token Azion com permissões administrativas (`AZION_TOKEN`).
- Acesso à API Context7 (ou endpoint equivalente) quando necessário.

## Instalação
```bash
npm install
```

## Variáveis de Ambiente
Copie `.env.example` para `.env` e preencha os valores:

| Variável | Descrição |
| --- | --- |
| `AZION_TOKEN` | Token de acesso às APIs Azion (Bearer). |
| `CONTEXT7_API` | Endpoint auxiliar para integrações Context7 (ajustável). |
| `UPLOAD_CONCURRENCY` | Limite de uploads paralelos durante `upload_dir` (padrão 4). |
| `AZION_API_BASE` | Base URL das APIs Azion (default `https://api.azion.com`). |

## Scripts
- `npm run build`: compila TypeScript para `dist/`.
- `npm run dev`: executa `src/server.ts` em modo watch via `tsx`.
- `npm run start`: inicia MCP a partir de `dist/server.js`.

## Estrutura
```
.
├── src/             # Código-fonte TypeScript (services, utils, server MCP)
├── dist/            # Saída compilada (gerada por `npm run build`)
├── .mcp-state/      # Artefatos persistentes (JSON/LOG) por execução
└── code-brain/      # Documentos cognitivos (use-case, to-dos, devlog, etc.)
```

## Status do MVP
- Escopo definido em `code-brain/business/mvp_scope.md`.
- Dependências MCP instaladas (`@modelcontextprotocol/sdk`, `typescript`, `tsx`).
- Tools disponíveis:
  - `azion.health_check`: verifica disponibilidade do agente.
  - `azion.create_bucket`: cria bucket no Edge Storage com cache local.
  - `azion.put_object`: envia objeto individual (conteúdo base64) ao bucket informado.
  - `azion.upload_dir`: publica diretório completo com hashes, concorrência e relatórios em `.mcp-state/`.
  - `azion.create_edge_application`: provisiona Edge Application estática com WAF opcional.
  - `azion.create_edge_connector`: vincula bucket Edge Storage como origem.
  - `azion.create_cache_rule`: adiciona regra básica no Rules Engine.
  - `azion.create_domain`: cria Domain apontando para a Edge Application.
  - `azion.dns_instructions`: gera instruções DNS (CNAME) atualizadas.
  - `azion.create_firewall`: provisiona Edge Firewall com domínios vinculados.
  - `azion.create_waf_ruleset`: cria ruleset WAF (blocking/learning).
  - `azion.apply_waf_ruleset`: associa ruleset ao firewall via regra dedicada.
  - `azion.configure_waf`: habilita/atualiza WAF para a Edge Application.
  - `azion.waf_status`: consulta estado atual da política WAF.
  - `azion.provision_static_site`: orquestra fluxo completo (bucket→edge→domain→WAF) e gera relatório consolidado.
  - `azion.post_deploy_check`: valida paths críticos via HTTP e grava métricas em `.mcp-state/post-deploy/`.
  - `azion.validate_stack`: confere a existência dos artefatos em `.mcp-state/` e testa um GET no domínio publicado.
  - `azion.validate_mimetypes`: audita Content-Type/Encoding armazenados no índice de upload.
  - `azion.validate_upload_idempotency`: verifica hashes/duplicatas do índice de upload.
  - `azion.inspect_upload_logs`: resume os últimos relatórios de upload.
  - `azion.verify_bucket_conflict` / `azion.verify_domain_conflict`: confirma recursos existentes para evitar 409.
- Observação: defina o bloco `upload` para disparar `azion.upload_dir` automaticamente (suporta `dryRun`).
- Próximos passos: enriquecer `azion.post_deploy_check` com asserts de headers e adicionar métricas de tráfego aos relatórios.

### Exemplo — `azion.provision_static_site`

```jsonc
{
  "project": "site-marketing",
  "bucket": { "name": "marketing-assets" },
  "upload": {
    "localDir": "./dist",
    "prefix": "public",
    "dryRun": false,
    "concurrency": 6
  },
  "edgeApplication": {
    "name": "marketing-app",
    "deliveryProtocol": "http-and-https",
    "originProtocol": "https",
    "enableWaf": true
  },
  "connector": {
    "name": "marketing-connector",
    "originPath": "/"
  },
  "firewall": {
    "name": "marketing-firewall"
  },
  "wafRuleset": {
    "name": "marketing-ruleset",
    "mode": "blocking"
  },
  "firewallRule": {
    "order": 0
  },
  "cacheRules": [
    {
      "phase": "request",
      "behaviors": [{ "name": "cache" }],
      "criteria": []
    }
  ],
  "domain": { "name": "www.exemplo.com" },
  "waf": { "mode": "blocking" },
  "postDeploy": {
    "domain": "www.exemplo.com",
    "paths": [
      "/",
      {
        "path": "/assets/app.js",
        "headers": { "content-type": "application/javascript" }
      }
    ],
    "assertions": {
      "headers": { "cache-control": "max-age" },
      "bodyIncludes": ["<title>Marketing</title>"]
    }
  },
  "dryRun": false
}
```

> Use `"dryRun": true` para obter apenas o plano de execução sem tocar na Azion.

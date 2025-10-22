# To-Do — Iniciais (T-001..T-100)
_Data: 2025-10-18_

- [ ] **T-001** — Fundação — Definir objetivo do MVP

  Descrição: Escopo: storage, edge app, rules, domain, WAF, orquestrador; DoD estabelecido.
  CA: mvp_scope.md
  Dep: —

  _Meta:_ Área: Ambiente • Inputs: Documento de escopo • Prioridade: P0 • Status: A Fazer • Estimativa: 1h

- [ ] **T-002** — Fundação — Criar repositório local do MCP

  Descrição: Repositório azion-mcp com estrutura mínima (src/, dist/, .mcp-state/)
  CA: Estrutura de pastas criada
  Dep: —

  _Meta:_ Área: Ambiente • Prioridade: P0 • Status: A Fazer • Estimativa: 0.5h

- [ ] **T-003** — Fundação — Configurar Node 18+

  Descrição: Node funcional; `node -v` ≥ 18
  CA: Node instalado
  Dep: —

  _Meta:_ Área: Ambiente • Prioridade: P0 • Status: A Fazer • Estimativa: 0.5h

- [ ] **T-004** — Fundação — Inicializar package.json mínimo

  Descrição: `npm init -y`; scripts build/dev/start definidos
  CA: package.json
  Dep: —

  _Meta:_ Área: Ambiente • Prioridade: P0 • Status: A Fazer • Estimativa: 0.5h

- [ ] **T-005** — Fundação — Adicionar TypeScript & SDK MCP

  Descrição: Instalar `typescript`, `@modelcontextprotocol/sdk`, `tsx`
  CA: deps instaladas
  Dep: T-001

  _Meta:_ Área: Ambiente • Prioridade: P0 • Status: A Fazer • Estimativa: 0.5h

- [ ] **T-006** — Fundação — Criar tsconfig.json

  Descrição: Compilar para dist/ com ModuleResolution NodeNext
  CA: tsconfig.json
  Dep: T-004

  _Meta:_ Área: Ambiente • Prioridade: P0 • Status: A Fazer • Estimativa: 0.5h

- [ ] **T-007** — Fundação — Criar pasta .mcp-state

  Descrição: Local de estado/artefatos JSON/LOG
  CA: .mcp-state/
  Dep: T-002

  _Meta:_ Área: Ambiente • Prioridade: P0 • Status: A Fazer • Estimativa: 0.2h

- [ ] **T-008** — Fundação — Definir variáveis de ambiente

  Descrição: AZION_TOKEN, CONTEXT7_API, UPLOAD_CONCURRENCY
  CA: .env.example (sem segredos)
  Dep: T-001

  _Meta:_ Área: Segurança • Prioridade: P0 • Status: A Fazer • Estimativa: 0.5h

- [ ] **T-009** — Fundação — Criar README base

  Descrição: Como rodar build/dev; visão geral; risco/limitações
  CA: README.md
  Dep: T-001

  _Meta:_ Área: Docs • Prioridade: P1 • Status: A Fazer • Estimativa: 1h

- [ ] **T-010** — MCP — Implementar bootstrap via STDIO

  Descrição: `src/server.ts` com `Server`+`StdioServerTransport` e registro de tools
  CA: src/server.ts
  Dep: T-004,T-005

  _Meta:_ Área: Servidor • Prioridade: P0 • Status: A Fazer • Estimativa: 1h

- [ ] **T-011** — MCP — Script de build e start

  Descrição: `npm run build` compila; `npm run start` inicia loop MCP
  CA: dist/server.js
  Dep: T-010

  _Meta:_ Área: Servidor • Prioridade: P0 • Status: A Fazer • Estimativa: 0.5h

- [ ] **T-012** — MCP — Health check básico

  Descrição: Log inicial e encerramento; erro claro se faltam envs
  CA: stdout logs
  Dep: T-010

  _Meta:_ Área: Servidor • Prioridade: P0 • Status: A Fazer • Estimativa: 0.3h

- [ ] **T-013** — MCP — Tratamento de exceções globais

  Descrição: Capturar unhandledRejection/uncaughtException
  CA: logger central
  Dep: T-010

  _Meta:_ Área: Servidor • Prioridade: P1 • Status: A Fazer • Estimativa: 0.5h

- [ ] **T-014** — Utils — Função required(env)

  Descrição: Falhar cedo se env ausente
  CA: Erro amigável
  Dep: T-008

  _Meta:_ Área: HTTP • Inputs: AZION_TOKEN, CONTEXT7_API • Prioridade: P0 • Status: A Fazer • Estimativa: 0.3h

- [ ] **T-015** — Utils — Função http(method,path,body,headers)

  Descrição: fetch nativo; Authorization Token; Accept JSON; erros ricos
  CA: JSON/Erro detalhado
  Dep: T-013

  _Meta:_ Área: HTTP • Inputs: method,path,body • Prioridade: P0 • Status: A Fazer • Estimativa: 1h

- [ ] **T-016** — Utils — Mapeador MIME

  Descrição: Inferir Content-Type por extensão (.html,.css,.js,.json,.png,.jpg,.svg,.webp,.ico,.map)
  CA: string MIME
  Dep: T-013

  _Meta:_ Área: MIME • Inputs: extensão • Prioridade: P0 • Status: A Fazer • Estimativa: 1h

- [ ] **T-017** — Utils — Detecção gzip

  Descrição: Se nome termina .gz, setar Content-Encoding=gzip; derivar MIME pela base sem .gz
  CA: headers corretos
  Dep: T-016

  _Meta:_ Área: Compressão • Inputs: nome arquivo • Prioridade: P0 • Status: A Fazer • Estimativa: 0.5h

- [ ] **T-018** — Utils — Walk de diretório

  Descrição: Listar arquivos recursivamente; normalizar caminhos POSIX
  CA: lista de paths
  Dep: T-013

  _Meta:_ Área: FS • Inputs: local_dir • Prioridade: P0 • Status: A Fazer • Estimativa: 0.8h

- [ ] **T-019** — Utils — SHA256 de arquivo

  Descrição: Calcular hash p/ idempotência de upload
  CA: hex sha256
  Dep: T-017

  _Meta:_ Área: Hash • Inputs: arquivo • Prioridade: P1 • Status: A Fazer • Estimativa: 0.8h

- [ ] **T-020** — Utils — Pool de promessas

  Descrição: Executor com limite (4–8) e retries simples
  CA: resultados
  Dep: T-017

  _Meta:_ Área: Concorrência • Inputs: lista de jobs • Prioridade: P1 • Status: A Fazer • Estimativa: 1h

- [ ] **T-021** — Storage — Tool azion.create_bucket

  Descrição: POST /v4/storage/buckets; edge_access default read_only; salvar storage_bucket.json
  CA: .mcp-state/storage_bucket.json
  Dep: T-014

  _Meta:_ Área: Bucket • Inputs: .name,.edge_access • Prioridade: P0 • Status: A Fazer • Estimativa: 1h

- [ ] **T-022** — Storage — Idempotência create_bucket

  Descrição: Se já existe, retornar estado/ID existente
  CA: JSON coerente
  Dep: T-021

  _Meta:_ Área: Bucket • Inputs: name • Prioridade: P0 • Status: A Fazer • Estimativa: 0.8h

- [ ] **T-023** — Storage — Tool azion.put_object

  Descrição: POST objetos; body binário; respeitar content_type/encoding
  CA: JSON da API
  Dep: T-016,T-017

  _Meta:_ Área: Upload • Inputs: bucket,object_path,content_b64 • Prioridade: P0 • Status: A Fazer • Estimativa: 1.2h

- [ ] **T-024** — Storage — Erros de upload verbosos

  Descrição: Incluir status, body truncado, dica de causa
  CA: Mensagens claras
  Dep: T-023

  _Meta:_ Área: Upload • Prioridade: P0 • Status: A Fazer • Estimativa: 0.5h

- [ ] **T-025** — Storage — Tool azion.upload_dir

  Descrição: Walk; inferência MIME; .gz → encoding; concurrency; dry_run; index.json (hash)
  CA: uploads.log, index.json
  Dep: T-018,T-019,T-020,T-024

  _Meta:_ Área: Upload • Inputs: bucket,local_dir,strip_gz?,concurrency?,dry_run? • Prioridade: P0 • Status: A Fazer • Estimativa: 3h

- [ ] **T-026** — Storage — Idempotência por hash

  Descrição: Pular upload se sha256 igual salvo em index.json
  CA: uploads otimizados
  Dep: T-026

  _Meta:_ Área: Upload • Inputs: object_path,sha • Prioridade: P1 • Status: A Fazer • Estimativa: 1h

- [ ] **T-027** — Storage — Relatório final de upload

  Descrição: Resumo: enviados, pulados, falhas, duração
  CA: stdout + uploads.log
  Dep: T-026

  _Meta:_ Área: Upload • Prioridade: P1 • Status: A Fazer • Estimativa: 0.5h

- [ ] **T-028** — Edge App & Rules — Tool azion.create_edge_application

  Descrição: Cria app ativa com modules.edge_cache=true (edge_functions opcional)
  CA: edge_application.json
  Dep: T-013

  _Meta:_ Área: App • Inputs: name • Prioridade: P0 • Status: A Fazer • Estimativa: 1h

- [ ] **T-029** — Edge App & Rules — Tool azion.create_edge_connector

  Descrição: type=edge_storage, attributes:{bucket,prefix:'/'}
  CA: edge_connector.json
  Dep: T-030,T-022

  _Meta:_ Área: Connector • Inputs: name,bucket,prefix? • Prioridade: P0 • Status: A Fazer • Estimativa: 1h

- [ ] **T-030** — Edge App & Rules — Tool azion.add_origin_rule

  Descrição: criteria ${uri} starts_with '/'; behavior set_edge_connector
  CA: rule_origin.json
  Dep: T-031

  _Meta:_ Área: Rules • Inputs: edge_application_id,connector_id • Prioridade: P0 • Status: A Fazer • Estimativa: 1h

- [ ] **T-031** — Edge App & Rules — Validação regra de origem

  Descrição: GET rules e confirmar behavior/value esperado
  CA: validation_rules.md
  Dep: T-032

  _Meta:_ Área: Rules • Inputs: edge_application_id • Prioridade: P1 • Status: A Fazer • Estimativa: 0.8h

- [ ] **T-032** — DNS/Domain — Tool azion.create_domain

  Descrição: Cria workload/domain ativo p/ custom domain; HTTP/2 on
  CA: edge_domain.json (workload_id)
  Dep: T-029

  _Meta:_ Área: Domain • Inputs: domain_name,protocols? • Prioridade: P0 • Status: A Fazer • Estimativa: 1.5h

- [ ] **T-033** — DNS/Domain — Tool azion.deploy_domain_to_app

  Descrição: Cria deployment current/active=true p/ app
  CA: deployment.json
  Dep: T-036,T-033

  _Meta:_ Área: Deploy • Inputs: workload_id,edge_application_id • Prioridade: P0 • Status: A Fazer • Estimativa: 1h

- [ ] **T-034** — DNS/Domain — Tool azion.dns_instructions

  Descrição: Gera instruções CNAME (ou nota se Azion DNS)
  CA: dns_instructions.txt
  Dep: T-037

  _Meta:_ Área: DNS • Inputs: workload_id ou endpoint • Prioridade: P1 • Status: A Fazer • Estimativa: 0.5h

- [ ] **T-035** — DNS/Domain — Validação endpoint provisório

  Descrição: Testar domínio *.azionedge.net responde 200 index.html
  CA: validation_dns.md
  Dep: T-038

  _Meta:_ Área: DNS • Inputs: endpoint • Prioridade: P1 • Status: A Fazer • Estimativa: 0.8h

- [ ] **T-036** — WAF — Tool azion.create_firewall

  Descrição: Cria firewall com módulo WAF on; associa domínio
  CA: firewall.json (firewall_id)
  Dep: T-035

  _Meta:_ Área: Firewall • Inputs: name,domains[]? • Prioridade: P0 • Status: A Fazer • Estimativa: 1.5h

- [ ] **T-037** — WAF — Tool azion.create_waf_ruleset

  Descrição: Cria ruleset default (mode blocking)
  CA: waf_ruleset.json
  Dep: T-041

  _Meta:_ Área: Ruleset • Inputs: mode • Prioridade: P0 • Status: A Fazer • Estimativa: 1h

- [ ] **T-038** — WAF — Tool azion.apply_waf_ruleset

  Descrição: Aplica ruleset ao firewall p/ todas as requisições
  CA: firewall_rule.json
  Dep: T-041,T-042

  _Meta:_ Área: Apply • Inputs: firewall_id,waf_ruleset_id • Prioridade: P0 • Status: A Fazer • Estimativa: 1h

- [ ] **T-039** — WAF — Teste de WAF não quebrar estáticos

  Descrição: Acesso às rotas estáticas ok; logs de bloqueio vazios
  CA: validation_waf.md
  Dep: T-043

  _Meta:_ Área: Validação • Inputs: domain • Prioridade: P1 • Status: A Fazer • Estimativa: 1h

- [ ] **T-040** — Workflow — Spec do azion.provision_static_site

  Descrição: Input: domain,bucket,local_dir,strip_gz?,waf_mode?,dry_run?; sequência completa
  CA: spec.md
  Dep: T-023..T-045

  _Meta:_ Área: CLI/Tool • Inputs: spec json • Prioridade: P0 • Status: A Fazer • Estimativa: 1h

- [ ] **T-041** — Workflow — Implementar orquestração passo-a-passo

  Descrição: Invocar em ordem: bucket→upload→app→connector→rule→domain→deploy→waf
  CA: summary.json
  Dep: T-046

  _Meta:_ Área: CLI/Tool • Inputs: inputs do usuário • Prioridade: P0 • Status: A Fazer • Estimativa: 3h

- [ ] **T-042** — Workflow — Persistir IDs e saídas

  Descrição: Salvar em .mcp-state/ (storage_bucket, app, connector, domain, deploy, waf)
  CA: .mcp-state/*.json
  Dep: T-047

  _Meta:_ Área: CLI/Tool • Prioridade: P0 • Status: A Fazer • Estimativa: 0.8h

- [ ] **T-043** — Workflow — Dry-run do orquestrador

  Descrição: Imprimir plano completo sem executar; indicar chamadas e cabeçalhos
  CA: plan.md
  Dep: T-046

  _Meta:_ Área: CLI/Tool • Inputs: params • Prioridade: P1 • Status: A Fazer • Estimativa: 1h

- [ ] **T-044** — Workflow — Relatório final do orquestrador

  Descrição: Resumo de recursos criados/atualizados e próximos passos DNS
  CA: summary.json + stdout
  Dep: T-048

  _Meta:_ Área: CLI/Tool • Prioridade: P1 • Status: A Fazer • Estimativa: 0.7h

- [ ] **T-045** — VSCode — Configurar mcpServers (azion)

  Descrição: Adicionar entry com command/args/cwd/env; prefixo azion.*
  CA: VSCode reconhece tools
  Dep: T-011

  _Meta:_ Área: Cliente • Inputs: settings.json • Prioridade: P0 • Status: A Fazer • Estimativa: 0.7h

- [ ] **T-046** — VSCode — Teste de tools via chat

  Descrição: Chamar create_bucket, upload_dir, create_edge_application, etc.
  CA: prints/retornos
  Dep: T-050

  _Meta:_ Área: Cliente • Inputs: inputs • Prioridade: P0 • Status: A Fazer • Estimativa: 1h

- [ ] **T-047** — VSCode — Logs e troubleshooting

  Descrição: Checklist de erros comuns (env, path, perms)
  CA: TROUBLESHOOTING.md
  Dep: T-052

  _Meta:_ Área: Cliente • Prioridade: P1 • Status: A Fazer • Estimativa: 1h

- [ ] **T-048** — Validação — Script de verificação geral

  Descrição: Confere existência de bucket, app, rule, domain, firewall; tenta GET index
  CA: validation_report.md
  Dep: T-048,T-054

  _Meta:_ Área: Checks • Inputs: ids • Prioridade: P0 • Status: A Fazer • Estimativa: 1.5h

- [ ] **T-049** — Validação — Teste de upload com .gz + strip_gz

  Descrição: Publica app.js.gz como app.js com encoding gzip
  CA: validation_upload_gzip.md
  Dep: T-025

  _Meta:_ Área: Teste • Inputs: bucket,local_dir • Prioridade: P1 • Status: A Fazer • Estimativa: 0.8h

- [ ] **T-050** — Validação — Teste de mimetypes (html, css, js, svg, png, webp, json, map)

  Descrição: Respostas corretas no browser/curl
  CA: validation_mime.md
  Dep: T-016,T-023

  _Meta:_ Área: Teste • Inputs: arquivos amostra • Prioridade: P1 • Status: A Fazer • Estimativa: 1h

- [ ] **T-051** — Validação — Teste de idempotência (hash)

  Descrição: 2ª execução não reenvia arquivos inalterados
  CA: validation_idempotency.md
  Dep: T-026

  _Meta:_ Área: Teste • Inputs: index.json • Prioridade: P1 • Status: A Fazer • Estimativa: 0.8h

- [ ] **T-052** — Validação — Teste de erros forçados

  Descrição: Token inválido, bucket inexistente, path inválido
  CA: error_matrix.md
  Dep: T-023,T-024

  _Meta:_ Área: Teste • Inputs: cenários • Prioridade: P1 • Status: A Fazer • Estimativa: 1h

- [ ] **T-053** — Observabilidade — Estruturar uploads.log em JSONL

  Descrição: Cada linha com path,status,duração,bytes,sha
  CA: uploads.log
  Dep: T-024

  _Meta:_ Área: Logs • Prioridade: P1 • Status: A Fazer • Estimativa: 0.5h

- [ ] **T-054** — Observabilidade — Exportar resumo em CSV opcional

  Descrição: path,action,status,bytes,sha
  CA: uploads_summary.csv
  Dep: T-071

  _Meta:_ Área: Relatórios • Prioridade: P2 • Status: A Fazer • Estimativa: 0.5h

- [ ] **T-055** — Segurança — Nunca logar tokens

  Descrição: Revisão de logs/códigos
  CA: ok
  Dep: T-009

  _Meta:_ Área: Segredos • Prioridade: P0 • Status: A Fazer • Estimativa: 0.2h

- [ ] **T-056** — Segurança — Tratar 401/403 com dica

  Descrição: Mensagem sugere revisar token e escopos
  CA: erro guiado
  Dep: T-023

  _Meta:_ Área: Permissões • Prioridade: P1 • Status: A Fazer • Estimativa: 0.3h

- [ ] **T-057** — DevEx — Mensagens curtas e técnicas

  Descrição: Uma linha com o porquê antes do como
  CA: padrão textos
  Dep: T-011

  _Meta:_ Área: UX • Prioridade: P2 • Status: A Fazer • Estimativa: 0.3h

- [ ] **T-058** — DevEx — Exemplos de chamadas no chat

  Descrição: Snippets do que pedir ao agente
  CA: README.md seção
  Dep: T-053

  _Meta:_ Área: Docs • Prioridade: P2 • Status: A Fazer • Estimativa: 0.5h

- [ ] **T-059** — Hardening — Upload de arquivos grandes

  Descrição: Chunk opcional ou aviso de limite; timeout maior
  CA: nota + retry
  Dep: T-024

  _Meta:_ Área: Edge Cases • Inputs: file grande • Prioridade: P2 • Status: A Fazer • Estimativa: 1h

- [ ] **T-060** — Hardening — Nomes com espaços e unicode

  Descrição: Encode correto no object_path
  CA: sucesso upload
  Dep: T-024

  _Meta:_ Área: Edge Cases • Inputs: paths • Prioridade: P2 • Status: A Fazer • Estimativa: 0.5h

- [ ] **T-061** — Hardening — Pastas vazias e .dotfiles

  Descrição: Ignorar pastas vazias; decisão sobre .env/.DS_Store
  CA: regra aplicada
  Dep: T-024

  _Meta:_ Área: Edge Cases • Inputs: local_dir • Prioridade: P2 • Status: A Fazer • Estimativa: 0.3h

- [ ] **T-062** — Hardening — Simulação DNS indisponível

  Descrição: Mensagem clara e alternativa por endpoint provisório
  CA: nota no summary
  Dep: T-038,T-039

  _Meta:_ Área: Edge Cases • Prioridade: P2 • Status: A Fazer • Estimativa: 0.5h

- [ ] **T-063** — Entrega — Script quickstart

  Descrição: Um comando: export envs + run; doc curta
  CA: quickstart.sh (sem segredos)
  Dep: T-018,T-050

  _Meta:_ Área: Onboarding • Prioridade: P2 • Status: A Fazer • Estimativa: 0.5h

- [ ] **T-064** — Entrega — Template de issues

  Descrição: Bugs/Features/Tasks com checklists
  CA: .github/ISSUE_TEMPLATE
  Dep: T-001

  _Meta:_ Área: Onboarding • Prioridade: P3 • Status: A Fazer • Estimativa: 0.5h

- [ ] **T-065** — Entrega — Changelog inicial

  Descrição: Registrar decisões e quebras
  CA: CHANGELOG.md
  Dep: T-001

  _Meta:_ Área: Onboarding • Prioridade: P3 • Status: A Fazer • Estimativa: 0.5h

- [ ] **T-066** — Fechamento — Validar critérios globais

  Descrição: Todos passos OK; site servindo; WAF aplicado; summary gerado
  CA: DoD_checked.md
  Dep: T-060..T-065

  _Meta:_ Área: DoD • Prioridade: P0 • Status: A Fazer • Estimativa: 0.5h

- [ ] **T-067** — Fechamento — Roteiro de demo

  Descrição: Sequência de comandos e prints pro showcase
  CA: DEMO.md
  Dep: T-079,T-080

  _Meta:_ Área: Demo • Prioridade: P1 • Status: A Fazer • Estimativa: 0.5h


# To-Do — Continuação (T-121..T-220)
_Data: 2025-10-18_

- [ ] **T-121** — Azion DNS — Importar zona (opcional)
  
  Descrição: Criar/associar zona DNS na Azion para domínio custom.
  CA: Zona criada/associada.
  Dep: T-041
  
  _Labels:_ `dns,aziondns`

- [ ] **T-122** — Azion DNS — Criar registro CNAME
  
  Descrição: Criar CNAME do host (www) para endpoint provisório gerado.
  CA: CNAME ativo na zona.
  Dep: T-121,T-043
  
  _Labels:_ `dns,aziondns`

- [ ] **T-123** — Azion DNS — Registro A/AAAA (quando aplicável)
  
  Descrição: Criar A/AAAA se necessário para raiz (ALIAS/ANAME).
  CA: Raiz do domínio resolvendo.
  Dep: T-122
  
  _Labels:_ `dns,aziondns`

- [ ] **T-124** — Azion DNS — TTL e política de cache
  
  Descrição: Definir TTL inicial (300s) e revisar política.
  CA: TTL aplicado.
  Dep: T-123
  
  _Labels:_ `dns,cache`

- [ ] **T-125** — Azion DNS — Validação de propagação
  
  Descrição: Executar dig/nslookup e registrar tempos de propagação.
  CA: report_dns_propagation.md.
  Dep: T-124
  
  _Labels:_ `dns,qa`

- [ ] **T-126** — Azion DNS — Alerta de expiração de zona
  
  Descrição: Checklist/cron para lembrar renovação de zona/domínio.
  CA: alerta cadastrado.
  Dep: T-125
  
  _Labels:_ `dns,ops`

- [ ] **T-127** — Azion DNS — Failover de registros (opcional)
  
  Descrição: Planejar fallback para origem alternativa se app cair.
  CA: plano documentado.
  Dep: T-126
  
  _Labels:_ `dns,ha`

- [ ] **T-128** — Azion DNS — Remoção segura (teardown)
  
  Descrição: Procedimento de deleção de registros com validação.
  CA: teardown_dns.md.
  Dep: T-127
  
  _Labels:_ `dns,teardown`

- [ ] **T-129** — Azion DNS — Script de verificação
  
  Descrição: Automatizar checagens de resolução e TTL.
  CA: dns_check.sh.
  Dep: T-128
  
  _Labels:_ `dns,qa`

- [ ] **T-130** — Azion DNS — Documentar boas práticas
  
  Descrição: Registrar naming, TTL, split-horizon (se aplicável).
  CA: dns_best_practices.md.
  Dep: T-129
  
  _Labels:_ `dns,docs`

- [ ] **T-131** — Teardown — Planejamento seguro
  
  Descrição: Plano com checkpoints para remoção: domain→deploy→rules→connector→app→objects→bucket.
  CA: teardown_plan.md.
  Dep: T-052,T-040
  
  _Labels:_ `teardown,planning`

- [ ] **T-132** — Teardown — Flag de confirmação dupla
  
  Descrição: Requer `--confirm` e digitar o domínio para prosseguir.
  CA: dupla confirmação implementada.
  Dep: T-131
  
  _Labels:_ `teardown,ux`

- [ ] **T-133** — Teardown — Backup de estado
  
  Descrição: Exportar .mcp-state antes de deletar (tar.gz).
  CA: state_backup.tgz.
  Dep: T-132
  
  _Labels:_ `teardown,state`

- [ ] **T-134** — Teardown — Deletar rules (sequência)
  
  Descrição: Listar e remover rules da app com ordem correta.
  CA: rules removidas.
  Dep: T-133,T-038
  
  _Labels:_ `teardown,rules`

- [ ] **T-135** — Teardown — Deletar connector
  
  Descrição: Remover connector e esperar consistência.
  CA: connector removido.
  Dep: T-134,T-036
  
  _Labels:_ `teardown,connector`

- [ ] **T-136** — Teardown — Desativar app
  
  Descrição: Set active=false antes de deleção.
  CA: app desativada.
  Dep: T-135,T-034
  
  _Labels:_ `teardown,edgeapp`

- [ ] **T-137** — Teardown — Apagar app
  
  Descrição: DELETE application; tratar 409/423 se houver vínculos.
  CA: app removida.
  Dep: T-136
  
  _Labels:_ `teardown,edgeapp`

- [ ] **T-138** — Teardown — Listar e remover objetos
  
  Descrição: Percorrer prefixos e excluir objetos remanescentes.
  CA: bucket vazio.
  Dep: T-137,T-028
  
  _Labels:_ `teardown,storage`

- [ ] **T-139** — Teardown — Apagar bucket
  
  Descrição: DELETE bucket quando vazio; tratar 409 se não vazio.
  CA: bucket removido.
  Dep: T-138
  
  _Labels:_ `teardown,storage`

- [ ] **T-140** — Teardown — Remover domain/deploy
  
  Descrição: Remover deployment e workload/domain.
  CA: domain removido.
  Dep: T-139,T-042,T-043
  
  _Labels:_ `teardown,dns`

- [ ] **T-141** — Teardown — Remover firewall e WAF ruleset
  
  Descrição: Excluir firewall e ruleset; ordem correta.
  CA: waf removido.
  Dep: T-140,T-048
  
  _Labels:_ `teardown,waf`

- [ ] **T-142** — Teardown — Pós-validação
  
  Descrição: Certificar que nada responde no endpoint.
  CA: teardown_report.md.
  Dep: T-141
  
  _Labels:_ `teardown,qa`

- [ ] **T-143** — Teardown — Script único
  
  Descrição: Implementar `azion.teardown_site` com passos e dry-run.
  CA: teardown_summary.json.
  Dep: T-142
  
  _Labels:_ `teardown,workflow`

- [ ] **T-144** — Teardown — Documentação de riscos
  
  Descrição: Listar riscos e mitigação (deleções irreversíveis).
  CA: teardown_risks.md.
  Dep: T-143
  
  _Labels:_ `teardown,docs`

- [ ] **T-145** — Teardown — Proteção contra produção
  
  Descrição: Bloquear execução se label=prod sem override explícito.
  CA: guardas implementados.
  Dep: T-144
  
  _Labels:_ `teardown,security`

- [ ] **T-146** — Teardown — Auditoria
  
  Descrição: Log de deleções com timestamps e IDs.
  CA: teardown_audit.log.
  Dep: T-145
  
  _Labels:_ `teardown,observability`

- [ ] **T-147** — Teardown — Restore parcial (opcional)
  
  Descrição: Restaurar app e domain a partir do backup .mcp-state.
  CA: restore.md.
  Dep: T-146
  
  _Labels:_ `teardown,recovery`

- [ ] **T-148** — Teardown — Teste e2e
  
  Descrição: Criar e destruir ambiente dummy para validar roteiro.
  CA: teardown_e2e.md.
  Dep: T-147
  
  _Labels:_ `teardown,qa`

- [ ] **T-149** — Teardown — Integração CI
  
  Descrição: Job manual (workflow_dispatch) com flags de segurança.
  CA: ci_teardown.yml.
  Dep: T-148,T-166
  
  _Labels:_ `teardown,ci`

- [ ] **T-149** — Teardown — Planejamento seguro
  
  Descrição: Plano com checkpoints para remoção: domain→deploy→rules→connector→app→objects→bucket.
  CA: teardown_plan.md.
  Dep: T-052,T-040
  
  _Labels:_ `teardown,planning`

- [ ] **T-150** — Teardown — Flag de confirmação dupla
  
  Descrição: Requer `--confirm` e digitar o domínio para prosseguir.
  CA: dupla confirmação implementada.
  Dep: T-149
  
  _Labels:_ `teardown,ux`

- [ ] **T-151** — Teardown — Backup de estado
  
  Descrição: Exportar .mcp-state antes de deletar (tar.gz).
  CA: state_backup.tgz.
  Dep: T-150
  
  _Labels:_ `teardown,state`

- [ ] **T-152** — Teardown — Deletar rules (sequência)
  
  Descrição: Listar e remover rules da app com ordem correta.
  CA: rules removidas.
  Dep: T-151,T-038
  
  _Labels:_ `teardown,rules`

- [ ] **T-153** — Teardown — Deletar connector
  
  Descrição: Remover connector e esperar consistência.
  CA: connector removido.
  Dep: T-152,T-036
  
  _Labels:_ `teardown,connector`

- [ ] **T-154** — Teardown — Desativar app
  
  Descrição: Set active=false antes de deleção.
  CA: app desativada.
  Dep: T-153,T-034
  
  _Labels:_ `teardown,edgeapp`

- [ ] **T-155** — Teardown — Apagar app
  
  Descrição: DELETE application; tratar 409/423 se houver vínculos.
  CA: app removida.
  Dep: T-154
  
  _Labels:_ `teardown,edgeapp`

- [ ] **T-156** — Teardown — Listar e remover objetos
  
  Descrição: Percorrer prefixos e excluir objetos remanescentes.
  CA: bucket vazio.
  Dep: T-155,T-028
  
  _Labels:_ `teardown,storage`

- [ ] **T-157** — Teardown — Apagar bucket
  
  Descrição: DELETE bucket quando vazio; tratar 409 se não vazio.
  CA: bucket removido.
  Dep: T-156
  
  _Labels:_ `teardown,storage`

- [ ] **T-158** — Teardown — Remover domain/deploy
  
  Descrição: Remover deployment e workload/domain.
  CA: domain removido.
  Dep: T-157,T-042,T-043
  
  _Labels:_ `teardown,dns`

- [ ] **T-159** — Teardown — Remover firewall e WAF ruleset
  
  Descrição: Excluir firewall e ruleset; ordem correta.
  CA: waf removido.
  Dep: T-158,T-048
  
  _Labels:_ `teardown,waf`

- [ ] **T-160** — Teardown — Pós-validação
  
  Descrição: Certificar que nada responde no endpoint.
  CA: teardown_report.md.
  Dep: T-159
  
  _Labels:_ `teardown,qa`

- [ ] **T-161** — Teardown — Script único
  
  Descrição: Implementar `azion.teardown_site` com passos e dry-run.
  CA: teardown_summary.json.
  Dep: T-160
  
  _Labels:_ `teardown,workflow`

- [ ] **T-162** — Teardown — Documentação de riscos
  
  Descrição: Listar riscos e mitigação (deleções irreversíveis).
  CA: teardown_risks.md.
  Dep: T-161
  
  _Labels:_ `teardown,docs`

- [ ] **T-163** — Teardown — Proteção contra produção
  
  Descrição: Bloquear execução se label=prod sem override explícito.
  CA: guardas implementados.
  Dep: T-162
  
  _Labels:_ `teardown,security`

- [ ] **T-164** — Teardown — Auditoria
  
  Descrição: Log de deleções com timestamps e IDs.
  CA: teardown_audit.log.
  Dep: T-163
  
  _Labels:_ `teardown,observability`

- [ ] **T-165** — Teardown — Restore parcial (opcional)
  
  Descrição: Restaurar app e domain a partir do backup .mcp-state.
  CA: restore.md.
  Dep: T-164
  
  _Labels:_ `teardown,recovery`

- [ ] **T-166** — Teardown — Teste e2e
  
  Descrição: Criar e destruir ambiente dummy para validar roteiro.
  CA: teardown_e2e.md.
  Dep: T-165
  
  _Labels:_ `teardown,qa`

- [ ] **T-167** — Teardown — Integração CI
  
  Descrição: Job manual (workflow_dispatch) com flags de segurança.
  CA: ci_teardown.yml.
  Dep: T-166,T-166
  
  _Labels:_ `teardown,ci`

- [ ] **T-167** — CI/CD — Workflow de build estático
  
  Descrição: YAML com passos de checkout, build (se houver) e artifact.
  CA: build.yml criado.
  Dep: T-057
  
  _Labels:_ `ci,build`

- [ ] **T-168** — CI/CD — Job de deploy (Azion)
  
  Descrição: Executar orquestrador com AZION_TOKEN do secrets.
  CA: deploy.yml criado.
  Dep: T-167,T-051
  
  _Labels:_ `ci,deploy`

- [ ] **T-169** — CI/CD — Strategy matrix (branches)
  
  Descrição: Executar em main e tags v*; bloquear em PRs se necessário.
  CA: matrix aplicada.
  Dep: T-168
  
  _Labels:_ `ci,policy`

- [ ] **T-170** — CI/CD — Cache de dependências
  
  Descrição: Usar actions/cache p/ node_modules e dist.
  CA: cache ativo.
  Dep: T-169
  
  _Labels:_ `ci,perf`

- [ ] **T-171** — CI/CD — Notifications (opcional)
  
  Descrição: Notificar canal/telegram ao finalizar deploy/erro.
  CA: notificações integradas.
  Dep: T-170
  
  _Labels:_ `ci,ops`

- [ ] **T-172** — CI/CD — Gate de aprovação (prod)
  
  Descrição: Requer aprovação manual antes de produção.
  CA: ambiente protegido.
  Dep: T-171
  
  _Labels:_ `ci,security`

- [ ] **T-173** — CI/CD — Secrets management
  
  Descrição: AZION_TOKEN, DOMAIN, BUCKET como secrets; sem logs.
  CA: secrets configurados.
  Dep: T-172
  
  _Labels:_ `ci,security`

- [ ] **T-174** — CI/CD — Relatório pós-deploy
  
  Descrição: Publicar summary.json como artifact.
  CA: artifact disponível.
  Dep: T-173
  
  _Labels:_ `ci,observability`

- [ ] **T-175** — CI/CD — Rollback manual
  
  Descrição: Workflow para reverter para N-1 (domain->prev app/deploy).
  CA: rollback.yml.
  Dep: T-174,T-034
  
  _Labels:_ `ci,rollback`

- [ ] **T-176** — CI/CD — Canary (10→50→100%)
  
  Descrição: Strategy para gradualmente promover tráfego se app suportar.
  CA: canary.yml.
  Dep: T-175
  
  _Labels:_ `ci,traffic`

- [ ] **T-177** — CI/CD — Lint de YAML
  
  Descrição: Validação de workflows com action específica.
  CA: lint ok.
  Dep: T-176
  
  _Labels:_ `ci,qa`

- [ ] **T-178** — CI/CD — Re-run com artifacts
  
  Descrição: Permitir reexecução usando artifacts anteriores (cache).
  CA: re-run configurado.
  Dep: T-177
  
  _Labels:_ `ci,reliability`

- [ ] **T-179** — CI/CD — Pipeline docs
  
  Descrição: Documentar triggers, ambientes e variáveis.
  CA: ci_docs.md.
  Dep: T-178
  
  _Labels:_ `ci,docs`

- [ ] **T-180** — CI/CD — Branch protection rules
  
  Descrição: Configurar proteções + status checks obrigatórios.
  CA: regras aplicadas.
  Dep: T-179
  
  _Labels:_ `ci,policy`

- [ ] **T-181** — CI/CD — Teste e2e do pipeline
  
  Descrição: Executar em ambiente dummy e validar sucesso.
  CA: ci_e2e.md.
  Dep: T-180
  
  _Labels:_ `ci,qa`

- [ ] **T-182** — CI/CD — Limpeza de artifacts antigos
  
  Descrição: Rotina para expirar artifacts > N dias.
  CA: retention configurada.
  Dep: T-181
  
  _Labels:_ `ci,ops`

- [ ] **T-183** — CI/CD — Parâmetros de release
  
  Descrição: Permitir setar versão/tag e nota de release.
  CA: release parametrizada.
  Dep: T-182
  
  _Labels:_ `ci,release`

- [ ] **T-184** — CI/CD — Template de release notes
  
  Descrição: Gerar CHANGELOG parcial com commits.
  CA: release_notes.md.
  Dep: T-183
  
  _Labels:_ `ci,docs`

- [ ] **T-185** — CI/CD — Step de validação HTTP
  
  Descrição: curl no endpoint final; esperar 200 + asset.
  CA: check http ok.
  Dep: T-184,T-061
  
  _Labels:_ `ci,qa`

- [ ] **T-186** — CI/CD — Injeção de headers via API
  
  Descrição: Verificar/ajustar headers no storage/aplicação durante deploy.
  CA: headers consistentes.
  Dep: T-185
  
  _Labels:_ `ci,perf`

- [ ] **T-186** — Headers — Cache-Control para estáticos
  
  Descrição: Definir s-maxage, immutable quando aplicável.
  CA: headers_cache.md.
  Dep: T-028
  
  _Labels:_ `perf,cache`

- [ ] **T-187** — Headers — ETag/If-None-Match
  
  Descrição: Habilitar validação condicional (quando suportado).
  CA: etag habilitado.
  Dep: T-186
  
  _Labels:_ `perf,cache`

- [ ] **T-188** — Headers — Content-Security-Policy
  
  Descrição: Definir CSP básica segura p/ site estático.
  CA: csp.md.
  Dep: T-187
  
  _Labels:_ `security,headers`

- [ ] **T-189** — Headers — HSTS
  
  Descrição: Strict-Transport-Security com preload opcional.
  CA: hsts.md.
  Dep: T-188
  
  _Labels:_ `security,headers`

- [ ] **T-190** — Headers — MIME-Sniffing
  
  Descrição: X-Content-Type-Options: nosniff.
  CA: nosniff aplicado.
  Dep: T-189
  
  _Labels:_ `security,headers`

- [ ] **T-191** — Headers — Referrer-Policy
  
  Descrição: Definir policy (no-referrer / strict-origin-when-cross-origin).
  CA: referrer_policy.md.
  Dep: T-190
  
  _Labels:_ `privacy,headers`

- [ ] **T-192** — Headers — X-Frame-Options
  
  Descrição: deny/sameorigin conforme necessidade.
  CA: xfo aplicado.
  Dep: T-191
  
  _Labels:_ `security,headers`

- [ ] **T-193** — Headers — Brotli (opcional)
  
  Descrição: Suporte a .br além de .gz se disponível.
  CA: br_support.md.
  Dep: T-192
  
  _Labels:_ `perf,compression`

- [ ] **T-194** — Perf — Preload/Preconnect
  
  Descrição: Incluir hints para assets críticos.
  CA: perf_hints.md.
  Dep: T-193
  
  _Labels:_ `perf,frontend`

- [ ] **T-195** — Perf — Medir p95/p99
  
  Descrição: Coletar latência p95/p99 do endpoint.
  CA: perf_report.md.
  Dep: T-194
  
  _Labels:_ `perf,observability`

- [ ] **T-196** — Perf — Cache HIT ratio
  
  Descrição: Medir % de cache-hit e ajustar TTLs.
  CA: cache_report.md.
  Dep: T-195
  
  _Labels:_ `perf,observability`

- [ ] **T-197** — Perf — Warmup opcional
  
  Descrição: Varredura inicial de URLs críticas para aquecer cache.
  CA: warmup.md.
  Dep: T-196
  
  _Labels:_ `perf,ops`

- [ ] **T-198** — Perf — Imagens estáticas
  
  Descrição: Checar formatos otimizados (webp) e compressão.
  CA: img_audit.md.
  Dep: T-197
  
  _Labels:_ `perf,frontend`

- [ ] **T-199** — WAF — Sensibilidade fina
  
  Descrição: Ajustar sensibilidade por família (SQLi/XSS).
  CA: waf_tuning.md.
  Dep: T-198
  
  _Labels:_ `waf,security`

- [ ] **T-200** — WAF — Allow-list
  
  Descrição: Listar IPs/paths permitidos se necessário (admin).
  CA: allow_list.md.
  Dep: T-199
  
  _Labels:_ `waf,security`

- [ ] **T-201** — WAF — Monitoramento de falsos positivos
  
  Descrição: Procedimento para reclassificar e ajustar regras.
  CA: waf_fp.md.
  Dep: T-200
  
  _Labels:_ `waf,qa`

- [ ] **T-202** — WAF — Integração SIEM (opcional)
  
  Descrição: Enviar eventos para SIEM/Telegram.
  CA: waf_siem.md.
  Dep: T-201
  
  _Labels:_ `waf,ops`

- [ ] **T-203** — WAF — Stress test controlado
  
  Descrição: Executar testes controlados sem afetar prod.
  CA: waf_stress.md.
  Dep: T-202
  
  _Labels:_ `waf,qa`

- [ ] **T-204** — WAF — Playbook de incidentes
  
  Descrição: Como responder a bloqueios legítimos e ataques reais.
  CA: waf_playbook.md.
  Dep: T-203
  
  _Labels:_ `waf,docs`

- [ ] **T-204** — MCP — Multi-servers (git)
  
  Descrição: Adicionar servidor MCP para git (branch, tag, release).
  CA: git-mcp registrado.
  Dep: T-056
  
  _Labels:_ `mcp,git`

- [ ] **T-205** — MCP — Multi-servers (dns)
  
  Descrição: Adicionar servidor MCP para DNS externo (cloudflare/route53).
  CA: dns-mcp registrado.
  Dep: T-204
  
  _Labels:_ `mcp,dns`

- [ ] **T-206** — MCP — Resources (templates)
  
  Descrição: Expor resources com templates de YAML/JSON (workflows).
  CA: resources listados.
  Dep: T-205
  
  _Labels:_ `mcp,resources`

- [ ] **T-207** — MCP — Prompts (assistenciais)
  
  Descrição: Prompts que guiam usuário a fornecer inputs corretos.
  CA: prompts disponíveis.
  Dep: T-206
  
  _Labels:_ `mcp,prompts`

- [ ] **T-208** — MCP — Tool orquestradora de rollback
  
  Descrição: Adicionar tool `azion.rollback_to_previous`.
  CA: rollback executável.
  Dep: T-170,T-034
  
  _Labels:_ `mcp,rollback`

- [ ] **T-209** — MCP — Metrics resource
  
  Descrição: Resource com últimos KPIs (latência, hit ratio).
  CA: metrics.json.
  Dep: T-195,T-196
  
  _Labels:_ `mcp,observability`

- [ ] **T-210** — MCP — Error matrix resource
  
  Descrição: Resource com catálogo de erros e soluções.
  CA: error_matrix.json.
  Dep: T-077
  
  _Labels:_ `mcp,qa`

- [ ] **T-211** — Docs — Guia avançado
  
  Descrição: Guia de operação: DNS gerenciado, WAF tuning, rollback.
  CA: OPERATIONS.md.
  Dep: T-181..T-200
  
  _Labels:_ `docs,advanced`

- [ ] **T-212** — Docs — Diagramas de fluxo
  
  Descrição: Fluxos do orquestrador e teardown (mermaid).
  CA: diagrams.md.
  Dep: T-131..T-150,T-152
  
  _Labels:_ `docs,diagrams`

- [ ] **T-213** — Release — MVP Final
  
  Descrição: Tag de release, changelog e artefatos anexos.
  CA: v1.0.0 publicado.
  Dep: T-151..T-200,T-210..T-219
  
  _Labels:_ `release`

- [ ] **T-213** — MCP — Multi-servers (git)
  
  Descrição: Adicionar servidor MCP para git (branch, tag, release).
  CA: git-mcp registrado.
  Dep: T-056
  
  _Labels:_ `mcp,git`

- [ ] **T-214** — MCP — Multi-servers (dns)
  
  Descrição: Adicionar servidor MCP para DNS externo (cloudflare/route53).
  CA: dns-mcp registrado.
  Dep: T-213
  
  _Labels:_ `mcp,dns`

- [ ] **T-215** — MCP — Resources (templates)
  
  Descrição: Expor resources com templates de YAML/JSON (workflows).
  CA: resources listados.
  Dep: T-214
  
  _Labels:_ `mcp,resources`

- [ ] **T-216** — MCP — Prompts (assistenciais)
  
  Descrição: Prompts que guiam usuário a fornecer inputs corretos.
  CA: prompts disponíveis.
  Dep: T-215
  
  _Labels:_ `mcp,prompts`

- [ ] **T-217** — MCP — Tool orquestradora de rollback
  
  Descrição: Adicionar tool `azion.rollback_to_previous`.
  CA: rollback executável.
  Dep: T-170,T-034
  
  _Labels:_ `mcp,rollback`

- [ ] **T-218** — MCP — Metrics resource
  
  Descrição: Resource com últimos KPIs (latência, hit ratio).
  CA: metrics.json.
  Dep: T-195,T-196
  
  _Labels:_ `mcp,observability`

- [ ] **T-219** — MCP — Error matrix resource
  
  Descrição: Resource com catálogo de erros e soluções.
  CA: error_matrix.json.
  Dep: T-077
  
  _Labels:_ `mcp,qa`

- [ ] **T-220** — Docs — Guia avançado
  
  Descrição: Guia de operação: DNS gerenciado, WAF tuning, rollback.
  CA: OPERATIONS.md.
  Dep: T-181..T-200
  
  _Labels:_ `docs,advanced`

- [ ] **T-221** — Docs — Diagramas de fluxo
  
  Descrição: Fluxos do orquestrador e teardown (mermaid).
  CA: diagrams.md.
  Dep: T-131..T-150,T-152
  
  _Labels:_ `docs,diagrams`

- [ ] **T-222** — Release — MVP Final
  
  Descrição: Tag de release, changelog e artefatos anexos.
  CA: v1.0.0 publicado.
  Dep: T-151..T-200,T-210..T-219
  
  _Labels:_ `release`


# To-Do — Continuação (T-221..T-320)
_Data: 2025-10-18_

- [ ] **T-221** — Blueprint Blue/Green — desenho do fluxo
  
  Descrição: Definir estratégia de manter duas versões (blue, green) e alternar tráfego.
  CA: Documento blue_green.md.
  Dep: T-151,T-170
  
  _Labels:_ `deploy,bluegreen`

- [ ] **T-222** — Tool: preparar ambiente 'green'
  
  Descrição: Criar app/clones de config para ambiente 'green' sem afetar produção.
  CA: app green criada.
  Dep: T-221,T-034
  
  _Labels:_ `deploy,bluegreen`

- [ ] **T-223** — Tool: switch de tráfego (blue→green)
  
  Descrição: Promover tráfego gradualmente 10→50→100% com rollback.
  CA: switch executável.
  Dep: T-222,T-169
  
  _Labels:_ `deploy,bluegreen`

- [ ] **T-224** — Validação Blue/Green
  
  Descrição: Checklist de verificação antes e depois de switch.
  CA: bluegreen_checklist.md.
  Dep: T-223
  
  _Labels:_ `deploy,qa`

- [ ] **T-225** — Feature Flags — design
  
  Descrição: Escolher mecanismo de flags (config JSON/state) sem framework.
  CA: feature_flags.md.
  Dep: T-221
  
  _Labels:_ `features,design`

- [ ] **T-226** — Tool: set_feature_flag
  
  Descrição: Tool MCP que liga/desliga flags e persiste em .mcp-state/flags.json.
  CA: flags.json atualizado.
  Dep: T-225
  
  _Labels:_ `features,mcp`

- [ ] **T-227** — Validação de flags
  
  Descrição: Simulações de liga/desliga e efeito na orquestração.
  CA: flags_tests.md.
  Dep: T-226
  
  _Labels:_ `features,qa`

- [ ] **T-228** — Config multi-ambientes — convenções
  
  Descrição: Definir naming p/ recursos (prefixo dev/stage/prod).
  CA: naming.md.
  Dep: T-057,T-051
  
  _Labels:_ `env,governance`

- [ ] **T-229** — Profiles de execução
  
  Descrição: Permitir `--env dev|stage|prod` no orquestrador.
  CA: profiles suportados.
  Dep: T-228
  
  _Labels:_ `env,workflow`

- [ ] **T-230** — Separação de estados por ambiente
  
  Descrição: Salvar .mcp-state/<env>/*.json para isolar IDs.
  CA: estados isolados.
  Dep: T-229
  
  _Labels:_ `env,state`

- [ ] **T-231** — Proteções em prod
  
  Descrição: Confirmações extras e bloqueios para ações destrutivas.
  CA: guards_prod.md.
  Dep: T-230
  
  _Labels:_ `env,security`

- [ ] **T-232** — Inventário de migração
  
  Descrição: Planilha de domínios, buckets e assets a migrar.
  CA: migration_inventory.csv.
  Dep: T-028,T-041
  
  _Labels:_ `migration,planning`

- [ ] **T-233** — Ferramenta de comparação de assets
  
  Descrição: Comparar local vs remoto (hash) para minimizar uploads.
  CA: diff_assets.md.
  Dep: T-231,T-028
  
  _Labels:_ `migration,perf`

- [ ] **T-234** — Janela de migração (runbook)
  
  Descrição: Procedimento controlado para cortar tráfego.
  CA: migration_runbook.md.
  Dep: T-222,T-233
  
  _Labels:_ `migration,ops`

- [ ] **T-235** — Pós-migração — verificação
  
  Descrição: Checklist de equivalência (conteúdo e headers).
  CA: post_migration_check.md.
  Dep: T-234
  
  _Labels:_ `migration,qa`

- [ ] **T-236** — Matriz de segredos
  
  Descrição: Quais segredos por ambiente e por servidor MCP.
  CA: secrets_matrix.md.
  Dep: T-230,T-056
  
  _Labels:_ `security,secrets`

- [ ] **T-237** — Carregamento seguro de env
  
  Descrição: Suporte a leitura via VSCode secrets / env do sistema.
  CA: guia de secrets.
  Dep: T-237
  
  _Labels:_ `security,secrets`

- [ ] **T-238** — Scanner de vazamento
  
  Descrição: Checar repositório contra vazamento de tokens.
  CA: scan report.
  Dep: T-238
  
  _Labels:_ `security,qa`

- [ ] **T-239** — Design multi-tenant
  
  Descrição: Suportar múltiplos projetos/domínios no mesmo CLI (profiles).
  CA: multitenant.md.
  Dep: T-229
  
  _Labels:_ `architecture,design`

- [ ] **T-240** — State por projeto
  
  Descrição: Estrutura .mcp-state/<project>/<env>/ para outputs.
  CA: states por projeto.
  Dep: T-241
  
  _Labels:_ `state,governance`

- [ ] **T-241** — Seleção de projeto via flag
  
  Descrição: Adicionar `--project` às tools e orquestrador.
  CA: CLI aceita projeto.
  Dep: T-242
  
  _Labels:_ `cli,ux`

- [ ] **T-242** — Rate limiting — design
  
  Descrição: Mapear limites da API; backoff + retries.
  CA: rate_limit.md.
  Dep: T-017,T-025
  
  _Labels:_ `perf,reliability`

- [ ] **T-243** — Implementar backoff exponencial
  
  Descrição: Retries com jitter para 429/5xx.
  CA: backoff aplicado.
  Dep: T-244
  
  _Labels:_ `reliability,utils`

- [ ] **T-244** — Quota-aware uploads
  
  Descrição: Pausar/resumir lote se quota perto do limite.
  CA: upload flow robusto.
  Dep: T-245
  
  _Labels:_ `reliability,storage`

- [ ] **T-245** — Definir SLOs (Disponibilidade e Latência)
  
  Descrição: SLO de 99.9% e p95 < 200ms (exemplo); error budget.
  CA: slos.md.
  Dep: T-061,T-196
  
  _Labels:_ `reliability,goals`

- [ ] **T-246** — Painel de métricas mínimo
  
  Descrição: Dashboard simples (latência, hit ratio, erros).
  CA: metrics_dashboard.md.
  Dep: T-247
  
  _Labels:_ `observability,metrics`

- [ ] **T-247** — Alertas básicos
  
  Descrição: Alertas quando p95 ou 5xx excederem thresholds.
  CA: alerts.md.
  Dep: T-248
  
  _Labels:_ `observability,alerts`

- [ ] **T-248** — Jogo do caos (simples)
  
  Descrição: Simular falhas de upload e ver resiliência do workflow.
  CA: chaos_report.md.
  Dep: T-246
  
  _Labels:_ `resilience,qa`

- [ ] **T-249** — Teste de failover DNS (se usar Azion DNS)
  
  Descrição: Troca controlada de registro para validar fallback.
  CA: dns_failover_test.md.
  Dep: T-121..T-130
  
  _Labels:_ `resilience,dns`

- [ ] **T-250** — Estimativa de custos
  
  Descrição: Planilha com volumes e estimativa (storage/transfer).
  CA: costs_estimate.xlsx.
  Dep: T-028,T-196
  
  _Labels:_ `costs,planning`

- [ ] **T-251** — Otimização de assets
  
  Descrição: Checar compressões e tamanhos para reduzir banda.
  CA: asset_optimization.md.
  Dep: T-255
  
  _Labels:_ `costs,perf`

- [ ] **T-252** — Matriz RACI
  
  Descrição: Quem decide/implementa/revisa para operações.
  CA: raci.md.
  Dep: T-001
  
  _Labels:_ `governance,people`

- [ ] **T-253** — Retenção de logs
  
  Descrição: Definir períodos e descarte seguro.
  CA: logs_retention.md.
  Dep: T-073
  
  _Labels:_ `governance,privacy`

- [ ] **T-254** — Certificados — automação ACME
  
  Descrição: Planejar integração ACME/Let's Encrypt (se aplicável).
  CA: tls_acme.md.
  Dep: T-041,T-042
  
  _Labels:_ `security,tls`

- [ ] **T-255** — Renovação de certificado
  
  Descrição: Rotina para renovar sem downtime (blue/green cert).
  CA: tls_renewal.md.
  Dep: T-259
  
  _Labels:_ `security,tls`

- [ ] **T-256** — Testes de TLS
  
  Descrição: Checagem de cadeia, cipher suites e HSTS.
  CA: tls_tests.md.
  Dep: T-260
  
  _Labels:_ `security,tls`

- [ ] **T-257** — Invalidação de cache — design
  
  Descrição: Definir política para purge seletivo/global.
  CA: cache_invalidation.md.
  Dep: T-196,T-228
  
  _Labels:_ `cache,design`

- [ ] **T-258** — Tool: purge_by_prefix
  
  Descrição: Invalidar prefixos após deploy de alterações críticas.
  CA: purge_summary.json.
  Dep: T-262
  
  _Labels:_ `cache,api`

- [ ] **T-259** — Validação de invalidação
  
  Descrição: Testar que assets novos são servidos após purge.
  CA: cache_validation.md.
  Dep: T-263
  
  _Labels:_ `cache,qa`

- [ ] **T-260** — Ambiente sandbox
  
  Descrição: Provisionar stack idêntica em stage/sandbox.
  CA: sandbox pronto.
  Dep: T-229,T-231
  
  _Labels:_ `env,stage`

- [ ] **T-261** — Dataset sintético
  
  Descrição: Conjunto de assets de teste representativos.
  CA: synthetic_assets.md.
  Dep: T-266
  
  _Labels:_ `env,qa`

- [ ] **T-262** — Testes E2E básicos
  
  Descrição: Script para acessar páginas principais e validar assets.
  CA: e2e_basic.md.
  Dep: T-061,T-229
  
  _Labels:_ `qa,e2e`

- [ ] **T-263** — Cenários k6 (load)
  
  Descrição: Cargas leves para validar latência sob pressão.
  CA: k6_scenarios.md.
  Dep: T-269
  
  _Labels:_ `qa,load`

- [ ] **T-264** — Scan de dependências
  
  Descrição: Rodar auditoria npm e corrigir altas/críticas.
  CA: dep_scan.md.
  Dep: T-006
  
  _Labels:_ `security,supplychain`

- [ ] **T-265** — SBOM (opcional)
  
  Descrição: Gerar SBOM do projeto (CycloneDX).
  CA: sbom.json.
  Dep: T-271
  
  _Labels:_ `security,supplychain`

- [ ] **T-266** — Reproducible builds (nota)
  
  Descrição: Documentar passos para builds reproduzíveis.
  CA: repro_builds.md.
  Dep: T-272
  
  _Labels:_ `security,builds`

- [ ] **T-267** — Guia avançado — operações
  
  Descrição: DNS gerenciado, WAF tuning, rollback, blue/green.
  CA: OPERATIONS.md.
  Dep: T-214,T-215,T-223
  
  _Labels:_ `docs,advanced`

- [ ] **T-268** — Guia avançado — troubleshooting
  
  Descrição: Códigos de erro, mensagens e soluções.
  CA: ADV_TROUBLESHOOTING.md.
  Dep: T-277
  
  _Labels:_ `docs,advanced`

- [ ] **T-269** — Roteiro de demo (vídeo)
  
  Descrição: Script + lista de cenas, do zero ao deploy.
  CA: DEMO_VIDEO.md.
  Dep: T-093,T-223,T-276
  
  _Labels:_ `docs,demo`

- [ ] **T-270** — Rollback N-1 automático
  
  Descrição: Selecionar última versão consistente e reverter com validações.
  CA: rollback_n1.md.
  Dep: T-169,T-223
  
  _Labels:_ `rollback,ops`

- [ ] **T-271** — Rollback seletivo (apenas DNS)
  
  Descrição: Voltar CNAME para endpoint anterior.
  CA: rollback_dns.md.
  Dep: T-122,T-223
  
  _Labels:_ `rollback,dns`

- [ ] **T-272** — Checagem avançada #-28
  
  Descrição: Validação específica (CSP, HSTS, purge, p95/p99).
  CA: checklist_advanced.md.
  Dep: T-181..T-200,T-247
  
  _Labels:_ `qa,advanced`

- [ ] **T-273** — Checagem avançada #-27
  
  Descrição: Validação específica (CSP, HSTS, purge, p95/p99).
  CA: checklist_advanced.md.
  Dep: T-181..T-200,T-247
  
  _Labels:_ `qa,advanced`

- [ ] **T-274** — Checagem avançada #-26
  
  Descrição: Validação específica (CSP, HSTS, purge, p95/p99).
  CA: checklist_advanced.md.
  Dep: T-181..T-200,T-247
  
  _Labels:_ `qa,advanced`

- [ ] **T-275** — Checagem avançada #-25
  
  Descrição: Validação específica (CSP, HSTS, purge, p95/p99).
  CA: checklist_advanced.md.
  Dep: T-181..T-200,T-247
  
  _Labels:_ `qa,advanced`

- [ ] **T-276** — Checagem avançada #-24
  
  Descrição: Validação específica (CSP, HSTS, purge, p95/p99).
  CA: checklist_advanced.md.
  Dep: T-181..T-200,T-247
  
  _Labels:_ `qa,advanced`

- [ ] **T-277** — Checagem avançada #-23
  
  Descrição: Validação específica (CSP, HSTS, purge, p95/p99).
  CA: checklist_advanced.md.
  Dep: T-181..T-200,T-247
  
  _Labels:_ `qa,advanced`

- [ ] **T-278** — Checagem avançada #-22
  
  Descrição: Validação específica (CSP, HSTS, purge, p95/p99).
  CA: checklist_advanced.md.
  Dep: T-181..T-200,T-247
  
  _Labels:_ `qa,advanced`

- [ ] **T-279** — Checagem avançada #-21
  
  Descrição: Validação específica (CSP, HSTS, purge, p95/p99).
  CA: checklist_advanced.md.
  Dep: T-181..T-200,T-247
  
  _Labels:_ `qa,advanced`

- [ ] **T-280** — Checagem avançada #-20
  
  Descrição: Validação específica (CSP, HSTS, purge, p95/p99).
  CA: checklist_advanced.md.
  Dep: T-181..T-200,T-247
  
  _Labels:_ `qa,advanced`

- [ ] **T-281** — Checagem avançada #-19
  
  Descrição: Validação específica (CSP, HSTS, purge, p95/p99).
  CA: checklist_advanced.md.
  Dep: T-181..T-200,T-247
  
  _Labels:_ `qa,advanced`

- [ ] **T-282** — Checagem avançada #-18
  
  Descrição: Validação específica (CSP, HSTS, purge, p95/p99).
  CA: checklist_advanced.md.
  Dep: T-181..T-200,T-247
  
  _Labels:_ `qa,advanced`

- [ ] **T-283** — Checagem avançada #-17
  
  Descrição: Validação específica (CSP, HSTS, purge, p95/p99).
  CA: checklist_advanced.md.
  Dep: T-181..T-200,T-247
  
  _Labels:_ `qa,advanced`

- [ ] **T-284** — Checagem avançada #-16
  
  Descrição: Validação específica (CSP, HSTS, purge, p95/p99).
  CA: checklist_advanced.md.
  Dep: T-181..T-200,T-247
  
  _Labels:_ `qa,advanced`

- [ ] **T-285** — Checagem avançada #-15
  
  Descrição: Validação específica (CSP, HSTS, purge, p95/p99).
  CA: checklist_advanced.md.
  Dep: T-181..T-200,T-247
  
  _Labels:_ `qa,advanced`

- [ ] **T-286** — Checagem avançada #-14
  
  Descrição: Validação específica (CSP, HSTS, purge, p95/p99).
  CA: checklist_advanced.md.
  Dep: T-181..T-200,T-247
  
  _Labels:_ `qa,advanced`

- [ ] **T-287** — Checagem avançada #-13
  
  Descrição: Validação específica (CSP, HSTS, purge, p95/p99).
  CA: checklist_advanced.md.
  Dep: T-181..T-200,T-247
  
  _Labels:_ `qa,advanced`

- [ ] **T-288** — Checagem avançada #-12
  
  Descrição: Validação específica (CSP, HSTS, purge, p95/p99).
  CA: checklist_advanced.md.
  Dep: T-181..T-200,T-247
  
  _Labels:_ `qa,advanced`

- [ ] **T-289** — Checagem avançada #-11
  
  Descrição: Validação específica (CSP, HSTS, purge, p95/p99).
  CA: checklist_advanced.md.
  Dep: T-181..T-200,T-247
  
  _Labels:_ `qa,advanced`

- [ ] **T-290** — Checagem avançada #-10
  
  Descrição: Validação específica (CSP, HSTS, purge, p95/p99).
  CA: checklist_advanced.md.
  Dep: T-181..T-200,T-247
  
  _Labels:_ `qa,advanced`

- [ ] **T-291** — Checagem avançada #-9
  
  Descrição: Validação específica (CSP, HSTS, purge, p95/p99).
  CA: checklist_advanced.md.
  Dep: T-181..T-200,T-247
  
  _Labels:_ `qa,advanced`

- [ ] **T-292** — Checagem avançada #-8
  
  Descrição: Validação específica (CSP, HSTS, purge, p95/p99).
  CA: checklist_advanced.md.
  Dep: T-181..T-200,T-247
  
  _Labels:_ `qa,advanced`

- [ ] **T-293** — Checagem avançada #-7
  
  Descrição: Validação específica (CSP, HSTS, purge, p95/p99).
  CA: checklist_advanced.md.
  Dep: T-181..T-200,T-247
  
  _Labels:_ `qa,advanced`

- [ ] **T-294** — Checagem avançada #-6
  
  Descrição: Validação específica (CSP, HSTS, purge, p95/p99).
  CA: checklist_advanced.md.
  Dep: T-181..T-200,T-247
  
  _Labels:_ `qa,advanced`

- [ ] **T-295** — Checagem avançada #-5
  
  Descrição: Validação específica (CSP, HSTS, purge, p95/p99).
  CA: checklist_advanced.md.
  Dep: T-181..T-200,T-247
  
  _Labels:_ `qa,advanced`

- [ ] **T-296** — Checagem avançada #-4
  
  Descrição: Validação específica (CSP, HSTS, purge, p95/p99).
  CA: checklist_advanced.md.
  Dep: T-181..T-200,T-247
  
  _Labels:_ `qa,advanced`

- [ ] **T-297** — Checagem avançada #-3
  
  Descrição: Validação específica (CSP, HSTS, purge, p95/p99).
  CA: checklist_advanced.md.
  Dep: T-181..T-200,T-247
  
  _Labels:_ `qa,advanced`

- [ ] **T-298** — Checagem avançada #-2
  
  Descrição: Validação específica (CSP, HSTS, purge, p95/p99).
  CA: checklist_advanced.md.
  Dep: T-181..T-200,T-247
  
  _Labels:_ `qa,advanced`

- [ ] **T-299** — Checagem avançada #-1
  
  Descrição: Validação específica (CSP, HSTS, purge, p95/p99).
  CA: checklist_advanced.md.
  Dep: T-181..T-200,T-247
  
  _Labels:_ `qa,advanced`

- [ ] **T-300** — Checagem avançada #00
  
  Descrição: Validação específica (CSP, HSTS, purge, p95/p99).
  CA: checklist_advanced.md.
  Dep: T-181..T-200,T-247
  
  _Labels:_ `qa,advanced`

- [ ] **T-301** — Checagem avançada #01
  
  Descrição: Validação específica (CSP, HSTS, purge, p95/p99).
  CA: checklist_advanced.md.
  Dep: T-181..T-200,T-247
  
  _Labels:_ `qa,advanced`

- [ ] **T-302** — Checagem avançada #02
  
  Descrição: Validação específica (CSP, HSTS, purge, p95/p99).
  CA: checklist_advanced.md.
  Dep: T-181..T-200,T-247
  
  _Labels:_ `qa,advanced`

- [ ] **T-303** — Checagem avançada #03
  
  Descrição: Validação específica (CSP, HSTS, purge, p95/p99).
  CA: checklist_advanced.md.
  Dep: T-181..T-200,T-247
  
  _Labels:_ `qa,advanced`

- [ ] **T-304** — Checagem avançada #04
  
  Descrição: Validação específica (CSP, HSTS, purge, p95/p99).
  CA: checklist_advanced.md.
  Dep: T-181..T-200,T-247
  
  _Labels:_ `qa,advanced`

- [ ] **T-305** — Checagem avançada #05
  
  Descrição: Validação específica (CSP, HSTS, purge, p95/p99).
  CA: checklist_advanced.md.
  Dep: T-181..T-200,T-247
  
  _Labels:_ `qa,advanced`

- [ ] **T-306** — Checagem avançada #06
  
  Descrição: Validação específica (CSP, HSTS, purge, p95/p99).
  CA: checklist_advanced.md.
  Dep: T-181..T-200,T-247
  
  _Labels:_ `qa,advanced`

- [ ] **T-307** — Checagem avançada #07
  
  Descrição: Validação específica (CSP, HSTS, purge, p95/p99).
  CA: checklist_advanced.md.
  Dep: T-181..T-200,T-247
  
  _Labels:_ `qa,advanced`

- [ ] **T-308** — Checagem avançada #08
  
  Descrição: Validação específica (CSP, HSTS, purge, p95/p99).
  CA: checklist_advanced.md.
  Dep: T-181..T-200,T-247
  
  _Labels:_ `qa,advanced`

- [ ] **T-309** — Checagem avançada #09
  
  Descrição: Validação específica (CSP, HSTS, purge, p95/p99).
  CA: checklist_advanced.md.
  Dep: T-181..T-200,T-247
  
  _Labels:_ `qa,advanced`

- [ ] **T-310** — Checagem avançada #10
  
  Descrição: Validação específica (CSP, HSTS, purge, p95/p99).
  CA: checklist_advanced.md.
  Dep: T-181..T-200,T-247
  
  _Labels:_ `qa,advanced`

- [ ] **T-311** — Checagem avançada #11
  
  Descrição: Validação específica (CSP, HSTS, purge, p95/p99).
  CA: checklist_advanced.md.
  Dep: T-181..T-200,T-247
  
  _Labels:_ `qa,advanced`

- [ ] **T-312** — Checagem avançada #12
  
  Descrição: Validação específica (CSP, HSTS, purge, p95/p99).
  CA: checklist_advanced.md.
  Dep: T-181..T-200,T-247
  
  _Labels:_ `qa,advanced`

- [ ] **T-313** — Checagem avançada #13
  
  Descrição: Validação específica (CSP, HSTS, purge, p95/p99).
  CA: checklist_advanced.md.
  Dep: T-181..T-200,T-247
  
  _Labels:_ `qa,advanced`

- [ ] **T-314** — Checagem avançada #14
  
  Descrição: Validação específica (CSP, HSTS, purge, p95/p99).
  CA: checklist_advanced.md.
  Dep: T-181..T-200,T-247
  
  _Labels:_ `qa,advanced`

- [ ] **T-315** — Checagem avançada #15
  
  Descrição: Validação específica (CSP, HSTS, purge, p95/p99).
  CA: checklist_advanced.md.
  Dep: T-181..T-200,T-247
  
  _Labels:_ `qa,advanced`

- [ ] **T-316** — Checagem avançada #16
  
  Descrição: Validação específica (CSP, HSTS, purge, p95/p99).
  CA: checklist_advanced.md.
  Dep: T-181..T-200,T-247
  
  _Labels:_ `qa,advanced`

- [ ] **T-317** — Checagem avançada #17
  
  Descrição: Validação específica (CSP, HSTS, purge, p95/p99).
  CA: checklist_advanced.md.
  Dep: T-181..T-200,T-247
  
  _Labels:_ `qa,advanced`

- [ ] **T-318** — Checagem avançada #18
  
  Descrição: Validação específica (CSP, HSTS, purge, p95/p99).
  CA: checklist_advanced.md.
  Dep: T-181..T-200,T-247
  
  _Labels:_ `qa,advanced`

- [ ] **T-319** — Checagem avançada #19
  
  Descrição: Validação específica (CSP, HSTS, purge, p95/p99).
  CA: checklist_advanced.md.
  Dep: T-181..T-200,T-247
  
  _Labels:_ `qa,advanced`

- [ ] **T-320** — Checagem avançada #20
  
  Descrição: Validação específica (CSP, HSTS, purge, p95/p99).
  CA: checklist_advanced.md.
  Dep: T-181..T-200,T-247
  
  _Labels:_ `qa,advanced`


# To-Do — Continuação (T-321..T-420)
_Data: 2025-10-18_

- [ ] **T-321** — Data Streaming — desenho de pipeline
  
  Descrição: Arquitetar fluxo de eventos (requests, cache status, WAF) para coletor externo.
  CA: data_stream_design.md.
  Dep: T-195,T-196,T-214
  
  _Labels:_ `analytics,design`

- [ ] **T-322** — Export de eventos (edge)
  
  Descrição: Configurar envio de eventos em tempo real para endpoint (HTTP/JSON).
  CA: stream_config.json.
  Dep: T-321
  
  _Labels:_ `analytics,edge`

- [ ] **T-323** — Parsers e normalização
  
  Descrição: Definir esquema (fields: ts, ip, ua, uri, status, cache, waf).
  CA: schema_events.json.
  Dep: T-322
  
  _Labels:_ `analytics,etl`

- [ ] **T-324** — Armazenamento de eventos (local/dev)
  
  Descrição: PoC com arquivo rotativo e agregação básica.
  CA: event_store.md.
  Dep: T-323
  
  _Labels:_ `analytics,storage`

- [ ] **T-325** — Agregações horárias
  
  Descrição: Script que computa req/s, p95, hit ratio por hora.
  CA: hourly_agg.csv.
  Dep: T-324
  
  _Labels:_ `analytics,metrics`

- [ ] **T-326** — Dash de analytics (md)
  
  Descrição: Gerar dashboard estático em Markdown com KPIs.
  CA: analytics_dashboard.md.
  Dep: T-325
  
  _Labels:_ `analytics,docs`

- [ ] **T-327** — Alertas de analytics (thresholds)
  
  Descrição: Alertar quando métricas ultrapassarem limites.
  CA: analytics_alerts.md.
  Dep: T-326
  
  _Labels:_ `analytics,alerts`

- [ ] **T-328** — Formato de log unificado
  
  Descrição: Padronizar JSONL para logs de uploads/orquestração/WAF.
  CA: log_format.md.
  Dep: T-073,T-051,T-048
  
  _Labels:_ `logs,observability`

- [ ] **T-329** — Rotação de logs
  
  Descrição: Política de rotação por tamanho/data; compressão.
  CA: log_rotation.md.
  Dep: T-327
  
  _Labels:_ `logs,ops`

- [ ] **T-330** — Correlações (request-id)
  
  Descrição: Inserir e propagar request-id para correlação.
  CA: correlation.md.
  Dep: T-328
  
  _Labels:_ `logs,tracing`

- [ ] **T-331** — Export de logs para análise
  
  Descrição: Ferramenta para exportar subset por período (grep-like).
  CA: log_export.sh.
  Dep: T-329
  
  _Labels:_ `logs,tools`

- [ ] **T-332** — Checagem de PII
  
  Descrição: Scanner para evitar PII nos logs.
  CA: pii_check.md.
  Dep: T-330
  
  _Labels:_ `privacy,logs`

- [ ] **T-333** — Integração Telegram (notificações)
  
  Descrição: Webhook para enviar alertas de deploy/falha/analytics.
  CA: telegram_integration.md.
  Dep: T-154,T-327
  
  _Labels:_ `integrations,ops`

- [ ] **T-334** — SIEM — mapeamento de campos
  
  Descrição: Definir tabela de correspondência dos eventos para SIEM.
  CA: siem_mapping.md.
  Dep: T-321,T-331
  
  _Labels:_ `siem,security`

- [ ] **T-335** — SIEM — conector de envio
  
  Descrição: Script/Tool que publica eventos no SIEM.
  CA: siem_connector.md.
  Dep: T-333
  
  _Labels:_ `siem,integrations`

- [ ] **T-336** — Teste end-to-end SIEM
  
  Descrição: Gatilho de evento e verificação de ingest no SIEM.
  CA: siem_e2e.md.
  Dep: T-334
  
  _Labels:_ `siem,qa`

- [ ] **T-337** — TLS — estratégia wildcard
  
  Descrição: Planejar uso de *.<domínio> para subdomínios diversos.
  CA: tls_wildcard.md.
  Dep: T-259
  
  _Labels:_ `tls,security`

- [ ] **T-338** — ACME para wildcard (DNS-01)
  
  Descrição: Desenhar desafio DNS-01 automatizável.
  CA: acme_dns01.md.
  Dep: T-338,T-122
  
  _Labels:_ `tls,automation`

- [ ] **T-339** — Renovação automática wildcard
  
  Descrição: Agendar/automatizar renovação sem downtime.
  CA: acme_renewal.md.
  Dep: T-339
  
  _Labels:_ `tls,automation`

- [ ] **T-340** — Validação TLS avançada
  
  Descrição: Verificar cadeias, OCSP, ciphers suportados.
  CA: tls_advanced_tests.md.
  Dep: T-340,T-262
  
  _Labels:_ `tls,qa`

- [ ] **T-341** — Desenho Multi-CDN
  
  Descrição: Arquitetar fallback/overflow entre CDNs.
  CA: multicdn_design.md.
  Dep: T-181,T-222
  
  _Labels:_ `cdn,design`

- [ ] **T-342** — Health-check de CDNs
  
  Descrição: Sondas simples e critérios de troca.
  CA: cdn_health.md.
  Dep: T-344
  
  _Labels:_ `cdn,ops`

- [ ] **T-343** — Roteamento baseado em latência
  
  Descrição: Selecionar provedor por latência média.
  CA: latency_routing.md.
  Dep: T-345
  
  _Labels:_ `cdn,perf`

- [ ] **T-344** — Teste de failover Multi-CDN
  
  Descrição: Cortar um provedor e observar continuidade.
  CA: multicdn_failover.md.
  Dep: T-346
  
  _Labels:_ `cdn,qa`

- [ ] **T-345** — DNS — Anycast e Geo
  
  Descrição: Documentar implicações de Anycast e geo-proximidade.
  CA: dns_anycast.md.
  Dep: T-126,T-181
  
  _Labels:_ `dns,design`

- [ ] **T-346** — DNS — Health-check externo
  
  Descrição: Verificação externa do host final (uptime).
  CA: dns_external_hc.md.
  Dep: T-349
  
  _Labels:_ `dns,ops`

- [ ] **T-347** — DNS — Split-horizon
  
  Descrição: Documentar quando usar vista interna/externa.
  CA: dns_split_horizon.md.
  Dep: T-350
  
  _Labels:_ `dns,design`

- [ ] **T-348** — Experimento — Preload crítico
  
  Descrição: Avaliar ganhos com preload em hero assets.
  CA: exp_preload.md.
  Dep: T-190,T-196
  
  _Labels:_ `perf,experiment`

- [ ] **T-349** — Experimento — Brotli vs Gzip
  
  Descrição: Comparar tamanhos e latências.
  CA: exp_brotli_gzip.md.
  Dep: T-190,T-198
  
  _Labels:_ `perf,experiment`

- [ ] **T-350** — Experimento — TTL agressivo
  
  Descrição: Testar impacto de TTL alto em cache-hit.
  CA: exp_ttl.md.
  Dep: T-196,T-263
  
  _Labels:_ `perf,experiment`

- [ ] **T-351** — Experimento — Warmup inteligente
  
  Descrição: Definir conjunto ótimo de URLs para aquecimento.
  CA: exp_warmup.md.
  Dep: T-199
  
  _Labels:_ `perf,experiment`

- [ ] **T-352** — Custos — modelo por ambiente
  
  Descrição: Estimar custos dev/stage/prod separadamente.
  CA: costs_env.md.
  Dep: T-256
  
  _Labels:_ `costs,planning`

- [ ] **T-353** — Custos — alerta de estouro
  
  Descrição: Alertar quando tráfego/banda extrapolar estimativas.
  CA: costs_alerts.md.
  Dep: T-359,T-327
  
  _Labels:_ `costs,alerts`

- [ ] **T-354** — Custos — consolidação mensal
  
  Descrição: Planilha com consolidação por centro de custo.
  CA: costs_monthly.xlsx.
  Dep: T-360
  
  _Labels:_ `costs,ops`

- [ ] **T-355** — Políticas de acesso (MCP)
  
  Descrição: Quem pode rodar quais tools e em quais ambientes.
  CA: mcp_policies.md.
  Dep: T-230,T-056
  
  _Labels:_ `governance,security`

- [ ] **T-356** — Revisão periódica de permissões
  
  Descrição: Checklist trimestral de acessos.
  CA: access_review.md.
  Dep: T-362
  
  _Labels:_ `governance,security`

- [ ] **T-357** — Políticas de retenção (artefatos)
  
  Descrição: Quanto tempo manter logs/artefatos/summaries.
  CA: retention_policy.md.
  Dep: T-073,T-361
  
  _Labels:_ `governance,privacy`

- [ ] **T-358** — DR — Objetivos RTO/RPO
  
  Descrição: Definir tempos máximos de recuperação e perda de dados.
  CA: dr_objectives.md.
  Dep: T-221,T-246
  
  _Labels:_ `dr,planning`

- [ ] **T-359** — DR — Playbook de recuperação
  
  Descrição: Roteiro para recuperar app/dns/storage rapidamente.
  CA: dr_playbook.md.
  Dep: T-366
  
  _Labels:_ `dr,ops`

- [ ] **T-360** — DR — Exercício de simulação
  
  Descrição: Rodar simulado e medir tempos.
  CA: dr_exercise.md.
  Dep: T-367
  
  _Labels:_ `dr,qa`

- [ ] **T-361** — MCP — Ajuda contextual
  
  Descrição: Tool `help(tool)` que retorna schema e exemplos.
  CA: help disponível.
  Dep: T-012,T-021
  
  _Labels:_ `mcp,ux`

- [ ] **T-362** — MCP — Autocomplete de inputs
  
  Descrição: Sugestões de valores (ex.: buckets, domains existentes).
  CA: autocomplete implementado.
  Dep: T-321,T-328
  
  _Labels:_ `mcp,ux`

- [ ] **T-363** — MCP — Prompts de validação
  
  Descrição: Prompts pedem confirmação quando detectam riscos.
  CA: confirm prompts.
  Dep: T-230,T-170
  
  _Labels:_ `mcp,ux`

- [ ] **T-364** — MCP — Telemetria de uso (local)
  
  Descrição: Contar uso de tools (local) para melhorias.
  CA: mcp_usage.md.
  Dep: T-327
  
  _Labels:_ `mcp,metrics`

- [ ] **T-365** — DX — Erros em linguagem humana
  
  Descrição: Mapear mensagens para versões explicativas curtas.
  CA: dx_errors.md.
  Dep: T-023,T-077
  
  _Labels:_ `devex,ux`

- [ ] **T-366** — DX — Exemplos prontos (cookbook)
  
  Descrição: Coleção de comandos prontos para casos comuns.
  CA: cookbook.md.
  Dep: T-057
  
  _Labels:_ `devex,docs`

- [ ] **T-367** — DX — Alias para tools longas
  
  Descrição: Alias curtos (ex.: azion.updir → azion.upload_dir).
  CA: aliases.json.
  Dep: T-021
  
  _Labels:_ `devex,ux`

- [ ] **T-368** — i18n — mensageria PT/EN
  
  Descrição: Mensagens chave em PT e EN.
  CA: i18n_strings.json.
  Dep: T-388
  
  _Labels:_ `i18n,ux`

- [ ] **T-369** — i18n — seleção de idioma
  
  Descrição: Flag `--lang` no orquestrador.
  CA: idioma selecionável.
  Dep: T-389
  
  _Labels:_ `i18n,ux`

- [ ] **T-370** — Compliance — política de privacidade
  
  Descrição: Documento básico e link no README.
  CA: privacy_policy.md.
  Dep: T-331,T-371
  
  _Labels:_ `compliance,privacy`

- [ ] **T-371** — Compliance — registro de consentimento (nota)
  
  Descrição: Anotar se é necessário para analytics.
  CA: consent_notes.md.
  Dep: T-392
  
  _Labels:_ `compliance,privacy`

- [ ] **T-372** — Checagem extra #-28
  
  Descrição: Verificação e ajuste fino: headers, cache, KPIs, custos.
  CA: extra_checklist.md.
  Dep: T-181..T-200,T-359
  
  _Labels:_ `qa,ops`

- [ ] **T-373** — Checagem extra #-27
  
  Descrição: Verificação e ajuste fino: headers, cache, KPIs, custos.
  CA: extra_checklist.md.
  Dep: T-181..T-200,T-359
  
  _Labels:_ `qa,ops`

- [ ] **T-374** — Checagem extra #-26
  
  Descrição: Verificação e ajuste fino: headers, cache, KPIs, custos.
  CA: extra_checklist.md.
  Dep: T-181..T-200,T-359
  
  _Labels:_ `qa,ops`

- [ ] **T-375** — Checagem extra #-25
  
  Descrição: Verificação e ajuste fino: headers, cache, KPIs, custos.
  CA: extra_checklist.md.
  Dep: T-181..T-200,T-359
  
  _Labels:_ `qa,ops`

- [ ] **T-376** — Checagem extra #-24
  
  Descrição: Verificação e ajuste fino: headers, cache, KPIs, custos.
  CA: extra_checklist.md.
  Dep: T-181..T-200,T-359
  
  _Labels:_ `qa,ops`

- [ ] **T-377** — Checagem extra #-23
  
  Descrição: Verificação e ajuste fino: headers, cache, KPIs, custos.
  CA: extra_checklist.md.
  Dep: T-181..T-200,T-359
  
  _Labels:_ `qa,ops`

- [ ] **T-378** — Checagem extra #-22
  
  Descrição: Verificação e ajuste fino: headers, cache, KPIs, custos.
  CA: extra_checklist.md.
  Dep: T-181..T-200,T-359
  
  _Labels:_ `qa,ops`

- [ ] **T-379** — Checagem extra #-21
  
  Descrição: Verificação e ajuste fino: headers, cache, KPIs, custos.
  CA: extra_checklist.md.
  Dep: T-181..T-200,T-359
  
  _Labels:_ `qa,ops`

- [ ] **T-380** — Checagem extra #-20
  
  Descrição: Verificação e ajuste fino: headers, cache, KPIs, custos.
  CA: extra_checklist.md.
  Dep: T-181..T-200,T-359
  
  _Labels:_ `qa,ops`

- [ ] **T-381** — Checagem extra #-19
  
  Descrição: Verificação e ajuste fino: headers, cache, KPIs, custos.
  CA: extra_checklist.md.
  Dep: T-181..T-200,T-359
  
  _Labels:_ `qa,ops`

- [ ] **T-382** — Checagem extra #-18
  
  Descrição: Verificação e ajuste fino: headers, cache, KPIs, custos.
  CA: extra_checklist.md.
  Dep: T-181..T-200,T-359
  
  _Labels:_ `qa,ops`

- [ ] **T-383** — Checagem extra #-17
  
  Descrição: Verificação e ajuste fino: headers, cache, KPIs, custos.
  CA: extra_checklist.md.
  Dep: T-181..T-200,T-359
  
  _Labels:_ `qa,ops`

- [ ] **T-384** — Checagem extra #-16
  
  Descrição: Verificação e ajuste fino: headers, cache, KPIs, custos.
  CA: extra_checklist.md.
  Dep: T-181..T-200,T-359
  
  _Labels:_ `qa,ops`

- [ ] **T-385** — Checagem extra #-15
  
  Descrição: Verificação e ajuste fino: headers, cache, KPIs, custos.
  CA: extra_checklist.md.
  Dep: T-181..T-200,T-359
  
  _Labels:_ `qa,ops`

- [ ] **T-386** — Checagem extra #-14
  
  Descrição: Verificação e ajuste fino: headers, cache, KPIs, custos.
  CA: extra_checklist.md.
  Dep: T-181..T-200,T-359
  
  _Labels:_ `qa,ops`

- [ ] **T-387** — Checagem extra #-13
  
  Descrição: Verificação e ajuste fino: headers, cache, KPIs, custos.
  CA: extra_checklist.md.
  Dep: T-181..T-200,T-359
  
  _Labels:_ `qa,ops`

- [ ] **T-388** — Checagem extra #-12
  
  Descrição: Verificação e ajuste fino: headers, cache, KPIs, custos.
  CA: extra_checklist.md.
  Dep: T-181..T-200,T-359
  
  _Labels:_ `qa,ops`

- [ ] **T-389** — Checagem extra #-11
  
  Descrição: Verificação e ajuste fino: headers, cache, KPIs, custos.
  CA: extra_checklist.md.
  Dep: T-181..T-200,T-359
  
  _Labels:_ `qa,ops`

- [ ] **T-390** — Checagem extra #-10
  
  Descrição: Verificação e ajuste fino: headers, cache, KPIs, custos.
  CA: extra_checklist.md.
  Dep: T-181..T-200,T-359
  
  _Labels:_ `qa,ops`

- [ ] **T-391** — Checagem extra #-9
  
  Descrição: Verificação e ajuste fino: headers, cache, KPIs, custos.
  CA: extra_checklist.md.
  Dep: T-181..T-200,T-359
  
  _Labels:_ `qa,ops`

- [ ] **T-392** — Checagem extra #-8
  
  Descrição: Verificação e ajuste fino: headers, cache, KPIs, custos.
  CA: extra_checklist.md.
  Dep: T-181..T-200,T-359
  
  _Labels:_ `qa,ops`

- [ ] **T-393** — Checagem extra #-7
  
  Descrição: Verificação e ajuste fino: headers, cache, KPIs, custos.
  CA: extra_checklist.md.
  Dep: T-181..T-200,T-359
  
  _Labels:_ `qa,ops`

- [ ] **T-394** — Checagem extra #-6
  
  Descrição: Verificação e ajuste fino: headers, cache, KPIs, custos.
  CA: extra_checklist.md.
  Dep: T-181..T-200,T-359
  
  _Labels:_ `qa,ops`

- [ ] **T-395** — Checagem extra #-5
  
  Descrição: Verificação e ajuste fino: headers, cache, KPIs, custos.
  CA: extra_checklist.md.
  Dep: T-181..T-200,T-359
  
  _Labels:_ `qa,ops`

- [ ] **T-396** — Checagem extra #-4
  
  Descrição: Verificação e ajuste fino: headers, cache, KPIs, custos.
  CA: extra_checklist.md.
  Dep: T-181..T-200,T-359
  
  _Labels:_ `qa,ops`

- [ ] **T-397** — Checagem extra #-3
  
  Descrição: Verificação e ajuste fino: headers, cache, KPIs, custos.
  CA: extra_checklist.md.
  Dep: T-181..T-200,T-359
  
  _Labels:_ `qa,ops`

- [ ] **T-398** — Checagem extra #-2
  
  Descrição: Verificação e ajuste fino: headers, cache, KPIs, custos.
  CA: extra_checklist.md.
  Dep: T-181..T-200,T-359
  
  _Labels:_ `qa,ops`

- [ ] **T-399** — Checagem extra #-1
  
  Descrição: Verificação e ajuste fino: headers, cache, KPIs, custos.
  CA: extra_checklist.md.
  Dep: T-181..T-200,T-359
  
  _Labels:_ `qa,ops`

- [ ] **T-400** — Checagem extra #00
  
  Descrição: Verificação e ajuste fino: headers, cache, KPIs, custos.
  CA: extra_checklist.md.
  Dep: T-181..T-200,T-359
  
  _Labels:_ `qa,ops`

- [ ] **T-401** — Checagem extra #01
  
  Descrição: Verificação e ajuste fino: headers, cache, KPIs, custos.
  CA: extra_checklist.md.
  Dep: T-181..T-200,T-359
  
  _Labels:_ `qa,ops`

- [ ] **T-402** — Checagem extra #02
  
  Descrição: Verificação e ajuste fino: headers, cache, KPIs, custos.
  CA: extra_checklist.md.
  Dep: T-181..T-200,T-359
  
  _Labels:_ `qa,ops`

- [ ] **T-403** — Checagem extra #03
  
  Descrição: Verificação e ajuste fino: headers, cache, KPIs, custos.
  CA: extra_checklist.md.
  Dep: T-181..T-200,T-359
  
  _Labels:_ `qa,ops`

- [ ] **T-404** — Checagem extra #04
  
  Descrição: Verificação e ajuste fino: headers, cache, KPIs, custos.
  CA: extra_checklist.md.
  Dep: T-181..T-200,T-359
  
  _Labels:_ `qa,ops`

- [ ] **T-405** — Checagem extra #05
  
  Descrição: Verificação e ajuste fino: headers, cache, KPIs, custos.
  CA: extra_checklist.md.
  Dep: T-181..T-200,T-359
  
  _Labels:_ `qa,ops`

- [ ] **T-406** — Checagem extra #06
  
  Descrição: Verificação e ajuste fino: headers, cache, KPIs, custos.
  CA: extra_checklist.md.
  Dep: T-181..T-200,T-359
  
  _Labels:_ `qa,ops`

- [ ] **T-407** — Checagem extra #07
  
  Descrição: Verificação e ajuste fino: headers, cache, KPIs, custos.
  CA: extra_checklist.md.
  Dep: T-181..T-200,T-359
  
  _Labels:_ `qa,ops`

- [ ] **T-408** — Checagem extra #08
  
  Descrição: Verificação e ajuste fino: headers, cache, KPIs, custos.
  CA: extra_checklist.md.
  Dep: T-181..T-200,T-359
  
  _Labels:_ `qa,ops`

- [ ] **T-409** — Checagem extra #09
  
  Descrição: Verificação e ajuste fino: headers, cache, KPIs, custos.
  CA: extra_checklist.md.
  Dep: T-181..T-200,T-359
  
  _Labels:_ `qa,ops`

- [ ] **T-410** — Checagem extra #10
  
  Descrição: Verificação e ajuste fino: headers, cache, KPIs, custos.
  CA: extra_checklist.md.
  Dep: T-181..T-200,T-359
  
  _Labels:_ `qa,ops`

- [ ] **T-411** — Checagem extra #11
  
  Descrição: Verificação e ajuste fino: headers, cache, KPIs, custos.
  CA: extra_checklist.md.
  Dep: T-181..T-200,T-359
  
  _Labels:_ `qa,ops`

- [ ] **T-412** — Checagem extra #12
  
  Descrição: Verificação e ajuste fino: headers, cache, KPIs, custos.
  CA: extra_checklist.md.
  Dep: T-181..T-200,T-359
  
  _Labels:_ `qa,ops`

- [ ] **T-413** — Checagem extra #13
  
  Descrição: Verificação e ajuste fino: headers, cache, KPIs, custos.
  CA: extra_checklist.md.
  Dep: T-181..T-200,T-359
  
  _Labels:_ `qa,ops`

- [ ] **T-414** — Checagem extra #14
  
  Descrição: Verificação e ajuste fino: headers, cache, KPIs, custos.
  CA: extra_checklist.md.
  Dep: T-181..T-200,T-359
  
  _Labels:_ `qa,ops`

- [ ] **T-415** — Checagem extra #15
  
  Descrição: Verificação e ajuste fino: headers, cache, KPIs, custos.
  CA: extra_checklist.md.
  Dep: T-181..T-200,T-359
  
  _Labels:_ `qa,ops`

- [ ] **T-416** — Checagem extra #16
  
  Descrição: Verificação e ajuste fino: headers, cache, KPIs, custos.
  CA: extra_checklist.md.
  Dep: T-181..T-200,T-359
  
  _Labels:_ `qa,ops`

- [ ] **T-417** — Checagem extra #17
  
  Descrição: Verificação e ajuste fino: headers, cache, KPIs, custos.
  CA: extra_checklist.md.
  Dep: T-181..T-200,T-359
  
  _Labels:_ `qa,ops`

- [ ] **T-418** — Checagem extra #18
  
  Descrição: Verificação e ajuste fino: headers, cache, KPIs, custos.
  CA: extra_checklist.md.
  Dep: T-181..T-200,T-359
  
  _Labels:_ `qa,ops`

- [ ] **T-419** — Checagem extra #19
  
  Descrição: Verificação e ajuste fino: headers, cache, KPIs, custos.
  CA: extra_checklist.md.
  Dep: T-181..T-200,T-359
  
  _Labels:_ `qa,ops`

- [ ] **T-420** — Checagem extra #20
  
  Descrição: Verificação e ajuste fino: headers, cache, KPIs, custos.
  CA: extra_checklist.md.
  Dep: T-181..T-200,T-359
  
  _Labels:_ `qa,ops`


# To-Do — Continuação (T-421..T-520)
_Data: 2025-10-18_

- [ ] **T-421** — Multi-site — catálogo de projetos
  
  Descrição: Criar catálogo (JSON/YAML) com metadados por site (domínio, bucket, owner).
  CA: projects_catalog.json.
  Dep: T-241,T-242
  
  _Labels:_ `multiproduct,design`

- [ ] **T-422** — Multi-site — seleção via --project
  
  Descrição: Orquestrador aceita `--project <name>` e carrega metadados do catálogo.
  CA: suporte a múltiplos sites.
  Dep: T-421
  
  _Labels:_ `multiproduct,cli`

- [ ] **T-423** — Multi-site — estado segregado
  
  Descrição: Salvar .mcp-state/<project>/<env>/*.json por site.
  CA: estados isolados.
  Dep: T-422
  
  _Labels:_ `multiproduct,state`

- [ ] **T-424** — Multi-site — policies por projeto
  
  Descrição: Definir limites e guardas (prod block, dry-run default) por projeto.
  CA: project_policies.md.
  Dep: T-423
  
  _Labels:_ `multiproduct,governance`

- [ ] **T-425** — Multi-site — owners e contatos
  
  Descrição: Mapa de responsáveis por projeto (oncall/telegram).
  CA: owners_map.md.
  Dep: T-421
  
  _Labels:_ `multiproduct,people`

- [ ] **T-426** — Multi-site — rota de suporte
  
  Descrição: Definir canal de suporte por projeto (labels/tags).
  CA: support_routes.md.
  Dep: T-425
  
  _Labels:_ `multiproduct,ops`

- [ ] **T-427** — Multi-site — template de novo site
  
  Descrição: Script para bootstrap rápido de um novo site (bucket + app + domain).
  CA: new_site_template.md.
  Dep: T-424,T-051
  
  _Labels:_ `multiproduct,automation`

- [ ] **T-428** — Quotas — design de limites
  
  Descrição: Limites de objetos, tamanho total, req/s por projeto.
  CA: quotas_design.md.
  Dep: T-423
  
  _Labels:_ `quotas,design`

- [ ] **T-429** — Quotas — medição mínima
  
  Descrição: Coletar métricas base para comparação com limites.
  CA: quotas_metrics.md.
  Dep: T-431,T-196
  
  _Labels:_ `quotas,metrics`

- [ ] **T-430** — Quotas — alertas proativos
  
  Descrição: Alertar quando atingir 80/90/100% da quota.
  CA: quotas_alerts.md.
  Dep: T-432,T-327
  
  _Labels:_ `quotas,alerts`

- [ ] **T-431** — Quotas — enforcement suave
  
  Descrição: Bloquear uploads acima de X com override manual.
  CA: enforcement_notes.md.
  Dep: T-433
  
  _Labels:_ `quotas,policy`

- [ ] **T-432** — Chargeback — modelo de rateio
  
  Descrição: Definir fórmula: (tráfego, objetos, requisições).
  CA: chargeback_model.md.
  Dep: T-257,T-361
  
  _Labels:_ `costs,governance`

- [ ] **T-433** — Showback — relatórios por projeto
  
  Descrição: Gerar csv mensal por projeto com consumo estimado.
  CA: showback_report.csv.
  Dep: T-436,T-359
  
  _Labels:_ `costs,reports`

- [ ] **T-434** — Chargeback — integração com billing interno
  
  Descrição: Exportar JSON para sistema interno de cobrança.
  CA: billing_export.json.
  Dep: T-437
  
  _Labels:_ `costs,integrations`

- [ ] **T-435** — Chargeback — auditoria
  
  Descrição: Rastrear origens de cálculo (artefatos e métricas).
  CA: chargeback_audit.md.
  Dep: T-438
  
  _Labels:_ `costs,governance`

- [ ] **T-436** — Purge — design por PR/branch
  
  Descrição: Definir estratégia de prefixos por branch (ex.: /preview/BRANCH/).
  CA: purge_branch_design.md.
  Dep: T-196,T-262
  
  _Labels:_ `cache,design`

- [ ] **T-437** — Purge — tool purge_by_branch
  
  Descrição: Invalidar prefixos do branch após merges/closes.
  CA: purge_branch.json.
  Dep: T-441,T-263
  
  _Labels:_ `cache,automation`

- [ ] **T-438** — Preview environments por branch
  
  Descrição: Mapear domínio/host temporário para PRs.
  CA: preview_envs.md.
  Dep: T-442,T-229
  
  _Labels:_ `env,preview`

- [ ] **T-439** — Painel comparativo — ambientes
  
  Descrição: Dashboard de latência/hit ratio por dev/stage/prod.
  CA: env_compare.md.
  Dep: T-247
  
  _Labels:_ `metrics,dashboards`

- [ ] **T-440** — Painel comparativo — projetos
  
  Descrição: Mapa de KPIs por projeto (top 5 consumo).
  CA: projects_compare.md.
  Dep: T-444
  
  _Labels:_ `metrics,dashboards`

- [ ] **T-441** — Painel de custos por projeto
  
  Descrição: Consolidar custos estimados + variação mensal.
  CA: costs_compare.md.
  Dep: T-436,T-445
  
  _Labels:_ `costs,dashboards`

- [ ] **T-442** — Hook pós-upload — verify & warmup
  
  Descrição: Após upload_dir, verificar asset crítico e acionar warmup.
  CA: post_upload_hook.md.
  Dep: T-028,T-199
  
  _Labels:_ `automation,hooks`

- [ ] **T-443** — Hook pós-deploy — smoke tests
  
  Descrição: Executar curls essenciais e registrar tempos.
  CA: post_deploy_smoke.md.
  Dep: T-061,T-152
  
  _Labels:_ `automation,hooks`

- [ ] **T-444** — Hook pré-teardown — backups
  
  Descrição: Realizar backup de .mcp-state/ e lista de objetos.
  CA: pre_teardown_backup.md.
  Dep: T-134,T-139
  
  _Labels:_ `automation,hooks`

- [ ] **T-445** — Templates de tools MCP reutilizáveis
  
  Descrição: Gerar snippets padronizados (schemas e handlers base).
  CA: mcp_tool_templates.md.
  Dep: T-012,T-021
  
  _Labels:_ `templates,mcp`

- [ ] **T-446** — Templates de workflows (YAML)
  
  Descrição: Modelos para build/deploy/rollback/teardown.
  CA: workflow_templates.md.
  Dep: T-151..T-170
  
  _Labels:_ `templates,ci`

- [ ] **T-447** — Templates de policies (governança)
  
  Descrição: Modelos de quotas/guards por projeto.
  CA: policy_templates.md.
  Dep: T-430,T-451
  
  _Labels:_ `templates,governance`

- [ ] **T-448** — Quota hard/soft por tenant
  
  Descrição: Marcações de hard limit vs soft limit, comportamentos distintos.
  CA: tenant_quotas.md.
  Dep: T-431,T-434
  
  _Labels:_ `multitenant,quotas`

- [ ] **T-449** — Isolamento de incidentes por tenant
  
  Descrição: Procedimentos para incidentes que afetam 1 tenant.
  CA: tenant_incidents.md.
  Dep: T-214,T-366
  
  _Labels:_ `multitenant,ops`

- [ ] **T-450** — Relatórios por tenant
  
  Descrição: Geração automática de relatórios semanais.
  CA: tenant_weekly.md.
  Dep: T-456,T-435
  
  _Labels:_ `multitenant,reports`

- [ ] **T-451** — Webhook para GitHub PR status
  
  Descrição: Notificar status de deploy/preview na PR.
  CA: gh_pr_status.md.
  Dep: T-152,T-443
  
  _Labels:_ `integrations,github`

- [ ] **T-452** — Integração com ChatOps
  
  Descrição: Comandos em chat para acionar purge/deploy.
  CA: chatops.md.
  Dep: T-331,T-152
  
  _Labels:_ `integrations,chatops`

- [ ] **T-453** — Export KPIs para planilha
  
  Descrição: CSV consolidado por projeto/ambiente.
  CA: kpis_export.csv.
  Dep: T-445
  
  _Labels:_ `integrations,excel`

- [ ] **T-454** — Testes E2E multi-site
  
  Descrição: Roteiros cobrindo dois projetos simulados.
  CA: e2e_multisite.md.
  Dep: T-421,T-466
  
  _Labels:_ `qa,e2e`

- [ ] **T-455** — Testes de regressão (headers/caching)
  
  Descrição: Suite que garante headers core e caching invariantes.
  CA: regression_suite.md.
  Dep: T-471
  
  _Labels:_ `qa,regression`

- [ ] **T-456** — Testes de segurança (básicos)
  
  Descrição: Scanner simples de headers e CSP.
  CA: security_tests.md.
  Dep: T-189,T-193
  
  _Labels:_ `qa,security`

- [ ] **T-457** — Fluxo de aprovação por projeto
  
  Descrição: Aprovação diferente por risco/ambiente.
  CA: approval_flows.md.
  Dep: T-229,T-153
  
  _Labels:_ `governance,security`

- [ ] **T-458** — Matriz de riscos por projeto
  
  Descrição: Heatmap de risco (impacto x probabilidade).
  CA: risk_matrix.md.
  Dep: T-472
  
  _Labels:_ `governance,risk`

- [ ] **T-459** — Backup periódico de estados
  
  Descrição: Agendar export de .mcp-state/* para storage seguro.
  CA: state_backup_plan.md.
  Dep: T-366
  
  _Labels:_ `dr,backup`

- [ ] **T-460** — Restauração quick
  
  Descrição: Script para restaurar app/domain a partir de backup.
  CA: quick_restore.md.
  Dep: T-481
  
  _Labels:_ `dr,recovery`

- [ ] **T-461** — Roteamento por custo (experimental)
  
  Descrição: Escolher CDN por custo efetivo vs latência.
  CA: routing_cost_experiment.md.
  Dep: T-352,T-357
  
  _Labels:_ `cdn,experiment`

- [ ] **T-462** — Roteamento por erro (shielding)
  
  Descrição: Desviar tráfego quando erro 5xx sobe em provedor.
  CA: routing_error_shield.md.
  Dep: T-352
  
  _Labels:_ `cdn,experiment`

- [ ] **T-463** — Modo verbose do MCP
  
  Descrição: Flag para mostrar chamadas HTTP (sem segredos).
  CA: verbose_mode.md.
  Dep: T-016,T-021
  
  _Labels:_ `mcp,ux`

- [ ] **T-464** — Modo silencioso do MCP
  
  Descrição: Saída minimalista para CI.
  CA: silent_mode.md.
  Dep: T-151
  
  _Labels:_ `mcp,ux`

- [ ] **T-465** — Sugestões inteligentes (inputs)
  
  Descrição: Autocomplete baseado em histórico (local).
  CA: smart_suggestions.md.
  Dep: T-395,T-327
  
  _Labels:_ `mcp,ux`

- [ ] **T-466** — Checagem comparativa #-34
  
  Descrição: Comparar KPIs/custos entre projetos e ambientes; destacar outliers.
  CA: compare_checklist.md.
  Dep: T-447,T-458
  
  _Labels:_ `qa,analytics`

- [ ] **T-467** — Checagem comparativa #-33
  
  Descrição: Comparar KPIs/custos entre projetos e ambientes; destacar outliers.
  CA: compare_checklist.md.
  Dep: T-447,T-458
  
  _Labels:_ `qa,analytics`

- [ ] **T-468** — Checagem comparativa #-32
  
  Descrição: Comparar KPIs/custos entre projetos e ambientes; destacar outliers.
  CA: compare_checklist.md.
  Dep: T-447,T-458
  
  _Labels:_ `qa,analytics`

- [ ] **T-469** — Checagem comparativa #-31
  
  Descrição: Comparar KPIs/custos entre projetos e ambientes; destacar outliers.
  CA: compare_checklist.md.
  Dep: T-447,T-458
  
  _Labels:_ `qa,analytics`

- [ ] **T-470** — Checagem comparativa #-30
  
  Descrição: Comparar KPIs/custos entre projetos e ambientes; destacar outliers.
  CA: compare_checklist.md.
  Dep: T-447,T-458
  
  _Labels:_ `qa,analytics`

- [ ] **T-471** — Checagem comparativa #-29
  
  Descrição: Comparar KPIs/custos entre projetos e ambientes; destacar outliers.
  CA: compare_checklist.md.
  Dep: T-447,T-458
  
  _Labels:_ `qa,analytics`

- [ ] **T-472** — Checagem comparativa #-28
  
  Descrição: Comparar KPIs/custos entre projetos e ambientes; destacar outliers.
  CA: compare_checklist.md.
  Dep: T-447,T-458
  
  _Labels:_ `qa,analytics`

- [ ] **T-473** — Checagem comparativa #-27
  
  Descrição: Comparar KPIs/custos entre projetos e ambientes; destacar outliers.
  CA: compare_checklist.md.
  Dep: T-447,T-458
  
  _Labels:_ `qa,analytics`

- [ ] **T-474** — Checagem comparativa #-26
  
  Descrição: Comparar KPIs/custos entre projetos e ambientes; destacar outliers.
  CA: compare_checklist.md.
  Dep: T-447,T-458
  
  _Labels:_ `qa,analytics`

- [ ] **T-475** — Checagem comparativa #-25
  
  Descrição: Comparar KPIs/custos entre projetos e ambientes; destacar outliers.
  CA: compare_checklist.md.
  Dep: T-447,T-458
  
  _Labels:_ `qa,analytics`

- [ ] **T-476** — Checagem comparativa #-24
  
  Descrição: Comparar KPIs/custos entre projetos e ambientes; destacar outliers.
  CA: compare_checklist.md.
  Dep: T-447,T-458
  
  _Labels:_ `qa,analytics`

- [ ] **T-477** — Checagem comparativa #-23
  
  Descrição: Comparar KPIs/custos entre projetos e ambientes; destacar outliers.
  CA: compare_checklist.md.
  Dep: T-447,T-458
  
  _Labels:_ `qa,analytics`

- [ ] **T-478** — Checagem comparativa #-22
  
  Descrição: Comparar KPIs/custos entre projetos e ambientes; destacar outliers.
  CA: compare_checklist.md.
  Dep: T-447,T-458
  
  _Labels:_ `qa,analytics`

- [ ] **T-479** — Checagem comparativa #-21
  
  Descrição: Comparar KPIs/custos entre projetos e ambientes; destacar outliers.
  CA: compare_checklist.md.
  Dep: T-447,T-458
  
  _Labels:_ `qa,analytics`

- [ ] **T-480** — Checagem comparativa #-20
  
  Descrição: Comparar KPIs/custos entre projetos e ambientes; destacar outliers.
  CA: compare_checklist.md.
  Dep: T-447,T-458
  
  _Labels:_ `qa,analytics`

- [ ] **T-481** — Checagem comparativa #-19
  
  Descrição: Comparar KPIs/custos entre projetos e ambientes; destacar outliers.
  CA: compare_checklist.md.
  Dep: T-447,T-458
  
  _Labels:_ `qa,analytics`

- [ ] **T-482** — Checagem comparativa #-18
  
  Descrição: Comparar KPIs/custos entre projetos e ambientes; destacar outliers.
  CA: compare_checklist.md.
  Dep: T-447,T-458
  
  _Labels:_ `qa,analytics`

- [ ] **T-483** — Checagem comparativa #-17
  
  Descrição: Comparar KPIs/custos entre projetos e ambientes; destacar outliers.
  CA: compare_checklist.md.
  Dep: T-447,T-458
  
  _Labels:_ `qa,analytics`

- [ ] **T-484** — Checagem comparativa #-16
  
  Descrição: Comparar KPIs/custos entre projetos e ambientes; destacar outliers.
  CA: compare_checklist.md.
  Dep: T-447,T-458
  
  _Labels:_ `qa,analytics`

- [ ] **T-485** — Checagem comparativa #-15
  
  Descrição: Comparar KPIs/custos entre projetos e ambientes; destacar outliers.
  CA: compare_checklist.md.
  Dep: T-447,T-458
  
  _Labels:_ `qa,analytics`

- [ ] **T-486** — Checagem comparativa #-14
  
  Descrição: Comparar KPIs/custos entre projetos e ambientes; destacar outliers.
  CA: compare_checklist.md.
  Dep: T-447,T-458
  
  _Labels:_ `qa,analytics`

- [ ] **T-487** — Checagem comparativa #-13
  
  Descrição: Comparar KPIs/custos entre projetos e ambientes; destacar outliers.
  CA: compare_checklist.md.
  Dep: T-447,T-458
  
  _Labels:_ `qa,analytics`

- [ ] **T-488** — Checagem comparativa #-12
  
  Descrição: Comparar KPIs/custos entre projetos e ambientes; destacar outliers.
  CA: compare_checklist.md.
  Dep: T-447,T-458
  
  _Labels:_ `qa,analytics`

- [ ] **T-489** — Checagem comparativa #-11
  
  Descrição: Comparar KPIs/custos entre projetos e ambientes; destacar outliers.
  CA: compare_checklist.md.
  Dep: T-447,T-458
  
  _Labels:_ `qa,analytics`

- [ ] **T-490** — Checagem comparativa #-10
  
  Descrição: Comparar KPIs/custos entre projetos e ambientes; destacar outliers.
  CA: compare_checklist.md.
  Dep: T-447,T-458
  
  _Labels:_ `qa,analytics`

- [ ] **T-491** — Checagem comparativa #-9
  
  Descrição: Comparar KPIs/custos entre projetos e ambientes; destacar outliers.
  CA: compare_checklist.md.
  Dep: T-447,T-458
  
  _Labels:_ `qa,analytics`

- [ ] **T-492** — Checagem comparativa #-8
  
  Descrição: Comparar KPIs/custos entre projetos e ambientes; destacar outliers.
  CA: compare_checklist.md.
  Dep: T-447,T-458
  
  _Labels:_ `qa,analytics`

- [ ] **T-493** — Checagem comparativa #-7
  
  Descrição: Comparar KPIs/custos entre projetos e ambientes; destacar outliers.
  CA: compare_checklist.md.
  Dep: T-447,T-458
  
  _Labels:_ `qa,analytics`

- [ ] **T-494** — Checagem comparativa #-6
  
  Descrição: Comparar KPIs/custos entre projetos e ambientes; destacar outliers.
  CA: compare_checklist.md.
  Dep: T-447,T-458
  
  _Labels:_ `qa,analytics`

- [ ] **T-495** — Checagem comparativa #-5
  
  Descrição: Comparar KPIs/custos entre projetos e ambientes; destacar outliers.
  CA: compare_checklist.md.
  Dep: T-447,T-458
  
  _Labels:_ `qa,analytics`

- [ ] **T-496** — Checagem comparativa #-4
  
  Descrição: Comparar KPIs/custos entre projetos e ambientes; destacar outliers.
  CA: compare_checklist.md.
  Dep: T-447,T-458
  
  _Labels:_ `qa,analytics`

- [ ] **T-497** — Checagem comparativa #-3
  
  Descrição: Comparar KPIs/custos entre projetos e ambientes; destacar outliers.
  CA: compare_checklist.md.
  Dep: T-447,T-458
  
  _Labels:_ `qa,analytics`

- [ ] **T-498** — Checagem comparativa #-2
  
  Descrição: Comparar KPIs/custos entre projetos e ambientes; destacar outliers.
  CA: compare_checklist.md.
  Dep: T-447,T-458
  
  _Labels:_ `qa,analytics`

- [ ] **T-499** — Checagem comparativa #-1
  
  Descrição: Comparar KPIs/custos entre projetos e ambientes; destacar outliers.
  CA: compare_checklist.md.
  Dep: T-447,T-458
  
  _Labels:_ `qa,analytics`

- [ ] **T-500** — Checagem comparativa #00
  
  Descrição: Comparar KPIs/custos entre projetos e ambientes; destacar outliers.
  CA: compare_checklist.md.
  Dep: T-447,T-458
  
  _Labels:_ `qa,analytics`

- [ ] **T-501** — Checagem comparativa #01
  
  Descrição: Comparar KPIs/custos entre projetos e ambientes; destacar outliers.
  CA: compare_checklist.md.
  Dep: T-447,T-458
  
  _Labels:_ `qa,analytics`

- [ ] **T-502** — Checagem comparativa #02
  
  Descrição: Comparar KPIs/custos entre projetos e ambientes; destacar outliers.
  CA: compare_checklist.md.
  Dep: T-447,T-458
  
  _Labels:_ `qa,analytics`

- [ ] **T-503** — Checagem comparativa #03
  
  Descrição: Comparar KPIs/custos entre projetos e ambientes; destacar outliers.
  CA: compare_checklist.md.
  Dep: T-447,T-458
  
  _Labels:_ `qa,analytics`

- [ ] **T-504** — Checagem comparativa #04
  
  Descrição: Comparar KPIs/custos entre projetos e ambientes; destacar outliers.
  CA: compare_checklist.md.
  Dep: T-447,T-458
  
  _Labels:_ `qa,analytics`

- [ ] **T-505** — Checagem comparativa #05
  
  Descrição: Comparar KPIs/custos entre projetos e ambientes; destacar outliers.
  CA: compare_checklist.md.
  Dep: T-447,T-458
  
  _Labels:_ `qa,analytics`

- [ ] **T-506** — Checagem comparativa #06
  
  Descrição: Comparar KPIs/custos entre projetos e ambientes; destacar outliers.
  CA: compare_checklist.md.
  Dep: T-447,T-458
  
  _Labels:_ `qa,analytics`

- [ ] **T-507** — Checagem comparativa #07
  
  Descrição: Comparar KPIs/custos entre projetos e ambientes; destacar outliers.
  CA: compare_checklist.md.
  Dep: T-447,T-458
  
  _Labels:_ `qa,analytics`

- [ ] **T-508** — Checagem comparativa #08
  
  Descrição: Comparar KPIs/custos entre projetos e ambientes; destacar outliers.
  CA: compare_checklist.md.
  Dep: T-447,T-458
  
  _Labels:_ `qa,analytics`

- [ ] **T-509** — Checagem comparativa #09
  
  Descrição: Comparar KPIs/custos entre projetos e ambientes; destacar outliers.
  CA: compare_checklist.md.
  Dep: T-447,T-458
  
  _Labels:_ `qa,analytics`

- [ ] **T-510** — Checagem comparativa #10
  
  Descrição: Comparar KPIs/custos entre projetos e ambientes; destacar outliers.
  CA: compare_checklist.md.
  Dep: T-447,T-458
  
  _Labels:_ `qa,analytics`

- [ ] **T-511** — Checagem comparativa #11
  
  Descrição: Comparar KPIs/custos entre projetos e ambientes; destacar outliers.
  CA: compare_checklist.md.
  Dep: T-447,T-458
  
  _Labels:_ `qa,analytics`

- [ ] **T-512** — Checagem comparativa #12
  
  Descrição: Comparar KPIs/custos entre projetos e ambientes; destacar outliers.
  CA: compare_checklist.md.
  Dep: T-447,T-458
  
  _Labels:_ `qa,analytics`

- [ ] **T-513** — Checagem comparativa #13
  
  Descrição: Comparar KPIs/custos entre projetos e ambientes; destacar outliers.
  CA: compare_checklist.md.
  Dep: T-447,T-458
  
  _Labels:_ `qa,analytics`

- [ ] **T-514** — Checagem comparativa #14
  
  Descrição: Comparar KPIs/custos entre projetos e ambientes; destacar outliers.
  CA: compare_checklist.md.
  Dep: T-447,T-458
  
  _Labels:_ `qa,analytics`

- [ ] **T-515** — Checagem comparativa #15
  
  Descrição: Comparar KPIs/custos entre projetos e ambientes; destacar outliers.
  CA: compare_checklist.md.
  Dep: T-447,T-458
  
  _Labels:_ `qa,analytics`

- [ ] **T-516** — Checagem comparativa #16
  
  Descrição: Comparar KPIs/custos entre projetos e ambientes; destacar outliers.
  CA: compare_checklist.md.
  Dep: T-447,T-458
  
  _Labels:_ `qa,analytics`

- [ ] **T-517** — Checagem comparativa #17
  
  Descrição: Comparar KPIs/custos entre projetos e ambientes; destacar outliers.
  CA: compare_checklist.md.
  Dep: T-447,T-458
  
  _Labels:_ `qa,analytics`

- [ ] **T-518** — Checagem comparativa #18
  
  Descrição: Comparar KPIs/custos entre projetos e ambientes; destacar outliers.
  CA: compare_checklist.md.
  Dep: T-447,T-458
  
  _Labels:_ `qa,analytics`

- [ ] **T-519** — Checagem comparativa #19
  
  Descrição: Comparar KPIs/custos entre projetos e ambientes; destacar outliers.
  CA: compare_checklist.md.
  Dep: T-447,T-458
  
  _Labels:_ `qa,analytics`

- [ ] **T-520** — Checagem comparativa #20
  
  Descrição: Comparar KPIs/custos entre projetos e ambientes; destacar outliers.
  CA: compare_checklist.md.
  Dep: T-447,T-458
  
  _Labels:_ `qa,analytics`

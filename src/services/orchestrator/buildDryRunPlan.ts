import { OrchestrateInput } from './schemas.js';

export function buildDryRunPlan(input: OrchestrateInput): string[] {
  const lines: string[] = [];
  lines.push(`Plano de execução — projeto ${input.project}`);
  lines.push('1. azion.create_bucket');
  if (input.upload) {
    lines.push(`2. azion.upload_dir (localDir=${input.upload.localDir}, dryRun=${input.upload.dryRun ?? false})`);
  } else {
    lines.push('2. (pular upload — não configurado)');
  }
  lines.push('3. azion.create_edge_application');
  lines.push('4. azion.create_edge_connector');
  lines.push('5. azion.create_cache_rule (ou regra padrão cache)');
  lines.push('6. azion.create_domain');
  lines.push('7. azion.create_firewall → azion.create_waf_ruleset → azion.apply_waf_ruleset → azion.configure_waf');
  if (input.postDeploy) {
    lines.push('8. azion.post_deploy_check');
  } else {
    lines.push('8. (post-deploy opcional não configurado)');
  }
  lines.push('9. Registrar relatório em .mcp-state/orchestration/runs/ ao executar modo real');
  lines.push('---');
  lines.push('Observação: definir registros DNS para o domínio após criação.');
  return lines;
}

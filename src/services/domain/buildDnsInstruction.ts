import { AzionDomain } from '../../models/azionDomain.js';

export function buildDnsInstruction(domain: AzionDomain): string[] {
  const lines: string[] = [];
  lines.push(`Instruções DNS para ${domain.name}`);
  lines.push('');
  if (domain.cnames?.length) {
    lines.push('Crie os seguintes registros CNAME:');
    for (const cname of domain.cnames) {
      lines.push(`- Host: ${domain.name} -> Target: ${cname.dns_name} (TTL ${cname.ttl}s)`);
    }
  } else {
    lines.push(`Crie um registro CNAME apontando ${domain.name} para ${domain.cname}.`);
  }
  lines.push('');
  lines.push('Após propagação, valide acesso via HTTPS.');
  return lines;
}

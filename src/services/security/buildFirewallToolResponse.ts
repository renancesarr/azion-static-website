import { ToolResponse } from '../../models/toolResponse.js';
import { FirewallRecord } from '../../models/entities/firewallRecord.js';
import { statePath } from '../../utils/state.js';
import { FIREWALL_STATE_FILE } from './constants.js';

export function buildFirewallToolResponse(message: string, record: FirewallRecord): ToolResponse {
  return {
    content: [
      {
        type: 'text',
        text: [
          message,
          `- ID: ${record.id}`,
          `- Nome: ${record.name}`,
          `- Domínios: ${record.domainIds.join(', ')}`,
          `- State: ${statePath(FIREWALL_STATE_FILE)}`,
        ].join('\n'),
      },
    ],
  };
}

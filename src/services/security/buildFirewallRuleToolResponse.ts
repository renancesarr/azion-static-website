import { ToolResponse } from '../../models/toolResponse.js';
import { FirewallRuleBinding } from '../../models/firewallRuleBinding.js';
import { statePath } from '../../utils/state.js';
import { FIREWALL_RULE_STATE_FILE } from './constants.js';

export function buildFirewallRuleToolResponse(message: string, record: FirewallRuleBinding): ToolResponse {
  return {
    content: [
      {
        type: 'text',
        text: [
          message,
          `- Firewall ID: ${record.firewallId}`,
          `- Ruleset ID: ${record.rulesetId}`,
          `- Rule ID: ${record.id}`,
          `- State: ${statePath(FIREWALL_RULE_STATE_FILE)}`,
        ].join('\n'),
      },
    ],
  };
}

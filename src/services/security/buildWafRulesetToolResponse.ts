import { ToolResponse } from '../../models/toolResponse.js';
import { WafRulesetRecord } from '../../models/entities/wafRulesetRecord.js';
import { statePath } from '../../utils/state.js';
import { WAF_RULESET_STATE_FILE } from './constants.js';

export function buildWafRulesetToolResponse(message: string, record: WafRulesetRecord): ToolResponse {
  return {
    content: [
      {
        type: 'text',
        text: [
          message,
          `- ID: ${record.id}`,
          `- Mode: ${record.mode}`,
          `- State: ${statePath(WAF_RULESET_STATE_FILE)}`,
        ].join('\n'),
      },
    ],
  };
}

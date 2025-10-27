import { ToolResponse } from '../../models/toolResponse.js';
import { WafPolicyRecord } from '../../models/entities/wafPolicyRecord.js';
import { statePath } from '../../utils/state.js';
import { WAF_STATE_FILE } from './constants.js';

export function buildWafToolResponse(prefix: string, record: WafPolicyRecord): ToolResponse {
  return {
    content: [
      {
        type: 'text',
        text: [
          `${prefix}`,
          `- Edge Application: ${record.edgeApplicationId}`,
          `- WAF ID: ${record.wafId}`,
          `- Mode: ${record.mode}`,
          `- Enabled: ${record.enabled}`,
          `- State: ${statePath(WAF_STATE_FILE)}`,
        ].join('\n'),
      },
    ],
  };
}

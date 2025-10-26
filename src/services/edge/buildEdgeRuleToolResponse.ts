import { ToolResponse } from '../../models/toolResponse.js';
import { EdgeRuleRecord } from '../../models/entities/edgeRuleRecord.js';
import { statePath } from '../../utils/state.js';
import { EDGE_RULE_STATE_FILE } from './constants.js';

export function buildEdgeRuleToolResponse(
  message: string,
  record: EdgeRuleRecord,
): ToolResponse {
  return {
    content: [
      {
        type: 'text',
        text: [
          message,
          `- Edge App ID: ${record.edgeApplicationId}`,
          `- Rule ID: ${record.id}`,
          `- Phase: ${record.phase}`,
          `- Order: ${record.order}`,
          `- State: ${statePath(EDGE_RULE_STATE_FILE)}`,
        ].join('\n'),
      },
    ],
  };
}

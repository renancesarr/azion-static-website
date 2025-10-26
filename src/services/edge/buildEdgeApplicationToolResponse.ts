import { ToolResponse } from '../../models/toolResponse.js';
import { EdgeApplicationRecord } from '../../models/entities/edgeApplicationRecord.js';
import { statePath } from '../../utils/state.js';
import { EDGE_APP_STATE_FILE } from './constants.js';

export function buildEdgeApplicationToolResponse(
  message: string,
  record: EdgeApplicationRecord,
): ToolResponse {
  return {
    content: [
      {
        type: 'text',
        text: [
          message,
          `- Name: ${record.name}`,
          `- ID: ${record.id}`,
          `- WAF: ${record.enableWaf ? 'ativo' : 'inativo'}`,
          `- State: ${statePath(EDGE_APP_STATE_FILE)}`,
        ].join('\n'),
      },
    ],
  };
}

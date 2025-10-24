import { ToolResponse } from '../../models/toolResponse.js';
import { EdgeConnectorRecord } from '../../models/edgeConnectorRecord.js';
import { statePath } from '../../utils/state.js';
import { EDGE_CONNECTOR_STATE_FILE } from './constants.js';

export function buildEdgeConnectorToolResponse(
  message: string,
  record: EdgeConnectorRecord,
): ToolResponse {
  return {
    content: [
      {
        type: 'text',
        text: [
          message,
          `- Name: ${record.name}`,
          `- ID: ${record.id}`,
          `- Bucket: ${record.bucketName ?? record.bucketId}`,
          `- State: ${statePath(EDGE_CONNECTOR_STATE_FILE)}`,
        ].join('\n'),
      },
    ],
  };
}

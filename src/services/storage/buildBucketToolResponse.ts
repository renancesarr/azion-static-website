import { ToolResponse } from '../../models/shared/toolResponse.js';
import { StorageBucketRecord } from '../../models/entities/storageBucketRecord.js';
import { statePath } from '../../utils/state.js';
import { STORAGE_STATE_FILE } from './constants.js';

export function buildBucketToolResponse(message: string, bucket: StorageBucketRecord): ToolResponse {
  return {
    content: [
      {
        type: 'text',
        text: `${message}\n- Bucket: ${bucket.name}\n- ID: ${bucket.id}\n- Edge Access: ${bucket.edgeAccess ?? 'n/d'}\n- State File: ${statePath(STORAGE_STATE_FILE)}`,
      },
    ],
  };
}

import { statePath } from '../../utils/state.js';
import { ToolResponse } from '../../models/toolResponse.js';
import { DomainRecord } from '../../models/domainRecord.js';
import { DOMAIN_STATE_FILE } from './constants.js';

export function buildDomainToolResponse(prefix: string, record: DomainRecord): ToolResponse {
  return {
    content: [
      {
        type: 'text',
        text: [
          `${prefix}`,
          `- Domain: ${record.name}`,
          `- ID: ${record.id}`,
          `- Edge Application: ${record.edgeApplicationId}`,
          `- CNAME: ${record.cname || 'n/d'}`,
          `- State: ${statePath(DOMAIN_STATE_FILE)}`,
        ].join('\n'),
      },
    ],
  };
}

import { HttpError } from '../../utils/http.js';
import { AzionWafPolicy } from '../../models/azionWafPolicy.js';
import { AzionWafResponse } from '../../models/azionWafResponse.js';
import { ConfigureWafInput } from './schemas.js';
import { buildWafRecord } from './buildWafRecord.js';
import { persistWaf } from './persistWaf.js';
import { fetchWafByEdgeAppApi } from './fetchWafByEdgeAppApi.js';
import type { SecurityDependencies } from './types.js';
import { defaultSecurityDependencies } from './dependencies.js';

export async function configureWafViaApi(
  input: ConfigureWafInput,
  deps: SecurityDependencies = defaultSecurityDependencies,
) {
  try {
    const response = await deps.http<AzionWafResponse>({
      method: 'POST',
      url: `${deps.apiBase}/v4/waf/policies`,
      body: {
        edge_application_id: input.edgeApplicationId,
        waf_id: input.wafId,
        mode: input.mode,
        enabled: input.enable,
      },
    });

    const payload = response.data.results ?? response.data.data ?? (response.data as unknown as AzionWafPolicy);
    return await persistWaf(buildWafRecord(payload));
  } catch (error: unknown) {
    if (error instanceof HttpError && error.status === 409) {
      const existing = await fetchWafByEdgeAppApi(input.edgeApplicationId, deps);
      if (existing) {
        return await persistWaf(buildWafRecord(existing));
      }
    }
    throw error;
  }
}

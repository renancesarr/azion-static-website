import { PostDeployPathEntryData } from '../../models/shared/postDeployPathEntryData.js';
import { PostDeployCheckInput } from './schemas.js';

export function buildPathEntries(input: PostDeployCheckInput): PostDeployPathEntryData[] {
  const { expectedStatus, assertions } = input;
  const baseHeaders = assertions?.headers ?? {};
  const bodyIncludes = assertions?.bodyIncludes ?? [];

  return (input.paths ?? ['/']).map((entry) => {
    if (typeof entry === 'string') {
      return {
        path: entry,
        expectedStatus,
        headers: baseHeaders,
        bodyIncludes,
      } satisfies PostDeployPathEntryData;
    }

    return {
      path: entry.path,
      expectedStatus: entry.expectedStatus ?? expectedStatus,
      headers: { ...baseHeaders, ...(entry.headers ?? {}) },
      bodyIncludes: [...bodyIncludes, ...(entry.bodyIncludes ?? [])],
    } satisfies PostDeployPathEntryData;
  });
}

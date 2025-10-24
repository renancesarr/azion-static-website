import { PostDeployPathEntry } from '../../models/postDeployPathEntry.js';
import { PostDeployCheckInput } from './schemas.js';

export function buildPathEntries(input: PostDeployCheckInput): PostDeployPathEntry[] {
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
      } satisfies PostDeployPathEntry;
    }

    return {
      path: entry.path,
      expectedStatus: entry.expectedStatus ?? expectedStatus,
      headers: { ...baseHeaders, ...(entry.headers ?? {}) },
      bodyIncludes: [...bodyIncludes, ...(entry.bodyIncludes ?? [])],
    } satisfies PostDeployPathEntry;
  });
}

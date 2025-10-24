import { UploadCandidate } from '../../models/uploadCandidate.js';
import { UploadIndexFile } from '../../models/uploadIndexFile.js';
import { WalkEntry } from '../../utils/fs.js';
import { hashFileSHA256 } from '../../utils/hash.js';
import { inferEncoding } from '../../utils/mime.js';
import { UploadDirInput } from './schemas.js';
import { applyPrefix, normalizeObjectPath } from './objectPath.js';
import { buildUploadReportEntry } from './buildUploadReportEntry.js';
import type { UploadPlan } from './types.js';

function buildObjectPath(entry: WalkEntry, input: UploadDirInput): string {
  const basePath =
    input.stripGzipExtension && entry.relativePath.toLowerCase().endsWith('.gz')
      ? entry.relativePath.slice(0, -3)
      : entry.relativePath;
  return applyPrefix(normalizeObjectPath(basePath), input.prefix);
}

export async function planUploadCandidates(
  entries: WalkEntry[],
  index: UploadIndexFile,
  input: UploadDirInput,
): Promise<UploadPlan> {
  const candidates: UploadCandidate[] = [];
  const skipped: UploadPlan['skipped'] = [];
  const nextIndexFiles: UploadPlan['nextIndexFiles'] = {};

  for (const entry of entries) {
    const objectPath = buildObjectPath(entry, input);
    const hash = await hashFileSHA256(entry.absolutePath);
    const { contentType, contentEncoding } = inferEncoding(entry.relativePath);

    const candidate: UploadCandidate = {
      absolutePath: entry.absolutePath,
      relativePath: entry.relativePath,
      objectPath,
      hash,
      size: entry.size,
      contentType,
      contentEncoding,
    };

    const previous = index.files[objectPath];
    if (previous && previous.hash === hash) {
      skipped.push(buildUploadReportEntry(candidate, 'skipped', 0));
      nextIndexFiles[objectPath] = {
        ...previous,
        hash,
        size: entry.size,
        updatedAt: new Date().toISOString(),
        contentType,
        contentEncoding,
        sourcePath: entry.relativePath,
      };
      continue;
    }

    candidates.push(candidate);
  }

  return { candidates, skipped, nextIndexFiles };
}

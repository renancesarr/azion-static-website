import { McpServer } from '@modelcontextprotocol/sdk/dist/esm/server/mcp.js';
import { ToolResponse } from '../../models/shared/toolResponse.js';
import { ToolExecutionContext } from '../../models/shared/toolExecutionContext.js';
import { inferEncoding, lookupMimeType } from '../../utils/mime.js';
import { statePath } from '../../utils/state.js';
import { defaultStorageDependencies } from './dependencies.js';
import type { StorageDependencies } from './types.js';
import { resolveBucketReference } from './resolveBucketReference.js';
import { PutObjectInput } from './schemas.js';
import { hashBufferSHA256 } from './hashBuffer.js';
import { loadUploadIndex, saveUploadIndex } from './uploadIndex.js';
import { buildObjectUrl } from './buildObjectUrl.js';
import { normalizeObjectPath } from './objectPath.js';
import { uploadIndexRelativePath } from './paths.js';

export async function handlePutObject(
  server: McpServer,
  input: PutObjectInput,
  ctx: ToolExecutionContext,
  deps: StorageDependencies = defaultStorageDependencies,
): Promise<ToolResponse> {
  const bucket = await resolveBucketReference(
    { bucketId: input.bucketId, bucketName: input.bucketName },
    deps,
  );

  const objectPath = normalizeObjectPath(input.objectPath);
  const buffer = Buffer.from(input.contentBase64, 'base64');
  const hash = input.sha256 ?? hashBufferSHA256(buffer);

  const encodingInfo =
    input.contentType || input.contentEncoding
      ? {
          contentType: input.contentType ?? lookupMimeType(objectPath),
          contentEncoding: input.contentEncoding,
        }
      : inferEncoding(objectPath);

  await deps.http.request({
    method: 'PUT',
    url: buildObjectUrl(deps.apiBase, bucket.id, objectPath),
    body: buffer,
    headers: {
      'Content-Type': encodingInfo.contentType,
      ...(encodingInfo.contentEncoding ? { 'Content-Encoding': encodingInfo.contentEncoding } : {}),
      'X-Checksum-Sha256': hash,
    },
  });

  let index = await loadUploadIndex(deps.state, bucket);
  const nextFiles = {
    ...index.files,
    [objectPath]: {
      hash,
      size: buffer.length,
      objectPath,
      updatedAt: new Date().toISOString(),
      contentType: encodingInfo.contentType,
      contentEncoding: encodingInfo.contentEncoding,
    },
  };
  index = index.withFiles(nextFiles).withUpdatedAt(new Date().toISOString());
  await saveUploadIndex(deps.state, bucket, index);

  await server.sendLoggingMessage(
    {
      level: 'info',
      data: `Objeto ${objectPath} enviado ao bucket ${bucket.name}.`,
    },
    ctx.sessionId,
  );

  return {
    content: [
      {
        type: 'text',
        text: `Objeto publicado com sucesso.\n- Bucket: ${bucket.name} (${bucket.id})\n- Path: ${objectPath}\n- Bytes: ${buffer.length}\n- SHA256: ${hash}\n- Index: ${statePath(uploadIndexRelativePath(bucket))}`,
      },
    ],
  };
}

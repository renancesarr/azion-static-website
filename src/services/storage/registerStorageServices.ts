import { McpServer } from '@modelcontextprotocol/sdk/dist/esm/server/mcp.js';
import { createBucketSchema, putObjectSchema, uploadDirSchema } from '../../constants/storageSchemas.js';
import { ToolExecutionContext } from '../../models/toolExecutionContext.js';
import { ToolResponse } from '../../models/toolResponse.js';
import { defaultStorageDependencies } from './dependencies.js';
import type { StorageDependencies } from './types.js';
import { lookupBucketByName } from './lookupBucket.js';
import { createBucketViaApi } from './createBucketViaApi.js';
import { buildBucketToolResponse } from './buildBucketToolResponse.js';
import { handlePutObject } from './handlePutObject.js';
import { processUploadDir } from './processUploadDir.js';

export function registerStorageServices(
  server: McpServer,
  deps: StorageDependencies = defaultStorageDependencies,
): void {
  server.registerTool(
    'azion.create_bucket',
    {
      title: 'Criar bucket no Edge Storage',
      description: 'Provisiona bucket na Azion com idempotência. Persiste metadados em .mcp-state.',
      inputSchema: createBucketSchema,
    },
    async (args: unknown, extra: ToolExecutionContext = {}): Promise<ToolResponse> => {
      const parsed = createBucketSchema.parse(args ?? {});
      const sessionId = extra.sessionId;

      const existing = await lookupBucketByName(deps.state, parsed.name);
      if (existing) {
        await server.sendLoggingMessage(
          {
            level: 'info',
            data: `Bucket ${parsed.name} já registrado em cache local. Pulando criação.`,
          },
          sessionId,
        );
        return buildBucketToolResponse('Bucket reutilizado a partir do estado local.', existing);
      }

      const record = await createBucketViaApi(parsed, deps);
      await server.sendLoggingMessage(
        {
          level: 'info',
          data: `Bucket ${parsed.name} criado ou recuperado via API.`,
        },
        sessionId,
      );

      return buildBucketToolResponse('Bucket provisionado com sucesso.', record);
    },
  );

  server.registerTool(
    'azion.put_object',
    {
      title: 'Enviar objeto individual ao Edge Storage',
      description: 'Realiza upload de um único arquivo (conteúdo base64) para o bucket especificado.',
      inputSchema: putObjectSchema,
    },
    async (args: unknown, extra: ToolExecutionContext = {}): Promise<ToolResponse> => {
      const parsed = putObjectSchema.parse(args ?? {});
      return await handlePutObject(server, parsed, extra, deps);
    },
  );

  server.registerTool(
    'azion.upload_dir',
    {
      title: 'Upload de diretório completo',
      description:
        'Publica um diretório local inteiro no bucket Azion. Reaproveita uploads anteriores via hash, suporta dry-run e gera relatórios em .mcp-state.',
      inputSchema: uploadDirSchema,
    },
    async (args: unknown, extra: ToolExecutionContext = {}): Promise<ToolResponse> => {
      const parsed = uploadDirSchema.parse(args ?? {});
      const execution = await processUploadDir(server, parsed, extra, deps);
      return {
        content: [
          {
            type: 'text',
            text: execution.summaryLines.join('\n'),
          },
        ],
      };
    },
  );
}

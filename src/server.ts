import { McpServer } from '@modelcontextprotocol/sdk/dist/esm/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/dist/esm/server/stdio.js';
import { MissingEnvError, requiredEnv } from './utils/env.js';
import { registerStorageTools } from './tools/storage.js';
import { registerEdgeTools } from './tools/edge.js';
import { registerDomainTools } from './tools/domain.js';
import { registerSecurityTools } from './tools/security.js';
import { registerOrchestratorTools } from './tools/orchestrator.js';
import { registerPostDeployTools } from './tools/postDeploy.js';
import { registerValidationTools } from './tools/validation.js';

const server = new McpServer(
  {
    name: 'azion-mcp',
    version: '0.1.0',
    description: 'Provisionador MCP para sites estáticos na Azion',
  },
  {
    capabilities: {
      logging: {},
    },
  },
);

registerStorageTools(server);
registerEdgeTools(server);
registerDomainTools(server);
registerSecurityTools(server);
registerOrchestratorTools(server);
registerPostDeployTools(server);
registerValidationTools(server);

server.registerTool(
  'azion.health_check',
  {
    title: 'Health Check',
    description: 'Retorna status do agente e timestamp atual.',
  },
  async () => ({
    content: [
      {
        type: 'text',
        text: `Azion MCP online @ ${new Date().toISOString()}`,
      },
    ],
  }),
);

const transport = new StdioServerTransport();

async function main(): Promise<void> {
  console.info('[startup] inicializando Azion MCP...');
  process.on('uncaughtException', (error) => {
    console.error('[fatal] uncaughtException', error);
    process.exitCode = 1;
  });

  process.on('unhandledRejection', (reason) => {
    console.error('[fatal] unhandledRejection', reason);
    process.exitCode = 1;
  });

  try {
    requiredEnv('AZION_TOKEN');
  } catch (error) {
    if (error instanceof MissingEnvError) {
      console.error('[startup] falha: variável obrigatória ausente.', error.message);
      process.exit(1);
      return;
    }
    throw error;
  }

  await server.connect(transport);
  await server.server.sendLoggingMessage({
    level: 'info',
    data: 'Azion MCP server started via stdio transport.',
  });

  const shutdown = async (signal: string) => {
    console.error(`[signal] ${signal} recebido; encerrando MCP...`);
    await transport.close();
    process.exit(0);
  };

  process.once('SIGINT', () => void shutdown('SIGINT'));
  process.once('SIGTERM', () => void shutdown('SIGTERM'));

  console.info('[startup] agente pronto para receber requisições.');
}

void main();

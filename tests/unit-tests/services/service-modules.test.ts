import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const servicesRoot = path.resolve(__dirname, '../../../src/services');

async function collectServiceFiles(dir: string): Promise<string[]> {
  const dirents = await fs.readdir(dir, { withFileTypes: true });
  const entries = await Promise.all(
    dirents.map(async (dirent) => {
      const fullPath = path.join(dir, dirent.name);
      if (dirent.isDirectory()) {
        return collectServiceFiles(fullPath);
      }

      if (dirent.isFile() && dirent.name.endsWith('.ts')) {
        return [path.relative(servicesRoot, fullPath)];
      }

      return [];
    }),
  );

  return entries.flat();
}

describe('service module imports', () => {
  let serviceFiles: string[];

  beforeAll(async () => {
    process.env.AZION_API_BASE = process.env.AZION_API_BASE ?? 'https://api.azion.com';
    serviceFiles = await collectServiceFiles(servicesRoot);
  });

  it('encontrou arquivos de serviço para teste', () => {
    expect(serviceFiles.length).toBeGreaterThan(0);
  });

  it('importa módulos sem acessar dependências reais', async () => {
    expect.hasAssertions();
    for (const relativePath of serviceFiles) {
      const normalized = relativePath.split(path.sep).join('/');
      const importPath = `../../../src/services/${normalized.replace(/\.ts$/, '.js')}`;

      const module = await import(importPath);

      expect(module).toBeDefined();
    }
  });
});

import { jest } from '@jest/globals';
import { ValidationCheckResult } from '../../../../src/models/entities/validationCheckResult.js';
import { inspectUploadLogs } from '../../../../src/services/validation/inspectUploadLogs.js';

describe('inspectUploadLogs', () => {
  const deps = {
    readDir: jest.fn(),
    readFile: jest.fn(),
  } as any;

  beforeEach(() => {
    deps.readDir.mockReset();
    deps.readFile.mockReset();
  });

  it('retorna alerta quando diretório vazio', async () => {
    deps.readDir.mockResolvedValue([]);

    const result = await inspectUploadLogs(3, deps);
    expect(result[0]).toBeInstanceOf(ValidationCheckResult);
    expect(result[0].ok).toBe(false);
  });

  it('lê logs recentes e resume métricas', async () => {
    deps.readDir.mockResolvedValue(['upload-1.json', 'upload-2.json']);
    deps.readFile.mockResolvedValueOnce(JSON.stringify({ totals: { uploaded: 10, skipped: 2, failed: 0 } }));
    deps.readFile.mockResolvedValueOnce(JSON.stringify({ totals: { uploaded: 5, skipped: 1, failed: 1 } }));

    const result = await inspectUploadLogs(2, deps);

    expect(result).toHaveLength(2);
    expect(result[0].detail).toContain('enviados=10');
    expect(result[0].ok).toBe(true);
  });

  it('retorna erro formatado em caso de falha de IO', async () => {
    deps.readDir.mockRejectedValue(new Error('boom'));

    const result = await inspectUploadLogs(1, deps);
    expect(result[0].detail).toContain('boom');
  });
});

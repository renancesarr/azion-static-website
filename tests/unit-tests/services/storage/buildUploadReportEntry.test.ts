import { buildUploadReportEntry } from '../../../../src/services/storage/buildUploadReportEntry.js';

describe('buildUploadReportEntry', () => {
  const candidate = {
    objectPath: 'index.html',
    hash: 'hash',
    size: 123,
  } as any;

  it('monta entrada sem erro', () => {
    const entry = buildUploadReportEntry(candidate, 'uploaded', 1);
    expect(entry).toEqual({
      objectPath: 'index.html',
      hash: 'hash',
      size: 123,
      status: 'uploaded',
      attempts: 1,
      error: undefined,
    });
  });

  it('inclui mensagem de erro quando fornecida', () => {
    const entry = buildUploadReportEntry(candidate, 'failed', 3, new Error('boom'));
    expect(entry.error).toBe('Error: boom');
  });
});

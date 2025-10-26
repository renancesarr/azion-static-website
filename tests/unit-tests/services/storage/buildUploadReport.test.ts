import { buildUploadReport } from '../../../../src/services/storage/buildUploadReport.js';

describe('buildUploadReport', () => {
  it('agrega métricas do upload', () => {
    const bucket = { id: 'bucket-1', name: 'assets' } as any;
    const started = new Date('2024-01-01T10:00:00Z');
    const finished = new Date('2024-01-01T10:05:00Z');

    const report = buildUploadReport(
      bucket,
      [{ objectPath: 'skip', hash: '1', size: 1, status: 'skipped', attempts: 0 }],
      [{ objectPath: 'up', hash: '2', size: 2, status: 'uploaded', attempts: 1 }],
      [{ objectPath: 'fail', hash: '3', size: 3, status: 'failed', attempts: 2, error: 'boom' }],
      2,
      3,
      { prefix: 'public', dryRun: false } as any,
      started,
      finished,
    );

    expect(report.bucketId).toBe('bucket-1');
    expect(report.totals).toEqual({
      scanned: 3,
      skipped: 1,
      toUpload: 2,
      uploaded: 1,
      failed: 1,
    });
    expect(report.entries).toHaveLength(3);
    expect(report.startedAt).toBe(started.toISOString());
    expect(report.finishedAt).toBe(finished.toISOString());
  });
});

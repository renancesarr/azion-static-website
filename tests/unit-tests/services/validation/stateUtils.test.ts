import { jest } from '@jest/globals';
import { readState, summarizeState, listIds } from '../../../../src/services/validation/stateUtils.js';

describe('validation stateUtils', () => {
  it('lê estado através do repositório', async () => {
    const repository = {
      read: jest.fn().mockResolvedValue({ value: 1 }),
    } as any;

    const result = await readState<{ value: number }>(repository, 'path');

    expect(repository.read).toHaveBeenCalledWith('path');
    expect(result).toEqual({ value: 1 });
  });

  it('resume estado indicando sucesso ou falha', () => {
    const ok = summarizeState('Check', true, 'Tudo certo');
    expect(ok).toEqual({ name: 'Check', ok: true, detail: 'Tudo certo' });

    const list = listIds({ a: { id: '1' }, b: { id: '2' } });
    expect(list).toBe('1, 2');
    expect(listIds(undefined)).toBe('n/d');
    expect(listIds({})).toBe('n/d');
  });
});

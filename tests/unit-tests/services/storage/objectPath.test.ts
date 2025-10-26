import { normalizeObjectPath, applyPrefix } from '../../../../src/services/storage/objectPath.js';

describe('objectPath utilities', () => {
  it('normaliza barras e remove leading slash', () => {
    expect(normalizeObjectPath('\\folder\\file.txt')).toBe('folder/file.txt');
    expect(normalizeObjectPath('/folder/file.txt')).toBe('folder/file.txt');
  });

  it('aplica prefixo quando fornecido', () => {
    expect(applyPrefix('file.txt', 'assets')).toBe('assets/file.txt');
    expect(applyPrefix('file.txt', undefined)).toBe('file.txt');
    expect(applyPrefix('file.txt', '/')).toBe('file.txt');
  });
});

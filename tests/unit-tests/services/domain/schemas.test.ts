import { createDomainInputSchema, dnsInstructionsInputSchema } from '../../../../src/services/domain/schemas.js';

describe('domain schemas', () => {
  it('valida entradas de criação de domínio com padrão ativo', () => {
    const parsed = createDomainInputSchema.parse({
      name: 'example.com',
      edgeApplicationId: 'edge-1',
    });

    expect(parsed).toEqual({
      name: 'example.com',
      edgeApplicationId: 'edge-1',
      isActive: true,
    });
  });

  it('aceita cname opcional e sinaliza valores inválidos', () => {
    const parsed = createDomainInputSchema.parse({
      name: 'blog.example.com',
      edgeApplicationId: 'edge-1',
      isActive: false,
      cname: 'blog.example.com.azioncdn.net',
    });

    expect(parsed.cname).toBe('blog.example.com.azioncdn.net');
  });

  it('schema de instruções DNS exige domainName', () => {
    const parsed = dnsInstructionsInputSchema.parse({ domainName: 'example.com' });
    expect(parsed.domainName).toBe('example.com');
  });
});

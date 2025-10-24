# AD-001 — Estrutura modular do service de Storage

- **Contexto:** O monolito `src/services/storage.ts` acumulava responsabilidades (schemas, constantes, chamadas HTTP, relatórios) e declarava interfaces inline. Isso dificultava reuso, testes unitários e aplicação de princípios SOLID solicitados.
- **Opções avaliadas:**  
  1. Manter o arquivo único adicionando comentários e seções internas.  
  2. Modularizar em subpastas específicas (`src/services/storage/**`) com separação de responsabilidades, exportando contratos tipados e centralizando constantes em `src/constants/*`.
- **Decisão:** Adotar a modularização completa (opção 2). Cada interface ou schema deve residir em arquivo próprio dentro de `src/models`, `src/services/<service>/schemas.ts` ou `src/constants/*.ts`, evitando declarações inline. Services passam a expor apenas funções públicas via `index.ts`.
- **Racional:** Facilita aplicação de SRP/OCP, permite que orquestradores injete dependências, viabiliza testes segmentados e reduz risco de regressão quando novos fluxos de upload forem adicionados.
- **Data:** 2025-01-13
- **Autor:** AzionProvisioningDev

# Ideia do Projeto

Provisionar **automaticamente** um site estático na **Azion**, usando um **agente MCP** (rodando dentro do VSCode) capaz de:
- coletar inputs do usuário (token, domínio, caminho dos arquivos),
- criar bucket de Storage e **publicar** os arquivos com MIME/encoding corretos,
- criar **Edge Application**, **Edge Connector** e **Regra de Origem**,
- configurar **Domínio** e orientar **DNS**,
- aplicar **WAF** com ruleset em modo adequado,
- orquestrar o fluxo ponta-a-ponta e **persistir IDs/artefatos**,
- integrar **CI/CD** (build, deploy, checks) e prover **observabilidade** (logs/relatórios),
- oferecer **teardown seguro** com auditoria.

A direção é um CLI/Agente reproduzível e auditável, entregando conteúdo globalmente com baixa latência e segurança.

## Por quê agora?
- Infra como API pela Azion viabiliza automação fina do edge.
- Sites estáticos dominam boa parte do conteúdo público e pedem **latência + cache** na borda.
- O agente encapsula complexidade (ordem, dependências e validação) e reduz **tempo de onboarding**.

## Saídas esperadas
- `summary.json` com IDs dos recursos e estado final;
- `uploads.log` e `uploads_summary.csv`;
- workflows em **CI** para publicação contínua;
- documentação de **DNS**, **WAF** e **teardown**.

## Não-objetivos (v1)
- Renderização dinâmica pesada;
- Multi-tenant complexo; 
- Automação de migração de conteúdo legado.

---
_Nota_: este resumo reflete fielmente o plano técnico e o backlog atuais.

# Relatório de auditoria — <projeto>

> Auditoria **somente leitura**: nenhuma correção foi implementada. Toda conclusão abaixo aponta para uma evidência em `evidencias/`.
> Item sem evidência deve dizer "não verificado" e o motivo.

## A. Resumo executivo
- **Objetivo do projeto:**
- **Escopo da auditoria:** (o que entrou e o que ficou de fora, e por quê)
- **Principais conclusões:** (3 a 5 frases)
- **Problemas mais relevantes:** (IDs, gravidade)
- **Limitações importantes:**

## B. Informações da execução
| Item | Valor |
|---|---|
| Modo | ciclos (planejados X · concluídos Y) / tempo (planejado X min · efetivo Y) |
| Data / período | |
| Tecnologias identificadas | |
| Ferramentas utilizadas | (do `audit.json` → `ferramentas`) |
| Ambiente testado | (URL, local/teste, sandbox) |
| Integridade do projeto | (resultado do `verificar`: intacto / alterações + explicação) |
| Limitações do ambiente | |

## C. Mapa de funcionalidades
(Resumo de `mapa-do-sistema.md`: funcionalidade, módulo, situação de cobertura)

## D. Resultados dos testes
| Situação | Cenários (IDs) |
|---|---|
| Aprovados | |
| Reprovados | |
| Bloqueados | |
| Não verificáveis | |
| Não executados / pendentes | |

Testes de código: suítes executadas (comando, resultado, log em `evidencias/`), erros originados pelo ambiente de teste (não são defeitos do produto) e funcionalidades sem teste automatizado.

## E. Problemas encontrados (BUG-)
### BUG-001 — <título>
| Campo | Valor |
|---|---|
| Categoria / gravidade / prioridade | |
| Estado da investigação / confiança | confirmado·provável·suspeito·inconclusivo / alta·média·baixa |
| Funcionalidades e onde | FUN-…, arquivos, componentes, rotas |
- **Descrição:**
- **Esperado:** · **Observado:**
- **Passos para reproduzir:** 1. …
- **Evidências:** `evidencias/…`
- **Causa provável:** (só com evidência suficiente; senão, as hipóteses)
- **Impacto técnico:** · **Impacto para o usuário:**
- **Como foi investigado:**
- **Limitações da investigação:**
- **Recomendação de correção** (não implementada):

## F. Auditoria visual e experiência do usuário (VIS-)
| ID | Página / componente | Tela (resolução) | Observado | Impacto | Evidência | Tipo | Recomendação |
|---|---|---|---|---|---|---|---|

Tipo = **defeito objetivo** (comprovado) ou **oportunidade de melhoria**. A opinião subjetiva de design vai para a seção H, marcada como tal. Resumo da varredura automática: `evidencias/visual.md`.

## G. Auditoria de segurança (SEC-)
| ID | Categoria de risco | Descrição | Componente | Evidência | Impacto potencial | Gravidade | Estado | Mitigação recomendada | Limitações |
|---|---|---|---|---|---|---|---|---|---|

O estado é um destes: confirmado, provável, suspeito ou preventivo. **Nunca** inclua valores de credenciais, tokens ou senhas: cite o arquivo, a linha e o tipo.

## H. Melhorias recomendadas (MEL-)
Agrupadas por categoria: funcionalidade, usabilidade, interface visual, acessibilidade, desempenho, arquitetura, manutenibilidade, segurança, experiência do usuário.

| ID | Categoria | Oportunidade | Problema ou necessidade | Benefício esperado | Prioridade | Justificativa | Impactos/riscos | Como implementar (proposta) |
|---|---|---|---|---|---|---|---|---|

> Todas são **propostas**. Nenhuma foi implementada.

## I. Matriz de cobertura dos testes
(Cole aqui a saída de `auditor.mjs stats`: totais, método de cálculo e matriz. Não ajuste os números à mão. Se precisar mudar algo, corrija o `audit.json` e rode de novo.)

## J. Histórico dos ciclos de auditoria
| Ciclo | Objetivo | Atividades | Funcionalidades examinadas | Testes executados | Problemas encontrados | Investigações concluídas | Pendências | Artefatos |
|---|---|---|---|---|---|---|---|---|

Modo ciclos: quantidade planejada × concluída. Modo tempo: duração planejada × efetiva. Explique o motivo de qualquer interrupção ou ciclo não concluído.

## K. Limitações e itens pendentes (LIM-)
| ID | O que não foi verificado | Por quê | Impacto nas conclusões | O que seria necessário |
|---|---|---|---|---|

## L. Conclusão técnica
- **Principais riscos:**
- **Atenção prioritária:**
- **Áreas com cobertura insuficiente:**
- **Melhorias mais relevantes:**
- **Limitações que impedem conclusões definitivas:**
- **Próximas verificações recomendadas:**

> Não encontrar problemas não prova que eles não existam. Esta conclusão vale para a cobertura alcançada (seção I) e as evidências obtidas.

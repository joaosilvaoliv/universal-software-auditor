# Universal Software Auditor

Skill que transforma um agente de programação (**Claude Code** ou **Google Antigravity**) num **auditor autônomo de software**. Ele lê o projeto, mapeia funcionalidades, testa código e aplicação (incluindo navegador com Playwright e auditoria visual em 3 tamanhos de tela), verifica segurança sem nada destrutivo, investiga as falhas e entrega um **relatório Markdown com evidências e recomendações**. Funciona por **N ciclos** ou por **tempo máximo**.

> **Auditor, não construtor.** A skill **nunca altera o projeto auditado**: tudo que escreve, instala ou testa fica numa pasta própria fora dele, e no fim ela **prova** isso com uma verificação de integridade. Correções são uma atividade separada, que você autoriza depois.

## Instalação

Requisitos: **Node 18+**. Opcionais, conforme o projeto auditado: Git, Docker, Python e o runtime da stack.

```bash
node scripts/instalar.mjs                  # liga a skill no Claude Code e no Antigravity
node scripts/instalar.mjs --alvo claude    # só um deles (claude | antigravity)
node scripts/instalar.mjs --copiar         # copia em vez de criar atalho
node scripts/instalar.mjs --remover        # desinstala
```

O instalador cria um **atalho** (junction no Windows, symlink no Linux/macOS) desta pasta em `~/.claude/skills/` e `~/.gemini/config/skills/`. Assim existe uma fonte só, e editar aqui vale para os dois. Abra uma sessão nova do agente depois de instalar. Detalhes e diferenças entre os ambientes: [docs/compatibilidade.md](docs/compatibilidade.md).

## Como usar

Basta pedir em linguagem natural; a skill é ativada pela descrição.

```text
Audite este projeto por 3 ciclos.
Faça uma auditoria de 2 horas no app que está em http://localhost:5173.
QA completo só do backend, 45 minutos, sem testar pagamentos.
Continue a auditoria de ontem (pasta ~/auditorias/meu-app/2026-10-18_1430).
```

Se você não disser o modo (ciclos ou tempo), o agente **pergunta antes de começar**.

### Parâmetros

| Parâmetro | Padrão | Para quê |
|---|---|---|
| projeto | pasta atual | raiz do repositório auditado |
| **modo** | (pergunta) | `ciclos` + N, ou `tempo` + minutos |
| url | — | aplicação já rodando (senão o agente sobe uma cópia de teste) |
| credenciais de teste | — | só de teste, passadas por variável de ambiente |
| foco / fora de escopo | tudo | ex.: "só a API", "não testar pagamentos" |
| saída | `~/auditorias/<projeto>/<data_hora>/` | sempre fora do projeto |

### Modo por ciclos

| Ciclos | O que cada um faz |
|---|---|
| 1 | descoberta + cobertura geral + investigação das falhas graves + relatório |
| 2 | C1 descoberta e cobertura geral · C2 investigação e consolidação |
| 3+ | C1 cobertura geral · intermediários investigação e aprofundamento · último consolidação |

O número pedido **nunca é excedido**: o script de controle se recusa a abrir mais ciclos.

### Modo por tempo

O prazo é um **limite máximo**. Uma reserva de no mínimo 10 min (ou 15% do tempo) fica guardada para o relatório. A fase recomendada sai do relógio:

**cobertura geral** (~55% do tempo útil) → **investigação** → **reta final** → **consolidar agora**

Se o trabalho útil acabar antes, o agente encerra antes.

## Fluxo recomendado (exemplo de uma rodada completa)

1. **Rodada inicial (descoberta).** Lê README, CLAUDE.md, AGENTS.md, docs, rotas e testes. Monta `mapa-do-sistema.md` e a matriz de testes (`FUN-001`, `FUN-001.1`…).
2. **Cobertura geral.** Testes do projeto rodam na cópia isolada. A varredura visual passa por todas as páginas em desktop, tablet e mobile, com acessibilidade. Os fluxos principais rodam em Playwright e a segurança é checada de forma estática. Toda falha é registrada, sem parar para aprofundar.
3. **Investigação.** Os achados mais graves são reproduzidos, a causa é procurada no código e os efeitos em outras funções são verificados. Cada conclusão sai com um grau de confiança.
4. **Relatório final.** `verificar` prova que o projeto não foi alterado e `stats` calcula os números. `relatorio.md` sai completo: resumo, matriz, bugs, visual, segurança, melhorias, ciclos, limitações e conclusão, tudo **com evidências**.

## O que fica na pasta da auditoria (`W`)

```
~/auditorias/<projeto>/<data_hora>/
├── audit.json              # fonte da verdade: matriz, achados, ciclos (permite retomar)
├── mapa-do-sistema.md      # o que o sistema é e faz
├── achados.md              # detalhe de cada BUG-/VIS-/SEC-
├── relatorio.md            # relatório final
├── estatisticas.md         # números gerados pelo `stats`
├── sandbox/                # cópia do projeto (sem .env reais) onde se instala e testa
├── e2e/                    # testes de fluxo Playwright escritos na auditoria
└── evidencias/             # logs, capturas (screens/), visual.md/json, segredos.md, integridade.md, e2e-resultado.json
```

## Estrutura da skill

```
SKILL.md                         # fluxo + regras absolutas (curto; é o que o agente carrega)
references/                      # lidos só na fase em que são usados
  descoberta.md · testes-codigo.md · playwright-e-visual.md · seguranca.md · investigacao.md · modos-e-orcamento.md
templates/                       # relatorio.md · mapa-do-sistema.md · e2e/ (config, exemplo, login)
scripts/auditor.mjs              # init · status · ciclo · browser · visual · segredos · verificar · stats
scripts/instalar.mjs             # liga a skill ao Claude Code / Antigravity
docs/especificacao.md            # especificação original do projeto
docs/compatibilidade.md          # Claude Code × Antigravity
VALIDACAO.md                     # critérios de aceitação e o que foi validado
```

## Garantias e limites

- **Não modifica o projeto**: cópia de trabalho isolada, `.env` reais fora da cópia, `git --no-optional-locks` (nem o índice do git é tocado) e uma verificação de integridade no fim (tamanho e data de cada arquivo, mais o estado do git). Pastas de dependência e cache ficam fora da verificação.
- **Honestidade:**
  - bloqueado não conta como aprovado;
  - os percentuais saem do script e explicam o método;
  - nenhum segredo aparece no relatório (os valores saem mascarados).
- **Limites:**
  - a varredura visual só descobre páginas com `<a href>`; telas abertas por botão precisam de teste de fluxo;
  - aplicativos mobile nativos dependem de emulador ou ferramenta acessível;
  - o agente não vê tokens nem créditos restantes, então trabalha com o relógio e os ciclos.

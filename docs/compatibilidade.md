# Compatibilidade: Claude Code × Google Antigravity

> Investigado em 19/10/2026: documentação pública do Antigravity e inspeção da instalação real na máquina de desenvolvimento.

## O que é igual (por isso há uma fonte só)

Os dois seguem o mesmo padrão de **Agent Skills**:
- uma pasta com um `SKILL.md`, cujo cabeçalho YAML tem `name` e `description`;
- subpastas opcionais, como `scripts/`, `references/` e `assets/`;
- **carregamento progressivo**: no início o agente lê só o nome e a descrição; o `SKILL.md` inteiro entra quando o pedido combina com a descrição; os arquivos de `references/` entram quando o `SKILL.md` manda ler.

Por isso o repositório não duplica instruções. O `SKILL.md` e as referências são únicos, e as diferenças ficam todas nesta página.

## Onde cada um procura skills

| Ambiente | Global (todos os projetos) | Por projeto | Observação |
|---|---|---|---|
| Claude Code | `~/.claude/skills/<nome>/` | `<projeto>/.claude/skills/<nome>/` | confirmado |
| Antigravity | `~/.gemini/config/skills/<nome>/` | `<projeto>/.agents/skills/<nome>/` (algumas fontes dizem `.agent/skills/`) | Na máquina real, as skills globais estão em `~/.gemini/config/skills/`. A documentação também cita `~/.gemini/antigravity/skills/` e `~/.agents/skills/` (instalações via `npx skills`). Se a skill não aparecer, use `instalar.mjs --destino <pasta>` |

**Não instale a skill dentro do projeto que vai ser auditado** (em `.claude/skills` ou `.agents/skills`), porque isso cria arquivos nele. Prefira a instalação global.

## Cabeçalho do `SKILL.md`

| Campo | Claude Code | Antigravity |
|---|---|---|
| `name` | obrigatório (minúsculas e hífen) | opcional (o padrão é o nome da pasta); se existir, precisa ser único |
| `description` | obrigatório; é o que ativa a skill | obrigatório; é "o campo mais importante" para a ativação |

O `SKILL.md` usa só esses dois campos, então serve para os dois.

## Ferramentas do agente (como cada passo é executado)

| Necessidade | Claude Code | Antigravity | Como a skill lida |
|---|---|---|---|
| Rodar comandos | ferramenta Bash/PowerShell | `run_command` | a skill só pede "rode `node .../auditor.mjs ...`", o que funciona nos dois |
| Pasta da skill | o agente recebe o diretório-base da skill ao carregá-la | os exemplos usam caminho relativo, e a pasta de execução não é garantida | o `SKILL.md` manda usar o **caminho absoluto** da pasta da skill; o `init` grava esse caminho em `audit.json` (`skill_dir`) e imprime os comandos prontos |
| Perguntar o modo ao usuário | pergunta no chat (ou AskUserQuestion) | pergunta no chat | a regra é só "pergunte antes de começar" |
| Navegador | Playwright via script (principal); o agente também pode ter ferramenta de navegador própria | Playwright via script; o Antigravity tem um agente de navegador próprio | o padrão é Playwright instalado no workspace, igual nos dois; a ferramenta própria do agente é alternativa se o Playwright falhar |
| Ler capturas de tela | lê PNG direto | lê imagens | as capturas ficam em `W/evidencias/screens/` |
| Subagentes / paralelismo | disponível | modelo de agentes próprio | a skill não depende disso: o fluxo é sequencial |
| Tempo e limites | sem acesso garantido a tokens ou créditos restantes | idem | o controle é pelo relógio e pelos ciclos (`status`), sem estimar tokens |

## Limitações conhecidas por ambiente

- **Antigravity:** os caminhos de instalação variam entre versões e documentos (ver acima). Rodar a skill no Antigravity **ainda não foi testado de ponta a ponta**: o formato e a instalação foram verificados, a execução não (ver `VALIDACAO.md`).
- **Os dois:** a sessão pode cair por limite externo. A retomada depende de abrir uma sessão nova e apontar para o `W` existente. A skill não trabalha em segundo plano.
- **Windows:** a instalação usa junction (não precisa de administrador). Comandos de exemplo vêm em bash e PowerShell quando a sintaxe muda (variáveis de ambiente).

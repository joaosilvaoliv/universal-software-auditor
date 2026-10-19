# Aplicação no navegador: fluxos funcionais e auditoria visual

## 1. Instalar o Playwright (fora do projeto)

Rode `node "S/scripts/auditor.mjs" browser W`. Ele instala `playwright`, `@playwright/test` e `axe-core` em `W/`, baixa o Chromium para o cache global (que é reaproveitado entre auditorias) e copia os modelos para `W/e2e/`.

**Se falhar** (sem rede, Linux sem bibliotecas do sistema), use as ferramentas de navegador do próprio agente ou `curl` para as checagens HTTP, e registre `LIM-`.

## 2. Subir e confirmar a aplicação

- Se o usuário deu a URL, use-a. Antes, confirme que é um ambiente **local ou de teste**.
- Se não deu, suba a partir do **sandbox**, com o `.env` de teste (ver `testes-codigo.md`) ou com `docker compose -p aud-<nome>` (ver `descoberta.md`). Anote o comando e a URL.
- **Confirme** que está no ar. Um comando de inicialização sem erro não basta: `curl -s -o /dev/null -w "%{http_code}" <URL>`, e a página precisa renderizar conteúdo, não ficar em branco.
- **Contas de teste:** as que o usuário passou, as dos seeds ou fixtures, ou as documentadas. Gere a sessão com `e2e/login.setup.mjs`, passando as credenciais por variável de ambiente. O arquivo `W/auth.json` contém a sessão: não cite o conteúdo dele no relatório.
- Sem conta de teste, teste as áreas públicas e registre as áreas autenticadas como `bloqueado` + `LIM-`.

## 3. Varredura visual automática (rodar na cobertura geral)

```
node "S/scripts/auditor.mjs" visual W --url <URL> --crawl 20 [--auth W/auth.json]
node "S/scripts/auditor.mjs" visual W --url <URL> --paths .,login,produtos     # rotas específicas
```

O `.` é a própria URL base; `login` é relativo a ela; `/login` parte da raiz do site. No **Git Bash do Windows**, não use a barra inicial, porque o shell a converte em caminho de disco (o script detecta e avisa).

- Ela **só navega** (GET) pelos links da mesma origem, pulando os que parecem destrutivos. Testa desktop 1440×900, tablet 768×1024 e mobile 390×844.
- Para cada página e cada tela, registra:
  - status HTTP, erros de JS e de console, falhas de rede ≥400;
  - rolagem horizontal, elementos que vazam da tela, imagens quebradas;
  - alvos de toque menores que 24px, texto menor que 12px;
  - violações de acessibilidade (axe-core) e uma captura de página inteira.
- O resumo vai para `evidencias/visual.md` e o detalhe para `visual.json`.
- **Interprete:**
  - os números são sinais, então **abra a captura** antes de registrar um `VIS-`;
  - rolagem horizontal e violação axe `critical`/`serious` são indícios fortes;
  - toque e texto pequeno são heurísticas;
  - erro de JS e rede ≥500 viram candidatos a `BUG-`.
- **Limitação:** rotas que só abrem por botão ou JS (sem `<a href>`) não são descobertas. Cubra essas rotas com testes de fluxo.

## 4. Testes de fluxo (funcional, ponta a ponta)

Escreva os specs em `W/e2e/`, **um arquivo por funcionalidade** e **um `test()` por cenário, com o ID no título** (`FUN-003.2 ...`). Partir de `exemplo.spec.mjs`. Rode a partir de `W`:
- bash: `AUDIT_URL=<URL> [AUDIT_AUTH=auth.json] npx playwright test -c e2e/playwright.config.mjs`
- PowerShell: `$env:AUDIT_URL='<URL>'; npx playwright test -c e2e/playwright.config.mjs`

- Para rodar só um projeto ou um arquivo: `--project=desktop` (com `=`, senão o nome do arquivo é tomado como projeto) e depois o caminho do spec.
- O **cwd é W**: caminhos relativos dentro do spec (ex.: `page.screenshot({ path: 'evidencias/screens/FUN-003.png' })`) partem de W.
- Cada execução grava `evidencias/e2e-resultado-<data-hora>.json`, sem sobrescrever a anterior.

Passe o resultado de cada teste para o cenário correspondente (`cenario W FUN-003.2 aprovado --evidencia evidencias/e2e-resultado-....json`).

**Clicar não basta, verifique o resultado:**
- o estado da interface mudou como esperado (item aparece, quantidade e total corretos segundo a regra de negócio);
- a requisição respondeu bem (`page.waitForResponse`, status e corpo);
- o dado **persiste** depois do `reload`;
- não houve erro de JS nem resposta 5xx.

**Seletores:** use `getByRole` / `getByLabel` / `getByText` / `data-testid`. Evite CSS frágil.

**Cubra os estados:** vazio, erro (entrada inválida, campo obrigatório), carregando, paginação, filtros, busca, modais, navegação entre telas, voltar e avançar, sessão expirada.

**Fluxos completos:** visitar todas as rotas não é testar todas as funcionalidades. Registre a cobertura **por funcionalidade e por cenário**.

**Ambiente seguro:**
- Só crie dados com o prefixo `AUDITORIA-`, e só em ambiente de teste confirmado.
- Edite ou apague só o que você criou.
- Nunca faça pagamento real, envio de e-mail ou mensagem a destinatário real, ou aprovação que dispare processo real.
- Se o fluxo exigir uma ação dessas, pare ali: marque `bloqueado` e registre a necessidade de um ambiente seguro ou de autorização.

## 5. Revisão visual e de UX (olhar humano sobre as capturas)

- Para as páginas e fluxos principais, compare as três telas. Procure:
  - elementos sobrepostos ou cortados, texto ilegível ou com contraste ruim;
  - espaçamento quebrado, menu inacessível no mobile, botão difícil de tocar;
  - inconsistência entre páginas;
  - estados ausentes (carregando, vazio, erro), falha de carregamento.
- **Defeito objetivo** (comprovado na captura ou na medição) → `VIS-` com tela, componente e evidência.
- **Opinião de design** (hierarquia, clareza, número de etapas) → `MEL-`, escrito como subjetivo.
- Não altere CSS nem componentes para "testar" uma sugestão.

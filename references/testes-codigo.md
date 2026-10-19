# Testes de código (unitário, integração, tipos, lint, build)

**Onde:** sempre em `W/sandbox`. Lá você pode instalar dependências e gerar arquivos de build e cache, porque é uma cópia. No projeto original **nada roda** (exceção: comandos de leitura como `git log`, `git ls-files` e leitura de arquivos). Com `--sem-copia`, rode só o que for comprovadamente somente leitura e registre a limitação.

## 1. Antes de executar qualquer comando

Leia a definição: `package.json > scripts`, `Makefile`, `tox.ini`, `pyproject` (`[tool.pytest]`), `noxfile`, configuração de CI, `conftest.py` e setups de teste. Procure sinais de alerta:
- `rm -rf` ou escrita fora do sandbox;
- `migrate`, `db:reset`, `db push`, `alembic upgrade`, `prisma migrate`, `seed` contra banco real;
- `deploy`, `publish`, `docker push`, `git push`/`commit`, `terraform apply`, `kubectl`;
- `curl` para serviços externos com token;
- `.env` real ou variáveis apontando para produção;
- `sudo`.

Se encontrar algum desses: não rode. Procure uma alternativa segura, por exemplo chamar o executor de testes direto com um banco de teste. Se não houver, marque `bloqueado` e registre `LIM-`.

## 2. Preparar o sandbox

- **Configuração:** os `.env` reais não foram copiados. Se a aplicação ou os testes precisarem, crie um `.env` **de teste** no sandbox a partir do `.env.example`, com valores falsos e banco local ou de teste (SQLite, banco em memória, contêiner `aud-`). Nunca use credenciais reais.
- **Dependências** (só no sandbox):
  - `npm ci` (ou `npm install` se não houver lockfile), `pnpm i --frozen-lockfile`, `yarn --frozen-lockfile`;
  - `python -m venv .venv` e depois `.venv/bin/pip install -r requirements.txt` (no Windows, `.venv\Scripts\pip`);
  - `mvn -q -o dependency:resolve` / `dotnet restore` / `composer install` / `go mod download`.
- **Variáveis seguras:** `CI=1`, `NODE_ENV=test`, `PYTHONDONTWRITEBYTECODE=1`. Desligue `DATABASE_URL` e afins que vierem do sistema, se apontarem para fora.
- Anote a duração da instalação. No modo tempo, ela conta.
- **Testes que criam, limpam ou apagam bancos** (conftest que faz `CREATE`/`DROP DATABASE`, `TRUNCATE`, migrações de teste) só rodam contra um servidor **descartável criado pela auditoria**, nunca contra um servidor que guarda outros dados, nem que seja local. Receita:
  ```
  docker run -d --name aud-pg -e POSTGRES_USER=aud -e POSTGRES_PASSWORD=aud -e POSTGRES_DB=aud -p 127.0.0.1:55432:5432 postgres:16-alpine
  # aponte o .env de teste do sandbox para postgresql://aud:aud@127.0.0.1:55432/aud ; ao final: docker rm -f aud-pg
  ```
  Para MySQL e Redis, o mesmo padrão: nome `aud-`, porta só em `127.0.0.1`, removido no fim. Sem Docker, use SQLite ou banco em memória, se o projeto suportar; se não, `bloqueado` + `LIM-`.

## 3. Executar e registrar

- Rode cada etapa redirecionando a saída para evidência: `<comando> > "W/evidencias/<etapa>.log" 2>&1`. Depois resuma: total, aprovados, reprovados, ignorados e tempo.
- **Ordem sugerida:** build ou compilação → testes unitários → integração → tipos → lint → testes de API ou contrato → e2e do próprio projeto (se não exigir serviço externo).
- Use relatórios estruturados quando existirem (`pytest --junitxml`, `vitest --reporter=json`, `jest --json`), sempre gravados em `W/evidencias/`.

## 4. Classificar os resultados (não misture as categorias)

| Situação | Como registrar |
|---|---|
| Teste executado e passou | cenário `aprovado` (com o log como evidência) |
| Teste executado e falhou por defeito do produto | `falhou` + achado `BUG-` (confirmar a causa na investigação) |
| Falhou por causa do ambiente (variável faltando, serviço indisponível, rede, versão de runtime) | **não é defeito do produto**: `bloqueado`/`nao-verificavel` + `LIM-` com o erro |
| Teste não pôde rodar | `bloqueado` + motivo |
| Funcionalidade sem nenhum teste automatizado | anotar na matriz; recomendação `MEL-` de manutenibilidade |
| Lint ou aviso de estilo | resumir por severidade; só vira `BUG-` se indicar erro real (variável indefinida, código inalcançável que esconde lógica) |

Não altere testes, dependências nem configuração para "fazer passar". Se quiser **acrescentar** um teste novo para provar uma hipótese, crie um arquivo novo (no sandbox ou em `W/e2e`) e marque-o como criado pela auditoria.

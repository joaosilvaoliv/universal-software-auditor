# Descoberta: ler, entender e mapear antes de testar

Não navegue nem teste "no escuro". Primeiro defina **o que** precisa ser verificado.

## 1. Documentação (leia o que existir de fato)

Procure por nome e por conteúdo: `README*`, `AGENTS.md`, `CLAUDE.md`, `GEMINI.md`, `CONTRIBUTING*` e as pastas `docs/`, `doc/` e `wiki/`. Inclua especificações, contratos, OpenAPI/Swagger (`openapi.*`, `swagger.*`), ADRs, documentos de regras de negócio, instruções de diretório (um `CLAUDE.md`/`AGENTS.md` dentro de subpastas), arquivos de CI (`.github/workflows`, `.gitlab-ci.yml`) e `Makefile`.

- Comece pela lista de arquivos (`git ls-files` ou listagem da pasta, ignorando dependências). Não presuma que um arquivo existe.
- Arquivos longos: leia por seções, sem pular regras de negócio por conveniência. Anote a fonte de cada regra.
- A documentação **não é prova** do comportamento. Quando divergir do código ou do sistema, registre as duas versões no mapa.

## 2. Estrutura e stack

Investigue:
- linguagens, frameworks e dependências;
- pontos de entrada, rotas (frontend e backend), componentes, serviços, modelos de dados;
- integrações externas, autenticação e autorização;
- configurações de ambiente (`.env.example`), testes existentes, scripts e processo de inicialização.

| Indício | Stack provável | Testes | Lint / tipos | Build | Subir a aplicação |
|---|---|---|---|---|---|
| `package.json` | Node; React/Vue/Angular/Next/Svelte pelas deps | ler `scripts.test`: jest, vitest, mocha | `tsc --noEmit`, eslint | `scripts.build` | `scripts.dev`/`start` |
| `pyproject.toml`, `requirements*.txt`, `setup.py` | Python; FastAPI/Django/Flask pelas deps | `pytest`, `python -m unittest` | ruff/flake8, mypy | — | `uvicorn`, `manage.py runserver`, `flask run` |
| `pom.xml` / `build.gradle*` | Java/Kotlin; Spring Boot | `mvn -q test` / `gradle test` | — | `mvn package` | `spring-boot:run` |
| `*.csproj` / `*.sln` | C#/.NET | `dotnet test` | `dotnet build` (warnings) | `dotnet build` | `dotnet run` |
| `composer.json` | PHP; Laravel (`artisan`) | `vendor/bin/phpunit`, `php artisan test` | phpstan | — | `php artisan serve` |
| `go.mod` | Go | `go test ./...` | `go vet ./...` | `go build ./...` | `go run` |
| `Cargo.toml` | Rust | `cargo test` | `cargo clippy` | `cargo build` | `cargo run` |
| `Gemfile` | Ruby/Rails | `bundle exec rspec` / `rails test` | rubocop | — | `rails s` |
| `docker-compose*.yml`, `Dockerfile` | serviços em contêiner | — | — | — | ver nota abaixo |
| app mobile (`android/`, `ios/`, `app.json`) | mobile | testes do projeto | — | — | só se houver emulador ou ferramenta acessível; senão, `LIM-` |

A tabela é ponto de partida. Para uma tecnologia desconhecida, leia os manifestos e a documentação, escolha ferramentas compatíveis e registre a escolha.

**Docker:** suba a partir do **sandbox** e com um nome de projeto próprio (`docker compose -p aud-<nome> up -d`), para não reaproveitar os volumes nem os contêineres do original. Se as portas colidirem com uma instância já rodando, mude a porta no sandbox ou audite a instância existente. Antes de usar uma instância existente, **confirme que é um ambiente local ou de teste**. Nunca rode `down -v` em projeto que não seja o `aud-<nome>`.

## 3. Identificar funcionalidades

Fontes, da mais confiável para a menos:
1. rotas e roteadores do código (decorators, arquivos de rota, router do front);
2. telas e menus;
3. endpoints do OpenAPI;
4. modelos e serviços;
5. nomes dos testes existentes;
6. documentação.

Uma página pode ter várias funcionalidades: liste cada uma (filtro, busca, criar, editar, exportar…). Para cada funcionalidade, registre o **comportamento esperado** e a fonte dele. Se a regra de negócio não estiver escrita em lugar nenhum, diga que o esperado foi **inferido**.

## 4. Mapa e matriz

- Preencha `W/mapa-do-sistema.md` a partir de `templates/mapa-do-sistema.md`.
- Registre cada funcionalidade em `W/audit.json` com seus cenários (`pendente`). Os cenários são positivos, negativos (entrada inválida), de estado vazio, de permissão e de limite. Comece pelos fluxos principais.
- Preencha também `tecnologias` no `audit.json`.
- Repositório grande: priorize os pontos de entrada e os fluxos principais, e registre como `LIM-` o que não foi lido.

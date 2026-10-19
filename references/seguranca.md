# Segurança: verificações proporcionais e não destrutivas

Teste dinâmico **só em ambiente local ou de teste autorizado**. É proibido:
- negação de serviço, força bruta, fuzzing pesado;
- scanner contra terceiros;
- exploração que persista dados ou acesse dados de usuários reais;
- qualquer teste contra produção sem autorização expressa.

Encontrar um padrão suspeito não confirma uma vulnerabilidade.

## Checklist

1. **Segredos.** Rode `auditor.mjs segredos W`: os valores saem mascarados.
   - Confirme cada candidato lendo o contexto.
   - `.env` real versionado no git = `SEC-` de gravidade alta ou crítica.
   - Segredo em arquivo de exemplo = baixa.
   - Se houver `gitleaks` instalado: `gitleaks detect --source <P> --no-git --redact --report-path W/evidencias/gitleaks.json` (é leitura).
2. **Dependências vulneráveis** (no sandbox, saída em `W/evidencias/`):
   - Node: `npm audit --json` (`--package-lock-only` se não instalou);
   - Python: `pip-audit -r requirements.txt` (instale o pip-audit num venv **do W**);
   - .NET: `dotnet list package --vulnerable`;
   - PHP: `composer audit`;
   - Go: `govulncheck ./...`;
   - Rust: `cargo audit`.
   - Separe dependências de produção e de desenvolvimento. Cite os CVEs e as versões corrigidas.
3. **Configuração insegura** (leitura de código e config):
   - modo debug em produção (`DEBUG=True`, `app.debug`, stack trace na resposta);
   - CORS: `*` junto com credenciais, origens largas demais, métodos permitidos que não batem com as rotas;
   - cookies sem `HttpOnly` / `Secure` / `SameSite`;
   - documentação da API exposta em produção (`/docs`, `/swagger`, `/openapi.json`);
   - listagem de diretórios; versão exposta no header `Server`;
   - TLS desligado (`verify=False`, `rejectUnauthorized: false`).
4. **Cabeçalhos HTTP:** `curl -sI <URL>` (e as rotas da API). Verifique CSP, X-Content-Type-Options, frame-ancestors/X-Frame-Options, Referrer-Policy e HSTS (só sob HTTPS). A ausência costuma ser `preventivo`; com impacto demonstrado, sobe a gravidade.
5. **Autenticação e autorização** (ambiente de teste):
   - liste as rotas protegidas pelo código ou pelo OpenAPI;
   - chame **sem sessão** e espere 401/403;
   - em rotas que escrevem, primeiro leia no código se há proteção. Na checagem dinâmica, use corpo inválido ou vazio: se a rota aceitar sem sessão, é um achado confirmado;
   - com duas contas de teste de perfis diferentes, tente acessar recurso de outro usuário ou de perfil superior (IDOR, escalonamento);
   - controle que só **esconde no front** (o backend aceita) = achado.
6. **Validação de entrada** (sondas benignas, em ambiente de teste):
   - aspas simples ou caracteres especiais causando 500 ou erro de SQL = indício de injeção (confirme lendo a consulta no código);
   - marcador de XSS refletido sem execução real de dano (ex.: `"><b>AUDITORIA</b>`), conferindo se é escapado;
   - upload sem validação de tipo ou tamanho;
   - mass assignment (campos como `role`/`is_admin` aceitos no corpo).
   - Nunca use payload destrutivo (`DROP`, sleep longo, comandos de sistema).
7. **Revisão de código** (padrões a confirmar pela leitura do fluxo de dados):
   - SQL montado por concatenação, `eval`/`exec`, `shell=True`/`child_process` com entrada externa;
   - `pickle`/`yaml.load` inseguros, `dangerouslySetInnerHTML`/`innerHTML` com dado do usuário;
   - hash fraco de senha (md5/sha1 sem sal), JWT sem verificação de assinatura ou com `none`;
   - redirecionamento aberto, bypass de admin escrito no código, segredo no front-end (bundle).
8. **Exposição de informação:** mensagens de erro com stack, PII em logs, respostas de API retornando campos sensíveis demais.

## Classificar e reportar

- **Estado:**
  - `confirmado`: demonstrado de forma segura;
  - `provavel`: o código mostra a falha, sem demonstração dinâmica;
  - `suspeito`: padrão a verificar;
  - `preventivo`: boa prática ausente sem falha demonstrada.
- Para cada `SEC-`: categoria (OWASP quando couber), evidência, componente, impacto potencial, gravidade, mitigação e limitações.
- **Nunca** escreva o valor de credencial, token ou senha: cite o arquivo, a linha, o tipo e o tamanho.

// Faz login UMA vez com uma conta de TESTE e grava a sessão em W/auth.json (para visual --auth e AUDIT_AUTH).
// As credenciais vêm de variáveis de ambiente, nunca escritas em arquivo. O auth.json contém sessão: não cite o conteúdo.
// Uso (a partir de W):  AUDIT_URL=... AUDIT_USER=... AUDIT_PASS=... node e2e/login.setup.mjs
// Ajuste a rota e os seletores ao sistema auditado.
import { chromium } from 'playwright';

const { AUDIT_URL, AUDIT_USER, AUDIT_PASS } = process.env;
if (!AUDIT_URL || !AUDIT_USER || !AUDIT_PASS) {
  console.error('Defina AUDIT_URL, AUDIT_USER e AUDIT_PASS.');
  process.exit(1);
}
const nav = await chromium.launch();
const pg = await nav.newPage();
await pg.goto(new URL('/login', AUDIT_URL).href);
await pg.getByLabel(/e-?mail|usu[aá]rio|login/i).fill(AUDIT_USER);
await pg.getByLabel(/senha|password/i).fill(AUDIT_PASS);
await pg.getByRole('button', { name: /entrar|login|acessar|sign in/i }).click();
await pg.waitForLoadState('networkidle');
await pg.context().storageState({ path: 'auth.json' });
console.log(`Sessão gravada em auth.json (URL atual: ${pg.url()}). Confira se o login funcionou de fato.`);
await nav.close();

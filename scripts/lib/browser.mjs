import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { SKILL_DIR, carregarAuditoria, registrarFerramenta, falhar } from './util.mjs';

// Instala o Playwright no workspace da auditoria, nunca no projeto auditado.
// O Chromium fica no cache global do Playwright e é reaproveitado entre auditorias.
export function browser(o) {
  const { w } = carregarAuditoria(o._[1]);
  const pkg = path.join(w, 'package.json');
  if (!fs.existsSync(pkg)) {
    fs.writeFileSync(pkg, JSON.stringify({ name: 'auditoria-workspace', private: true, type: 'module' }, null, 2) + '\n');
  }
  const rodar = (cmd) => {
    console.log('> ' + cmd);
    execSync(cmd, { cwd: w, stdio: 'inherit', env: { ...process.env, CI: '1' } });
  };
  try {
    rodar('npm install --no-audit --no-fund --loglevel=error playwright @playwright/test axe-core');
    rodar('npx playwright install chromium');
  } catch {
    falhar('Falha ao instalar o Playwright. No Linux, pode faltar biblioteca do sistema (tente "npx playwright install --with-deps chromium", que pede sudo). Sem navegador: use as ferramentas de navegador do próprio agente ou curl, e registre a limitação (LIM-).');
  }
  for (const f of ['playwright.config.mjs', 'exemplo.spec.mjs', 'login.setup.mjs']) {
    const dst = path.join(w, 'e2e', f);
    if (!fs.existsSync(dst)) fs.copyFileSync(path.join(SKILL_DIR, 'templates', 'e2e', f), dst);
  }
  const ver = JSON.parse(fs.readFileSync(path.join(w, 'node_modules', 'playwright', 'package.json'), 'utf8')).version;
  registrarFerramenta(w, `Playwright ${ver} (Chromium) + axe-core`);
  console.log([
    `Playwright ${ver} pronto em ${w} (fora do projeto).`,
    `Varredura visual: node "${path.join(SKILL_DIR, 'scripts', 'auditor.mjs')}" visual "${w}" --url <URL>`,
    `Testes de fluxo: escreva specs em ${path.join(w, 'e2e')} e rode a partir de W:`,
    '  bash:       AUDIT_URL=<URL> npx playwright test -c e2e/playwright.config.mjs',
    "  PowerShell: $env:AUDIT_URL='<URL>'; npx playwright test -c e2e/playwright.config.mjs",
  ].join('\n'));
}

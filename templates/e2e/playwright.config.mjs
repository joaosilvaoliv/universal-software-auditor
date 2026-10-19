import { defineConfig, devices } from '@playwright/test';

// Configuração dos testes de fluxo da auditoria. Roda a partir do workspace (W), FORA do projeto auditado.
// AUDIT_URL = endereço da aplicação · AUDIT_AUTH = arquivo de sessão (opcional, gerado por login.setup.mjs)
// Rode SEMPRE a partir de W. Caminhos relativos dentro dos specs (ex.: page.screenshot) partem de W: use "evidencias/...".
// Cada execução grava um resultado novo (com data/hora), sem sobrescrever o anterior.
const carimbo = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');

export default defineConfig({
  testDir: '.',
  testMatch: /.*\.spec\.mjs$/,
  timeout: 60_000,
  retries: 0,
  workers: 1, // um teste por vez: evita que cenários alterem o estado uns dos outros
  outputDir: '../evidencias/e2e-artefatos',
  reporter: [['list'], ['json', { outputFile: `../evidencias/e2e-resultado-${carimbo}.json` }]],
  use: {
    baseURL: process.env.AUDIT_URL,
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
    ...(process.env.AUDIT_AUTH ? { storageState: process.env.AUDIT_AUTH } : {}),
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
  ],
});

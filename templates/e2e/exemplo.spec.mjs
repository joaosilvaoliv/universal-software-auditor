import { test, expect } from '@playwright/test';

// MODELO. Crie um arquivo por funcionalidade (ex.: FUN-003.spec.mjs) e um test() por cenário, com o ID no título.
// Regras: verifique o RESULTADO (asserção), não só o clique; use seletores por papel/rótulo; nada destrutivo;
// só crie dados com o prefixo AUDITORIA- e só em ambiente de teste.

test('FUN-000.1 página inicial carrega sem erro de JS nem de rede', async ({ page }) => {
  const erros = [];
  const falhas = [];
  page.on('pageerror', (e) => erros.push(e.message));
  page.on('response', (r) => { if (r.status() >= 500) falhas.push(`${r.status()} ${r.url()}`); });

  const resp = await page.goto('/');
  expect(resp?.status(), 'status HTTP da página').toBeLessThan(400);
  await expect(page.locator('body')).toBeVisible();
  expect(erros, erros.join('\n')).toEqual([]);
  expect(falhas, falhas.join('\n')).toEqual([]);
});

// Exemplo de fluxo com verificação de regra de negócio e persistência (adapte ao sistema auditado):
test.skip('FUN-000.2 criar item e conferir que aparece e persiste', async ({ page }) => {
  const nome = `AUDITORIA-${Date.now()}`;
  await page.goto('/itens');
  await page.getByRole('button', { name: /novo|adicionar|criar/i }).click();
  await page.getByLabel(/nome/i).fill(nome);
  const salvar = page.waitForResponse((r) => r.request().method() === 'POST' && r.url().includes('/api/'));
  await page.getByRole('button', { name: /salvar|confirmar/i }).click();
  expect((await salvar).status()).toBeLessThan(400);   // o backend aceitou
  await expect(page.getByText(nome)).toBeVisible();     // a interface mostra
  await page.reload();
  await expect(page.getByText(nome)).toBeVisible();     // persistiu de verdade
});

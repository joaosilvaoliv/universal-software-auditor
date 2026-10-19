import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { SKILL_DIR, carregarAuditoria, gravarJSON, gravarTexto, registrarFerramenta, falhar } from './util.mjs';

const TELAS = {
  desktop: { viewport: { width: 1440, height: 900 } },
  tablet: { viewport: { width: 768, height: 1024 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 },
  mobile: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 },
};
// A varredura só NAVEGA (GET). Links com cara de ação destrutiva ou de API ficam de fora.
const PERIGOSO = /(logout|log-out|signout|sign-out|\/sair|delete|excluir|remover|\/remove|destroy|apagar|unsubscribe|descadastr|reset|cancelar-conta|\/api\/)/i;
const ARQUIVO = /\.(pdf|zip|rar|7z|gz|png|jpe?g|gif|svg|webp|ico|mp4|mp3|xlsx?|docx?|pptx?|csv|exe|dmg|apk)$/i;

// Roda dentro da página. Os números são SINAIS: confirme olhando a captura antes de registrar um VIS-.
function medir(movel) {
  const W = window.innerWidth;
  const visivel = (el) => {
    const s = getComputedStyle(el);
    if (s.display === 'none' || s.visibility === 'hidden' || Number(s.opacity) === 0) return false;
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  };
  const seletor = (el) => el.tagName.toLowerCase() + (el.id ? '#' + el.id : '')
    + (typeof el.className === 'string' && el.className.trim() ? '.' + el.className.trim().split(/\s+/).slice(0, 2).join('.') : '');
  // Conteúdo dentro de área com rolagem/recorte própria (kanban, carrossel, tabela larga) não é vazamento da página.
  const contido = (el) => {
    for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
      if (['auto', 'scroll', 'hidden', 'clip'].includes(getComputedStyle(p).overflowX)) return true;
    }
    return false;
  };
  const todos = [...document.body.querySelectorAll('*')];
  const fora = new Set(todos.filter((el) => visivel(el) && el.getBoundingClientRect().right > W + 1
    && getComputedStyle(el).position !== 'fixed' && !contido(el)));
  const foraTopo = [...fora].filter((el) => !fora.has(el.parentElement));
  const imgs = [...document.images].filter((i) => i.complete && i.naturalWidth === 0 && visivel(i)).map((i) => (i.currentSrc || i.src).slice(0, 150));
  const alvos = movel
    ? [...document.querySelectorAll('a,button,[role=button],input:not([type=hidden]),select,textarea')]
      .filter(visivel).filter((el) => { const r = el.getBoundingClientRect(); return r.width < 24 || r.height < 24; })
    : [];
  const pequenos = todos.filter((el) => visivel(el)
    && [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim().length > 2)
    && parseFloat(getComputedStyle(el).fontSize) < 12);
  return {
    overflow_horizontal: document.documentElement.scrollWidth > W + 1,
    largura_documento: document.documentElement.scrollWidth,
    largura_tela: W,
    fora_da_tela: foraTopo.length, exemplos_fora: foraTopo.slice(0, 5).map(seletor),
    imagens_quebradas: imgs,
    toque_menor_24px: alvos.length, exemplos_toque: alvos.slice(0, 5).map(seletor),
    texto_menor_12px: pequenos.length, exemplos_texto: pequenos.slice(0, 5).map(seletor),
    h1: document.querySelectorAll('h1').length,
    lang: document.documentElement.getAttribute('lang'),
    meta_viewport: !!document.querySelector('meta[name=viewport]'),
  };
}

function nomeArquivo(u) {
  const x = new URL(u);
  const base = (x.pathname.replace(/\/+$/, '') || '/home').replace(/[^\w-]+/g, '_').replace(/^_+/, '') || 'home';
  return (base + (x.search ? '_' + Buffer.from(x.search).toString('base64url').slice(0, 10) : '')).slice(0, 80);
}

export async function visual(o) {
  const { w, a } = carregarAuditoria(o._[1]);
  const req = createRequire(path.join(w, 'package.json'));
  let pw;
  try { pw = req('playwright'); } catch {
    falhar(`Playwright não está instalado neste workspace. Rode: node "${path.join(SKILL_DIR, 'scripts', 'auditor.mjs')}" browser "${w}"`);
  }
  const base = o.url || a.projeto.url;
  if (!base) falhar('Informe --url com o endereço da aplicação rodando.');
  const origem = new URL(base).origin;
  const telas = String(o.viewports || 'desktop,tablet,mobile').split(',').map((s) => s.trim()).filter((v) => TELAS[v]);
  const auth = o.auth ? path.resolve(String(o.auth)) : null;
  const sessao = auth ? { storageState: auth } : {};
  let axe = null;
  try { axe = fs.readFileSync(req.resolve('axe-core/axe.min.js'), 'utf8'); } catch { /* segue sem acessibilidade */ }

  const nav = await pw.chromium.launch();
  // "/x" = a partir da raiz do site · "x" = relativo à URL base · "." = a própria base.
  const pastaBase = base.endsWith('/') ? base : base + '/';
  const rota = (p) => {
    const s = p.trim();
    if (/^[A-Za-z]:[\\/]/.test(s) || /Program Files|\/usr\/|\\Git\\/i.test(s)) {
      falhar(`A rota "${s}" virou caminho de disco (o Git Bash converte argumentos que começam com "/"). Use rotas sem a barra inicial (--paths .,login,produtos) ou rode no PowerShell.`);
    }
    return s === '.' || s === '' ? new URL(base).href : new URL(s, pastaBase).href;
  };
  const iniciais = o.paths ? String(o.paths).split(',').map(rota) : [new URL(base).href];
  const limite = o.paths ? iniciais.length + parseInt(o.crawl || 0, 10) : parseInt(o.crawl || 15, 10);

  // 1) Descoberta de páginas pelos links do próprio site (mesma origem, sem ações destrutivas).
  const paginas = [];
  const vistos = new Set();
  const fila = [...iniciais];
  const ctxBusca = await nav.newContext({ ...TELAS.desktop, ...sessao });
  while (fila.length && paginas.length < limite) {
    const u = fila.shift();
    if (vistos.has(u)) continue;
    vistos.add(u);
    paginas.push(u);
    const pg = await ctxBusca.newPage();
    try {
      await pg.goto(u, { waitUntil: 'load', timeout: 30000 });
      try { await pg.waitForLoadState('networkidle', { timeout: 6000 }); } catch { /* app com polling */ }
      for (const l of await pg.$$eval('a[href]', (as) => as.map((x) => x.href))) {
        try {
          const x = new URL(l);
          x.hash = '';
          if (x.origin === origem && !PERIGOSO.test(x.pathname + x.search) && !ARQUIVO.test(x.pathname) && !vistos.has(x.href)) fila.push(x.href);
        } catch { /* href inválido */ }
      }
    } catch { /* o erro aparece na varredura abaixo */ }
    await pg.close();
  }
  await ctxBusca.close();

  // 2) Varredura: cada página em cada tamanho de tela.
  const resultados = [];
  for (const u of paginas) {
    for (const t of telas) {
      const ctx = await nav.newContext({ ...TELAS[t], ...sessao, bypassCSP: true });
      const pg = await ctx.newPage();
      const r = { url: u, tela: t, http: null, titulo: null, console: [], erros_js: [], rede: [], metricas: null, axe: null, captura: null, erro: null };
      pg.on('console', (m) => { if (m.type() === 'error') r.console.push(m.text().slice(0, 300)); });
      pg.on('pageerror', (e) => r.erros_js.push(String(e.message || e).slice(0, 300)));
      pg.on('requestfailed', (q) => r.rede.push({ url: q.url().slice(0, 200), metodo: q.method(), falha: q.failure()?.errorText || 'falhou' }));
      pg.on('response', (s) => { if (s.status() >= 400) r.rede.push({ url: s.url().slice(0, 200), metodo: s.request().method(), status: s.status() }); });
      try {
        const resp = await pg.goto(u, { waitUntil: 'load', timeout: 30000 });
        try { await pg.waitForLoadState('networkidle', { timeout: 8000 }); } catch { /* idem */ }
        r.http = resp ? resp.status() : null;
        r.titulo = await pg.title();
        r.metricas = await pg.evaluate(medir, t !== 'desktop');
        if (axe) {
          await pg.addScriptTag({ content: axe });
          r.axe = await pg.evaluate(async () => (await window.axe.run(document, { resultTypes: ['violations'] }))
            .violations.map((v) => ({ id: v.id, impacto: v.impact, nos: v.nodes.length, ajuda: v.help })));
        }
        const nome = `${nomeArquivo(u)}_${t}.png`;
        await pg.screenshot({ path: path.join(w, 'evidencias', 'screens', nome), fullPage: true });
        r.captura = `evidencias/screens/${nome}`;
      } catch (e) {
        r.erro = String(e.message || e).split('\n')[0].slice(0, 300);
      }
      resultados.push(r);
      await ctx.close();
    }
  }
  await nav.close();

  gravarJSON(path.join(w, 'evidencias', 'visual.json'), { quando: new Date().toISOString(), base, telas, paginas, resultados });
  const ax = (r) => {
    if (!r.axe) return axe ? '—' : 'sem axe';
    const g = (i) => r.axe.filter((v) => v.impacto === i).length;
    return `${g('critical')}/${g('serious')}/${r.axe.length}`;
  };
  const linhas = resultados.map((r) => {
    const m = r.metricas || {};
    const rotaUrl = new URL(r.url);
    const rota = rotaUrl.pathname + rotaUrl.search;
    if (r.erro) return `| ${rota} | ${r.tela} | ERRO: ${r.erro.replace(/\|/g, '/')} | | | | | | | | |`;
    return `| ${rota} | ${r.tela} | ${r.http ?? '?'} | ${r.console.length + r.erros_js.length} | ${r.rede.length} | ${m.overflow_horizontal ? `**sim** (${m.largura_documento}px)` : 'não'} | ${m.fora_da_tela || 0} | ${(m.imagens_quebradas || []).length} | ${m.toque_menor_24px || 0} | ${ax(r)} | ${r.captura} |`;
  });
  const total = (f) => resultados.filter(f).length;
  const PESO = { critical: 0, serious: 1, moderate: 2, minor: 3 };
  const regras = {};
  for (const r of resultados) {
    for (const v of r.axe || []) {
      const x = (regras[v.id] ??= { impacto: v.impacto, ajuda: v.ajuda, rotas: new Set(), telas: new Set(), nos: 0 });
      x.rotas.add(new URL(r.url).pathname); x.telas.add(r.tela); x.nos += v.nos;
    }
  }
  const tabelaAxe = Object.entries(regras).sort((p, q) => (PESO[p[1].impacto] ?? 9) - (PESO[q[1].impacto] ?? 9))
    .map(([id, x]) => `| ${id} | ${x.impacto} | ${[...x.rotas].join(', ')} | ${[...x.telas].join(', ')} | ${x.nos} | ${x.ajuda} |`);
  const md = [
    `## Varredura visual (${paginas.length} página(s) × ${telas.length} tela(s) = ${resultados.length} verificações)`,
    '',
    `Base: ${base} · telas: ${telas.map((t) => `${t} ${TELAS[t].viewport.width}×${TELAS[t].viewport.height}`).join(', ')}${auth ? ' · com sessão autenticada' : ''}`,
    `Resumo: ${total((r) => r.erro)} com erro de carregamento · ${total((r) => r.erros_js.length || r.console.length)} com erro de JS/console · ${total((r) => r.rede.length)} com falha de rede · ${total((r) => r.metricas?.overflow_horizontal)} com rolagem horizontal · ${total((r) => r.axe?.some((v) => ['critical', 'serious'].includes(v.impacto)))} com violação de acessibilidade crítica ou séria`,
    '',
    '| Rota | Tela | HTTP | Erros JS/console | Rede ≥400/falha | Rolagem horizontal | Elementos fora da tela | Imagens quebradas | Toque < 24px | axe crít/sér/total | Captura |',
    '|---|---|---|---|---|---|---|---|---|---|---|',
    ...linhas,
    '',
    tabelaAxe.length ? ['### Acessibilidade — regras do axe violadas', '| Regra | Impacto | Rotas | Telas | Elementos (soma) | O que verifica |', '|---|---|---|---|---|---|', ...tabelaAxe, ''].join('\n') : '',
    'Detalhes em evidencias/visual.json. Por resultado: http, console, erros_js, rede, metricas, axe [{id, impacto (critical|serious|moderate|minor), nos, ajuda}], captura.',
    'Os números são sinais: abra a captura para confirmar antes de registrar um VIS-. "Toque < 24px" e "texto < 12px" são heurísticas (links dentro de texto são exceção no WCAG 2.5.8).',
    'A varredura só segue links `<a href>` da mesma origem: rotas abertas só por botão/JS precisam de teste de fluxo (e2e).',
  ].join('\n');
  gravarTexto(path.join(w, 'evidencias', 'visual.md'), md + '\n');
  registrarFerramenta(w, 'varredura visual Playwright (auditor.mjs visual)');
  console.log(md);
}

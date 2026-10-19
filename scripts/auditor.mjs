#!/usr/bin/env node
// Ferramentas do Universal Software Auditor. Nenhum comando altera o projeto auditado.
import { args, falhar } from './lib/util.mjs';

const [maior] = process.versions.node.split('.').map(Number);
if (maior < 18) falhar(`Node ${process.versions.node} é antigo; precisa de Node 18+.`);

const o = args(process.argv.slice(2));
const AJUDA = `Uso: node auditor.mjs <comando> ...
  init --projeto <P> --modo ciclos --ciclos <N> | --modo tempo --minutos <M> [--url <U>] [--saida <D>] [--sem-copia]
  status <W>                         relógio/ciclos, contagens e FASE recomendada
  ciclo <W> inicio [--objetivo ".."] | fim [--resumo ".."]
  browser <W>                        instala Playwright + axe-core no workspace
  visual <W> --url <U> [--crawl N | --paths /,/x] [--viewports desktop,tablet,mobile] [--auth <arquivo>]
  segredos <W>                       varredura de segredos (valores mascarados)
  registrar <W> <lote.json>          mescla funcionalidades/cenários/achados/melhorias/limitações por ID
  cenario <W> <ID> <estado> [--evidencia ..] [--achado ..]   atualiza um cenário
  verificar <W>                      prova se o projeto continua intacto
  stats <W>                          números para o relatório
  encerrar <W>                       fecha ciclo/execução + verificar + stats`;

const comandos = {
  init: async () => (await import('./lib/workspace.mjs')).init(o),
  status: async () => (await import('./lib/orcamento.mjs')).status(o),
  ciclo: async () => (await import('./lib/orcamento.mjs')).ciclo(o),
  browser: async () => (await import('./lib/browser.mjs')).browser(o),
  visual: async () => (await import('./lib/visual.mjs')).visual(o),
  segredos: async () => (await import('./lib/segredos.mjs')).segredos(o),
  registrar: async () => (await import('./lib/registro.mjs')).registrar(o),
  cenario: async () => (await import('./lib/registro.mjs')).cenario(o),
  verificar: async () => (await import('./lib/integridade.mjs')).verificar(o),
  stats: async () => (await import('./lib/stats.mjs')).stats(o),
  encerrar: async () => {
    (await import('./lib/orcamento.mjs')).encerrar(o);
    (await import('./lib/integridade.mjs')).verificar(o);
    console.log('');
    (await import('./lib/stats.mjs')).stats(o);
  },
};

const fn = comandos[o._[0]];
if (!fn) { console.log(AJUDA); process.exit(o._[0] ? 1 : 0); }
await fn();

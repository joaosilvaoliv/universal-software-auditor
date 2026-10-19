#!/usr/bin/env node
// Liga esta pasta de skill ao Claude Code e ao Google Antigravity (um atalho em cada; a fonte é uma só).
// Uso: node scripts/instalar.mjs [--alvo claude|antigravity|todos] [--copiar] [--remover] [--forcar]
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { SKILL_DIR, args } from './lib/util.mjs';

const o = args(process.argv.slice(2));
const NOME = 'universal-software-auditor';
const home = os.homedir();
// Locais confirmados: Claude Code lê ~/.claude/skills. Antigravity lê ~/.gemini/config/skills
// (há documentação que cita ~/.gemini/antigravity/skills; use --destino para outro caminho).
const ALVOS = {
  claude: path.join(home, '.claude', 'skills'),
  antigravity: path.join(home, '.gemini', 'config', 'skills'),
};
const escolha = o.alvo || 'todos';
const destinos = o.destino ? [path.resolve(o.destino)]
  : Object.entries(ALVOS).filter(([k]) => escolha === 'todos' || escolha === k).map(([, v]) => v);

for (const pasta of destinos) {
  const alvo = path.join(pasta, NOME);
  let existe = null;
  try { existe = fs.lstatSync(alvo); } catch { /* não existe */ }

  if (o.remover) {
    if (existe) { fs.rmSync(alvo, { recursive: !existe.isSymbolicLink(), force: true }); console.log(`removido: ${alvo}`); }
    continue;
  }
  if (existe) {
    let atual = null;
    try { atual = fs.realpathSync(alvo); } catch { /* link quebrado */ }
    if (atual && path.resolve(atual) === path.resolve(fs.realpathSync(SKILL_DIR))) { console.log(`ok (já instalado): ${alvo}`); continue; }
    if (!o.forcar) { console.log(`PULADO: ${alvo} já existe e aponta para outro lugar (use --forcar para substituir)`); continue; }
    fs.rmSync(alvo, { recursive: !existe.isSymbolicLink(), force: true });
  }
  fs.mkdirSync(pasta, { recursive: true });
  if (o.copiar) {
    fs.cpSync(SKILL_DIR, alvo, { recursive: true, filter: (s) => !/[\\/](\.git|node_modules)([\\/]|$)/.test(s) });
    console.log(`copiado: ${alvo}`);
  } else {
    fs.symlinkSync(SKILL_DIR, alvo, process.platform === 'win32' ? 'junction' : 'dir');
    console.log(`ligado: ${alvo} -> ${SKILL_DIR}`);
  }
}
console.log('Reinicie o Claude Code / Antigravity (ou abra nova sessão) para a skill aparecer.');

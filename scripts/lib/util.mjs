import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

export const SKILL_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

// Dependências, caches e saídas de build: ficam fora da cópia de trabalho e da foto de integridade.
export const PASTAS_IGNORADAS = new Set([
  'node_modules', '.git', '.venv', 'venv', '.tox', '__pycache__', '.pytest_cache', '.mypy_cache',
  '.ruff_cache', 'dist', 'build', '.next', '.nuxt', '.svelte-kit', '.turbo', '.cache',
  '.parcel-cache', 'coverage', 'htmlcov', 'target', '.gradle',
]);

export function falhar(msg) {
  console.error('ERRO: ' + msg);
  process.exit(1);
}

export function lerJSON(p) {
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

// Escrita atômica: uma interrupção no meio não corrompe o audit.json.
export function gravarJSON(p, obj) {
  const tmp = p + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(obj, null, 2) + '\n', 'utf8');
  fs.renameSync(tmp, p);
}

export function gravarTexto(p, txt) {
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, txt, 'utf8');
}

export function args(argv) {
  const out = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const prox = argv[i + 1];
      if (prox === undefined || prox.startsWith('--')) out[a.slice(2)] = true;
      else { out[a.slice(2)] = prox; i++; }
    } else out._.push(a);
  }
  return out;
}

export function carregarAuditoria(w) {
  if (!w) falhar('Informe a pasta da auditoria (W) impressa pelo "init".');
  const dir = path.resolve(w);
  const p = path.join(dir, 'audit.json');
  if (!fs.existsSync(p)) falhar(`audit.json não encontrado em ${dir}. Rode "init" primeiro.`);
  return { w: dir, p, a: lerJSON(p) };
}

export function registrarFerramenta(w, nome) {
  const p = path.join(w, 'audit.json');
  const a = lerJSON(p);
  if (!a.ferramentas.includes(nome)) a.ferramentas.push(nome);
  gravarJSON(p, a);
}

export function carimbo(d = new Date()) {
  const z = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())}_${z(d.getHours())}${z(d.getMinutes())}`;
}

export function hora(d) {
  return new Date(d).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

export function duracao(ms) {
  const m = Math.max(0, Math.round(ms / 60000));
  return m < 60 ? `${m} min` : `${Math.floor(m / 60)}h${String(m % 60).padStart(2, '0')}`;
}

export function dentro(filho, pai) {
  const r = path.relative(path.resolve(pai), path.resolve(filho));
  return r === '' || (!r.startsWith('..') && !path.isAbsolute(r));
}

export function* caminhar(raiz, ignorar = PASTAS_IGNORADAS) {
  const pilha = [raiz];
  while (pilha.length) {
    const d = pilha.pop();
    let itens;
    try { itens = fs.readdirSync(d, { withFileTypes: true }); } catch { continue; }
    for (const it of itens) {
      const p = path.join(d, it.name);
      if (it.isSymbolicLink()) continue;
      if (it.isDirectory()) { if (!ignorar.has(it.name)) pilha.push(p); }
      else if (it.isFile()) yield p;
    }
  }
}

export function relativo(raiz, p) {
  return path.relative(raiz, p).split(path.sep).join('/');
}

// --no-optional-locks: o git não reescreve o índice, então consultar não altera o repositório auditado.
export function git(dir, ...a) {
  try {
    return execFileSync('git', ['--no-optional-locks', '-C', dir, ...a], {
      encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], maxBuffer: 64 * 1024 * 1024,
    }).trimEnd();
  } catch { return null; }
}

export function contar(lista) {
  const c = {};
  for (const x of lista) c[x] = (c[x] || 0) + 1;
  return c;
}

import fs from 'node:fs';
import path from 'node:path';
import { caminhar, relativo, git, gravarJSON, gravarTexto, carregarAuditoria, registrarFerramenta } from './util.mjs';

const BINARIO = /\.(png|jpe?g|gif|webp|ico|bmp|svg|pdf|zip|gz|tgz|7z|rar|woff2?|ttf|otf|eot|mp[34]|mov|avi|webm|exe|dll|so|dylib|class|jar|pyc|db|sqlite3?|xlsx?|docx?|pptx?|map)$/i;
const LOCK = /(package-lock\.json|yarn\.lock|pnpm-lock\.yaml|poetry\.lock|Pipfile\.lock|composer\.lock|Cargo\.lock|go\.sum|uv\.lock)$/i;
const CONFIG = /(^\.env|\.(ya?ml|ini|cfg|conf|properties|toml|json|xml|env)$|^dockerfile|compose)/i;
const MODELO = /(example|sample|template|dist|fixture|mock|fake|dummy|test|spec|exemplo)/i;
const MAX = 1024 * 1024;

const PADROES = [
  ['Chave privada', /-----BEGIN (?:RSA |EC |OPENSSH |DSA |PGP |ENCRYPTED )?PRIVATE KEY-----/, null],
  ['AWS access key', /\b(AKIA[0-9A-Z]{16})\b/, 1],
  ['GitHub token', /\b((?:ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9]{36}|github_pat_[A-Za-z0-9_]{50,})\b/, 1],
  ['Slack token', /\b(xox[baprs]-[A-Za-z0-9-]{10,})\b/, 1],
  ['Google API key', /\b(AIza[0-9A-Za-z_-]{35})\b/, 1],
  ['Stripe live key', /\b((?:sk|rk)_live_[0-9a-zA-Z]{20,})\b/, 1],
  ['Anthropic API key', /\b(sk-ant-[A-Za-z0-9_-]{20,})\b/, 1],
  ['OpenAI API key', /\b(sk-(?:proj-)?[A-Za-z0-9_-]{32,})\b/, 1],
  ['JWT', /\b(eyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,})\b/, 1],
  ['URL com credencial', /\b[a-z][a-z0-9+.-]*:\/\/[^\s:@/'"]+:([^\s@/'"]{3,})@/i, 1],
];
const NOME = '[\\w.-]*(?:pass(?:word|wd)?|senha|secret|token|api[_-]?key|apikey|access[_-]?key|private[_-]?key|client[_-]?secret|auth[_-]?key)[\\w.-]*';
const ATRIB_CODIGO = new RegExp(`\\b${NOME}["']?\\s*[:=]\\s*["'\`]([^"'\`\\s]{6,})["'\`]`, 'i');
const ATRIB_CONFIG = new RegExp(`\\b${NOME}["']?\\s*[:=]\\s*["']?([^\\s"'#,}]{3,})`, 'i');
const MARCADOR = /^(\$\{|\$\(|\{\{|<|%|process\.env|os\.environ|getenv|env\(|settings\.|config\.|changeme|change_?me|your[_-]|xxx|\*{3}|example|exemplo|dummy|placeholder|redacted|null|none|true|false|undefined|string|required|optional|secret$|password$|senha$|token$)/i;

function mascarar(v) {
  return v ? `${v.slice(0, 2)}…(${v.length} caracteres)` : '(bloco de chave privada)';
}

export function segredos(o) {
  const { w, a } = carregarAuditoria(o._[1]);
  const raiz = a.projeto.caminho;
  const rastreados = new Set((git(raiz, 'ls-files') || '').split('\n').filter(Boolean));
  const temGit = rastreados.size > 0;
  const achados = [];
  const envs = [];

  for (const p of caminhar(raiz)) {
    const rel = relativo(raiz, p);
    const base = path.basename(p);
    if (/^\.env(\..+)?$/i.test(base)) envs.push({ arquivo: rel, no_git: rastreados.has(rel), modelo: MODELO.test(base) });
    if (BINARIO.test(base) || LOCK.test(base)) continue;
    let st;
    try { st = fs.statSync(p); } catch { continue; }
    if (st.size > MAX) continue;
    let txt;
    try { txt = fs.readFileSync(p, 'utf8'); } catch { continue; }
    if (txt.includes('\u0000')) continue;
    const ehConfig = CONFIG.test(base);
    const ehModelo = MODELO.test(rel);
    txt.split(/\r?\n/).forEach((linha, i) => {
      if (linha.length > 2000) return;
      const tipos = [...PADROES, ['Atribuição de segredo', ehConfig ? ATRIB_CONFIG : ATRIB_CODIGO, 1]];
      for (const [tipo, re, g] of tipos) {
        const m = linha.match(re);
        if (!m) continue;
        const valor = g ? m[g] : null;
        if (valor && ['Atribuição de segredo', 'URL com credencial'].includes(tipo) && MARCADOR.test(valor)) continue;
        const noGit = rastreados.has(rel);
        const padraoDev = tipo === 'URL com credencial' && /@(localhost|127\.0\.0\.1|0\.0\.0\.0|db|database|postgres|mysql|mariadb|redis|mongo)\b/i.test(linha);
        const gravidade = ehModelo ? 'baixa (arquivo de exemplo/teste)'
          : (temGit && !noGit) ? 'informativa (arquivo local, fora do git)'
            : padraoDev ? 'media (credencial padrão de desenvolvimento versionada: vira real se ninguém trocar)'
              : 'alta';
        achados.push({ arquivo: rel, linha: i + 1, tipo, valor: mascarar(valor), no_git: temGit ? noGit : null, gravidade_sugerida: gravidade });
        break;
      }
    });
  }

  gravarJSON(path.join(w, 'evidencias', 'segredos.json'), { quando: new Date().toISOString(), raiz, achados, arquivos_env: envs });
  const sim = (x) => (x === null ? 'sem git' : x ? 'sim' : 'não');
  const md = [
    '## Varredura de segredos (somente leitura; valores mascarados)',
    '',
    `Candidatos: **${achados.length}** · arquivos .env encontrados: ${envs.length}. É uma triagem por padrões: confirme cada item antes de registrar como SEC-.`,
    '',
    envs.length ? '| Arquivo .env | Versionado no git? | Modelo? |\n|---|---|---|\n' + envs.map((e) => `| \`${e.arquivo}\` | ${sim(temGit ? e.no_git : null)} | ${e.modelo ? 'sim' : 'não'} |`).join('\n') : '',
    '',
    achados.length ? '| Arquivo:linha | Tipo | Valor (mascarado) | No git? | Gravidade sugerida |\n|---|---|---|---|---|\n'
      + achados.slice(0, 150).map((x) => `| \`${x.arquivo}:${x.linha}\` | ${x.tipo} | ${x.valor} | ${sim(x.no_git)} | ${x.gravidade_sugerida} |`).join('\n')
      + (achados.length > 150 ? `\n\n… mais ${achados.length - 150} em evidencias/segredos.json` : '') : 'Nenhum candidato encontrado pelos padrões.',
  ].join('\n');
  gravarTexto(path.join(w, 'evidencias', 'segredos.md'), md + '\n');
  registrarFerramenta(w, 'varredura de segredos (auditor.mjs segredos)');
  console.log(md);
}

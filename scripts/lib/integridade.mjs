import fs from 'node:fs';
import path from 'node:path';
import { PASTAS_IGNORADAS, caminhar, relativo, git, lerJSON, gravarJSON, gravarTexto, carregarAuditoria } from './util.mjs';

// Foto do projeto: tamanho + data de modificação de cada arquivo, e o estado do git.
export function fotografar(dir) {
  const arquivos = {};
  for (const p of caminhar(dir)) {
    try {
      const s = fs.statSync(p);
      arquivos[relativo(dir, p)] = [s.size, Math.round(s.mtimeMs)];
    } catch { /* arquivo sumiu durante a leitura */ }
  }
  const head = git(dir, 'rev-parse', 'HEAD');
  return {
    quando: new Date().toISOString(),
    raiz: dir,
    total: Object.keys(arquivos).length,
    arquivos,
    git: head ? {
      head,
      branch: git(dir, 'rev-parse', '--abbrev-ref', 'HEAD'),
      status: git(dir, 'status', '--porcelain=v1'),
    } : null,
  };
}

export function verificar(o) {
  const { w, a } = carregarAuditoria(o._[1]);
  const ini = lerJSON(path.join(w, 'integridade-inicial.json'));
  const fim = fotografar(a.projeto.caminho);

  const modificados = [], novos = [], removidos = [];
  for (const [k, v] of Object.entries(fim.arquivos)) {
    const x = ini.arquivos[k];
    if (!x) novos.push(k);
    else if (x[0] !== v[0] || x[1] !== v[1]) modificados.push(k);
  }
  for (const k of Object.keys(ini.arquivos)) if (!(k in fim.arquivos)) removidos.push(k);

  const gitIni = ini.git, gitFim = fim.git;
  const gitMudou = !!(gitIni && gitFim && (gitIni.head !== gitFim.head || gitIni.branch !== gitFim.branch));
  const statusMudou = !!(gitIni && gitFim && gitIni.status !== gitFim.status);
  const intacto = !modificados.length && !novos.length && !removidos.length && !gitMudou && !statusMudou;

  const lista = (titulo, xs) => xs.length
    ? `\n**${titulo} (${xs.length})**\n${xs.slice(0, 50).map((x) => `- \`${x}\``).join('\n')}${xs.length > 50 ? `\n- … e mais ${xs.length - 50}` : ''}\n`
    : '';
  const md = [
    '## Verificação de integridade do projeto auditado',
    '',
    `- Resultado: **${intacto ? 'PROJETO INTACTO — nenhuma alteração detectada' : 'ALTERAÇÕES DETECTADAS'}**`,
    `- Foto inicial: ${ini.quando} (${ini.total} arquivos) · foto final: ${fim.quando} (${fim.total} arquivos)`,
    gitIni ? `- Git: HEAD ${gitIni.head.slice(0, 10)} → ${gitFim ? gitFim.head.slice(0, 10) : '?'} · branch ${gitIni.branch} → ${gitFim ? gitFim.branch : '?'}${statusMudou ? ' · **o `git status` mudou**' : ''}` : '- Git: projeto sem repositório git (verificação só pelos arquivos)',
    `- Método: compara tamanho e data de modificação de cada arquivo. Fora da verificação: ${[...PASTAS_IGNORADAS].join(', ')}.`,
    lista('Modificados', modificados),
    lista('Novos', novos),
    lista('Removidos', removidos),
    intacto ? '' : '> Confira se as alterações vieram da auditoria ou de outra pessoa ou processo (ex.: o desenvolvedor editando durante a auditoria, ou um servidor rodando no projeto original). Registre a explicação no relatório.',
  ].filter((l) => l !== '').join('\n');

  gravarJSON(path.join(w, 'integridade-final.json'), { quando: fim.quando, intacto, modificados, novos, removidos, git: gitFim });
  gravarTexto(path.join(w, 'evidencias', 'integridade.md'), md + '\n');
  console.log(md);
}

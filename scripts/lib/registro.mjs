import path from 'node:path';
import { carregarAuditoria, gravarJSON, lerJSON, falhar } from './util.mjs';

const ESTADOS = ['pendente', 'em-execucao', 'aprovado', 'falhou', 'bloqueado', 'nao-verificavel', 'nao-aplicavel'];

function upsert(lista, item) {
  if (!item || !item.id) falhar(`Item sem "id": ${JSON.stringify(item).slice(0, 120)}`);
  const i = lista.findIndex((x) => x.id === item.id);
  if (i < 0) { lista.push(item); return 'novo'; }
  lista[i] = { ...lista[i], ...item };
  return 'atualizado';
}

function juntarCenarios(f, cenarios) {
  f.cenarios = f.cenarios || [];
  for (const c of cenarios) {
    if (c.status && !ESTADOS.includes(c.status)) falhar(`${c.id}: estado inválido "${c.status}" (use: ${ESTADOS.join(', ')})`);
    const atual = f.cenarios.find((x) => x.id === c.id);
    if (atual) {
      for (const k of ['evidencias', 'achados']) if (c[k]) c[k] = [...new Set([...(atual[k] || []), ...c[k]])];
    }
    upsert(f.cenarios, c);
  }
}

// Mescla um lote (arquivo JSON escrito pelo agente) no audit.json, por ID. Evita editar JSON grande via shell.
export function registrar(o) {
  const { p, a } = carregarAuditoria(o._[1]);
  const arq = o.arquivo || o._[2];
  if (!arq) falhar('Uso: registrar W <lote.json>   (lote: { funcionalidades, cenarios, achados, melhorias, limitacoes, tecnologias, ferramentas })');
  const lote = lerJSON(path.resolve(String(arq)));
  const log = [];

  for (const f of lote.funcionalidades || []) {
    const { cenarios = [], ...resto } = f;
    const r = upsert(a.funcionalidades, resto);
    juntarCenarios(a.funcionalidades.find((x) => x.id === f.id), cenarios);
    log.push(`${f.id} ${r}${cenarios.length ? ` (+${cenarios.length} cenário(s))` : ''}`);
  }
  for (const c of lote.cenarios || []) {
    const fid = String(c.id).split('.')[0];
    const f = a.funcionalidades.find((x) => x.id === fid);
    if (!f) falhar(`Cenário ${c.id}: a funcionalidade ${fid} não existe (registre-a antes).`);
    juntarCenarios(f, [c]);
    log.push(`${c.id} → ${c.status || 'atualizado'}`);
  }
  for (const k of ['achados', 'melhorias', 'limitacoes']) {
    for (const x of lote[k] || []) log.push(`${x.id} ${upsert(a[k], x)}`);
  }
  for (const k of ['tecnologias', 'ferramentas']) {
    for (const x of lote[k] || []) if (!a[k].includes(x)) a[k].push(x);
  }
  gravarJSON(p, a);
  console.log(`Registrado (${log.length}): ${log.join(' · ') || 'nada'}`);
}

// Atualização rápida de um cenário, sem JSON: cenario W FUN-001.2 falhou --evidencia evidencias/x.log --achado BUG-001
export function cenario(o) {
  const { p, a } = carregarAuditoria(o._[1]);
  const id = o._[2];
  const status = o._[3];
  if (!id || !ESTADOS.includes(status)) falhar(`Uso: cenario W <FUN-001.1> <${ESTADOS.join('|')}> [--evidencia caminho] [--achado ID] [--descricao ".."] [--obs ".."]`);
  const f = a.funcionalidades.find((x) => x.id === id.split('.')[0]);
  if (!f) falhar(`A funcionalidade de ${id} não existe.`);
  const c = { id, status };
  if (o.descricao) c.descricao = String(o.descricao);
  if (o.obs) c.obs = String(o.obs);
  if (o.evidencia) c.evidencias = [String(o.evidencia)];
  if (o.achado) c.achados = [String(o.achado)];
  juntarCenarios(f, [c]);
  gravarJSON(p, a);
  console.log(`${id} → ${status}`);
}

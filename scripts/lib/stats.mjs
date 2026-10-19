import path from 'node:path';
import { carregarAuditoria, gravarTexto, contar, duracao } from './util.mjs';

const ESTADOS = ['pendente', 'em-execucao', 'aprovado', 'falhou', 'bloqueado', 'nao-verificavel', 'nao-aplicavel'];
const GRAVIDADES = ['critica', 'alta', 'media', 'baixa'];
const ESTADOS_ACHADO = ['confirmado', 'provavel', 'suspeito', 'inconclusivo', 'preventivo'];
const ROTULO = { pendente: 'Pendente', 'em-execucao': 'Em execução', aprovado: 'Aprovado', falhou: 'Falhou', bloqueado: 'Bloqueado', 'nao-verificavel': 'Não verificável', 'nao-aplicavel': 'Não aplicável' };

const pct = (x, base) => (base > 0 ? `${Math.round((x / base) * 100)}%` : 'n/d');

export function stats(o) {
  const { w, a } = carregarAuditoria(o._[1]);
  const avisos = [];
  const ids = new Set();
  const matriz = [];
  const sit = { testada: 0, parcial: 0, 'não testada': 0, 'não aplicável': 0 };
  const todos = [];

  for (const f of a.funcionalidades) {
    if (ids.has(f.id)) avisos.push(`ID repetido: ${f.id}`);
    ids.add(f.id);
    const cs = f.cenarios || [];
    if (!cs.length) avisos.push(`${f.id} não tem nenhum cenário`);
    for (const c of cs) {
      if (!ESTADOS.includes(c.status)) avisos.push(`${c.id || f.id}: estado inválido "${c.status}"`);
      if (['aprovado', 'falhou'].includes(c.status) && !(c.evidencias || []).length) avisos.push(`${c.id}: executado sem evidência registrada`);
      todos.push(c.status);
    }
    const n = (s) => cs.filter((c) => c.status === s).length;
    const aplic = cs.filter((c) => c.status !== 'nao-aplicavel');
    const exec = aplic.filter((c) => ['aprovado', 'falhou'].includes(c.status));
    const s = !aplic.length ? 'não aplicável' : exec.length === aplic.length ? 'testada' : exec.length ? 'parcial' : 'não testada';
    sit[s]++;
    matriz.push(`| ${f.id} | ${f.nome} | ${cs.length} | ${exec.length} | ${n('aprovado')} | ${n('falhou')} | ${n('bloqueado') + n('nao-verificavel')} | ${n('pendente') + n('em-execucao')} | ${s} |`);
  }

  const achIds = new Set(a.achados.map((x) => x.id));
  for (const f of a.funcionalidades) for (const c of f.cenarios || []) for (const r of c.achados || []) if (!achIds.has(r)) avisos.push(`${c.id} cita o achado inexistente ${r}`);
  for (const x of a.achados) {
    if (!/^(BUG|VIS|SEC)-\d{3,}$/.test(x.id)) avisos.push(`achado com ID fora do padrão: ${x.id}`);
    if (!GRAVIDADES.includes(x.gravidade)) avisos.push(`${x.id}: gravidade inválida "${x.gravidade}"`);
    if (!ESTADOS_ACHADO.includes(x.estado)) avisos.push(`${x.id}: estado inválido "${x.estado}"`);
  }

  const c = contar(todos);
  const totalC = todos.length;
  const aplicC = totalC - (c['nao-aplicavel'] || 0);
  const execC = (c.aprovado || 0) + (c.falhou || 0);
  const aplicF = a.funcionalidades.length - sit['não aplicável'];
  const comExec = sit.testada + sit.parcial;

  const tiposAchado = ['BUG', 'VIS', 'SEC'];
  const linhaAchado = (t) => {
    const xs = a.achados.filter((x) => x.id.startsWith(t + '-'));
    return `| ${t} | ${xs.length} | ${GRAVIDADES.map((g) => xs.filter((x) => x.gravidade === g).length).join(' | ')} |`;
  };
  const porEstado = contar(a.achados.map((x) => x.estado));
  const porCat = contar(a.melhorias.map((m) => `${m.categoria} (${m.prioridade || 'sem prioridade'})`));

  const ciclos = a.ciclos.map((x) => `| C${x.n} | ${x.objetivo} | ${x.inicio.slice(0, 16).replace('T', ' ')} | ${x.fim ? x.fim.slice(0, 16).replace('T', ' ') : 'aberto'} | ${x.fim ? duracao(Date.parse(x.fim) - Date.parse(x.inicio)) : '—'} | ${x.resumo || ''} |`);
  const e = a.execucao;

  const md = [
    `## Números da auditoria (gerado por \`auditor.mjs stats\` em ${new Date().toISOString().slice(0, 16).replace('T', ' ')})`,
    '',
    '### Funcionalidades',
    `- Identificadas: **${a.funcionalidades.length}**${sit['não aplicável'] ? ` (não aplicáveis: ${sit['não aplicável']})` : ''}`,
    `- Testadas (todos os cenários aplicáveis executados): **${sit.testada}**`,
    `- Parcialmente testadas: **${sit.parcial}**`,
    `- Não testadas: **${sit['não testada']}**`,
    '',
    '### Cenários de teste',
    '| Estado | Quantidade |', '|---|---|',
    ...ESTADOS.map((s) => `| ${ROTULO[s]} | ${c[s] || 0} |`),
    `| **Total** | **${totalC}** |`,
    '',
    '### Cobertura e método de cálculo',
    `- Cobertura de funcionalidades = funcionalidades com ≥1 cenário executado ÷ funcionalidades com ≥1 cenário aplicável = ${comExec}/${aplicF} = **${pct(comExec, aplicF)}**`,
    `- Execução de cenários = cenários executados ÷ cenários aplicáveis = ${execC}/${aplicC} = **${pct(execC, aplicC)}**`,
    '- "Executado" = aprovado ou falhou. Bloqueado, não verificável, pendente e em execução **não** contam como executados. Os percentuais medem o que foi planejado na matriz, não a totalidade do sistema.',
    '',
    '### Matriz de cobertura',
    '| ID | Funcionalidade | Cenários previstos | Executados | Aprovados | Falharam | Bloqueados/não verificáveis | Pendentes | Situação |',
    '|---|---|---|---|---|---|---|---|---|',
    ...matriz,
    '',
    '### Achados por tipo e gravidade',
    '| Tipo | Total | Crítica | Alta | Média | Baixa |', '|---|---|---|---|---|---|',
    ...tiposAchado.map(linhaAchado),
    '',
    `Por estado: ${ESTADOS_ACHADO.map((s) => `${s} ${porEstado[s] || 0}`).join(' · ')}`,
    '',
    '### Melhorias recomendadas',
    a.melhorias.length ? Object.entries(porCat).map(([k, v]) => `- ${k}: ${v}`).join('\n') : '- Nenhuma registrada.',
    `- Limitações registradas: ${a.limitacoes.length}`,
    '',
    '### Ciclos',
    e.modo === 'ciclos'
      ? `Planejados: ${e.ciclos_planejados} · concluídos: ${a.ciclos.filter((x) => x.fim).length}`
      : `Duração planejada: ${e.duracao_min} min · decorrido até agora: ${duracao(Date.now() - Date.parse(e.inicio))}`,
    ciclos.length ? ['| Ciclo | Objetivo | Início | Fim | Duração | Resumo |', '|---|---|---|---|---|---|', ...ciclos].join('\n') : '(nenhum ciclo registrado)',
    avisos.length ? `\n### ⚠️ Avisos de consistência (corrija o audit.json antes do relatório)\n${avisos.map((x) => `- ${x}`).join('\n')}` : '',
  ].join('\n');

  gravarTexto(path.join(w, 'estatisticas.md'), md + '\n');
  console.log(md);
}

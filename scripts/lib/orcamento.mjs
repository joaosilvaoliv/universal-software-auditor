import { carregarAuditoria, gravarJSON, falhar, duracao, hora, contar } from './util.mjs';

export function objetivoPadrao(n, total) {
  if (!total) return `rodada ${n}`;
  if (total === 1) return 'descoberta, cobertura geral, investigação das falhas graves e consolidação';
  if (n === 1) return 'descoberta e cobertura geral';
  if (n === total) return total === 2 ? 'investigação das falhas e consolidação' : 'consolidação (rever evidências, fechar inconclusivos, relatório)';
  return 'investigação e aprofundamento (falhas registradas, pendências, casos extremos)';
}

export function status(o) {
  const { a } = carregarAuditoria(o._[1]);
  const e = a.execucao;
  const agora = Date.now();
  const ini = Date.parse(e.inicio);
  const linhas = [`Projeto: ${a.projeto.nome} · modo: ${e.modo === 'ciclos' ? `${e.ciclos_planejados} ciclo(s)` : `tempo (${e.duracao_min} min)`} · decorrido: ${duracao(agora - ini)}`];
  let fase;

  if (e.modo === 'tempo') {
    const prazo = Date.parse(e.prazo);
    const consolidar = prazo - e.reserva_relatorio_min * 60000;
    const util = consolidar - ini;
    const fimCobertura = ini + util * 0.55;
    const retaFinal = consolidar - Math.max(3 * 60000, util * 0.1);
    linhas.push(`Restante: ${duracao(prazo - agora)} (prazo ${hora(prazo)}) · cobertura geral até ~${hora(fimCobertura)} · reta final ${hora(retaFinal)} · consolidar a partir de ${hora(consolidar)}`);
    if (e.fim) fase = 'AUDITORIA ENCERRADA — entregue o relatório.';
    else if (agora >= prazo) fase = 'TEMPO ESGOTADO — pare toda exploração e finalize o relatório agora com o que já tem.';
    else if (agora >= consolidar) fase = 'CONSOLIDAR AGORA — só encerrar (verificar + stats) e escrever o relatório. Nada de testes novos.';
    else if (agora >= retaFinal) fase = 'RETA FINAL — não comece atividade longa; feche o que está aberto e registre tudo.';
    else if (agora < fimCobertura) fase = 'COBERTURA GERAL — amplitude antes de profundidade; registre falhas e siga.';
    else fase = 'INVESTIGAÇÃO — aprofunde os achados mais graves e cubra pendências.';
  } else {
    const feitos = a.ciclos.filter((c) => c.fim).length;
    const aberto = a.ciclos.find((c) => !c.fim);
    linhas.push(`Ciclos: ${feitos}/${e.ciclos_planejados} concluídos${aberto ? ` · em andamento: C${aberto.n} (desde ${hora(aberto.inicio)})` : ''}`);
    if (aberto) fase = `CICLO ${aberto.n} — ${aberto.objetivo}`;
    else if (feitos >= e.ciclos_planejados) fase = 'TODOS OS CICLOS CONCLUÍDOS — não inicie outro; finalize o relatório.';
    else fase = `Abra o ciclo ${feitos + 1} ("ciclo W inicio"): ${objetivoPadrao(feitos + 1, e.ciclos_planejados)}`;
  }

  const cen = a.funcionalidades.flatMap((f) => f.cenarios || []);
  const c = contar(cen.map((x) => x.status));
  const g = contar(a.achados.map((x) => x.gravidade));
  linhas.push(`Funcionalidades: ${a.funcionalidades.length} · cenários: ${cen.length} (pendente ${(c.pendente || 0) + (c['em-execucao'] || 0)}, aprovado ${c.aprovado || 0}, falhou ${c.falhou || 0}, bloqueado ${c.bloqueado || 0}, não verificável ${c['nao-verificavel'] || 0})`);
  linhas.push(`Achados: ${a.achados.length} (crítica ${g.critica || 0}, alta ${g.alta || 0}, média ${g.media || 0}, baixa ${g.baixa || 0}) · melhorias: ${a.melhorias.length} · limitações: ${a.limitacoes.length}`);
  linhas.push(`FASE: ${fase}`);
  console.log(linhas.join('\n'));
}

// Fecha o ciclo aberto e marca o fim da execução (a duração efetiva vai para o relatório).
export function encerrar(o) {
  const { p, a } = carregarAuditoria(o._[1]);
  const agora = new Date().toISOString();
  const aberto = a.ciclos.find((c) => !c.fim);
  if (aberto) aberto.fim = agora;
  a.execucao.fim = agora;
  gravarJSON(p, a);
  console.log(`Execução encerrada em ${hora(agora)} · duração efetiva ${duracao(Date.parse(agora) - Date.parse(a.execucao.inicio))}${aberto ? ` · ciclo C${aberto.n} fechado` : ''}\n`);
}

export function ciclo(o) {
  const { p, a, w } = carregarAuditoria(o._[1]);
  const acao = o._[2];
  const e = a.execucao;
  if (acao === 'inicio') {
    if (a.ciclos.some((c) => !c.fim)) falhar('Já existe um ciclo aberto. Feche com: ciclo W fim');
    const n = a.ciclos.length + 1;
    if (e.modo === 'ciclos' && n > e.ciclos_planejados) {
      falhar(`O usuário pediu ${e.ciclos_planejados} ciclo(s). Não exceda: consolide e entregue o relatório.`);
    }
    a.ciclos.push({ n, objetivo: o.objetivo || objetivoPadrao(n, e.ciclos_planejados), inicio: new Date().toISOString(), fim: null, resumo: null });
  } else if (acao === 'fim') {
    const c = a.ciclos.find((x) => !x.fim);
    if (!c) falhar('Nenhum ciclo aberto.');
    c.fim = new Date().toISOString();
    if (typeof o.resumo === 'string') c.resumo = o.resumo;
  } else {
    falhar('Uso: ciclo W inicio [--objetivo "..."]  |  ciclo W fim [--resumo "..."]');
  }
  gravarJSON(p, a);
  status({ _: ['status', w] });
}

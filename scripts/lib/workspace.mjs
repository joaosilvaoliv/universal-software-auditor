import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { SKILL_DIR, PASTAS_IGNORADAS, gravarJSON, falhar, carimbo, dentro, hora } from './util.mjs';
import { fotografar } from './integridade.mjs';

const ENV_REAL = /^\.env(\..+)?$/i;
const ENV_MODELO = /(example|sample|template|dist|defaults?)$/i;
const MAX_COPIA = 100 * 1024 * 1024;

export function init(o) {
  const projeto = path.resolve(o.projeto || process.cwd());
  if (!fs.existsSync(projeto) || !fs.statSync(projeto).isDirectory()) falhar(`Projeto não encontrado: ${projeto}`);

  const modo = o.modo;
  if (!['ciclos', 'tempo'].includes(modo)) {
    falhar('Defina --modo ciclos --ciclos N  ou  --modo tempo --minutos M. Se o usuário não escolheu, PERGUNTE antes de começar.');
  }
  const ciclos = modo === 'ciclos' ? parseInt(o.ciclos, 10) : null;
  const minutos = modo === 'tempo' ? parseInt(o.minutos, 10) : null;
  if (modo === 'ciclos' && !(ciclos >= 1)) falhar('--ciclos precisa ser um inteiro >= 1.');
  if (modo === 'tempo' && !(minutos >= 5)) falhar('--minutos precisa ser um inteiro >= 5.');

  const nome = path.basename(projeto).normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^\w.-]+/g, '-').toLowerCase();
  const w = path.resolve(o.saida || path.join(os.homedir(), 'auditorias', nome, carimbo()));
  if (dentro(w, projeto)) falhar('A pasta da auditoria não pode ficar dentro do projeto auditado.');
  if (fs.existsSync(path.join(w, 'audit.json'))) falhar(`Já existe uma auditoria em ${w}. Para retomar: status "${w}".`);
  for (const d of ['', 'evidencias', 'evidencias/screens', 'e2e']) fs.mkdirSync(path.join(w, d), { recursive: true });

  const inicio = new Date();
  const foto = fotografar(projeto);
  gravarJSON(path.join(w, 'integridade-inicial.json'), foto);

  // Cópia de trabalho: é aqui que se instala, compila e testa. Os .env reais ficam de fora, para nenhum teste alcançar serviço real.
  let sandbox = null;
  const envFora = [], grandesFora = [];
  if (!o['sem-copia']) {
    sandbox = path.join(w, 'sandbox');
    fs.cpSync(projeto, sandbox, {
      recursive: true,
      filter: (src) => {
        if (src === projeto) return true;
        let st;
        try { st = fs.lstatSync(src); } catch { return false; }
        if (st.isSymbolicLink()) return false;
        const base = path.basename(src);
        if (st.isDirectory()) return !PASTAS_IGNORADAS.has(base);
        if (ENV_REAL.test(base) && !ENV_MODELO.test(base)) { envFora.push(path.relative(projeto, src)); return false; }
        if (st.size > MAX_COPIA) { grandesFora.push(path.relative(projeto, src)); return false; }
        return true;
      },
    });
  }

  // Reserva para o relatório: 15% do tempo, entre 5 e 30 min.
  const reserva = minutos ? Math.min(30, Math.max(5, Math.round(minutos * 0.15))) : null;
  const prazo = minutos ? new Date(inicio.getTime() + minutos * 60000) : null;
  const a = {
    versao: 1,
    skill_dir: SKILL_DIR,
    workspace: w,
    projeto: { nome: path.basename(projeto), caminho: projeto, url: o.url || null, git_head: foto.git?.head || null },
    sandbox,
    env_fora_da_copia: envFora,
    arquivos_grandes_fora_da_copia: grandesFora,
    execucao: {
      modo, ciclos_planejados: ciclos, duracao_min: minutos, reserva_relatorio_min: reserva,
      inicio: inicio.toISOString(), prazo: prazo ? prazo.toISOString() : null, fim: null,
    },
    tecnologias: [], ferramentas: [], ciclos: [],
    funcionalidades: [], achados: [], melhorias: [], limitacoes: [],
  };
  gravarJSON(path.join(w, 'audit.json'), a);

  const S = `node "${path.join(SKILL_DIR, 'scripts', 'auditor.mjs')}"`;
  console.log([
    'Auditoria criada.',
    `W = ${w}`,
    sandbox ? `Cópia de trabalho: ${sandbox}  (instale, compile e teste SÓ aqui)` : 'Sem cópia de trabalho (--sem-copia): rode apenas comandos comprovadamente somente leitura.',
    envFora.length ? `.env reais NÃO copiados (crie .env de TESTE no sandbox, a partir do .env.example): ${envFora.join(', ')}` : null,
    grandesFora.length ? `Arquivos > 100 MB fora da cópia: ${grandesFora.join(', ')}` : null,
    modo === 'ciclos' ? `Modo: ${ciclos} ciclo(s). Abra o primeiro com: ${S} ciclo "${w}" inicio`
      : `Modo: tempo, ${minutos} min. Prazo ${hora(prazo)}; consolidar a partir de ${hora(prazo.getTime() - reserva * 60000)} (reserva de ${reserva} min para o relatório).`
        + (minutos < 30 ? '\nATENÇÃO: tempo curto. Foque nos fluxos principais e na varredura visual; investigação rasa; mapa e relatório resumidos (seções não executadas marcadas como tal).' : ''),
    `Foto de integridade: ${foto.total} arquivos${foto.git ? ` · git ${foto.git.branch}@${foto.git.head.slice(0, 10)}` : ' · sem git'}`,
    `Comandos: ${S} <status|ciclo|browser|visual|segredos|verificar|stats> "${w}"`,
    `Próximo passo: ler ${path.join(SKILL_DIR, 'references', 'descoberta.md')}`,
  ].filter(Boolean).join('\n'));
}

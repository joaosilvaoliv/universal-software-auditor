# Modos de execução, orçamento e encerramento seguro

A ordem vale nos dois modos: **cobertura geral → investigação → consolidação**. Se sobrar tempo ou ciclo, volte às áreas de maior risco ou maior incerteza.

## Modo A — ciclos

Abra e feche cada ciclo com `ciclo W inicio` e `ciclo W fim --resumo "..."`. O script **recusa** abrir um ciclo além do pedido.

| Total pedido | C1 | Intermediários | Último |
|---|---|---|---|
| 1 | descoberta + cobertura geral + investigação só das falhas graves + relatório | — | (é o C1) |
| 2 | descoberta + cobertura geral | — | investigação + consolidação |
| ≥3 | descoberta + cobertura geral | investigação e aprofundamento | consolidação |

- **C1:** entenda o projeto, mapeie as funcionalidades, monte a matriz, rode os testes disponíveis e os fluxos principais, faça a varredura visual e registre todo erro com evidência. Liste o que ficou sem verificação.
- **Intermediários:** revise os resultados anteriores e investigue os achados (`investigacao.md`). Crie testes **novos** para os problemas, explore cenários alternativos e casos extremos, teste o que ficou pendente e procure falhas relacionadas. Atualize a matriz.
- **Final:** confira as evidências, revise as conclusões, marque os inconclusivos, rode `verificar` e `stats` e escreva o relatório.
- **Não repita a suíte inteira em todo ciclo.** Reexecute só o necessário para confirmar a reprodução ou depois de levantar uma nova hipótese.
- No resumo do ciclo, registre: atividades, funcionalidades examinadas, testes executados, problemas encontrados, investigações concluídas, pendências e artefatos (alimenta a seção J).

## Modo B — tempo

O `init` calcula o prazo e uma **reserva para o relatório**: 15% do tempo, no mínimo 5 e no máximo 30 min. O `status` mostra a fase pelo relógio (o tempo útil é o total menos a reserva):
- **COBERTURA GERAL:** até ~55% do tempo útil;
- **INVESTIGAÇÃO:** daí até a reta final;
- **RETA FINAL:** os últimos ~10% do tempo útil (mínimo 3 min); não comece nada longo;
- **CONSOLIDAR AGORA:** rode `encerrar` e escreva o relatório;
- **TEMPO ESGOTADO:** finalize já.

Abaixo de 30 min, o `init` avisa que o tempo é curto. Nesse caso: fluxos principais + varredura visual + segurança estática, investigação só dos achados graves, mapa e relatório resumidos (com as seções não executadas marcadas).

- O tempo é um **limite máximo**, não uma meta. Se o trabalho útil acabar antes, consolide e encerre.
- **Antes de qualquer tarefa longa** (instalar dependências, build pesado, suíte grande, varredura com muitas páginas), estime a duração. Se ela passar do horário de "consolidar", não comece: registre como pendência (`LIM-`).
- Rode `status` a cada mudança de fase, a cada ~15 minutos ou ~5 cenários.

## Recursos que você não enxerga

- Não presuma que o ambiente mostra os tokens restantes, os créditos ou o limite da sessão. Trabalhe com o que é conhecido: o relógio, os ciclos e o tamanho da conversa.
- Se a conversa estiver ficando longa, ou houver risco de a sessão cair, salve `W/relatorio-parcial.md` com o essencial e mantenha o `audit.json` em dia.

## Encerramento seguro

1. Pare de explorar **antes** de comprometer a capacidade de escrever o relatório.
2. O `audit.json` precisa estar atualizado: cada cenário com estado e evidência, cada achado com gravidade e estado.
3. Rode `encerrar`: ele fecha o ciclo aberto, registra o fim da execução e roda `verificar` e `stats`. Depois escreva o `relatorio.md`.
4. Se algo foi interrompido, diga o quê, por quê e em que ponto parou. Nunca diga que continuou trabalhando em segundo plano.

## Retomada

Só retome se o usuário pedir e se `W/audit.json` existir. Nesse caso:
1. Rode `status W` e leia `relatorio-parcial.md`, se houver.
2. Continue a partir dos itens `pendente` e `em-execucao`.
3. No modo ciclos, a contagem continua de onde parou e o limite pedido vale para o total.
4. Registre a retomada no resumo do ciclo.

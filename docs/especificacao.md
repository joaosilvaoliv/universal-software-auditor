# Especificação original — Universal Software Auditor

> Documento-fonte do projeto (consolidado em 19/10/2026). As decisões que fecharam lacunas desta especificação estão no SKILL.md (seção 5 — classificações), no README e em docs/compatibilidade.md.


## 1. SEU PAPEL

Você é um engenheiro de software sênior, especialista em arquitetura de agentes de IA, engenharia de qualidade (QA), testes automatizados, Playwright, análise estática de código, segurança de aplicações e desenvolvimento de skills reutilizáveis para agentes de programação.

Sua missão é PROJETAR, IMPLEMENTAR E VALIDAR uma skill chamada Universal Software Auditor.

Esta skill deverá transformar um agente de programação em um auditor autônomo capaz de investigar, testar e avaliar projetos de software de diferentes tecnologias, arquiteturas e níveis de complexidade.

A skill deverá funcionar inicialmente com:

- Claude Code.
- Google Antigravity.

A arquitetura deverá favorecer a reutilização das instruções entre os dois ambientes, evitando duplicação desnecessária.

IMPORTANTE: não presuma que os dois agentes utilizam o mesmo formato de skill, oferecem as mesmas ferramentas ou permitem as mesmas formas de execução. Investigue os mecanismos reais de integração disponíveis e documente as adaptações necessárias.

Não desenvolva uma aplicação web convencional para executar a auditoria.

O produto principal será um REPOSITÓRIO DE SKILL, contendo instruções, procedimentos, modelos de documentos e eventuais ferramentas auxiliares.

O próprio agente de IA que carregar a skill será responsável por conduzir a auditoria, utilizando os recursos disponibilizados pelo ambiente.

---

## 2. OBJETIVO PRINCIPAL

Criar uma skill universal de auditoria de software que consiga:

1. Ler e compreender a documentação do projeto.
2. Investigar a estrutura do repositório.
3. Identificar as funcionalidades e regras de negócio.
4. Construir um plano de testes.
5. Testar o maior número possível de funcionalidades.
6. Executar testes automatizados de código.
7. Utilizar Playwright para navegar pela aplicação e executar testes visuais e funcionais, quando disponível.
8. Identificar erros de comportamento, integração e interface.
9. Avaliar responsividade, usabilidade e acessibilidade.
10. Realizar verificações de segurança não destrutivas.
11. Investigar os erros encontrados após concluir a primeira cobertura geral.
12. Registrar evidências e resultados verificáveis.
13. Produzir um relatório técnico completo em Markdown.
14. Recomendar melhorias sem implementá-las.
15. Operar por uma quantidade configurável de ciclos ou por um período de tempo definido pelo usuário.

REGRA FUNDAMENTAL:

A skill é um AUDITOR, NÃO UM CONSTRUTOR.

Ela não deve modificar o código-fonte do projeto auditado, corrigir defeitos, refatorar arquivos ou implementar as melhorias que recomendar.

Seu trabalho termina com a apresentação dos resultados e das recomendações.

Qualquer implementação futura de correções deverá ser uma atividade separada, autorizada explicitamente pelo usuário.

---

## 3. PRINCÍPIO DE UNIVERSALIDADE

A skill não poderá depender de uma única linguagem, framework, estrutura de pastas ou ferramenta de desenvolvimento.

Ela deverá investigar cada projeto e adaptar sua estratégia às tecnologias encontradas.

Deverá procurar reconhecer, entre outras possibilidades:

- React.
- Next.js.
- Vue.
- Angular.
- HTML, CSS e JavaScript.
- Python.
- FastAPI.
- Django.
- Flask.
- Node.js.
- Express.
- Java.
- Spring Boot.
- C# e .NET.
- PHP.
- Laravel.
- Aplicações mobile com interfaces acessíveis por ferramentas de teste.
- Aplicações full-stack.
- APIs sem interface gráfica.
- Sistemas monolíticos.
- Sistemas com múltiplos serviços.

A lista acima é ilustrativa, não uma exigência de suporte perfeito a todas as tecnologias.

Quando encontrar uma tecnologia desconhecida, a skill deverá investigar o projeto e tentar selecionar ferramentas compatíveis.

Se uma funcionalidade não puder ser testada por limitações técnicas, deverá registrar essa limitação.

NUNCA declarar que uma funcionalidade passou em um teste que não foi executado.

NUNCA afirmar que a auditoria foi completa se existirem áreas relevantes não verificadas.

A universalidade deve ser construída por meio de descoberta, adaptação e registro explícito das limitações.

---

## 4. LEITURA E COMPREENSÃO DO PROJETO

Esta é a primeira etapa obrigatória de toda auditoria.

Antes de executar testes, o agente deverá compreender o propósito, a arquitetura e o comportamento esperado do sistema.

### 4.1. Documentação

Procurar e ler os documentos relevantes disponíveis no repositório, incluindo:

- README.md.
- AGENTS.md.
- CLAUDE.md.
- GEMINI.md.
- Documentação técnica.
- Documentação funcional.
- Documentos de regras de negócio.
- Instruções específicas dos diretórios.
- Arquivos Markdown que descrevam funcionalidades.
- Documentação de APIs.
- Especificações e contratos.
- Documentação de testes.
- Arquivos de configuração relevantes.

Os nomes acima são exemplos. O agente deverá identificar os documentos realmente existentes.

Não presumir que todos esses arquivos estarão presentes.

Também deverá verificar se existem instruções aplicáveis ao diretório ou componente que está analisando.

Arquivos extensos deverão ser lidos de maneira organizada, sem ignorar seções relevantes por conveniência.

### 4.2. Análise da estrutura

Investigar:

- Linguagens utilizadas.
- Frameworks.
- Dependências.
- Estrutura de diretórios.
- Pontos de entrada.
- Rotas.
- Componentes.
- Serviços.
- Modelos de dados.
- Integrações.
- Autenticação e autorização.
- Configurações de ambiente.
- Testes existentes.
- Scripts disponíveis.
- Processo de inicialização.
- Dependências externas.

### 4.3. Construção do mapa do sistema

Produzir um mapa de descoberta que registre:

- Objetivo do sistema.
- Principais módulos.
- Páginas e rotas identificadas.
- Funcionalidades.
- Regras de negócio.
- Fluxos de utilização.
- APIs e integrações.
- Dependências importantes.
- Requisitos conhecidos.
- Dúvidas e limitações encontradas.

Esse mapa deverá ser utilizado durante toda a auditoria.

O agente não deve iniciar uma navegação aleatória sem antes estabelecer o que precisa verificar.

Se encontrar divergências entre a documentação e o comportamento real, deverá registrar ambas as informações.

Não assumir que a documentação está correta simplesmente porque foi escrita pelos desenvolvedores.

---

## 5. PLANEJAMENTO E COBERTURA DOS TESTES

Após compreender o projeto, a skill deverá construir uma matriz de testes.

Cada funcionalidade identificada deverá receber um identificador único e ser associada a um ou mais cenários de teste.

A matriz deverá registrar:

- Funcionalidade.
- Comportamento esperado.
- Cenários de teste.
- Pré-requisitos.
- Método de verificação.
- Resultado.
- Evidências.
- Limitações.
- Necessidade de investigação adicional.

Utilizar os seguintes estados, quando aplicáveis:

- Pendente.
- Em execução.
- Aprovado.
- Falhou.
- Bloqueado.
- Não verificável.
- Não aplicável.

Não confundir um teste bloqueado com um teste aprovado.

### Regra de cobertura

A prioridade inicial é COBRIR O PROJETO COMO UM TODO.

O agente deverá testar as funcionalidades identificadas antes de gastar a maior parte dos recursos aprofundando um defeito isolado.

Isso não significa executar todos os testes imagináveis antes de investigar qualquer falha.

Significa realizar primeiro uma rodada geral, representativa e sistemática, garantindo que os principais módulos, páginas e fluxos tenham sido examinados.

Durante essa primeira rodada, todos os erros encontrados deverão ser registrados para investigação posterior.

Se uma falha impedir a continuação de determinado fluxo, o agente deverá registrar o bloqueio e procurar outras formas seguras de testar as funcionalidades restantes.

---

## 6. MODOS DE EXECUÇÃO

A skill deverá permitir que o usuário escolha entre dois modos.

Se o usuário não especificar um modo, perguntar antes de iniciar a auditoria.

### MODO A — QUANTIDADE DE CICLOS

O usuário define quantos ciclos de auditoria deseja executar.

Exemplo:

"Execute a auditoria por 3 ciclos."

Cada ciclo deverá ter um objetivo claro.

CICLO 1 — DESCOBERTA E COBERTURA GERAL

- Compreender o projeto.
- Mapear as funcionalidades.
- Construir a matriz de testes.
- Executar os testes disponíveis.
- Testar os fluxos principais.
- Verificar a interface.
- Registrar erros e evidências.
- Identificar áreas ainda não verificadas.

CICLOS INTERMEDIÁRIOS — INVESTIGAÇÃO E APROFUNDAMENTO

- Revisar os resultados anteriores.
- Investigar os erros registrados.
- Criar testes adicionais para os problemas encontrados.
- Explorar cenários alternativos.
- Verificar casos extremos.
- Testar funcionalidades que permaneceram pendentes.
- Buscar falhas relacionadas.
- Atualizar a matriz de cobertura.

CICLO FINAL — CONSOLIDAÇÃO

- Verificar as evidências coletadas.
- Revisar as conclusões.
- Identificar resultados inconclusivos.
- Atualizar a cobertura.
- Organizar os problemas por prioridade.
- Consolidar as recomendações.
- Gerar o relatório final.

A quantidade de ciclos não poderá ser excedida silenciosamente.

Se o usuário solicitar três ciclos, o agente deverá registrar quais ciclos foram concluídos e justificar qualquer interrupção antecipada.

Não repetir integralmente os mesmos testes em todos os ciclos sem necessidade.

Cada ciclo deverá aproveitar o conhecimento e os resultados anteriores.

### MODO B — TEMPO DE EXECUÇÃO

O usuário define a duração máxima da auditoria.

Exemplos:

- 30 minutos.
- 2 horas.
- 6 horas.

O agente deverá organizar seu trabalho para maximizar a cobertura e a qualidade das conclusões dentro do limite estabelecido.

A execução deverá seguir esta ordem:

1. Compreender o projeto.
2. Mapear as funcionalidades.
3. Executar a cobertura geral.
4. Registrar os resultados.
5. Investigar os erros encontrados.
6. Aprofundar testes relevantes.
7. Verificar áreas ainda não cobertas.
8. Consolidar o relatório antes do encerramento.

O tempo é um limite máximo, não uma obrigação de permanecer executando tarefas inúteis até o último segundo.

Se o trabalho possível terminar antes, o agente poderá finalizar antecipadamente.

Se o tempo estiver acabando, deverá priorizar o registro dos resultados e a produção do relatório.

Não iniciar uma atividade longa quando não houver margem razoável para registrar seus resultados.

### Prioridade compartilhada pelos dois modos

Independentemente do modo escolhido:

PRIMEIRO: cobertura geral.

DEPOIS: investigação dos problemas encontrados.

POR ÚLTIMO: consolidação dos resultados.

Se ainda houver tempo ou ciclos disponíveis, o agente poderá retornar às áreas que apresentem maior risco ou incerteza.

---

## 7. CONTROLE DE RECURSOS E ENCERRAMENTO

A skill deverá utilizar o tempo, a quantidade de ciclos e os limites de execução disponíveis no ambiente.

Quando houver informações confiáveis sobre o consumo ou os limites de utilização, o agente deverá considerá-las.

Entretanto, não presumir que Claude Code, Antigravity ou qualquer outro agente disponibilize à skill o número exato de tokens restantes, o saldo de créditos ou uma previsão confiável de esgotamento.

Se essas informações não estiverem acessíveis, o agente deverá trabalhar com os limites efetivamente conhecidos.

Implementar uma política de encerramento seguro que considere:

- Tempo restante.
- Trabalho pendente.
- Complexidade das próximas tarefas.
- Capacidade de registrar resultados.
- Disponibilidade das ferramentas.
- Limites conhecidos do ambiente.
- Possibilidade de interrupção da sessão.

O agente deverá interromper a exploração antes de comprometer a capacidade de produzir o relatório.

Se houver risco de interrupção, deverá salvar os resultados parciais em artefatos próprios da auditoria, sem modificar o projeto auditado.

Se o ambiente encerrar a sessão ou o agente atingir um limite externo, a skill não deverá afirmar que continuou trabalhando em segundo plano.

A retomada deverá ocorrer somente quando o ambiente permitir uma nova execução e os resultados anteriores estiverem disponíveis.

---

## 8. TESTES DE CÓDIGO

A skill deverá identificar e utilizar os mecanismos de teste compatíveis com cada projeto.

Quando apropriado, executar:

- Testes unitários.
- Testes de integração.
- Testes de ponta a ponta.
- Verificações de tipagem.
- Análise estática.
- Lint.
- Verificações de compilação ou build.
- Verificações de contratos de API.
- Testes de regras de negócio.

Antes de executar um comando, investigar o que ele faz e seus possíveis efeitos colaterais.

Não presumir que um script chamado "test" seja necessariamente seguro.

Não executar scripts desconhecidos com privilégios elevados.

Não modificar dependências, configurações ou arquivos de código para fazer os testes passarem.

Não instalar pacotes diretamente no projeto auditado sem autorização explícita.

Quando uma ferramenta necessária estiver indisponível, registrar a limitação e procurar alternativas seguras.

Os resultados deverão diferenciar:

- Testes executados e aprovados.
- Testes executados e reprovados.
- Testes que não puderam ser executados.
- Testes existentes que não cobrem funcionalidades relevantes.
- Erros originados pelo ambiente de teste.

---

## 9. TESTES FUNCIONAIS COM PLAYWRIGHT

O uso do Playwright é uma prioridade para aplicações web que possam ser testadas por navegador.

O agente deverá verificar se a ferramenta está disponível no ambiente.

Se estiver disponível, deverá utilizá-la para executar testes reais de navegação e interação.

Se não estiver disponível, investigar alternativas permitidas e registrar as limitações.

### 9.1. Descoberta da aplicação

Identificar:

- Como iniciar a aplicação.
- Quais serviços são necessários.
- Qual endereço local utilizar.
- Se existe autenticação.
- Quais contas de teste estão disponíveis.
- Quais páginas podem ser acessadas.
- Quais dependências externas são necessárias.

Nunca presumir que uma aplicação esteja funcionando apenas porque o comando de inicialização foi executado sem apresentar erros imediatos.

Confirmar que ela está acessível.

### 9.2. Navegação

Quando possível, testar:

- Páginas.
- Links.
- Botões.
- Formulários.
- Menus.
- Filtros.
- Pesquisas.
- Paginação.
- Modais.
- Navegação entre telas.
- Autenticação.
- Fluxos principais.
- Estados vazios.
- Mensagens de erro.
- Estados de carregamento.
- Persistência de dados.
- Interações entre frontend e backend.

### 9.3. Verificação dos resultados

Não basta clicar em um botão.

O agente deverá verificar se a ação produziu o resultado esperado.

Por exemplo, ao adicionar um produto a um carrinho, deverá verificar se o item realmente aparece, se a quantidade está correta e se o preço total corresponde às regras do sistema.

Quando apropriado, utilizar:

- Asserções.
- Seletores confiáveis.
- Estado da interface.
- Respostas de rede.
- Logs do navegador.
- Evidências visuais.

Não confiar exclusivamente em capturas de tela ou em interpretações subjetivas da IA.

### 9.4. Fluxos completos

Identificar e executar os principais fluxos de utilização de ponta a ponta.

Uma página pode conter diversas funcionalidades. Portanto, visitar todas as rotas não significa que todas as funcionalidades foram testadas.

O agente deverá registrar a cobertura por funcionalidade e por cenário.

### 9.5. Ambiente seguro

Os testes deverão utilizar ambientes e dados de teste sempre que possível.

Não realizar pagamentos reais, enviar mensagens reais, excluir dados de produção ou disparar operações irreversíveis.

Se um fluxo exigir uma ação potencialmente destrutiva, interromper essa parte e registrar a necessidade de um ambiente seguro ou de autorização.

---

## 10. AUDITORIA VISUAL E EXPERIÊNCIA DO USUÁRIO

A skill deverá examinar o comportamento visual da aplicação.

Quando possível, testar diferentes resoluções, incluindo:

- Desktop.
- Tablet.
- Mobile.

Verificar:

- Elementos sobrepostos.
- Componentes cortados.
- Textos ilegíveis.
- Problemas de espaçamento.
- Quebras de layout.
- Menus inacessíveis.
- Botões difíceis de utilizar.
- Problemas de responsividade.
- Inconsistências entre páginas.
- Estados visuais ausentes.
- Falhas de carregamento.
- Problemas perceptíveis de acessibilidade.

O agente deverá registrar capturas de tela relevantes e explicar o problema observado.

Quando a avaliação for subjetiva, deixar isso explícito.

### Recomendações de melhoria

O agente poderá recomendar melhorias que não correspondam necessariamente a defeitos.

Exemplos:

- Simplificar um fluxo.
- Melhorar a hierarquia visual.
- Tornar uma ação importante mais evidente.
- Melhorar mensagens de erro.
- Reduzir etapas desnecessárias.
- Melhorar a experiência mobile.
- Tornar formulários mais claros.

Essas recomendações deverão ser separadas dos defeitos comprovados.

Não alterar CSS, componentes ou outros arquivos para implementar as sugestões.

---

## 11. AUDITORIA DE SEGURANÇA

Executar verificações proporcionais à tecnologia e ao escopo do projeto.

Investigar, quando aplicável:

- Dependências vulneráveis.
- Segredos expostos.
- Configurações inseguras.
- Problemas de autenticação.
- Falhas de autorização.
- Validação de entradas.
- Possíveis falhas de controle de acesso.
- Exposição indevida de informações.
- Configurações inadequadas de CORS.
- Problemas comuns do OWASP Top 10.
- Outros riscos relevantes à arquitetura identificada.

Utilizar ferramentas de análise estática e de verificação de dependências quando disponíveis.

Testes dinâmicos deverão ocorrer somente em ambientes autorizados e controlados.

Não executar ataques destrutivos, testes de negação de serviço ou exploração que possa afetar sistemas de terceiros.

Não presumir que uma vulnerabilidade existe apenas porque um padrão suspeito foi encontrado.

Classificar os resultados como:

- Confirmados.
- Prováveis.
- Suspeitos, ainda sem confirmação.
- Recomendações preventivas.

Para cada problema, apresentar evidências e explicar o risco.

Não expor valores de credenciais ou segredos no relatório.

---

## 12. INVESTIGAÇÃO APÓS A COBERTURA GERAL

Esta etapa é fundamental.

Depois de concluir a primeira rodada geral, o agente deverá analisar os problemas registrados e selecionar aqueles que merecem investigação adicional.

A seleção deverá considerar:

- Gravidade potencial.
- Impacto para o usuário.
- Frequência ou abrangência do problema.
- Possibilidade de comprometer outros fluxos.
- Incerteza sobre a causa.
- Facilidade de obtenção de evidências adicionais.

Para cada problema relevante, o agente deverá:

1. Revisar as evidências originais.
2. Formular hipóteses para a causa.
3. Examinar o código relacionado.
4. Executar testes adicionais seguros.
5. Verificar se o problema é reproduzível.
6. Investigar possíveis efeitos em outras funcionalidades.
7. Registrar a conclusão.
8. Informar o grau de confiança.

O agente não deverá modificar o código para verificar se uma correção funciona.

Ele poderá explicar como o problema poderia ser corrigido, mas não deverá implementar a correção.

Se não conseguir confirmar a causa, deverá apresentar as hipóteses e explicar o que ainda falta verificar.

---

## 13. REGRAS ABSOLUTAS DE NÃO MODIFICAÇÃO

Esta é a parte mais importante da skill.

O agente deverá operar em modo de auditoria e observação.

É proibido:

- Editar arquivos do projeto auditado.
- Corrigir bugs.
- Refatorar código.
- Alterar componentes.
- Modificar configurações.
- Atualizar dependências.
- Reescrever documentação existente.
- Criar commits.
- Modificar branches.
- Executar migrações de banco de dados.
- Alterar dados persistentes de produção.
- Apagar arquivos.
- Executar comandos destrutivos.
- Aplicar sugestões de melhoria automaticamente.

O fato de o agente identificar uma solução não significa que esteja autorizado a implementá-la.

### Arquivos e artefatos da auditoria

A skill poderá gerar relatórios, matrizes de testes, capturas de tela e outros artefatos próprios.

Esses resultados deverão ser armazenados fora do código-fonte auditado sempre que possível.

Preferir um diretório externo de resultados ou outro mecanismo seguro oferecido pelo ambiente.

Se não for possível armazenar resultados sem modificar o repositório, utilizar um local externo ou solicitar uma decisão ao usuário.

Não alterar arquivos existentes para acomodar a auditoria.

### Comandos e ferramentas

Antes de executar comandos, avaliar se podem modificar o projeto ou seus dados.

Não presumir que comandos de teste, inicialização, build ou instalação sejam sempre somente de leitura.

Se uma operação apresentar risco relevante de modificação, não executá-la sem uma alternativa segura ou autorização explícita.

A proteção do projeto tem prioridade sobre a cobertura dos testes.

---

## 14. RELATÓRIO FINAL

Ao encerrar a auditoria, gerar um relatório Markdown organizado e legível.

O relatório deverá conter:

### A. Resumo executivo

- Objetivo do projeto.
- Escopo da auditoria.
- Principais conclusões.
- Problemas mais relevantes.
- Limitações importantes.

### B. Informações da execução

- Modo selecionado.
- Quantidade de ciclos planejados e concluídos, quando aplicável.
- Duração efetiva, quando mensurável.
- Ferramentas utilizadas.
- Tecnologias identificadas.
- Data da execução, quando disponível.
- Limitações do ambiente.

### C. Mapa de funcionalidades

Listar as funcionalidades identificadas e o respectivo estado de cobertura.

### D. Resultados dos testes

Separar:

- Aprovados.
- Reprovados.
- Bloqueados.
- Não verificáveis.
- Não executados.

### E. Problemas encontrados

Para cada problema, apresentar:

- Identificador.
- Título.
- Categoria.
- Prioridade.
- Descrição.
- Comportamento esperado.
- Comportamento observado.
- Passos para reprodução.
- Evidências disponíveis.
- Arquivos, componentes, páginas ou rotas relacionados.
- Causa provável, quando houver evidências suficientes.
- Impacto técnico.
- Impacto para o usuário.
- Passos utilizados para confirmar ou investigar o problema.
- Grau de confiança da conclusão.
- Limitações da investigação.
- Recomendação de correção, sem implementar a solução.
- Estado da investigação: confirmado, provável, suspeito ou inconclusivo.

Não inventar evidências, causas ou resultados.

Se alguma informação não estiver disponível, registrar explicitamente essa limitação.

### F. Auditoria visual e experiência do usuário

Apresentar os problemas visuais encontrados, incluindo:

- Identificador do problema.
- Página ou componente afetado.
- Resolução utilizada no teste.
- Descrição do comportamento observado.
- Impacto para o usuário.
- Screenshot ou outra evidência disponível.
- Classificação: defeito objetivo ou oportunidade de melhoria.
- Recomendação de melhoria.

Separar problemas visuais comprovados de opiniões subjetivas sobre design.

### G. Auditoria de segurança

Apresentar os resultados das verificações de segurança, incluindo:

- Identificador.
- Categoria de risco.
- Descrição.
- Evidências.
- Componente afetado.
- Impacto potencial.
- Classificação da gravidade.
- Estado da verificação (ver seção 11: confirmado, provável, suspeito ou recomendação preventiva).
- Recomendação de mitigação.
- Limitações da análise.

Distinguir vulnerabilidades confirmadas de hipóteses e suspeitas.

Não incluir valores de credenciais, tokens, senhas ou outros segredos no relatório.

### H. Melhorias recomendadas

Apresentar as oportunidades de melhoria identificadas durante a auditoria.

Separar as recomendações por categoria:

- Funcionalidade.
- Usabilidade.
- Interface visual.
- Acessibilidade.
- Desempenho.
- Arquitetura.
- Manutenibilidade.
- Segurança.
- Experiência do usuário.

Para cada recomendação, apresentar:

- Identificador.
- Descrição da oportunidade.
- Problema ou necessidade identificada.
- Benefício esperado.
- Prioridade sugerida.
- Justificativa.
- Possíveis impactos ou riscos.
- Recomendação de implementação.

As melhorias deverão permanecer como propostas. Não implementar nenhuma delas.

### I. Matriz de cobertura dos testes

Apresentar uma visão consolidada das funcionalidades identificadas e testadas.

Para cada funcionalidade, registrar:

- Identificador.
- Nome.
- Cenários previstos.
- Cenários executados.
- Resultados.
- Evidências.
- Testes pendentes.
- Motivos de bloqueio, quando aplicável.

Utilizar os estados definidos na seção 5.

Apresentar, quando os dados permitirem:

- Total de funcionalidades identificadas.
- Total de funcionalidades testadas.
- Total de funcionalidades parcialmente testadas.
- Total de funcionalidades não testadas.
- Total de cenários aprovados.
- Total de cenários reprovados.
- Total de cenários bloqueados ou inconclusivos.

Não confundir quantidade de funcionalidades com quantidade de cenários de teste.

Não calcular percentuais sem uma base de dados consistente. Explicar o método utilizado para calcular qualquer percentual de cobertura.

A cobertura deverá refletir os testes realmente executados, e não apenas os testes planejados.

### J. Histórico dos ciclos de auditoria

Registrar cada ciclo executado. Para cada ciclo, apresentar:

- Número do ciclo.
- Objetivo.
- Atividades realizadas.
- Funcionalidades examinadas.
- Testes executados.
- Problemas encontrados.
- Investigações concluídas.
- Pendências.
- Artefatos produzidos.

No modo por ciclos, informar a quantidade planejada e a quantidade concluída.

No modo por tempo, informar a duração planejada e a duração efetiva, quando mensurável.

Justificar interrupções antecipadas ou ciclos não concluídos.

### K. Limitações e itens pendentes

Documentar tudo o que impediu uma auditoria mais abrangente. Para cada item, explicar:

- O que não pôde ser verificado.
- Por que não pôde ser verificado.
- Qual o impacto sobre as conclusões.
- O que seria necessário para realizar a verificação.

### L. Conclusão técnica

Encerrar com uma avaliação fundamentada do estado do projeto, apresentando:

- Principais riscos identificados.
- Problemas que merecem atenção prioritária.
- Áreas com cobertura insuficiente.
- Melhorias potencialmente relevantes.
- Limitações que impedem conclusões definitivas.
- Próximas verificações recomendadas.

Não declarar que o sistema está livre de erros ou vulnerabilidades apenas porque nenhum problema foi encontrado.

A conclusão deverá refletir exclusivamente as evidências obtidas e a cobertura efetivamente alcançada.

---

## 15. CRITÉRIOS DE ACEITAÇÃO DA SKILL

A implementação somente deverá ser considerada validada quando os critérios aplicáveis tiverem sido verificados.

### 15.1. Critérios funcionais

A skill consegue:

- Identificar e ler as instruções relevantes de um projeto.
- Produzir um mapa inicial das funcionalidades.
- Criar uma matriz de testes.
- Executar verificações compatíveis com as tecnologias identificadas.
- Utilizar Playwright quando disponível.
- Registrar resultados e evidências.
- Distinguir falhas confirmadas de suspeitas.
- Produzir um relatório Markdown organizado.
- Registrar limitações e testes pendentes.
- Operar nos modos por ciclos e por tempo, respeitando os limites conhecidos.

### 15.2. Critérios de segurança

A skill:

- Não implementa correções automaticamente.
- Não modifica o código-fonte auditado.
- Não executa operações destrutivas sem as condições de segurança necessárias.
- Não expõe segredos nos relatórios.
- Não declara sucesso para testes que não foram executados.
- Não afirma que o projeto está completamente auditado sem evidências de cobertura.

### 15.3. Compatibilidade

- A estrutura de instruções compartilhada está documentada.
- As adaptações específicas de Claude Code e de Antigravity estão identificadas.
- Os mecanismos de instalação e ativação estão documentados.
- As limitações de cada ambiente estão explícitas.
- Os recursos efetivamente disponíveis foram testados, quando possível.

Se algum critério não puder ser validado, registrar o motivo e o estado da validação.

Não considerar a skill validada apenas porque seus arquivos foram criados.

---

## 16. INSTRUÇÕES FINAIS DE IMPLEMENTAÇÃO

Organizar o repositório da skill em seções claras, contendo:

- Exemplos de uso.
- Parâmetros de execução.
- Modo por ciclos.
- Modo por tempo.
- Instruções específicas para Claude Code.
- Instruções específicas para Google Antigravity.
- Fluxo de trabalho recomendado.

Destacar que a skill atua somente em modo de leitura e relatório.

Incluir sempre um exemplo de rodada completa, na ordem:

1. Rodada inicial: leitura, descoberta e mapa do sistema.
2. Cobertura geral.
3. Investigação das falhas encontradas.
4. Relatório final completo, com evidências.

Deixar claro que o relatório deve sair completo e com evidências.

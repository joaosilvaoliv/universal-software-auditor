# Investigação depois da cobertura geral

Só comece depois da primeira rodada geral (ou quando um bloqueio impedir a cobertura e for preciso entender a causa).

## Escolher o que investigar

Ordene os achados por:
- gravidade e impacto para o usuário;
- abrangência (quantos fluxos atinge);
- potencial de comprometer outros fluxos;
- incerteza sobre a causa;
- facilidade de obter mais evidência.

Investigue primeiro os `critica`/`alta` com causa incerta. Se o tempo for curto, aprofunde menos itens e faça bem feito.

## Para cada achado

1. Revise a evidência original (log, captura, resposta de rede).
2. Formule hipóteses de causa (mais de uma, quando houver).
3. Leia o caminho no código: rota → handler/controller → serviço → consulta/integração → resposta → renderização no front. Use `git log`/`git blame` (leitura) para contexto.
4. Rode testes adicionais seguros:
   - reprodução mínima, variação de entrada, outro perfil, outra tela;
   - leitura dos logs do servidor (saída do processo no sandbox, `docker logs` do `aud-`);
   - para mais detalhe, nível de log por variável de ambiente.
5. Confirme se reproduz (quantas vezes, em que condições).
6. Verifique efeitos em funcionalidades relacionadas (o mesmo componente, endpoint ou regra).
7. Registre a conclusão no `audit.json` (estado + confiança) e o detalhe em `achados.md`. Acrescente à matriz os cenários novos (`FUN-00x.y`), ligados ao achado.
8. Informe o grau de confiança:
   - `alta`: reproduzido e com a causa vista no código;
   - `media`: reproduzido, com causa inferida;
   - `baixa`: hipótese.

## Limites

- **Proibido modificar código para testar se uma correção funciona**, nem no sandbox. Nada de prints temporários em arquivos existentes. Pode acrescentar **arquivos novos de teste**.
- Pode descrever como corrigir (recomendação), sem implementar.
- Se não confirmar a causa, apresente as hipóteses, o que foi descartado e o que falta verificar. O estado fica `inconclusivo` ou `suspeito`.

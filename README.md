# SPX Delete Orders — DEL

Extensão Chrome/Edge (Manifest V3) para excluir somente os pedidos retornados pela **Pesquisa em lote** na tela **Roteirizar → Pedidos para roteirizar** do SPX.

**Versão 0.1.2 de teste.** A lógica foi verificada em simulação DOM. A compatibilidade final dos seletores e o comportamento do sistema precisam ser conferidos no SPX real. Nenhuma operação foi realizada em uma sessão real durante o desenvolvimento.

## Atualização 0.1.2

Remove a varredura de todas as páginas antes da exclusão. Começa na página atual e confere os BRs de cada página contra a lista enviada na pesquisa em lote, conforme os pedidos aparecem. Também remove a espera fixa de estabilidade após cada exclusão: o próximo pedido começa assim que o diálogo fecha, a linha desaparece, o total diminui em um e o carregamento termina. O servidor continua determinando a velocidade final.

## Funcionamento

- Ícone DEL branco sobre laranja; caixa aberta exclusivamente pelo ícone e arrastável pelo cabeçalho.
- Registra silenciosamente os códigos enviados na Pesquisa em lote, sem abrir a caixa nem iniciar exclusões.
- Ao iniciar, confere a página atual. Cada página e cada pedido são verificados antes da exclusão. Se aparecer um BR fora da lista enviada, interrompe antes de excluir esse BR. Pedidos válidos das páginas anteriores podem já ter sido excluídos.
- Sem limite fixo de 24; suporta os tamanhos de 24, 40 e 50 por página.
- Exclui somente códigos da lista enviada, um por vez. Confere redução do total e desaparecimento da linha antes de contabilizar o sucesso.
- Não acessa Entrada ou Recebimento.
- PARAR e fechar a caixa abortam as esperas e impedem novos cliques. Tentam cancelar a confirmação aberta pelo processo. Solicitações já enviadas ao SPX podem terminar.
- Redefinir, nova pesquisa, edição de filtros e mudança de rota interrompem o processo. A pesquisa em lote deve ser refeita para registrar um novo conjunto.
- Impede execuções simultâneas e falha sem clicar quando a identificação fica ambígua.

A extensão deve estar ativa antes de clicar em Enviar na Pesquisa em lote. Após instalar, recarregar a extensão ou atualizar a aba, refaça a pesquisa. Não deduz que uma tabela com poucos pedidos seja um resultado filtrado.

## Instalação e ZIP

Veja [INSTALACAO.md](INSTALACAO.md). No download do repositório, a pasta instalável é **extension**. No ZIP gerado pelo script, ela se chama **DEL-SPX**.

Execute `python3 scripts/package.py` para gerar o ZIP com os arquivos da extensão e as instruções. Atualizações devem ser recarregadas em cada PC.

## Testes

Node 22 ou superior: `npm install` e `npm test`. A simulação usa jsdom e relógios virtuais, com as mesmas classes observadas no HTML fornecido. Não se conecta ao SPX.

Casos: 10, 24, 50, 100 e 400 pedidos; tamanhos 24/40/50; reposição de linhas após exclusão; parada durante preparação, antes do diálogo e com diálogo aberto; parada/fechamento/Redefinir após envio de uma exclusão; resultado fora da lista na segunda página (interrompe ao encontrá-lo); falha de exclusão; ausência de pesquisa registrada; duplo início; início da exclusão sem varredura de páginas; arraste da caixa.

Limites: a geometria de visibilidade é simulada e os diálogos são reproduzidos a partir dos seletores e textos observados; o servidor real pode apresentar outros estados. Uma demora superior a 15 segundos encerra o processo para revisão. A contagem mostra somente exclusões verificadas; após uma parada, a última solicitação enviada pode concluir sem ser contabilizada.

## Privacidade

Não há envio de dados para servidores da extensão, telemetria ou armazenamento persistente dos códigos. A lista fica apenas na memória da aba. O monitoramento roda somente no domínio spx.shopee.com.br; o processamento é restrito à rota lmRouteCollectionPool. Capturas e HTML reais com códigos de pedidos não integram o repositório ou o ZIP.

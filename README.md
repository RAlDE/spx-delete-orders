# SPX Delete Orders — DEL

Extensão para excluir somente os pedidos retornados pela pesquisa aplicada na tela Roteirizar → Pedidos para roteirizar do SPX.

## Requisitos

- Ícone DEL com letras brancas sobre fundo laranja.
- Caixa com os botões de iniciar e parar, aberta somente ao clicar no ícone da extensão.
- Abrir a página ou pesquisar não abre a caixa e não inicia exclusões.
- Excluir todos os pedidos da pesquisa, incluindo as páginas seguintes, sem limite fixo de 24.
- Funcionar com a visualização de 24, 40 ou 50 itens por página.
- Identificar os códigos dos pedidos de todo o resultado antes de iniciar a exclusão; excluir somente códigos desse conjunto. Não usar apenas a quantidade como limite de segurança.
- Interromper se a pesquisa mudar, se sair da tela ou se não for possível identificar os resultados com segurança.
- Verificar o sucesso de cada exclusão antes de contabilizá-la e aguardar a atualização da tabela.
- Impedir execuções simultâneas e manter o controle de parada disponível.
- Remover toda navegação para Entrada, Recebimento e Single Receive.
- Permanecer na tela de pedidos ao finalizar.
- Entregar ZIP instalável pelo modo de desenvolvedor do Chrome/Edge em vários PCs. Atualizar o GitHub não atualiza automaticamente as instalações.

## Revisão do código original

O original abre o popup pelo ícone, mas possui limite fixo de 24, não trata a paginação e não protege o conjunto de pedidos pesquisados. Escolhe o botão Excluir pela posição, usa um seletor global para confirmação, conta cada clique em confirmar como sucesso e espera apenas 300 ms entre operações. Não verifica a tela correta ou execuções simultâneas. Fechar e reabrir o popup perde o estado de controle, embora a automação possa continuar. A etapa final navega para Recebimento e será removida.

## Estado

Requisitos definidos. Ainda não há versão instalável validada. O HTML real da tabela, da paginação, dos filtros e do diálogo de exclusão precisa ser conferido antes de validar os seletores.

## Validação prevista

Simular 10, 24, 50, 100 e 400 resultados; diferentes tamanhos de página; redistribuição de linhas após excluir; respostas lentas; falhas de exclusão; mudança da pesquisa; parada e reabertura; tentativa de execução simultânea; pedidos fora do conjunto inicial. Seletores ambíguos devem interromper o processo, nunca causar cliques por aproximação. Validar depois a compatibilidade com a tela real do SPX.

# DEL SPX — versão de teste 0.1.2

## Instalar no Chrome ou Edge

1. Extraia o ZIP em uma pasta permanente no computador.
2. Abra chrome://extensions (Chrome) ou edge://extensions (Edge).
3. Ative o Modo do desenvolvedor.
4. Clique em Carregar sem compactação e escolha a pasta DEL-SPX, onde está manifest.json.
5. Fixe a extensão DEL na barra do navegador.
6. Atualize a aba do SPX antes da primeira pesquisa.

## Usar

1. Abra Roteirizar → Pedidos para roteirizar no SPX.
2. Use Pesquisa em lote, cole os códigos BR e clique em Enviar. A extensão registra esses códigos sem abrir a caixa ou excluir pedidos.
3. Aguarde o resultado da pesquisa.
4. Clique no ícone DEL para abrir a caixa e depois em Iniciar exclusão.
5. Você pode mover a caixa arrastando o cabeçalho DEL / Excluir pesquisa.
6. A ferramenta começa a excluir na página atual, um pedido por vez, conferindo os BRs e a atualização da tabela. Continua até terminar os resultados da pesquisa, sem varrer todas as páginas antes de começar.

A pesquisa precisa ter sido enviada depois que a extensão passou a funcionar na aba. Se Iniciar estiver desabilitado, faça a pesquisa em lote novamente. Não é necessário manter a caixa aberta durante a pesquisa.

## Parar

- Clique em PARAR ou feche a caixa pelo ×. Ambos bloqueiam os próximos cliques e interrompem as esperas.
- A confirmação de exclusão já aberta pelo processo será cancelada se puder ser identificada.
- Uma exclusão já confirmada e enviada ao SPX pode terminar: a extensão não desfaz solicitações enviadas.
- Redefinir, iniciar outra pesquisa ou sair da tela interrompe e invalida a pesquisa registrada.
- Iniciar novamente só fica disponível após a execução anterior encerrar. O sistema não executa duas exclusões automáticas simultâneas.

## Conferência no SPX

Esta versão foi testada em simulação DOM; ainda precisa de validação na sessão real do SPX. Comece com uma pesquisa pequena de pedidos destinados à exclusão. Confira primeiro o botão PARAR, depois uma pesquisa com mais de 24 resultados. Se houver erro, a ferramenta interrompe; envie a mensagem exibida para ajuste. Não use o teste para excluir pedidos que precisam ser preservados.

## Atualizar

Extraia a nova versão, substitua os arquivos da pasta instalada e clique em Recarregar na página de extensões. Atualize a aba do SPX e refaça a pesquisa em lote. Faça isso em cada PC. Atualizar o GitHub não atualiza as instalações automaticamente.

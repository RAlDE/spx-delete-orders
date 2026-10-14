(() => {
  'use strict';
  if (globalThis.__spxDelInstalled) return;
  globalThis.__spxDelInstalled = true;
  const normalize = value => (value || '').replace(/\s+/g, ' ').trim();
  const visible = el => !!el && el.isConnected && el.getClientRects().length > 0 && getComputedStyle(el).visibility !== 'hidden';
  const allowedRoute = () => location.hostname === 'spx.shopee.com.br' && /^#\/lmRouteCollectionPool(?:[/?]|$)/i.test(location.hash);
  let scope = null, submittedAt = 0, run = null, host = null, ui = null;
  let message = 'Faça a pesquisa em lote no SPX. Depois clique em Iniciar.';
  function root() {
    const candidates = [...document.querySelectorAll('.ssc-pro-table.has-pagination')].filter(visible);
    const matches = candidates.filter(el => el.querySelector('.batch-search'));
    if (matches.length !== 1) throw Error('Não foi possível identificar a tabela de pedidos com segurança.');
    return matches[0];
  }
  function pager() {
    const list = [...root().querySelectorAll('.ssc-pagination.ssc-pro-table-pagination')].filter(visible);
    if (list.length !== 1) throw Error('Paginação não identificada.');
    return list[0];
  }
  function count() {
    const match = normalize(pager().querySelector('.total-container')?.textContent).match(/^Total\s+([\d.,]+)$/i);
    if (!match) throw Error('Total de resultados não identificado.');
    return Number(match[1].replace(/[.,]/g, ''));
  }
  function pageNumber() {
    const n = Number(normalize(pager().querySelector('.pager-item.active')?.textContent));
    if (!Number.isInteger(n) || n < 1) throw Error('Página atual não identificada.');
    return n;
  }
  function pageSize() {
    const value = normalize(pager().querySelector('.sizer .ssc-select-single-value')?.textContent);
    const n = Number(value.match(/^(24|40|50)\b/)?.[1]);
    if (!n) throw Error('Quantidade por página não identificada.');
    return n;
  }
  function rows() {
    return [...root().querySelectorAll('tr.ssc-table-row')].filter(visible).map(el => {
      const links = [...el.querySelectorAll('a.view-order')];
      const buttons = [...el.querySelectorAll('button.table-action-btn')].filter(b => normalize(b.textContent) === 'Excluir');
      const id = links.length === 1 ? links[0].getAttribute('href')?.match(/^#\/orderDetail\/([A-Z0-9]+)\?originUrl=\/lmRouteCollectionPool$/i)?.[1] : null;
      if (!id || buttons.length !== 1 || !normalize(el.textContent).includes(id)) throw Error('Pedido ou botão Excluir ambíguo.');
      return {id: id.toUpperCase(), el, button: buttons[0]};
    });
  }
  const disabled = el => !el || el.matches('[disabled], [aria-disabled="true"], .pager-step-disabled, .ssc-btn-disabled');
  const busy = () => [...root().querySelectorAll('.ssc-loading')].some(visible);
  const boxes = () => [...document.querySelectorAll('.ssc-message-box')].filter(visible);
  function deleteBox() {
    const list = boxes().filter(el => /Collection Pool/i.test(el.textContent) && /deletar|excluir/i.test(el.textContent));
    if (list.length > 1) throw Error('Mais de uma confirmação de exclusão aberta.');
    return list[0] || null;
  }
  function cancelOwned(current) {
    if (!current?.awaitingDialog || current.confirmed) return;
    const box = deleteBox();
    if (!box || current.existingBoxes.has(box)) return;
    const cancel = [...box.querySelectorAll('button.ssc-message-box-action-button')].find(b => /^cancelar$/i.test(normalize(b.textContent)));
    if (cancel && !disabled(cancel)) cancel.click();
  }
  function update() {
    if (!ui) return;
    ui.status.textContent = message;
    ui.start.disabled = !!run || !scope || !allowedRoute();
    ui.stop.disabled = !run;
    ui.scope.textContent = scope ? `${scope.size} código(s) enviados na pesquisa em lote.` : 'Nenhuma pesquisa em lote registrada.';
  }
  function stop(reason = 'Parado. Nenhuma nova exclusão será iniciada.') {
    if (run && !run.controller.signal.aborted) {
      run.controller.abort(new Error(reason));
      try { cancelOwned(run); } catch { /* Nunca confirmar em caso de ambiguidade. */ }
    }
    message = reason;
    update();
  }
  function invalidate(reason) { stop(reason); scope = null; update(); }
  function check(current) {
    if (current.controller.signal.aborted) throw current.controller.signal.reason;
    if (!allowedRoute() || scope !== current.scope) throw Error('A pesquisa ou a página mudou. Processo interrompido.');
  }
  function pause(current, ms) {
    check(current);
    return new Promise((resolve, reject) => {
      const signal = current.controller.signal;
      const abort = () => { clearTimeout(timer); reject(signal.reason); };
      const timer = setTimeout(() => { signal.removeEventListener('abort', abort); resolve(); }, ms);
      signal.addEventListener('abort', abort, {once: true});
    });
  }
  async function wait(current, predicate, failure, timeout = 15000) {
    const until = Date.now() + timeout;
    while (Date.now() < until) {
      check(current);
      const result = predicate();
      if (result) return result;
      await pause(current, 50);
    }
    throw Error(failure);
  }
  async function settled(current, condition = () => true) {
    let last = '', stableSince = 0;
    return wait(current, () => {
      if (busy() || !condition()) { stableSince = 0; return false; }
      const signature = JSON.stringify([pageNumber(), count(), pageSize(), rows().map(r => r.id)]);
      if (signature !== last || !stableSince) { last = signature; stableSince = Date.now(); return false; }
      return Date.now() - stableSince >= 250;
    }, 'O SPX não concluiu a atualização da tabela.');
  }
  function validateRows(current, list, remaining = null) {
    const ids = list.map(r => r.id);
    if (new Set(ids).size !== ids.length || ids.some(id => !current.scope.has(id) || (remaining && !remaining.has(id)))) {
      throw Error('A tabela contém pedidos fora da pesquisa ou já processados. Processo interrompido.');
    }
  }
  async function go(current, direction) {
    const before = pageNumber(), ids = rows().map(r => r.id).join('|');
    const btn = pager().querySelector(direction === 'next' ? '.pager-next' : '.pager-prev');
    if (disabled(btn)) return false;
    check(current); btn.click();
    const expected = before + (direction === 'next' ? 1 : -1);
    await settled(current, () => pageNumber() === expected && rows().map(r => r.id).join('|') !== ids);
    return true;
  }
  async function firstPage(current) {
    while (pageNumber() > 1) {
      if (!await go(current, 'prev')) throw Error('Não foi possível voltar à primeira página.');
    }
  }
  async function collect(current) {
    await pause(current, Math.max(0, 600 - (Date.now() - submittedAt)));
    await settled(current);
    if ([...document.querySelectorAll('.batch-search .ssc-dialog-wrapper')].some(visible)) throw Error('Aguarde o SPX concluir a pesquisa em lote.');
    await firstPage(current);
    const total = count(), size = pageSize(), ids = new Set();
    if (!total) throw Error('A pesquisa não retornou pedidos para excluir.');
    if (total > current.scope.size) throw Error('O total excede a lista pesquisada. Processo interrompido.');
    for (let n = 1; n <= Math.ceil(total / size); n++) {
      check(current);
      if (pageNumber() !== n || count() !== total || pageSize() !== size) throw Error('Resultados mudaram durante a conferência.');
      const list = rows(); validateRows(current, list);
      if (list.length !== Math.min(size, total - ids.size)) throw Error('A página não contém a quantidade esperada de pedidos.');
      for (const row of list) {
        if (ids.has(row.id)) throw Error('Pedido repetido entre as páginas.');
        ids.add(row.id);
      }
      message = `Conferindo pesquisa: ${ids.size} de ${total} pedidos. Nenhuma exclusão iniciada.`; update();
      if (n < Math.ceil(total / size) && !await go(current, 'next')) throw Error('Não foi possível conferir todas as páginas.');
    }
    if (ids.size !== total) throw Error('A lista completa não pôde ser conferida.');
    await firstPage(current);
    return ids;
  }
  async function erase(current, row, remaining) {
    check(current);
    if (boxes().length) throw Error('Feche a janela de confirmação existente antes de iniciar.');
    if (disabled(row.button)) throw Error(`Exclusão indisponível para ${row.id}.`);
    current.existingBoxes = new Set(boxes()); current.awaitingDialog = true; current.confirmed = false;
    check(current); row.button.click();
    const box = await wait(current, () => deleteBox(), 'A confirmação de exclusão não apareceu.');
    const confirm = [...box.querySelectorAll('button.ssc-message-box-action-button.ssc-btn-type-primary')];
    if (confirm.length !== 1 || disabled(confirm[0])) throw Error('Confirmação de exclusão ambígua ou indisponível.');
    check(current);
    validateRows(current, rows(), remaining);
    if (!rows().some(r => r.id === row.id) || !remaining.has(row.id)) throw Error('O pedido mudou antes da confirmação.');
    const before = count();
    current.confirmed = true;
    confirm[0].click();
    await settled(current, () => !visible(box) && count() === before - 1 && !rows().some(r => r.id === row.id));
    current.awaitingDialog = false;
    remaining.delete(row.id); current.deleted++;
  }
  async function start() {
    if (run || !scope) return;
    const current = {controller: new AbortController(), scope, deleted: 0, awaitingDialog: false, confirmed: false, existingBoxes: new Set()};
    run = current; update();
    try {
      const remaining = await collect(current), total = remaining.size;
      while (remaining.size) {
        check(current); await settled(current);
        if (count() !== remaining.size) throw Error('O total mudou fora do processo. Exclusão interrompida.');
        const list = rows(); validateRows(current, list, remaining);
        if (!list.length) {
          if (pageNumber() > 1) { await go(current, 'prev'); continue; }
          throw Error('Pedidos restantes não estão disponíveis na tabela.');
        }
        message = `Excluindo: ${current.deleted} de ${total}.`; update();
        await erase(current, list[0], remaining);
      }
      message = `Concluído: ${current.deleted} pedido(s) excluído(s).`; scope = null;
    } catch (error) {
      try { cancelOwned(current); } catch { /* Falha de identificação mantém tudo parado. */ }
      message = `${error.message} Exclusões verificadas: ${current.deleted}.`;
    } finally { if (run === current) run = null; update(); }
  }
  function toggle() {
    if (!allowedRoute()) return;
    if (host) { stop('Caixa fechada. Processo parado.'); host.remove(); host = null; ui = null; return; }
    host = document.createElement('div'); host.id = 'spx-del-panel';
    host.style.cssText = 'position:fixed;right:20px;top:100px;z-index:2147483647;';
    const shadow = host.attachShadow({mode: 'open'});
    shadow.innerHTML = `<style>:host{font-family:Arial,sans-serif}section{width:290px;padding:18px;background:#f5f6f9;color:#172b48;border:1px solid #ddd;border-radius:8px;box-shadow:0 8px 30px #0004}header{display:flex;align-items:center;gap:10px}b{background:#ee4d2d;color:white;padding:7px;border-radius:5px}h2{font-size:16px;margin:0;flex:1}button{cursor:pointer;font:600 14px Arial}#close{border:0;background:none;font-size:22px}p{font-size:12px;line-height:1.5;color:#5d6b7f}#start,#stop{width:100%;padding:12px;border-radius:6px;margin-top:8px}#start{background:#ee4d2d;color:white;border:0}#stop{background:#fff;color:#b72e16;border:2px solid #ee4d2d}button:disabled{opacity:.45;cursor:default}#status{font-size:13px;line-height:1.5;margin-top:14px;white-space:pre-wrap}</style><section><header><b>DEL</b><h2>Excluir pesquisa</h2><button id="close" aria-label="Fechar e parar">×</button></header><p>Exclui somente pedidos da pesquisa em lote, em todas as páginas.</p><p id="scope"></p><button id="start">Iniciar exclusão</button><button id="stop">PARAR</button><div id="status" role="status" aria-live="polite"></div><p>Parar bloqueia os próximos cliques. Uma exclusão já enviada ao SPX pode terminar.</p></section>`;
    document.documentElement.append(host);
    ui = Object.fromEntries(['start','stop','scope','status'].map(id => [id,shadow.getElementById(id)]));
    shadow.getElementById('close').onclick = toggle;
    ui.stop.onclick = () => stop(); ui.start.onclick = start; update();
  }
  // Monitoramento sem abrir a caixa e sem iniciar exclusões.
  document.addEventListener('click', event => {
    if (!allowedRoute()) return;
    const target = event.target instanceof Element ? event.target : null;
    const button = target?.closest('button');
    if (button?.matches('.batch-search button') && normalize(button.textContent) === 'Enviar') {
      invalidate('Nova pesquisa em lote registrada. Aguarde o resultado antes de iniciar.');
      const value = button.closest('.batch-search')?.querySelector('textarea')?.value || '';
      const ids = value.trim().split(/\s+/).filter(Boolean).map(id => id.toUpperCase());
      if (!ids.length || ids.length > 10000 || ids.some(id => !/^BR[A-Z0-9]+$/.test(id))) { message = 'Lista de códigos da pesquisa não reconhecida.'; update(); return; }
      scope = new Set(ids); submittedAt = Date.now(); update(); return;
    }
    if (target?.closest('.pro-filter .ssc-option') || button?.matches('.pro-filter-btn-cancel,.pro-filter-btn-confirm') || normalize(button?.textContent) === 'Pesquisa em lote') {
      invalidate('Pesquisa alterada ou redefinida. Processo interrompido. Faça a pesquisa em lote novamente.'); return;
    }
    if (run && event.isTrusted && target?.closest('.ssc-pagination')) stop('Paginação alterada manualmente. Processo interrompido.');
  }, true);
  document.addEventListener('input', event => {
    if (event.target instanceof Element && event.target.closest('.pro-filter')) invalidate('Filtro alterado. Faça a pesquisa em lote novamente.');
  }, true);
  document.addEventListener('change', event => {
    if (event.target instanceof Element && event.target.closest('.pro-filter')) invalidate('Filtro alterado. Faça a pesquisa em lote novamente.');
  }, true);
  window.addEventListener('hashchange', () => {
    invalidate('Página alterada. Processo interrompido.');
    host?.remove(); host = null; ui = null;
  });
  chrome.runtime.onMessage.addListener(msg => { if (msg.type === 'DEL_TOGGLE') toggle(); });
})();

chrome.action.onClicked.addListener(async (tab) => {
  if (!tab.id || !/^https:\/\/spx\.shopee\.com\.br\/.*#\/lmRouteCollectionPool(?:[/?]|$)/i.test(tab.url || '')) {
    await chrome.action.setBadgeText({tabId: tab.id, text: '!'});
    await chrome.action.setTitle({tabId: tab.id, title: 'Abra Roteirizar → Pedidos para roteirizar no SPX.'});
    return;
  }
  try {
    // Também funciona na aba que já estava aberta durante a instalação.
    await chrome.scripting.executeScript({target: {tabId: tab.id}, files: ['content.js']});
    await chrome.tabs.sendMessage(tab.id, {type: 'DEL_TOGGLE'});
    await chrome.action.setBadgeText({tabId: tab.id, text: ''});
  } catch (error) {
    await chrome.action.setBadgeText({tabId: tab.id, text: '!'});
    await chrome.action.setTitle({tabId: tab.id, title: `DEL: ${error.message}`});
  }
});

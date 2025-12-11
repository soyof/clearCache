/**
 * 分析数据清理模块
 */

/**
 * 清除指定域名的所有存储数据
 * @param {string} domain - 域名
 */
export async function clearDomain(domain) {
  const origins = [`https://${domain}`, `http://${domain}`];
  try {
    // 清除 cookies
    const cookies = await chrome.cookies.getAll({ domain });
    await Promise.all(
      cookies.map((c) =>
        chrome.cookies.remove({
          url: `${c.secure ? 'https' : 'http'}://${c.domain.replace(/^\./, '')}${c.path}`,
          name: c.name,
          storeId: c.storeId,
        }).catch(() => null)
      )
    );

    // 清除存储 (localStorage / IndexedDB / Cache)
    await chrome.browsingData.remove(
      { origins },
      {
        cache: true,
        cacheStorage: true,
        indexedDB: true,
        localStorage: true,
      }
    );

    // 尝试清理 sessionStorage / Cache API in-page（仅对已打开的同域 tab）
    const tabs = await chrome.tabs.query({ url: [`*://${domain}/*`] });
    await Promise.all(
      tabs.map((tab) =>
        chrome.scripting
          .executeScript({
            target: { tabId: tab.id },
            func: async () => {
              try {
                sessionStorage.clear();
              } catch (_) { }
              try {
                const names = await caches.keys();
                await Promise.all(names.map((n) => caches.delete(n)));
              } catch (_) { }
            },
          })
          .catch(() => null)
      )
    );
  } catch (error) {
    console.warn('clearDomain failed', domain, error);
  }
}

/**
 * 清除所有域名的存储数据
 * @param {Array} domains - 域名列表
 */
export async function clearAll(domains) {
  for (const d of domains) {
    await clearDomain(d.domain);
  }
}


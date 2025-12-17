/**
 * 后台服务工作器
 * 处理插件的后台任务，如右键菜单、通知等
 * 作为Chrome扩展的Service Worker入口点
 */

// 国际化工具函数
function getMessage(key, substitutions = null) {
  try {
    if (chrome && chrome.i18n && chrome.i18n.getMessage) {
      return chrome.i18n.getMessage(key, substitutions) || key;
    }
    return key;
  } catch (error) {
    return key;
  }
}

// 图标URL
const iconUrl = chrome.runtime.getURL('icons/icon128.png');

// 清理时间范围
const TIME_RANGE_PRESETS = {
  hour: 60 * 60 * 1000,
  day: 24 * 60 * 60 * 1000,
  week: 7 * 24 * 60 * 60 * 1000,
  month: 28 * 24 * 60 * 60 * 1000,
  all: null
};

function normalizeRangeKey(rangeKey) {
  return Object.prototype.hasOwnProperty.call(TIME_RANGE_PRESETS, rangeKey) ? rangeKey : 'all';
}

function calculateSince(rangeKey = 'all') {
  const key = normalizeRangeKey(rangeKey);
  const duration = TIME_RANGE_PRESETS[key];
  if (!duration) return 0;
  const since = Date.now() - duration;
  return since > 0 ? since : 0;
}

async function getCleanupSince(rangeKey) {
  if (rangeKey) return calculateSince(rangeKey);
  try {
    const { timeRange } = await chrome.storage.local.get(['timeRange']);
    return calculateSince(timeRange);
  } catch (error) {
    return calculateSince('all');
  }
}

// 确保Service Worker正常注册
self.addEventListener('install', (event) => {
  // Service Worker 安装
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // Service Worker 激活
  event.waitUntil(clients.claim());

  // 创建右键菜单
  createContextMenus();
});

// 检查是否为受限制的页面
function isRestrictedPage(url) {
  if (!url) return true;
  
  const restrictedProtocols = [
    'chrome://',
    'chrome-extension://',
    'edge://',
    'about:',
    'view-source:',
    'data:',
    'javascript:'
  ];
  
  return restrictedProtocols.some(protocol => url.startsWith(protocol));
}

// 从URL提取域名
function extractDomain(url) {
  if (!url) return '';
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch (e) {
    const match = url.match(/^(?:https?:\/\/)?([^\/]+)/);
    return match ? match[1] : '';
  }
}

// 检查域名是否匹配规则
function matchesDomain(domain, list) {
  if (!domain || !list || list.length === 0) return false;
  const normalizedDomain = domain.toLowerCase().trim();
  return list.some(rule => {
    const normalizedRule = rule.toLowerCase().trim();
    if (!normalizedRule) return false;
    if (normalizedRule === normalizedDomain) return true;
    if (normalizedRule.startsWith('*.')) {
      const suffix = normalizedRule.slice(2);
      return normalizedDomain === suffix || normalizedDomain.endsWith('.' + suffix);
    }
    if (normalizedDomain.endsWith('.' + normalizedRule)) return true;
    return false;
  });
}

// 检查域名是否被允许（异步）
async function isDomainAllowed(url, operation = 'cleanup') {
  try {
    const result = await chrome.storage.local.get([
      'domainWhitelist',
      'domainBlacklist',
      'domainFilterMode'
    ]);
    
    const mode = result.domainFilterMode || 'disabled';
    if (mode === 'disabled') return true;
    
    const domain = extractDomain(url);
    if (!domain) return true;
    
    if (mode === 'whitelist') {
      const whitelist = result.domainWhitelist || [];
      return matchesDomain(domain, whitelist);
    } else if (mode === 'blacklist') {
      const blacklist = result.domainBlacklist || [];
      return !matchesDomain(domain, blacklist);
    }
    
    return true;
  } catch (error) {
    console.warn('检查域名过滤失败:', error);
    return true; // 出错时默认允许
  }
}

// 创建右键菜单（基础菜单，始终显示）
function createContextMenus() {
  // 清除现有菜单
  chrome.contextMenus.removeAll(() => {
    // 定义允许显示右键菜单的页面URL模式（排除扩展程序自己的页面）
    const allowedUrlPatterns = ['http://*/*', 'https://*/*', 'file:///*'];
    
    // 主菜单 - 只在普通网页中显示，不在扩展程序页面显示
    chrome.contextMenus.create({
      id: 'clearCache',
      title: getMessage('contextMenuTitle'),
      contexts: ['all'],
      documentUrlPatterns: allowedUrlPatterns
    });

    // 刷新相关子菜单 - 在普通网页中显示
    chrome.contextMenus.create({
      id: 'normalReload',
      parentId: 'clearCache',
      title: getMessage('normalReload'),
      contexts: ['all'],
      documentUrlPatterns: allowedUrlPatterns
    });

    chrome.contextMenus.create({
      id: 'hardReloadOnly',
      parentId: 'clearCache',
      title: getMessage('hardReload'),
      contexts: ['all'],
      documentUrlPatterns: allowedUrlPatterns
    });

    chrome.contextMenus.create({
      id: 'hardReloadCacheOnly',
      parentId: 'clearCache',
      title: getMessage('clearCacheAndHardReload'),
      contexts: ['all'],
      documentUrlPatterns: allowedUrlPatterns
    });

    // 分隔线 - 只在普通页面显示
    chrome.contextMenus.create({
      id: 'separator1',
      parentId: 'clearCache',
      type: 'separator',
      contexts: ['all'],
      documentUrlPatterns: allowedUrlPatterns
    });

    // 清理相关子菜单 - 只在普通页面显示
    chrome.contextMenus.create({
      id: 'clearCurrentWebsiteCache',
      parentId: 'clearCache',
      title: getMessage('clearCache'),
      contexts: ['all'],
      documentUrlPatterns: allowedUrlPatterns
    });

    chrome.contextMenus.create({
      id: 'clearCookies',
      parentId: 'clearCache',
      title: getMessage('cookies'),
      contexts: ['all'],
      documentUrlPatterns: allowedUrlPatterns
    });

    chrome.contextMenus.create({
      id: 'clearLocalStorage',
      parentId: 'clearCache',
      title: getMessage('localStorage'),
      contexts: ['all'],
      documentUrlPatterns: allowedUrlPatterns
    });

    chrome.contextMenus.create({
      id: 'clearSessionStorage',
      parentId: 'clearCache',
      title: getMessage('sessionStorage'),
      contexts: ['all'],
      documentUrlPatterns: allowedUrlPatterns
    });

    chrome.contextMenus.create({
      id: 'hardReload',
      parentId: 'clearCache',
      title: getMessage('clearAllAndReload'),
      contexts: ['all'],
      documentUrlPatterns: allowedUrlPatterns
    });

    // 右键菜单创建成功
  });
}

// 处理右键菜单点击
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  // 处理右键菜单点击

  try {
    // 对于清理操作，检查是否为受限制的页面
    const isRestricted = isRestrictedPage(tab.url);
    const cleaningOperations = ['clearCurrentWebsiteCache', 'clearCookies', 'clearLocalStorage', 'clearSessionStorage', 'hardReload'];
    
    if (isRestricted && cleaningOperations.includes(info.menuItemId)) {
      showNotification('此页面受浏览器保护，无法执行清理操作', 'error');
      return;
    }

    // 检查域名过滤（仅对清理操作）
    if (cleaningOperations.includes(info.menuItemId)) {
      const isAllowed = await isDomainAllowed(tab.url, 'contextMenu');
      if (!isAllowed) {
        showNotification(getMessage('domainBlocked') || '该域名已被过滤，无法执行清理操作', 'warning');
        return;
      }
    }

    switch (info.menuItemId) {
      case 'normalReload':
        // 正常重新加载
        // 执行正常重新加载
        chrome.tabs.reload(tab.id);
        showNotification(getMessage('pageReloading'));
        break;

      case 'hardReloadOnly':
        // 硬性重新加载
        // 执行硬性重新加载
        chrome.tabs.reload(tab.id, { bypassCache: true });
        showNotification(getMessage('pageHardReloading'));
        break;

      case 'hardReloadCacheOnly':
        // 清空缓存并硬性重新加载
        // 🚀 优化：先重载页面（立即响应），后清理缓存（异步进行）
        // 这样可以避免在 macOS 等系统上因缓存清理导致的延迟
        {
          const since = await getCleanupSince();
        
          // 立即重载页面，提供即时反馈
          chrome.tabs.reload(tab.id, { bypassCache: true }); // bypassCache: true - 确保即使缓存还在，也会从服务器获取最新内容
          showNotification(getMessage('cacheAndPageReloading'));
          
          // 异步清理缓存，不阻塞页面重载
          setTimeout(() => {
            chrome.browsingData.removeCache({
              since,
              origins: [tab.url]
            }).catch(error => {
              // 缓存清理失败（静默处理，因为页面已经重载）
              console.warn('Cache cleanup failed:', error);
            });
          }, 0);
        }
        break;

      case 'clearCurrentWebsiteCache':
        // 清空当前网站缓存
        // 执行清空当前网站缓存
        clearCurrentWebsiteCache(tab);
        break;

      case 'clearCookies': {
        // 清空Cookies
        // 执行清空Cookies
        const cookiesSince = await getCleanupSince();
        chrome.browsingData.removeCookies({
          since: cookiesSince,
          origins: [tab.url]
        }).then(() => {
          showNotification(getMessage('cookiesCleared'));
        }).catch(error => {
          // 清理Cookies失败
          showNotification(getMessage('cleaningFailed') + ': ' + error.message, 'error');
        });
        break;
      }

      case 'clearLocalStorage':
        // 清空LocalStorage
        // 执行清空LocalStorage
        clearLocalStorage(tab);
        break;

      case 'clearSessionStorage':
        // 清空SessionStorage
        // 执行清空SessionStorage
        clearSessionStorage(tab);
        break;

      case 'hardReload':
        // 全部清空重载
        // 执行全部清空重载
        clearAllAndReload(tab);
        break;

      default:
        // 未知的菜单项
        showNotification(getMessage('unknownOperation') + ': ' + info.menuItemId);
    }
  } catch (error) {
    // 处理右键菜单点击失败
    showNotification(getMessage('operationFailed') + ': ' + error.message, 'error');
  }
});

// 清空当前网站缓存
function clearCurrentWebsiteCache(tab) {
  // 清理缓存
  getCleanupSince().then((since) => {
    return chrome.browsingData.removeCache({
      since,
      origins: [tab.url]
    }).then(() => {
      // 清理Cookies
      return chrome.browsingData.removeCookies({
        since,
        origins: [tab.url]
      });
    }).then(() => {
      // 清理IndexedDB
      return chrome.browsingData.removeIndexedDB({
        since,
        origins: [tab.url]
      });
    }).then(() => {
      // 清理LocalStorage
      return clearLocalStorage(tab, false);
    }).then(() => {
      // 清理SessionStorage
      return clearSessionStorage(tab, false);
    }).then(() => {
      // 显示成功通知
      showNotification(getMessage('currentSiteCacheCleared'));
    });
  }).catch(error => {
    // 清理当前网站缓存失败
    showNotification(getMessage('cleaningFailed') + ': ' + error.message, 'error');
  });
}

// 清理LocalStorage
function clearLocalStorage(tab, showNotif = true) {
  // 检查是否为受限制的页面
  if (isRestrictedPage(tab.url)) {
    if (showNotif) {
      showNotification('此页面受浏览器保护，无法清理LocalStorage', 'error');
    }
    return Promise.reject(new Error('受限制的页面'));
  }

  return chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: () => {
      try {
        if (typeof localStorage === 'undefined') {
          return { success: false, error: 'LocalStorage不可用' };
        }

        const itemCount = localStorage.length;
        localStorage.clear();
        return { success: true, count: itemCount };
      } catch (error) {
        return { success: false, error: error.message };
      }
    }
  }).then(result => {
    // LocalStorage清理完成

    if (showNotif) {
      showNotification(getMessage('localStorageCleared'));
    }
    return result;
  }).catch(error => {
    // 清理LocalStorage失败
    if (showNotif) {
      const errorMsg = error.message.includes('Cannot access') 
        ? '无法访问此页面，可能是受保护的页面'
        : error.message;
      showNotification(getMessage('localStorageClearFailed') + ': ' + errorMsg, 'error');
    }
    throw error;
  });
}

// 清理SessionStorage
function clearSessionStorage(tab, showNotif = true) {
  // 检查是否为受限制的页面
  if (isRestrictedPage(tab.url)) {
    if (showNotif) {
      showNotification('此页面受浏览器保护，无法清理SessionStorage', 'error');
    }
    return Promise.reject(new Error('受限制的页面'));
  }

  return chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: () => {
      try {
        if (typeof sessionStorage === 'undefined') {
          return { success: false, error: 'SessionStorage不可用' };
        }

        const itemCount = sessionStorage.length;
        sessionStorage.clear();
        return { success: true, count: itemCount };
      } catch (error) {
        return { success: false, error: error.message };
      }
    }
  }).then(result => {
    // SessionStorage清理完成

    if (showNotif) {
      showNotification(getMessage('sessionStorageCleared'));
    }
    return result;
  }).catch(error => {
    // 清理SessionStorage失败
    if (showNotif) {
      const errorMsg = error.message.includes('Cannot access') 
        ? '无法访问此页面，可能是受保护的页面'
        : error.message;
      showNotification(getMessage('sessionStorageClearFailed') + ': ' + errorMsg, 'error');
    }
    throw error;
  });
}

// 清空所有数据并重新加载
function clearAllAndReload(tab) {
  // 定义清理选项
  getCleanupSince().then((since) => {
    const apiOptions = {
      since,
      origins: [tab.url]
    };

    // 清理所有数据
    return Promise.all([
      // 清理缓存
      chrome.browsingData.removeCache(apiOptions),
      // 清理Cookies
      chrome.browsingData.removeCookies(apiOptions),
      // 清理IndexedDB
      chrome.browsingData.removeIndexedDB(apiOptions)
    ]).then(() => {
      // 清理LocalStorage
      return clearLocalStorage(tab, false);
    }).then(() => {
      // 清理SessionStorage
      return clearSessionStorage(tab, false);
    }).then(() => {
      // 重新加载页面
      return chrome.tabs.reload(tab.id, { bypassCache: true });
    }).then(() => {
      // 显示成功通知
      showNotification(getMessage('allDataAndPageReloading'));
    });
  }).catch(error => {
    // 全部清空重载失败
    showNotification(getMessage('cleaningFailed') + ': ' + error.message, 'error');
  });
}

// 显示通知
async function showNotification(message, type = 'basic') {
  try {
    // 获取用户通知设置
    const settings = await chrome.storage.local.get(['enableNotifications', 'notificationSound']);

    // 如果用户禁用了通知，则不显示
    if (settings.enableNotifications === false) {
      // 通知已禁用，不显示
      return;
    }

    // 创建通知
    chrome.notifications.create({
      type: type,
      iconUrl: iconUrl,
      title: getMessage('contextMenuTitle'),
      message: message,
      priority: 1,
      silent: !settings.notificationSound // 根据用户设置决定是否静音
    });

    // 显示通知
  } catch (error) {
    // 显示通知失败
    // 出错时尝试使用默认设置显示通知
    try {
      chrome.notifications.create({
        type: type,
        iconUrl: iconUrl,
        title: getMessage('contextMenuTitle'),
        message: message,
        priority: 1
      });
    } catch (e) {
      // 使用默认设置显示通知也失败
    }
  }
}

// 处理来自弹窗和内容脚本的消息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // 处理消息

  switch (message.action) {
    case 'ping':
      // 简单的ping测试
      sendResponse({
        success: true,
        message: 'pong',
        timestamp: Date.now()
      });
      break;

    case 'checkServiceWorkerStatus':
      // 检查Service Worker状态
      sendResponse({
        success: true,
        message: 'Service Worker 已注册并正常运行'
      });
      break;

    case 'keepAlive':
      // 保活请求
      sendResponse({
        success: true,
        message: '保活机制已启动'
      });
      break;

    case 'createContextMenus':
      // 创建右键菜单
      createContextMenus();
      sendResponse({
        success: true,
        message: '右键菜单已创建'
      });
      break;

    default:
      sendResponse({
        success: false,
        message: '未知操作'
      });
  }

  return true; // 保持消息通道开放
});

// 立即创建右键菜单
createContextMenus();

// 服务工作器已加载完成

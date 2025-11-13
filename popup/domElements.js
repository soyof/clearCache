/**
 * DOM 元素管理模块
 * 统一管理所有 DOM 元素引用
 */

/**
 * 获取所有 DOM 元素
 * @returns {Object} DOM 元素对象
 */
export function getDOMElements() {
  return {
    currentUrl: document.getElementById('current-url'),
    status: document.getElementById('status'),
    statusContainer: document.querySelector('.status-container'),
    progress: document.getElementById('progress'),
    progressFill: document.querySelector('.progress-fill'),

    // 针对当前网站的按钮
    normalReload: document.getElementById('normal-reload'),
    hardReloadOnly: document.getElementById('hard-reload-only'),
    clearCurrentAll: document.getElementById('clear-current-all'),
    hardReloadCacheOnly: document.getElementById('hard-reload-cache-only'),
    hardReload: document.getElementById('hard-reload'),
    clearCurrentCookies: document.getElementById('clear-current-cookies'),
    clearLocalStorage: document.getElementById('clear-localstorage'),
    clearSessionStorage: document.getElementById('clear-sessionstorage'),
    clearCurrentIndexedDB: document.getElementById('clear-current-indexeddb'),

    // 针对整个浏览器的按钮
    clearAll: document.getElementById('clear-all'),
    clearCache: document.getElementById('clear-cache'),
    clearCookies: document.getElementById('clear-cookies'),
    clearIndexedDB: document.getElementById('clear-indexeddb'),
    clearHistory: document.getElementById('clear-history'),
    clearDownloads: document.getElementById('clear-downloads'),
    clearDownloadsFiles: document.getElementById('clear-downloads-files'),

    // 复选框
    clearPasswords: document.getElementById('clear-passwords'),
    clearFormData: document.getElementById('clear-formdata'),
    includeProtected: document.getElementById('include-protected'),

    // 高级设置元素
    themeRadios: document.querySelectorAll('input[name="theme"]'),
    enableNotifications: document.getElementById('enable-notifications'),
    notificationSound: document.getElementById('notification-sound'),
    languageSelect: document.getElementById('language-select'),

    // 存储使用情况元素
    storageUsageContent: document.getElementById('storage-usage-content'),
    refreshStorageBtn: document.getElementById('refresh-storage'),
  };
}


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
    openAnalysis: document.getElementById('open-analysis'),

    // 复选框
    clearPasswords: document.getElementById('clear-passwords'),
    clearFormData: document.getElementById('clear-formdata'),
    includeProtected: document.getElementById('include-protected'),
    confirmDangerous: document.getElementById('confirm-dangerous'),
    silentMode: document.getElementById('silent-mode'),

    // 高级设置元素
    enableNotifications: document.getElementById('enable-notifications'),
    notificationSound: document.getElementById('notification-sound'),
    languageBtn: document.getElementById('language-btn'),
    languageMenu: document.getElementById('language-menu'),
    languageMenuItems: document.querySelectorAll('.language-menu-item'),
    themeBtn: document.getElementById('theme-btn'),
    themeMenu: document.getElementById('theme-menu'),
    themeMenuItems: document.querySelectorAll('.theme-menu-item'),

    // 存储使用情况元素
    storageUsageContent: document.getElementById('storage-usage-content'),
    refreshStorageBtn: document.getElementById('refresh-storage'),

    // 危险操作确认弹窗
    dangerConfirm: document.getElementById('danger-confirm'),
    dangerConfirmOk: document.getElementById('danger-ok'),
    dangerConfirmCancel: document.getElementById('danger-cancel'),
    dangerConfirmMessage: document.querySelector('.danger-confirm-message'),
  };
}


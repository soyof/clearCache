/**
 * 弹窗脚本主入口
 * 协调各个模块，处理弹窗界面的交互和功能
 */

// 导入工具模块
import {
    getMessage
} from './utils/index.js';

// 导入 popup 模块
import { initRequestIdleCallbackPolyfill } from './popup/polyfills.js';
import { getDOMElements } from './popup/domElements.js';
import { initialize } from './popup/initialization.js';
import { bindEventListeners } from './popup/eventHandlers.js';
import {
    clearCurrentWebsiteData,
    clearAllData,
    clearCache,
    clearCookies,
    clearLocalStorage,
    clearSessionStorage,
    clearCurrentIndexedDB,
    clearIndexedDB,
    clearHistory,
    clearDownloads,
    clearDownloadFiles
} from './popup/cleanupHandlers.js';
import {
    normalReload,
    hardReloadOnly,
    hardReloadCacheOnly,
    hardReloadPage
} from './popup/reloadHandlers.js';
import {
    handleThemeChange,
    saveAdvancedSettings
} from './popup/settingsHandlers.js';
import { adjustTabTextSize } from './popup/uiHelpers.js';

// 初始化 polyfill
initRequestIdleCallbackPolyfill();

// 立即加载版本信息（在模块加载时立即执行，不等待DOMContentLoaded）
(function loadVersionInfoSync() {
    try {
        const manifest = chrome.runtime.getManifest();
        // 使用 requestAnimationFrame 确保 DOM 已准备好
        requestAnimationFrame(() => {
            const versionElement = document.querySelector('.version');
            if (versionElement && manifest && manifest.version) {
                versionElement.textContent = 'v' + manifest.version;
            }
        });
    } catch (e) {
        // 静默失败，稍后在 DOMContentLoaded 时重试
        console.warn('加载版本信息失败:', e);
    }
})();

// 获取 DOM 元素
const elements = getDOMElements();

/**
 * 初始化
 */
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // 立即绑定事件监听器，避免等待异步操作
        bindEventListeners(elements, {
            // 清理操作
            clearCurrentWebsiteData: () => clearCurrentWebsiteData(elements),
            clearAllData: () => clearAllData(elements),
            clearCache: () => clearCache(elements),
            clearCookies: () => clearCookies(elements),
            clearLocalStorage: () => clearLocalStorage(elements),
            clearSessionStorage: () => clearSessionStorage(elements),
            clearCurrentIndexedDB: () => clearCurrentIndexedDB(elements),
            clearIndexedDB: () => clearIndexedDB(elements),
            clearHistory: () => clearHistory(elements),
            clearDownloads: () => clearDownloads(elements),
            clearDownloadFiles: () => clearDownloadFiles(elements),

            // 重载操作
            normalReload: () => normalReload(elements),
            hardReloadOnly: () => hardReloadOnly(elements),
            hardReloadCacheOnly: () => hardReloadCacheOnly(elements),
            hardReloadPage: () => hardReloadPage(elements),

            // 设置操作
            handleThemeChange,
            saveAdvancedSettings
        });

        // 执行初始化
        await initialize(elements);

        // 延迟执行不影响界面显示的操作
        requestIdleCallback(() => {
            adjustTabTextSize();
        }, { timeout: 500 });

    } catch (error) {
        console.error('初始化过程出错:', error);
        // 即使出错也要确保基本功能可用
        if (elements.currentUrl && elements.currentUrl.textContent === '加载中...') {
            elements.currentUrl.textContent = getMessage('unknownSite') || '未知网站';
        }
    }
});

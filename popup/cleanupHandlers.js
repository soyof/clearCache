/**
 * 清理操作处理模块
 * 处理各种数据清理操作
 */

import {
    BrowsingDataManager,
    ButtonManager,
    CleanerManager,
    SettingsManager,
    StatusManager,
    getMessage
} from '../utils/index.js';
import { getCurrentTab } from './state.js';

/**
 * 执行清理操作
 * @param {Function} cleanupFunction - 清理函数
 * @param {HTMLElement} button - 按钮元素
 * @param {string} successMessage - 成功消息
 * @param {string} errorMessage - 错误消息
 * @param {HTMLElement} statusElement - 状态元素
 * @param {HTMLElement} statusContainer - 状态容器元素
 * @param {boolean} waitForCompletion - 是否等待操作完成（默认true）
 */
export async function executeCleanup(
    cleanupFunction,
    button,
    successMessage,
    errorMessage,
    statusElement,
    statusContainer,
    waitForCompletion = true
) {
    try {
        // 立即设置按钮为加载状态，提供即时反馈
        ButtonManager.setLoading(button);

        if (waitForCompletion) {
            // 需要等待操作完成的情况（如清理缓存等需要确认完成的操作）
            await cleanupFunction();

            // 设置按钮为成功状态
            ButtonManager.setSuccess(button);

            // 显示成功消息
            StatusManager.show(statusElement, statusContainer, successMessage, 'success');
        } else {
            // 不需要等待操作完成的情况（如页面重载，立即给用户反馈）
            // 立即显示成功消息
            StatusManager.show(statusElement, statusContainer, successMessage, 'success');

            // 立即设置按钮为成功状态
            ButtonManager.setSuccess(button);

            // 异步执行清理操作，不阻塞UI
            cleanupFunction().catch(error => {
                console.error('操作执行失败:', error);
            });
        }
    } catch (error) {
        // 设置按钮为错误状态
        ButtonManager.setError(button);

        // 显示错误消息
        StatusManager.show(statusElement, statusContainer, errorMessage + ': ' + error.message, 'error');
    }
}

/**
 * 清空当前网站所有数据
 * @param {Object} elements - DOM元素对象
 */
export async function clearCurrentWebsiteData(elements) {
    await executeCleanup(
        async () => {
            const currentTab = getCurrentTab();
            if (!currentTab) throw new Error(getMessage('cannotGetCurrentTab'));
            await CleanerManager.clearCurrentWebsiteData(currentTab);
        },
        elements.clearCurrentAll,
        getMessage('currentSiteCacheCleared'),
        getMessage('currentSiteCacheClearFailed'),
        elements.status,
        elements.statusContainer
    );
}

/**
 * 清空所有数据
 * @param {Object} elements - DOM元素对象
 */
export async function clearAllData(elements) {
    await executeCleanup(
        async () => {
            const currentTab = getCurrentTab();
            if (!currentTab) throw new Error(getMessage('cannotGetCurrentTab'));

            // 获取清理选项设置
            const settings = await SettingsManager.get([
                'clearPasswords',
                'clearFormData',
                'includeProtected'
            ]);

            await CleanerManager.clearAllData(currentTab, settings);
        },
        elements.clearAll,
        getMessage('allCacheCleared'),
        getMessage('allCacheClearFailed'),
        elements.status,
        elements.statusContainer
    );
}

/**
 * 清空缓存
 * @param {Object} elements - DOM元素对象
 */
export async function clearCache(elements) {
    await executeCleanup(
        async () => {
            await BrowsingDataManager.clearCache({ since: 0 });
        },
        elements.clearCache,
        getMessage('cacheCleared'),
        getMessage('cacheClearFailed'),
        elements.status,
        elements.statusContainer
    );
}

/**
 * 清空 Cookies
 * @param {Object} elements - DOM元素对象
 */
export async function clearCookies(elements) {
    await executeCleanup(
        async () => {
            const currentTab = getCurrentTab();
            if (!currentTab) throw new Error(getMessage('cannotGetCurrentTab'));
            await CleanerManager.clearCookiesData(currentTab);
        },
        elements.clearCurrentCookies,
        getMessage('cookiesCleared'),
        getMessage('cookiesClearFailed'),
        elements.status,
        elements.statusContainer
    );
}

/**
 * 清空 LocalStorage
 * @param {Object} elements - DOM元素对象
 */
export async function clearLocalStorage(elements) {
    await executeCleanup(
        async () => {
            const currentTab = getCurrentTab();
            if (!currentTab) throw new Error(getMessage('cannotGetCurrentTab'));
            await CleanerManager.clearLocalStorageData(currentTab);
        },
        elements.clearLocalStorage,
        getMessage('localStorageCleared'),
        getMessage('localStorageClearFailed'),
        elements.status,
        elements.statusContainer
    );
}

/**
 * 清空 SessionStorage
 * @param {Object} elements - DOM元素对象
 */
export async function clearSessionStorage(elements) {
    await executeCleanup(
        async () => {
            const currentTab = getCurrentTab();
            if (!currentTab) throw new Error(getMessage('cannotGetCurrentTab'));
            await CleanerManager.clearSessionStorageData(currentTab);
        },
        elements.clearSessionStorage,
        getMessage('sessionStorageCleared'),
        getMessage('sessionStorageClearFailed'),
        elements.status,
        elements.statusContainer
    );
}

/**
 * 清空 IndexedDB
 * @param {Object} elements - DOM元素对象
 */
export async function clearCurrentIndexedDB(elements) {
    await executeCleanup(
        async () => {
            const currentTab = getCurrentTab();
            if (!currentTab) throw new Error(getMessage('cannotGetCurrentTab'));
            await CleanerManager.clearIndexedDBData(currentTab);
        },
        elements.clearCurrentIndexedDB,
        getMessage('indexedDBCleared'),
        getMessage('indexedDBClearFailed'),
        elements.status,
        elements.statusContainer
    );
}

/**
 * 清空所有 IndexedDB
 * @param {Object} elements - DOM元素对象
 */
export async function clearIndexedDB(elements) {
    await executeCleanup(
        async () => {
            await BrowsingDataManager.clearIndexedDB({ since: 0 });
        },
        elements.clearIndexedDB,
        getMessage('allIndexedDBCleared'),
        getMessage('indexedDBClearFailed'),
        elements.status,
        elements.statusContainer
    );
}

/**
 * 清空历史记录
 * @param {Object} elements - DOM元素对象
 */
export async function clearHistory(elements) {
    await executeCleanup(
        async () => {
            await CleanerManager.clearHistoryData();
        },
        elements.clearHistory,
        getMessage('historyCleared'),
        getMessage('historyClearFailed'),
        elements.status,
        elements.statusContainer
    );
}

/**
 * 清空下载记录
 * @param {Object} elements - DOM元素对象
 */
export async function clearDownloads(elements) {
    await executeCleanup(
        async () => {
            await CleanerManager.clearDownloadsData();
        },
        elements.clearDownloads,
        getMessage('downloadsCleared'),
        getMessage('downloadsClearFailed'),
        elements.status,
        elements.statusContainer
    );
}

/**
 * 清空下载文件
 * @param {Object} elements - DOM元素对象
 */
export async function clearDownloadFiles(elements) {
    await executeCleanup(
        async () => {
            await CleanerManager.clearDownloadFiles();
        },
        elements.clearDownloadsFiles,
        getMessage('downloadFilesCleared'),
        getMessage('downloadFilesClearFailed'),
        elements.status,
        elements.statusContainer
    );
}


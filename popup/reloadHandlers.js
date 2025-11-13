/**
 * 重载操作处理模块
 * 处理页面重载相关操作
 */

import { ButtonManager, CleanerManager, StatusManager, getMessage } from '../utils/index.js';
import { getCurrentTab } from './state.js';

/**
 * 正常重新加载
 * @param {Object} elements - DOM元素对象
 */
export async function normalReload(elements) {
    try {
        const currentTab = getCurrentTab();
        // 立即检查tab
        if (!currentTab || !currentTab.id) {
            StatusManager.show(elements.status, elements.statusContainer, getMessage('cannotGetCurrentTab'), 'error');
            return;
        }

        // 立即更新UI
        ButtonManager.setSuccess(elements.normalReload);
        StatusManager.show(elements.status, elements.statusContainer, getMessage('pageReloading'), 'success');

        // 强制浏览器立即应用所有样式变化（通过读取布局属性触发重排）
        // 这比requestAnimationFrame更可靠，因为popup关闭前确保UI已更新
        if (elements.normalReload) {
            elements.normalReload.offsetHeight;
        }
        if (elements.statusContainer) {
            elements.statusContainer.offsetHeight;
        }

        // 立即执行重载
        chrome.tabs.reload(currentTab.id);
    } catch (error) {
        ButtonManager.setError(elements.normalReload);
        StatusManager.show(elements.status, elements.statusContainer, getMessage('reloadFailed') + ': ' + error.message, 'error');
    }
}

/**
 * 硬性重新加载（绕过缓存）
 * @param {Object} elements - DOM元素对象
 */
export async function hardReloadOnly(elements) {
    try {
        const currentTab = getCurrentTab();
        // 立即检查tab
        if (!currentTab || !currentTab.id) {
            StatusManager.show(elements.status, elements.statusContainer, getMessage('cannotGetCurrentTab'), 'error');
            return;
        }

        // 立即更新UI
        ButtonManager.setSuccess(elements.hardReloadOnly);
        StatusManager.show(elements.status, elements.statusContainer, getMessage('pageHardReloading'), 'success');

        // 强制浏览器立即应用所有样式变化
        if (elements.hardReloadOnly) {
            elements.hardReloadOnly.offsetHeight;
        }
        if (elements.statusContainer) {
            elements.statusContainer.offsetHeight;
        }

        // 立即执行重载（绕过缓存）
        chrome.tabs.reload(currentTab.id, { bypassCache: true });
    } catch (error) {
        ButtonManager.setError(elements.hardReloadOnly);
        StatusManager.show(elements.status, elements.statusContainer, getMessage('hardReloadFailed') + ': ' + error.message, 'error');
    }
}

/**
 * 清空缓存并硬性重新加载（保留登录状态）
 * @param {Object} elements - DOM元素对象
 */
export async function hardReloadCacheOnly(elements) {
    try {
        const currentTab = getCurrentTab();
        // 立即检查tab
        if (!currentTab || !currentTab.id || !currentTab.url) {
            StatusManager.show(elements.status, elements.statusContainer, getMessage('cannotGetCurrentTab'), 'error');
            return;
        }

        // 立即更新UI
        ButtonManager.setSuccess(elements.hardReloadCacheOnly);
        StatusManager.show(elements.status, elements.statusContainer, getMessage('cacheAndPageReloading'), 'success');

        // 强制浏览器立即应用所有样式变化
        // 这是关键：确保用户能看到UI变化
        if (elements.hardReloadCacheOnly) {
            elements.hardReloadCacheOnly.offsetHeight;
        }
        if (elements.statusContainer) {
            elements.statusContainer.offsetHeight;
        }

        // 保存变量用于后续清理
        const urlToClean = currentTab.url;
        const tabId = currentTab.id;

        // 🚀 立即触发重载（最高优先级，零延迟）
        chrome.tabs.reload(tabId, { bypassCache: true });

        // 🔄 异步清理缓存（不阻塞重载）
        setTimeout(() => {
            chrome.browsingData.removeCache({
                since: 0,
                origins: [urlToClean]
            }).catch(error => {
                console.warn('清理缓存失败:', error);
            });
        }, 0);
    } catch (error) {
        ButtonManager.setError(elements.hardReloadCacheOnly);
        StatusManager.show(elements.status, elements.statusContainer, getMessage('cacheAndReloadFailed') + ': ' + error.message, 'error');
    }
}

/**
 * 清空所有数据并硬性重新加载（包括登录状态）
 * @param {Object} elements - DOM元素对象
 */
export async function hardReloadPage(elements) {
    // 导入 executeCleanup 函数
    const { executeCleanup } = await import('./cleanupHandlers.js');
    await executeCleanup(
        async () => {
            const currentTab = getCurrentTab();
            if (!currentTab) throw new Error(getMessage('cannotGetCurrentTab'));
            await CleanerManager.hardReloadPage(currentTab);
        },
        elements.hardReload,
        getMessage('allDataAndPageReloading'),
        getMessage('allDataAndReloadFailed'),
        elements.status,
        elements.statusContainer
    );
}


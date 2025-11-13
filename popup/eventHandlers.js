/**
 * 事件处理模块
 * 处理各种用户交互事件
 */

import { TabManager, StatusManager, getMessage, initializePageI18n, getUserLanguage, switchLanguage } from '../utils/index.js';
import { getCurrentTab } from './state.js';
import { formatUrl, adjustTabTextSize, loadVersionInfo } from './uiHelpers.js';

/**
 * 绑定按钮事件
 * @param {HTMLElement} button - 按钮元素
 * @param {Function} handler - 事件处理函数
 */
export function bindButtonEvent(button, handler) {
    if (button) {
        button.addEventListener('click', handler);
    }
}

/**
 * 处理标签页切换
 * @param {Event} event - 事件对象
 */
export function handleTabClick(event) {
    const tabId = event.currentTarget.dataset.tab;
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    TabManager.switchTo(tabId, tabButtons, tabContents);
}

/**
 * 恢复标签页状态
 */
export async function restoreTabState() {
    try {
        // 添加超时保护
        const storagePromise = chrome.storage.local.get('activeTab');
        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('恢复标签页状态超时')), 500)
        );

        const result = await Promise.race([storagePromise, timeoutPromise]);

        if (result && result.activeTab) {
            const tabButtons = document.querySelectorAll('.tab-btn');
            const tabContents = document.querySelectorAll('.tab-content');
            if (tabButtons.length > 0 && tabContents.length > 0) {
                TabManager.switchTo(result.activeTab, tabButtons, tabContents);
            }
        }
    } catch (error) {
        // 忽略恢复标签页状态错误，使用默认标签页
        console.warn('恢复标签页状态失败:', error);
    }
}

/**
 * 处理语言切换
 * @param {Event} event - 事件对象
 * @param {Object} elements - DOM元素对象
 */
export async function handleLanguageChange(event, elements) {
    try {
        const selectedLanguage = event.target.value;
        const success = await switchLanguage(selectedLanguage);

        if (success) {
            StatusManager.show(elements.status, elements.statusContainer, getMessage('languageChanged'), 'success');

            // 重新加载当前URL显示（因为"未知网站"等文本可能需要更新）
            if (elements.currentUrl) {
                const currentUrl = getCurrentTab()?.url || '';
                if (currentUrl) {
                    elements.currentUrl.textContent = formatUrl(currentUrl);
                }
            }

            // 重新加载版本信息
            loadVersionInfo();

            // 更新存储使用情况区域的国际化文本
            // 先调用 initializePageI18n 更新所有静态元素（包括标题）
            await initializePageI18n();
            // 然后更新动态生成的存储使用情况内容
            if (window.storageUsageView) {
                window.storageUsageView.updateI18n();
            }

            // 重新调整标签页文本大小
            setTimeout(() => {
                adjustTabTextSize();
            }, 100);
        } else {
            StatusManager.show(elements.status, elements.statusContainer, getMessage('languageChangeFailed'), 'error');
            // 恢复到之前的选择
            const currentLang = await getUserLanguage();
            elements.languageSelect.value = currentLang;
        }
    } catch (error) {
        StatusManager.show(elements.status, elements.statusContainer, getMessage('languageChangeFailed'), 'error');
    }
}

/**
 * 绑定所有事件监听器
 * @param {Object} elements - DOM元素对象
 * @param {Object} handlers - 各种处理函数对象
 */
export function bindEventListeners(elements, handlers) {
    // 当前网站标签页按钮
    bindButtonEvent(elements.normalReload, handlers.normalReload);
    bindButtonEvent(elements.hardReloadOnly, handlers.hardReloadOnly);
    
    // 创建清理后刷新存储使用情况的包装函数
    const withStorageRefresh = (fn) => async () => {
        await fn();
        setTimeout(() => {
            if (window.storageUsageView) {
                window.storageUsageView.loadStorageUsage().catch(err => console.warn('加载存储使用情况失败:', err));
            }
        }, 500);
    };

    bindButtonEvent(elements.clearCurrentAll, withStorageRefresh(handlers.clearCurrentWebsiteData));
    bindButtonEvent(elements.hardReloadCacheOnly, handlers.hardReloadCacheOnly);
    bindButtonEvent(elements.hardReload, handlers.hardReloadPage);
    bindButtonEvent(elements.clearCurrentCookies, withStorageRefresh(handlers.clearCookies));
    bindButtonEvent(elements.clearLocalStorage, withStorageRefresh(handlers.clearLocalStorage));
    bindButtonEvent(elements.clearSessionStorage, withStorageRefresh(handlers.clearSessionStorage));
    bindButtonEvent(elements.clearCurrentIndexedDB, withStorageRefresh(handlers.clearCurrentIndexedDB));

    // 整个浏览器标签页按钮
    bindButtonEvent(elements.clearAll, handlers.clearAllData);
    bindButtonEvent(elements.clearCache, handlers.clearCache);
    bindButtonEvent(elements.clearCookies, handlers.clearCookies);
    bindButtonEvent(elements.clearIndexedDB, handlers.clearIndexedDB);
    bindButtonEvent(elements.clearHistory, handlers.clearHistory);
    bindButtonEvent(elements.clearDownloads, handlers.clearDownloads);
    bindButtonEvent(elements.clearDownloadsFiles, handlers.clearDownloadFiles);

    // Tab切换
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(button => {
        button.addEventListener('click', handleTabClick);
    });

    // 主题切换
    elements.themeRadios.forEach(radio => {
        radio.addEventListener('change', (e) => handlers.handleThemeChange(e, elements));
    });

    // 设置变更
    if (elements.clearPasswords) {
        elements.clearPasswords.addEventListener('change', () => handlers.saveAdvancedSettings(elements));
    }
    if (elements.clearFormData) {
        elements.clearFormData.addEventListener('change', () => handlers.saveAdvancedSettings(elements));
    }
    if (elements.includeProtected) {
        elements.includeProtected.addEventListener('change', () => handlers.saveAdvancedSettings(elements));
    }
    if (elements.enableNotifications) {
        elements.enableNotifications.addEventListener('change', () => handlers.saveAdvancedSettings(elements));
    }
    if (elements.notificationSound) {
        elements.notificationSound.addEventListener('change', () => handlers.saveAdvancedSettings(elements));
    }

    // 语言切换
    if (elements.languageSelect) {
        elements.languageSelect.addEventListener('change', (e) => handleLanguageChange(e, elements));
    }

    // 刷新存储使用情况
    if (elements.refreshStorageBtn) {
        elements.refreshStorageBtn.addEventListener('click', () => {
            // 添加加载动画
            elements.refreshStorageBtn.classList.add('loading');
            if (window.storageUsageView) {
                window.storageUsageView.loadStorageUsage().finally(() => {
                    // 移除加载动画
                    setTimeout(() => {
                        elements.refreshStorageBtn.classList.remove('loading');
                    }, 300);
                });
            }
        });
    }
}


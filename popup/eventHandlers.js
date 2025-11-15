/**
 * 事件处理模块
 * 处理各种用户交互事件
 */

import { TabManager, StatusManager, getMessage, initializePageI18n, getUserLanguage, switchLanguage, ThemeManager } from '../utils/index.js';
import { getCurrentTab } from './state.js';
import { formatUrl, adjustTabTextSize } from './uiHelpers.js';

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
 * 处理语言切换（图标按钮方式）
 * @param {string} languageCode - 语言代码
 * @param {Object} elements - DOM元素对象
 */
export async function handleLanguageIconChange(languageCode, elements) {
    try {
        const success = await switchLanguage(languageCode);

        if (success) {
            StatusManager.show(elements.status, elements.statusContainer, getMessage('languageChanged'), 'success');

            // 重新加载当前URL显示（因为"未知网站"等文本可能需要更新）
            if (elements.currentUrl) {
                const currentUrl = getCurrentTab()?.url || '';
                if (currentUrl) {
                    elements.currentUrl.textContent = formatUrl(currentUrl);
                }
            }

            // 更新存储使用情况区域的国际化文本
            // 先调用 initializePageI18n 更新所有静态元素（包括标题）
            await initializePageI18n();
            // 然后更新动态生成的存储使用情况内容
            if (window.storageUsageView) {
                window.storageUsageView.updateI18n();
            }

            // 更新菜单中的激活状态
            updateLanguageMenuActive(elements);

            // 重新调整标签页文本大小
            setTimeout(() => {
                adjustTabTextSize();
            }, 100);
        } else {
            StatusManager.show(elements.status, elements.statusContainer, getMessage('languageChangeFailed'), 'error');
        }
    } catch (error) {
        StatusManager.show(elements.status, elements.statusContainer, getMessage('languageChangeFailed'), 'error');
    }
}

/**
 * 更新语言菜单中的激活状态
 * @param {Object} elements - DOM元素对象
 */
export async function updateLanguageMenuActive(elements) {
    if (!elements.languageMenuItems) return;

    try {
        const currentLang = await getUserLanguage();
        elements.languageMenuItems.forEach(item => {
            const lang = item.getAttribute('data-lang');
            if (lang === currentLang) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    } catch (error) {
        console.warn('更新语言菜单激活状态失败:', error);
    }
}

/**
 * 处理主题切换（图标按钮方式）
 * @param {string} theme - 主题代码
 * @param {Object} elements - DOM元素对象
 */
export async function handleThemeIconChange(theme, elements) {
    try {
        const container = document.querySelector('.container');
        const body = document.body;

        // 应用主题
        ThemeManager.apply(theme, container, body);

        // 更新菜单中的激活状态
        updateThemeMenuActive(elements);

        // 保存主题设置
        await chrome.storage.local.set({ theme });

        StatusManager.show(elements.status, elements.statusContainer, getMessage('settingsSaved') || '设置已保存', 'success');
    } catch (error) {
        console.error('切换主题失败:', error);
        StatusManager.show(elements.status, elements.statusContainer, getMessage('settingsSaveFailed') || '设置保存失败', 'error');
    }
}

/**
 * 更新主题菜单中的激活状态
 * @param {Object} elements - DOM元素对象
 */
export async function updateThemeMenuActive(elements) {
    if (!elements.themeMenuItems) return;

    try {
        const result = await chrome.storage.local.get(['theme']);
        const currentTheme = result.theme || 'dark';

        elements.themeMenuItems.forEach(item => {
            const theme = item.getAttribute('data-theme');
            if (theme === currentTheme) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    } catch (error) {
        console.warn('更新主题菜单激活状态失败:', error);
    }
}

/**
 * 处理语言切换（保留用于兼容性）
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
            if (elements.languageSelect) {
                elements.languageSelect.value = currentLang;
            }
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

    // 主题切换（图标按钮）
    if (elements.themeBtn && elements.themeMenu) {
        // 点击图标按钮显示/隐藏菜单
        elements.themeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isShowing = elements.themeMenu.classList.contains('show');
            if (isShowing) {
                elements.themeMenu.classList.remove('show');
            } else {
                // 关闭语言菜单（如果打开）
                if (elements.languageMenu) {
                    elements.languageMenu.classList.remove('show');
                }
                // 动态计算菜单位置
                const rect = elements.themeBtn.getBoundingClientRect();
                elements.themeMenu.style.top = `${rect.bottom + 6}px`;
                elements.themeMenu.style.right = `${window.innerWidth - rect.right}px`;
                // 确保菜单在最上层
                elements.themeMenu.style.zIndex = '99999';
                elements.themeMenu.classList.add('show');
                updateThemeMenuActive(elements);
            }
        });

        // 点击菜单项切换主题
        elements.themeMenuItems.forEach(item => {
            item.addEventListener('click', async (e) => {
                e.stopPropagation();
                const theme = item.getAttribute('data-theme');
                await handleThemeIconChange(theme, elements);
                elements.themeMenu.classList.remove('show');
            });
        });

        // 点击外部关闭菜单
        document.addEventListener('click', (e) => {
            if (!elements.themeBtn.contains(e.target) &&
                !elements.themeMenu.contains(e.target)) {
                elements.themeMenu.classList.remove('show');
            }
        });
    }

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

    // 语言切换（图标按钮）
    if (elements.languageBtn && elements.languageMenu) {
        // 点击图标按钮显示/隐藏菜单
        elements.languageBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isShowing = elements.languageMenu.classList.contains('show');
            if (isShowing) {
                elements.languageMenu.classList.remove('show');
            } else {
                // 关闭主题菜单（如果打开）
                if (elements.themeMenu) {
                    elements.themeMenu.classList.remove('show');
                }
                // 动态计算菜单位置
                const rect = elements.languageBtn.getBoundingClientRect();
                elements.languageMenu.style.top = `${rect.bottom + 6}px`;
                elements.languageMenu.style.right = `${window.innerWidth - rect.right}px`;
                // 确保菜单在最上层
                elements.languageMenu.style.zIndex = '99999';
                elements.languageMenu.classList.add('show');
                updateLanguageMenuActive(elements);
            }
        });

        // 点击菜单项切换语言
        elements.languageMenuItems.forEach(item => {
            item.addEventListener('click', async (e) => {
                e.stopPropagation();
                const lang = item.getAttribute('data-lang');
                await handleLanguageIconChange(lang, elements);
                elements.languageMenu.classList.remove('show');
            });
        });

        // 点击外部关闭菜单
        document.addEventListener('click', (e) => {
            if (!elements.languageBtn.contains(e.target) &&
                !elements.languageMenu.contains(e.target)) {
                elements.languageMenu.classList.remove('show');
            }
        });
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


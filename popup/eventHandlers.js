/**
 * 事件处理模块
 * 处理各种用户交互事件
 */

import { getMessage, getUserLanguage, initializePageI18n, SettingsManager, StatusManager, switchLanguage, TabManager, ThemeManager } from '../utils/index.js';
import { updateStorageDetailViewI18n } from '../utils/storageDetailView.js';
import { getCurrentTab } from './state.js';
import { adjustTabTextSize, formatUrl } from './uiHelpers.js';

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
 * 显示危险操作确认弹窗
 * @param {Object} elements - DOM 元素集合
 * @param {string} actionText - 操作描述
 * @returns {Promise<boolean>} 是否确认
 */
async function showDangerConfirm(elements, actionText) {
    return new Promise((resolve) => {
        const modal = elements.dangerConfirm;
        const okBtn = elements.dangerConfirmOk;
        const cancelBtn = elements.dangerConfirmCancel;
        const messageEl = elements.dangerConfirmMessage;

        if (!modal || !okBtn || !cancelBtn) {
            resolve(true);
            return;
        }

        const titleText = getMessage('confirmDangerousTitle') || '确认执行当前操作？';
        const prefix = getMessage('confirmDangerousMessagePrefix') || '清空';
        const suffix = getMessage('confirmDangerousMessageSuffix') || '不可恢复，是否继续？';
        const combined = actionText ? `${prefix}${actionText}${suffix}` : (getMessage('confirmDangerousMessage') || '此操作不可恢复，是否继续？');

        modal.querySelector('.danger-confirm-title').textContent = titleText;
        if (messageEl) {
            messageEl.textContent = combined;
        }

        modal.classList.add('show');

        const cleanup = () => {
            modal.classList.remove('show');
            okBtn.removeEventListener('click', handleOk);
            cancelBtn.removeEventListener('click', handleCancel);
        };

        const handleOk = () => {
            cleanup();
            resolve(true);
        };
        const handleCancel = () => {
            cleanup();
            resolve(false);
        };

        okBtn.addEventListener('click', handleOk);
        cancelBtn.addEventListener('click', handleCancel);
    });
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
            // 更新存储详情弹窗的国际化文本
            updateStorageDetailViewI18n(getMessage);

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
            // 更新存储详情弹窗的国际化文本
            updateStorageDetailViewI18n(getMessage);

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

    const reloadStorageUsage = (delay = 500) => {
        setTimeout(() => {
            if (window.storageUsageView) {
                window.storageUsageView.loadStorageUsage().catch(err => console.warn('加载存储使用情况失败:', err));
            }
        }, delay);
    };

    const bindDangerousAction = (button, handler, { labelKey, withRefresh = false } = {}) => {
        if (!button) return;
        button.addEventListener('click', async () => {
            try {
                const settings = await SettingsManager.get(['confirmDangerous', 'silentMode']);
                const needConfirm = settings.confirmDangerous !== false;
                const silentMode = settings.silentMode === true;
                const actionText = getMessage(labelKey) || labelKey || '';

                const run = async () => {
                    await handler({ silent: silentMode });
                    if (withRefresh && !silentMode) {
                        reloadStorageUsage();
                    }
                };

                if (silentMode) {
                    await run();
                    return;
                }

                if (needConfirm) {
                    const ok = await showDangerConfirm(elements, actionText);
                    if (!ok) return;
                }

                await run();
            } catch (error) {
                console.warn('危险操作处理失败:', error);
            }
        });
    };

    bindDangerousAction(elements.clearCurrentAll, handlers.clearCurrentWebsiteData, { labelKey: 'clearCache', withRefresh: true });
    bindButtonEvent(elements.hardReloadCacheOnly, handlers.hardReloadCacheOnly);
    bindDangerousAction(elements.hardReload, handlers.hardReloadPage, { labelKey: 'clearAllAndReload' });
    bindDangerousAction(elements.clearCurrentCookies, handlers.clearCookies, { labelKey: 'cookies', withRefresh: true });
    bindDangerousAction(elements.clearLocalStorage, handlers.clearLocalStorage, { labelKey: 'localStorage', withRefresh: true });
    bindDangerousAction(elements.clearSessionStorage, handlers.clearSessionStorage, { labelKey: 'sessionStorage', withRefresh: true });
    bindDangerousAction(elements.clearCurrentIndexedDB, handlers.clearCurrentIndexedDB, { labelKey: 'indexedDB', withRefresh: true });

    // 整个浏览器标签页按钮
    bindDangerousAction(elements.clearAll, handlers.clearAllData, { labelKey: 'clearAllCache' });
    bindDangerousAction(elements.clearCache, handlers.clearCache, { labelKey: 'browserCache' });
    bindDangerousAction(elements.clearCookies, handlers.clearCookies, { labelKey: 'allCookies' });
    bindDangerousAction(elements.clearIndexedDB, handlers.clearIndexedDB, { labelKey: 'allIndexedDB' });
    bindDangerousAction(elements.clearHistory, handlers.clearHistory, { labelKey: 'clearHistory' });
    bindDangerousAction(elements.clearDownloads, handlers.clearDownloads, { labelKey: 'downloadHistory' });
    bindDangerousAction(elements.clearDownloadsFiles, handlers.clearDownloadFiles, { labelKey: 'deleteDownloadFiles' });

    // 全局存储分析入口
    if (elements.openAnalysis) {
        elements.openAnalysis.addEventListener('click', () => {
            const url = chrome.runtime.getURL('analysis.html');
            chrome.tabs.create({ url });
        });
    }

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
    if (elements.confirmDangerous) {
        elements.confirmDangerous.addEventListener('change', () => handlers.saveAdvancedSettings(elements));
    }
    if (elements.silentMode) {
        elements.silentMode.addEventListener('change', () => handlers.saveAdvancedSettings(elements));
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


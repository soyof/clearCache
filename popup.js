/**
 * 弹窗脚本
 * 处理弹窗界面的交互和功能
 */

// 导入工具模块
import {
    BrowsingDataManager,
    ButtonManager,
    CleanerManager,
    SettingsManager,
    StatusManager,
    TabManager,
    ThemeManager,
    estimateStorageSize,
    formatBytes,
    getCookiesInfo,
    getMessage,
    getUserLanguage,
    initializePageI18n,
    isRestrictedPage,
    switchLanguage,
    validateStorageCount
} from './utils/index.js';

// requestIdleCallback polyfill
if (!window.requestIdleCallback) {
    window.requestIdleCallback = function (callback, options) {
        const timeout = options && options.timeout ? options.timeout : 1;
        return setTimeout(() => {
            callback({
                didTimeout: false,
                timeRemaining: () => Math.max(0, 50)
            });
        }, timeout);
    };
}

// 获取当前标签页信息
let currentTab = null;
let currentUrl = '';

// DOM 元素
const elements = {
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

/**
 * 初始化
 */
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // 立即设置加载中状态
        if (elements.currentUrl) {
            elements.currentUrl.textContent = '加载中...';
        }

        // 立即绑定事件监听器，避免等待异步操作
        bindEventListeners();

        // 第一步：快速初始化国际化（优先级最高）
        await Promise.race([
            initializePageI18n(),
            new Promise((_, reject) => setTimeout(() => reject(new Error('i18n超时')), 1000))
        ]).catch(err => console.warn('i18n初始化失败:', err));

        // 第二步：立即获取当前标签页信息（用户最关心的）
        initializeCurrentTab().catch(err => console.warn('标签页初始化失败:', err));

        // 第二步半：加载存储使用情况（在获取标签页后，延迟执行避免阻塞）
        setTimeout(() => {
            loadStorageUsage().catch(err => console.warn('加载存储使用情况失败:', err));
        }, 300);

        // 第三步：并行执行其他初始化任务
        const otherInitPromises = [
            loadVersionInfo().catch(err => console.warn('版本信息加载失败:', err)),
            loadSettings().catch(err => console.warn('设置加载失败:', err)),
            restoreTabState().catch(err => console.warn('标签页状态恢复失败:', err)),
            initializeAdvancedSettings().catch(err => console.warn('高级设置初始化失败:', err))
        ];

        // 等待其他初始化完成，但设置超时防止卡死
        await Promise.race([
            Promise.all(otherInitPromises),
            new Promise((_, reject) => setTimeout(() => reject(new Error('初始化超时')), 2000))
        ]).catch(err => {
            console.warn('部分初始化失败或超时:', err);
        });

        // 延迟执行不影响界面显示的操作
        requestIdleCallback(() => {
            adjustTabTextSize();
        }, { timeout: 500 });

    } catch (error) {
        console.error('初始化过程出错:', error);
        // 即使出错也要确保基本功能可用
        if (elements.currentUrl && elements.currentUrl.textContent === '加载中...') {
            elements.currentUrl.textContent = '未知网站';
        }
    }
});

/**
 * 初始化当前标签页信息
 */
async function initializeCurrentTab() {
    // 先显示国际化的"加载中..."
    if (elements.currentUrl) {
        elements.currentUrl.textContent = getMessage('loading') || '加载中...';
    }

    try {
        // 添加超时保护，防止chrome.tabs.query卡住
        const tabsPromise = chrome.tabs.query({ active: true, currentWindow: true });
        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('获取标签页超时')), 1000)
        );

        const tabs = await Promise.race([tabsPromise, timeoutPromise]);

        if (tabs && tabs.length > 0) {
            currentTab = tabs[0];
            currentUrl = currentTab.url || '';

            // 显示当前URL
            if (elements.currentUrl) {
                const formattedUrl = formatUrl(currentUrl);
                elements.currentUrl.textContent = formattedUrl;
                elements.currentUrl.title = currentUrl;
            }
        } else {
            // 如果没有获取到标签页，显示默认信息
            if (elements.currentUrl) {
                elements.currentUrl.textContent = getMessage('unknownSite') || '未知网站';
            }
        }
    } catch (error) {
        console.warn('获取当前标签页失败:', error);
        // 即使失败也显示友好信息
        if (elements.currentUrl) {
            elements.currentUrl.textContent = getMessage('unknownSite') || '未知网站';
        }
    }
}

/**
 * 格式化URL
 * @param {string} url - URL
 * @returns {string} 格式化后的URL
 */
function formatUrl(url) {
    try {
        if (!url) return getMessage('unknownSite');

        // 移除协议
        let formattedUrl = url.replace(/^(https?:\/\/)/, '');

        // 移除路径和查询参数
        formattedUrl = formattedUrl.split('/')[0];

        // 如果URL太长，截断它
        if (formattedUrl.length > 30) {
            formattedUrl = formattedUrl.substring(0, 27) + '...';
        }

        return formattedUrl;
    } catch (error) {
        return getMessage('unknownSite');
    }
}

/**
 * 加载版本信息
 */
async function loadVersionInfo() {
    try {
        const manifest = chrome.runtime.getManifest();
        const versionElement = document.querySelector('.version');
        if (versionElement && manifest && manifest.version) {
            versionElement.textContent = 'v' + manifest.version;
        }
    } catch (error) {
        // 忽略版本加载错误
        console.warn('加载版本信息失败:', error);
    }
}

/**
 * 绑定事件监听器
 */
function bindEventListeners() {
    // 当前网站标签页按钮
    bindButtonEvent(elements.normalReload, normalReload);
    bindButtonEvent(elements.hardReloadOnly, hardReloadOnly);
    // 创建清理后刷新存储使用情况的包装函数
    const withStorageRefresh = (fn) => async () => {
        await fn();
        setTimeout(() => loadStorageUsage(), 500);
    };

    bindButtonEvent(elements.clearCurrentAll, withStorageRefresh(clearCurrentWebsiteData));
    bindButtonEvent(elements.hardReloadCacheOnly, hardReloadCacheOnly);
    bindButtonEvent(elements.hardReload, hardReloadPage);
    bindButtonEvent(elements.clearCurrentCookies, withStorageRefresh(clearCookies));
    bindButtonEvent(elements.clearLocalStorage, withStorageRefresh(clearLocalStorage));
    bindButtonEvent(elements.clearSessionStorage, withStorageRefresh(clearSessionStorage));
    bindButtonEvent(elements.clearCurrentIndexedDB, withStorageRefresh(clearCurrentIndexedDB));

    // 整个浏览器标签页按钮
    bindButtonEvent(elements.clearAll, clearAllData);
    bindButtonEvent(elements.clearCache, clearCache);
    bindButtonEvent(elements.clearCookies, clearCookies);
    bindButtonEvent(elements.clearIndexedDB, clearIndexedDB);
    bindButtonEvent(elements.clearHistory, clearHistory);
    bindButtonEvent(elements.clearDownloads, clearDownloads);
    bindButtonEvent(elements.clearDownloadsFiles, clearDownloadFiles);

    // Tab切换
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(button => {
        button.addEventListener('click', handleTabClick);
    });

    // 主题切换
    elements.themeRadios.forEach(radio => {
        radio.addEventListener('change', handleThemeChange);
    });

    // 设置变更
    if (elements.clearPasswords) {
        elements.clearPasswords.addEventListener('change', saveAdvancedSettings);
    }
    if (elements.clearFormData) {
        elements.clearFormData.addEventListener('change', saveAdvancedSettings);
    }
    if (elements.includeProtected) {
        elements.includeProtected.addEventListener('change', saveAdvancedSettings);
    }
    if (elements.enableNotifications) {
        elements.enableNotifications.addEventListener('change', saveAdvancedSettings);
    }
    if (elements.notificationSound) {
        elements.notificationSound.addEventListener('change', saveAdvancedSettings);
    }

    // 语言切换
    if (elements.languageSelect) {
        elements.languageSelect.addEventListener('change', handleLanguageChange);
    }

    // 刷新存储使用情况
    if (elements.refreshStorageBtn) {
        elements.refreshStorageBtn.addEventListener('click', () => {
            // 添加加载动画
            elements.refreshStorageBtn.classList.add('loading');
            loadStorageUsage().finally(() => {
                // 移除加载动画
                setTimeout(() => {
                    elements.refreshStorageBtn.classList.remove('loading');
                }, 300);
            });
        });
    }
}

/**
 * 绑定按钮事件
 * @param {HTMLElement} button - 按钮元素
 * @param {Function} handler - 事件处理函数
 */
function bindButtonEvent(button, handler) {
    if (button) {
        button.addEventListener('click', handler);
    }
}

/**
 * 处理标签页切换
 * @param {Event} event - 事件对象
 */
function handleTabClick(event) {
    const tabId = event.currentTarget.dataset.tab;
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    TabManager.switchTo(tabId, tabButtons, tabContents);
}

/**
 * 恢复标签页状态
 */
async function restoreTabState() {
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
 * 加载设置
 */
async function loadSettings() {
    try {
        // 添加超时保护
        const settingsPromise = SettingsManager.get([
            'clearPasswords',
            'clearFormData',
            'includeProtected'
        ]);
        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('加载设置超时')), 1000)
        );

        const settings = await Promise.race([settingsPromise, timeoutPromise]);

        if (elements.clearPasswords) {
            elements.clearPasswords.checked = settings.clearPasswords !== false;
        }

        if (elements.clearFormData) {
            elements.clearFormData.checked = settings.clearFormData !== false;
        }

        if (elements.includeProtected) {
            elements.includeProtected.checked = settings.includeProtected !== false;
        }
    } catch (error) {
        console.warn('加载设置失败:', error);
        // 使用默认设置
        if (elements.clearPasswords) {
            elements.clearPasswords.checked = true;
        }
        if (elements.clearFormData) {
            elements.clearFormData.checked = true;
        }
        if (elements.includeProtected) {
            elements.includeProtected.checked = true;
        }
    }
}

/**
 * 执行清理操作
 * @param {Function} cleanupFunction - 清理函数
 * @param {HTMLElement} button - 按钮元素
 * @param {string} successMessage - 成功消息
 * @param {string} errorMessage - 错误消息
 * @param {boolean} waitForCompletion - 是否等待操作完成（默认true）
 */
async function executeCleanup(cleanupFunction, button, successMessage, errorMessage, waitForCompletion = true) {
    try {
        // 立即设置按钮为加载状态，提供即时反馈
        ButtonManager.setLoading(button);

        if (waitForCompletion) {
            // 需要等待操作完成的情况（如清理缓存等需要确认完成的操作）
            await cleanupFunction();

            // 设置按钮为成功状态
            ButtonManager.setSuccess(button);

            // 显示成功消息
            showStatus(successMessage, 'success');
        } else {
            // 不需要等待操作完成的情况（如页面重载，立即给用户反馈）
            // 立即显示成功消息
            showStatus(successMessage, 'success');

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
        showStatus(errorMessage + ': ' + error.message, 'error');
    }
}

/**
 * 显示状态消息
 * @param {string} message - 状态消息
 * @param {string} type - 状态类型
 */
function showStatus(message, type = 'info') {
    StatusManager.show(elements.status, elements.statusContainer, message, type);
}

// 清理功能实现

/**
 * 清空当前网站所有数据
 */
async function clearCurrentWebsiteData() {
    await executeCleanup(async () => {
        if (!currentTab) throw new Error(getMessage('cannotGetCurrentTab'));
        await CleanerManager.clearCurrentWebsiteData(currentTab);
    }, elements.clearCurrentAll, getMessage('currentSiteCacheCleared'), getMessage('currentSiteCacheClearFailed'));
}

/**
 * 清空所有数据
 */
async function clearAllData() {
    await executeCleanup(async () => {
        if (!currentTab) throw new Error(getMessage('cannotGetCurrentTab'));

        // 获取清理选项设置
        const settings = await SettingsManager.get([
            'clearPasswords',
            'clearFormData',
            'includeProtected'
        ]);

        await CleanerManager.clearAllData(currentTab, settings);
    }, elements.clearAll, getMessage('allCacheCleared'), getMessage('allCacheClearFailed'));
}

/**
 * 清空缓存
 */
async function clearCache() {
    await executeCleanup(async () => {
        await BrowsingDataManager.clearCache({ since: 0 });
    }, elements.clearCache, getMessage('cacheCleared'), getMessage('cacheClearFailed'));
}

/**
 * 清空 Cookies
 */
async function clearCookies() {
    await executeCleanup(async () => {
        if (!currentTab) throw new Error(getMessage('cannotGetCurrentTab'));
        await CleanerManager.clearCookiesData(currentTab);
    }, elements.clearCurrentCookies, getMessage('cookiesCleared'), getMessage('cookiesClearFailed'));
}

/**
 * 清空 LocalStorage
 */
async function clearLocalStorage() {
    await executeCleanup(async () => {
        if (!currentTab) throw new Error(getMessage('cannotGetCurrentTab'));
        await CleanerManager.clearLocalStorageData(currentTab);
    }, elements.clearLocalStorage, getMessage('localStorageCleared'), getMessage('localStorageClearFailed'));
}

/**
 * 清空 SessionStorage
 */
async function clearSessionStorage() {
    await executeCleanup(async () => {
        if (!currentTab) throw new Error(getMessage('cannotGetCurrentTab'));
        await CleanerManager.clearSessionStorageData(currentTab);
    }, elements.clearSessionStorage, getMessage('sessionStorageCleared'), getMessage('sessionStorageClearFailed'));
}

/**
 * 清空 IndexedDB
 */
async function clearCurrentIndexedDB() {
    await executeCleanup(async () => {
        if (!currentTab) throw new Error(getMessage('cannotGetCurrentTab'));
        await CleanerManager.clearIndexedDBData(currentTab);
    }, elements.clearCurrentIndexedDB, getMessage('indexedDBCleared'), getMessage('indexedDBClearFailed'));
}

/**
 * 清空所有 IndexedDB
 */
async function clearIndexedDB() {
    await executeCleanup(async () => {
        await BrowsingDataManager.clearIndexedDB({ since: 0 });
    }, elements.clearIndexedDB, getMessage('allIndexedDBCleared'), getMessage('indexedDBClearFailed'));
}

/**
 * 清空历史记录
 */
async function clearHistory() {
    await executeCleanup(async () => {
        await CleanerManager.clearHistoryData();
    }, elements.clearHistory, getMessage('historyCleared'), getMessage('historyClearFailed'));
}

/**
 * 清空下载记录
 */
async function clearDownloads() {
    await executeCleanup(async () => {
        await CleanerManager.clearDownloadsData();
    }, elements.clearDownloads, getMessage('downloadsCleared'), getMessage('downloadsClearFailed'));
}

/**
 * 清空下载文件
 */
async function clearDownloadFiles() {
    await executeCleanup(async () => {
        await CleanerManager.clearDownloadFiles();
    }, elements.clearDownloadsFiles, getMessage('downloadFilesCleared'), getMessage('downloadFilesClearFailed'));
}

/**
 * 正常重新加载
 */
async function normalReload() {
    try {
        // 立即检查tab
        if (!currentTab || !currentTab.id) {
            showStatus(getMessage('cannotGetCurrentTab'), 'error');
            return;
        }

        // 立即更新UI
        ButtonManager.setSuccess(elements.normalReload);
        showStatus(getMessage('pageReloading'), 'success');

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
        showStatus(getMessage('reloadFailed') + ': ' + error.message, 'error');
    }
}

/**
 * 硬性重新加载（绕过缓存）
 */
async function hardReloadOnly() {
    try {
        // 立即检查tab
        if (!currentTab || !currentTab.id) {
            showStatus(getMessage('cannotGetCurrentTab'), 'error');
            return;
        }

        // 立即更新UI
        ButtonManager.setSuccess(elements.hardReloadOnly);
        showStatus(getMessage('pageHardReloading'), 'success');

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
        showStatus(getMessage('hardReloadFailed') + ': ' + error.message, 'error');
    }
}

/**
 * 清空缓存并硬性重新加载（保留登录状态）
 */
async function hardReloadCacheOnly() {
    try {
        // 立即检查tab
        if (!currentTab || !currentTab.id || !currentTab.url) {
            showStatus(getMessage('cannotGetCurrentTab'), 'error');
            return;
        }

        // 立即更新UI
        ButtonManager.setSuccess(elements.hardReloadCacheOnly);
        showStatus(getMessage('cacheAndPageReloading'), 'success');

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
        showStatus(getMessage('cacheAndReloadFailed') + ': ' + error.message, 'error');
    }
}

/**
 * 清空所有数据并硬性重新加载（包括登录状态）
 */
async function hardReloadPage() {
    await executeCleanup(async () => {
        if (!currentTab) throw new Error(getMessage('cannotGetCurrentTab'));
        await CleanerManager.hardReloadPage(currentTab);
    }, elements.hardReload, getMessage('allDataAndPageReloading'), getMessage('allDataAndReloadFailed'));
}

/**
 * 初始化高级设置
 */
async function initializeAdvancedSettings() {
    try {
        // 并行加载高级设置和语言设置
        await Promise.all([
            loadAdvancedSettings().catch(err => console.warn('加载高级设置失败:', err)),
            loadLanguageSettings().catch(err => console.warn('加载语言设置失败:', err))
        ]);

        // 绑定主题切换事件（防御性检查）
        if (elements.themeRadios && elements.themeRadios.length > 0) {
            elements.themeRadios.forEach(radio => {
                if (radio && radio.addEventListener) {
                    radio.addEventListener('change', handleThemeChange);
                }
            });
        }
    } catch (error) {
        console.warn('初始化高级设置失败:', error);
    }
}

/**
 * 处理主题切换
 * @param {Event} event - 事件对象
 */
function handleThemeChange(event) {
    const theme = event.target.value;
    applyTheme(theme);
    updateThemeSelection(theme);

    // 保存主题设置
    chrome.storage.local.set({ theme });
}

/**
 * 应用主题
 * @param {string} theme - 主题名称
 */
function applyTheme(theme) {
    const container = document.querySelector('.container');
    const body = document.body;

    ThemeManager.apply(theme, container, body);
}

/**
 * 更新主题选择的视觉标识
 * @param {string} selectedTheme - 选中的主题
 */
function updateThemeSelection(selectedTheme) {
    ThemeManager.updateSelection(selectedTheme);
}

/**
 * 加载高级设置
 */
async function loadAdvancedSettings() {
    try {
        const settings = await SettingsManager.get([
            'theme',
            'enableNotifications',
            'notificationSound'
        ]);

        // 设置主题
        const theme = settings.theme || 'dark'; // 默认使用深色主题
        const themeRadio = document.querySelector(`input[name="theme"][value="${theme}"]`);
        if (themeRadio) {
            themeRadio.checked = true;
            applyTheme(theme);
            // 更新主题选择的视觉标识
            updateThemeSelection(theme);
        }

        // 设置其他选项
        if (elements.enableNotifications) {
            elements.enableNotifications.checked = settings.enableNotifications !== false;
        }
        if (elements.notificationSound) {
            elements.notificationSound.checked = settings.notificationSound === true;
        }
    } catch (error) {
        // 加载高级设置失败
    }
}

/**
 * 处理语言切换
 * @param {Event} event - 事件对象
 */
async function handleLanguageChange(event) {
    try {
        const selectedLanguage = event.target.value;
        const success = await switchLanguage(selectedLanguage);

        if (success) {
            showStatus(getMessage('languageChanged'), 'success');

            // 重新加载当前URL显示（因为"未知网站"等文本可能需要更新）
            if (elements.currentUrl && currentUrl) {
                elements.currentUrl.textContent = formatUrl(currentUrl);
            }

            // 重新加载版本信息
            loadVersionInfo();

            // 更新存储使用情况区域的国际化文本
            // 先调用 initializePageI18n 更新所有静态元素（包括标题）
            await initializePageI18n();
            // 然后更新动态生成的存储使用情况内容
            updateStorageUsageI18n();

            // 重新调整标签页文本大小
            setTimeout(() => {
                adjustTabTextSize();
            }, 100);
        } else {
            showStatus(getMessage('languageChangeFailed'), 'error');
            // 恢复到之前的选择
            const currentLang = await getUserLanguage();
            elements.languageSelect.value = currentLang;
        }
    } catch (error) {
        showStatus(getMessage('languageChangeFailed'), 'error');
    }
}

/**
 * 加载语言设置
 */
async function loadLanguageSettings() {
    try {
        const userLanguage = await getUserLanguage();
        if (elements.languageSelect) {
            elements.languageSelect.value = userLanguage;
        }
    } catch (error) {
        // 加载语言设置失败，使用默认值
    }
}

/**
 * 调整标签页文本大小以防止换行
 * 使用简化的CSS方案替代复杂的Canvas计算
 */
function adjustTabTextSize() {
    try {
        const tabButtons = document.querySelectorAll('.tab-btn');

        tabButtons.forEach(button => {
            const textElement = button.querySelector('.tab-text');
            if (!textElement) return;

            const textContent = textElement.textContent;
            const textLength = textContent.length;

            // 检测文本语言类型（中文、日文、韩文字符密度更高）
            const isCJK = /[\u4e00-\u9fff\u3400-\u4dbf\u3040-\u309f\u30a0-\u30ff\uac00-\ud7af]/.test(textContent);

            // 简单的字体大小调整逻辑
            let fontSize;
            if (isCJK) {
                if (textLength <= 4) {
                    fontSize = '0.9rem';
                } else if (textLength <= 6) {
                    fontSize = '0.8rem';
                } else {
                    fontSize = '0.75rem';
                }
            } else {
                if (textLength <= 8) {
                    fontSize = '0.85rem';
                } else if (textLength <= 12) {
                    fontSize = '0.75rem';
                } else {
                    fontSize = '0.7rem';
                }
            }

            textElement.style.fontSize = fontSize;
        });
    } catch (error) {
        // 调整标签页文本大小失败，使用默认样式
        console.warn('调整标签页文本大小失败:', error);
    }
}

/**
 * 保存高级设置
 */
async function saveAdvancedSettings() {
    try {
        const settings = {
            enableNotifications: elements.enableNotifications?.checked !== false,
            notificationSound: elements.notificationSound?.checked === true,
            clearPasswords: elements.clearPasswords?.checked !== false,
            clearFormData: elements.clearFormData?.checked !== false,
            includeProtected: elements.includeProtected?.checked !== false
        };

        await SettingsManager.save(settings);
        showStatus(getMessage('settingsSaved'), 'success');
    } catch (error) {
        // 保存高级设置失败
        showStatus(getMessage('settingsSaveFailed'), 'error');
    }
}


/**
 * 通过 executeScript 获取存储使用情况（备用方案）
 * @param {number} tabId - 标签页ID
 * @returns {Promise<Object>} 存储使用情况
 */
async function getStorageUsageViaScript(tabId) {
    try {
        const results = await chrome.scripting.executeScript({
            target: { tabId },
            func: () => {
                const usage = {};
                
                try {
                    // LocalStorage
                    if (typeof localStorage !== 'undefined') {
                        usage.localStorage = {
                            count: localStorage.length,
                            keys: Object.keys(localStorage)
                        };
                    }
                    
                    // SessionStorage
                    if (typeof sessionStorage !== 'undefined') {
                        usage.sessionStorage = {
                            count: sessionStorage.length,
                            keys: Object.keys(sessionStorage)
                        };
                    }
                    
                    // IndexedDB
                    if ('indexedDB' in window && indexedDB.databases) {
                        // 注意：indexedDB.databases() 是异步的，但这里我们只能同步返回
                        usage.indexedDB = {
                            count: 0,
                            databases: []
                        };
                    }
                    
                    // Cache API
                    if ('caches' in window) {
                        // caches.keys() 也是异步的
                        usage.cacheAPI = {
                            count: 0,
                            names: []
                        };
                    }
                    
                    // Service Worker
                    if ('serviceWorker' in navigator) {
                        usage.serviceWorker = {
                            count: 0,
                            scopes: []
                        };
                    }
                } catch (e) {
                    return { error: e.message };
                }
                
                return usage;
            }
        });
        
        return results[0]?.result || {};
    } catch (error) {
        throw new Error('无法执行脚本获取存储信息：' + error.message);
    }
}

/**
 * 加载存储使用情况
 */
async function loadStorageUsage() {
    if (!elements.storageUsageContent || !currentTab || !currentTab.id) {
        return;
    }

    // 检查是否为受限制的页面
    if (isRestrictedPage(currentTab.url)) {
        elements.storageUsageContent.innerHTML = `
            <div class="storage-error" data-i18n="restrictedPageStorage">此页面受浏览器保护，无法获取存储信息</div>
        `;
        return;
    }

    try {
        // 显示加载状态
        elements.storageUsageContent.innerHTML = `
            <div class="storage-loading" data-i18n="loadingStorage">${getMessage('loadingStorage') || '正在加载存储信息...'}</div>
        `;
        updateStorageUsageI18n();

        let usage = {};
        let response = null;

        // 首先尝试通过消息传递获取（更准确）
        try {
            response = await chrome.tabs.sendMessage(currentTab.id, {
                action: 'getStorageUsage'
            });
            
            if (response && response.success && response.usage) {
                usage = response.usage;
            } else {
                throw new Error('消息响应无效');
            }
        } catch (messageError) {
            // 如果消息传递失败，使用备用方案：直接执行脚本
            // 这是正常情况，当内容脚本未加载或页面刚加载时会发生
            usage = await getStorageUsageViaScript(currentTab.id);
            
            // 如果备用方案也失败，尝试异步获取 IndexedDB、Cache API 和 Service Worker
            if (usage && !usage.error) {
                // 异步存储数据获取配置
                const asyncStorageConfig = [
                    {
                        type: 'indexedDB',
                        check: () => 'indexedDB' in window && indexedDB.databases,
                        getData: async () => {
                            const databases = await indexedDB.databases();
                            return { count: databases.length, databases: databases.map(db => ({ name: db.name, version: db.version })) };
                        }
                    },
                    {
                        type: 'cacheAPI',
                        check: () => 'caches' in window,
                        getData: async () => {
                            const cacheNames = await caches.keys();
                            return { count: cacheNames.length, names: cacheNames };
                        }
                    },
                    {
                        type: 'serviceWorker',
                        check: () => 'serviceWorker' in navigator,
                        getData: async () => {
                            const registrations = await navigator.serviceWorker.getRegistrations();
                            return { count: registrations.length, scopes: registrations.map(reg => reg.scope) };
                        }
                    }
                ];

                // 并行获取所有异步存储数据
                const asyncStoragePromises = asyncStorageConfig.map(config =>
                    chrome.scripting.executeScript({
                        target: { tabId: currentTab.id },
                        func: async () => {
                            if (config.check()) {
                                try {
                                    return { type: config.type, data: await config.getData() };
                                } catch (e) {
                                    return { type: config.type, data: { count: 0 } };
                                }
                            }
                            return { type: config.type, data: { count: 0 } };
                        }
                    }).catch(() => ({ type: config.type, data: { count: 0 } }))
                );

                // 合并结果到 usage 对象
                try {
                    const asyncResults = await Promise.all(asyncStoragePromises);
                    asyncResults.forEach(result => {
                        const resultData = Array.isArray(result) && result[0]?.result ? result[0].result : result;
                        if (resultData?.type && resultData.data) {
                            usage[resultData.type] = resultData.data;
                        }
                    });
                } catch (e) {
                    // 忽略异步数据获取失败
                }
            }
        }

        // 如果获取失败，显示错误
        if (usage.error) {
            throw new Error(usage.error);
        }
        
        // 获取 Cookies 大小和数量
        const cookiesInfo = await getCookiesInfo(currentTab.url);
        const cookiesSize = cookiesInfo.size;
        const cookiesCount = cookiesInfo.count;

        // 计算总大小
        const estimatedSize = estimateStorageSize(usage) + cookiesSize;

        // 准备存储数据
        const storageTypes = ['localStorage', 'sessionStorage', 'indexedDB', 'cacheAPI'];
        const storageData = {};
        
        storageTypes.forEach(type => {
            storageData[type] = {
                count: validateStorageCount(usage[type]?.count),
                size: estimateStorageSize({ [type]: usage[type] })
            };
        });

        storageData.cookies = {
            count: validateStorageCount(cookiesCount),
            size: cookiesSize
        };
        storageData.serviceWorker = {
            count: validateStorageCount(usage.serviceWorker?.count)
        };
        storageData.total = { size: estimatedSize };

        renderStorageUsage(storageData);

    } catch (error) {
        const errorKey = error.message.includes('Cannot access') ? 'restrictedPageStorage' : 'storageLoadFailed';
        const errorMessage = getMessage(errorKey) || (errorKey === 'storageLoadFailed' ? `无法加载存储信息：${error.message}` : '此页面受浏览器保护，无法获取存储信息');
        elements.storageUsageContent.innerHTML = `
            <div class="storage-error" data-i18n="${errorKey}">${errorMessage}</div>
        `;
        updateStorageUsageI18n();
    }
}

/**
 * 渲染存储使用情况
 * @param {Object} data - 存储数据
 */
function renderStorageUsage(data) {
    // 存储项配置
    const storageConfig = [
        { key: 'localStorage', icon: '💾', fallback: 'LocalStorage' },
        { key: 'sessionStorage', icon: '📂', fallback: 'SessionStorage' },
        { key: 'cookies', icon: '🍪', fallback: 'Cookies' },
        { key: 'indexedDB', icon: '🗄️', fallback: 'IndexedDB' },
        { key: 'cacheAPI', icon: '📋', fallback: 'Cache API' }
    ];

    const storageItems = storageConfig.map(config => ({
        name: getMessage(config.key) || config.fallback,
        icon: config.icon,
        count: data[config.key].count,
        size: data[config.key].size,
        i18nKey: config.key
    }));

    // 过滤掉没有数据的项
    const activeItems = storageItems.filter(item => item.count > 0 || item.size > 0);

    if (activeItems.length === 0) {
        elements.storageUsageContent.innerHTML = `
            <div class="storage-empty" data-i18n="noStorageData">${getMessage('noStorageData') || '当前网站没有存储数据'}</div>
        `;
        updateStorageUsageI18n();
        return;
    }

    const maxSize = Math.max(...activeItems.map(item => item.size), 1);
    const itemsText = getMessage('items') || '项';
    const totalStorageText = getMessage('totalStorage') || '总存储：';

    // 生成 HTML
    const html = `
        <div class="storage-items">
            ${activeItems.map(item => {
                const percentage = (item.size / maxSize) * 100;
                return `
                    <div class="storage-item">
                        <div class="storage-item-header">
                            <span class="storage-item-icon">${item.icon}</span>
                            <span class="storage-item-name" data-i18n="${item.i18nKey}">${item.name}</span>
                            <span class="storage-item-count">${item.count} ${itemsText}</span>
                        </div>
                        <div class="storage-item-bar">
                            <div class="storage-item-bar-fill" style="width: ${percentage}%"></div>
                        </div>
                        <div class="storage-item-size">${formatBytes(item.size)}</div>
                    </div>
                `;
            }).join('')}
        </div>
        <div class="storage-total">
            <span class="storage-total-label" data-i18n="totalStorage">${totalStorageText}</span>
            <span class="storage-total-size">${formatBytes(data.total.size)}</span>
        </div>
    `;

    elements.storageUsageContent.innerHTML = html;

    // 更新国际化文本
    updateStorageUsageI18n();
}

/**
 * 更新存储使用情况区域的国际化文本
 */
function updateStorageUsageI18n() {
    // 更新标题
    const storageTitle = document.querySelector('.storage-title');
    if (storageTitle?.hasAttribute('data-i18n')) {
        const text = getMessage(storageTitle.getAttribute('data-i18n'));
        if (text && text !== storageTitle.getAttribute('data-i18n')) {
            storageTitle.textContent = text;
        }
    }

    if (!elements.storageUsageContent) return;

    // 更新所有带 data-i18n 属性的元素
    elements.storageUsageContent.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (!key) return;
        const text = getMessage(key);
        if (text && text !== key) {
            el.textContent = text;
        }
    });

    // 更新存储项数量单位
    const itemsText = getMessage('items') || '项';
    elements.storageUsageContent.querySelectorAll('.storage-item-count').forEach(el => {
        const match = el.textContent.match(/^(\d+)\s*/);
        if (match) {
            el.textContent = `${match[1]} ${itemsText}`;
        }
    });
}

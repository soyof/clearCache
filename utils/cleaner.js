/**
 * 清理工具模块
 * 提供各种清理操作的功能
 */

import { NotificationManager } from './notification.js';
import { BrowsingDataManager, LocalStorageManager, SessionStorageManager } from './storage.js';

/**
 * 清理管理器
 */
const CleanerManager = {
    /**
     * 清理当前网站数据
     * @param {Object} tab - 标签页对象
     * @param {Object} options - 清理选项
     * @returns {Promise<void>}
     */
    async clearCurrentWebsiteData(tab, options = {}) {
        try {
            const url = tab.url;
            const since = options.since ?? 0;
            const apiOptions = {
                since,
                origins: [url]
            };

            // 先并行清理主要数据（缓存、Cookies、IndexedDB），这些操作通常很快
            await Promise.all([
                BrowsingDataManager.clearCache(apiOptions),
                BrowsingDataManager.clearCookies(apiOptions),
                BrowsingDataManager.clearIndexedDB(apiOptions)
            ]);

            // localStorage/sessionStorage 在后台清理；按时间范围时也执行（等同清理全部）
            const tasks = [];
            tasks.push(
                BrowsingDataManager.clearLocalStorage(apiOptions).catch(() => {
                    return LocalStorageManager.clearInTab(tab.id);
                })
            );
            tasks.push(
                (async () => {
                    await SessionStorageManager.clearInTab(tab.id).catch(() => { });
                })()
            );

            await Promise.all(tasks).catch(() => { /* 静默处理后台清理错误 */ });

            NotificationManager.success('当前网站缓存已清空');
        } catch (error) {
            throw error;
        }
    },

    /**
     * 清理所有数据
     * @param {Object} tab - 标签页对象
     * @param {Object} settings - 设置
     * @param {Object} options - 额外选项
     * @returns {Promise<void>}
     */
    async clearAllData(tab, settings, options = {}) {
        try {
            const url = tab.url;
            const since = options.since ?? 0;

            // 定义清理选项
            const apiOptions = {
                since,
                origins: settings.includeProtected ? undefined : [url]
            };

            // 先并行清理主要数据（缓存、Cookies、IndexedDB），这些操作通常很快
            const mainDataTypes = [
                BrowsingDataManager.clearCache(apiOptions),
                BrowsingDataManager.clearCookies(apiOptions),
                BrowsingDataManager.clearIndexedDB(apiOptions)
            ];

            // 根据设置决定是否清理密码 (clearPasswords为true表示保留密码)
            if (!settings.clearPasswords) {
                mainDataTypes.push(BrowsingDataManager.clearPasswords(apiOptions));
            }

            // 根据设置决定是否清理表单数据 (clearFormData为true表示保留表单数据)
            if (!settings.clearFormData) {
                mainDataTypes.push(BrowsingDataManager.clearFormData(apiOptions));
            }

            // 执行主要清理操作
            await Promise.all(mainDataTypes);

            // localStorage/sessionStorage 在后台清理；按时间范围时也执行（等同清理全部）
            const backgroundTasks = [];
            backgroundTasks.push(
                BrowsingDataManager.clearLocalStorage(apiOptions).catch(() => {
                    return LocalStorageManager.clearInTab(tab.id);
                })
            );
            backgroundTasks.push(
                (async () => {
                    await SessionStorageManager.clearInTab(tab.id).catch(() => { });
                })()
            );

            await Promise.all(backgroundTasks).catch(() => { /* 静默处理后台清理错误 */ });

            NotificationManager.success('所有缓存已清空');
        } catch (error) {
            throw error;
        }
    },

    /**
     * 清理Cookies
     * @param {Object} tab - 标签页对象
     * @param {Object} options - 额外选项
     * @returns {Promise<void>}
     */
    async clearCookiesData(tab, options = {}) {
        try {
            const since = options.since ?? 0;
            await BrowsingDataManager.clearCookies({
                since,
                origins: [tab.url]
            });

            NotificationManager.success('Cookies 已清空');
        } catch (error) {
            throw error;
        }
    },

    /**
     * 清理LocalStorage
     * @param {Object} tab - 标签页对象
     * @returns {Promise<void>}
     */
    async clearLocalStorageData(tab) {
        try {
            await LocalStorageManager.clearInTab(tab.id);
            NotificationManager.success('LocalStorage 已清空');
        } catch (error) {
            throw error;
        }
    },

    /**
     * 清理SessionStorage
     * @param {Object} tab - 标签页对象
     * @returns {Promise<void>}
     */
    async clearSessionStorageData(tab) {
        try {
            await SessionStorageManager.clearInTab(tab.id);
            NotificationManager.success('SessionStorage 已清空');
        } catch (error) {
            throw error;
        }
    },

    /**
     * 清理IndexedDB
     * @param {Object} tab - 标签页对象
     * @param {Object} options - 额外选项
     * @returns {Promise<void>}
     */
    async clearIndexedDBData(tab, options = {}) {
        try {
            const since = options.since ?? 0;
            await BrowsingDataManager.clearIndexedDB({
                since,
                origins: [tab.url]
            });

            NotificationManager.success('IndexedDB 已清空');
        } catch (error) {
            throw error;
        }
    },

    /**
     * 清理历史记录
     * @param {Object} options - 额外选项
     * @returns {Promise<void>}
     */
    async clearHistoryData(options = {}) {
        try {
            const since = options.since ?? 0;
            await BrowsingDataManager.clearHistory({ since });
            NotificationManager.success('历史记录已清空');
        } catch (error) {
            throw error;
        }
    },

    /**
     * 清理下载记录
     * @param {Object} options - 额外选项
     * @returns {Promise<void>}
     */
    async clearDownloadsData(options = {}) {
        try {
            const since = options.since ?? 0;
            await BrowsingDataManager.clearDownloads({ since });
            NotificationManager.success('下载记录已清空');
        } catch (error) {
            throw error;
        }
    },

    /**
     * 清理下载文件
     * @returns {Promise<void>}
     */
    async clearDownloadFiles() {
        try {
            // 获取所有下载项
            const downloads = await chrome.downloads.search({});

            // 删除每个下载文件
            for (const download of downloads) {
                if (download.exists) {
                    try {
                        await chrome.downloads.removeFile(download.id);
                    } catch (e) {
                        // 忽略单个文件删除错误
                    }
                }
            }

            // 清除下载记录
            await chrome.downloads.erase({});

            NotificationManager.success('下载文件已清除');
        } catch (error) {
            throw error;
        }
    },

    /**
     * 清空缓存并硬性重新加载（保留登录状态）
     * @param {Object} tab - 标签页对象
     * @param {Object} options - 额外选项
     * @returns {Promise<void>}
     */
    async hardReloadCacheOnly(tab, options = {}) {
        try {
            const url = tab.url;
            const since = options.since ?? 0;

            // 只清理文件缓存，不清理 Cookies 和用户数据
            await BrowsingDataManager.clearCache({
                since,
                origins: [url]
            });

            // 清理 Service Worker 缓存和 Cache API
            try {
                await chrome.tabs.sendMessage(tab.id, {
                    action: 'clearPageStorage',
                    types: ['cacheAPI', 'serviceWorker']
                }).catch(() => { });
            } catch (error) {
                // 忽略错误
            }

            // 重新加载页面（绕过缓存）
            await chrome.tabs.reload(tab.id, { bypassCache: true });

            NotificationManager.success('缓存已清空，页面正在重载');
        } catch (error) {
            throw error;
        }
    },

    /**
     * 清空所有数据并硬性重新加载（包括登录状态）
     * @param {Object} tab - 标签页对象
     * @param {Object} settings - 清理选项设置（可选）
     * @param {Object} options - 额外选项
     * @returns {Promise<void>}
     */
    async hardReloadPage(tab, settings, options = {}) {
        try {
            // 如果没有传递 settings，使用默认值
            const defaultSettings = {
                clearPasswords: true,
                clearFormData: true,
                includeProtected: false
            };
            const finalSettings = settings || defaultSettings;
            const since = options.since ?? 0;

            // 先清理所有数据
            await this.clearAllData(tab, finalSettings, { since });

            // 重新加载页面
            await chrome.tabs.reload(tab.id, { bypassCache: true });

            NotificationManager.info('所有数据已清空，页面正在重载');
        } catch (error) {
            // 即使清理失败，也尝试重载页面
            try {
                await chrome.tabs.reload(tab.id, { bypassCache: true });
            } catch (reloadError) {
                // 忽略重载错误
            }
            throw error;
        }
    },

    /**
     * 正常重新加载
     * @param {Object} tab - 标签页对象
     * @returns {Promise<void>}
     */
    async normalReload(tab) {
        try {
            // 普通重新加载页面
            await chrome.tabs.reload(tab.id);
            NotificationManager.success('页面正在重新加载');
        } catch (error) {
            throw error;
        }
    },

    /**
     * 硬性重新加载（绕过缓存）
     * @param {Object} tab - 标签页对象
     * @returns {Promise<void>}
     */
    async hardReloadOnly(tab) {
        try {
            // 硬性重新加载页面（绕过缓存）
            await chrome.tabs.reload(tab.id, { bypassCache: true });
            NotificationManager.success('页面正在硬性重新加载');
        } catch (error) {
            throw error;
        }
    }
};

export { CleanerManager };


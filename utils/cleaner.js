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
            const apiOptions = {
                since: 0,
                origins: [url]
            };
            
            // 并行清理浏览器数据
            await Promise.all([
                BrowsingDataManager.clearCache(apiOptions),
                BrowsingDataManager.clearCookies(apiOptions),
                BrowsingDataManager.clearIndexedDB(apiOptions)
            ]);
            
            // 清理localStorage
            await LocalStorageManager.clearInTab(tab.id);
            
            // 清理sessionStorage
            await SessionStorageManager.clearInTab(tab.id);
            
            NotificationManager.success('当前网站缓存已清空');
        } catch (error) {
            throw error;
        }
    },
    
    /**
     * 清理所有数据
     * @param {Object} tab - 标签页对象
     * @param {Object} settings - 设置
     * @returns {Promise<void>}
     */
    async clearAllData(tab, settings) {
        try {
            const url = tab.url;
            
            // 定义清理选项
            const apiOptions = {
                since: 0,
                origins: settings.includeProtected ? undefined : [url]
            };
            
            // 定义要清理的数据类型
            const dataTypes = [
                BrowsingDataManager.clearCache(apiOptions),
                BrowsingDataManager.clearCookies(apiOptions),
                BrowsingDataManager.clearIndexedDB(apiOptions)
            ];
            
            // 根据设置决定是否清理密码 (clearPasswords为true表示保留密码)
            if (!settings.clearPasswords) {
                dataTypes.push(BrowsingDataManager.clearPasswords(apiOptions));
            }
            
            // 根据设置决定是否清理表单数据 (clearFormData为true表示保留表单数据)
            if (!settings.clearFormData) {
                dataTypes.push(BrowsingDataManager.clearFormData(apiOptions));
            }
            
            // 并行执行所有清理操作
            await Promise.all(dataTypes);
            
            // 清理localStorage
            await LocalStorageManager.clearInTab(tab.id);
            
            // 清理sessionStorage
            await SessionStorageManager.clearInTab(tab.id);
            
            NotificationManager.success('所有缓存已清空');
        } catch (error) {
            throw error;
        }
    },
    
    /**
     * 清理Cookies
     * @param {Object} tab - 标签页对象
     * @returns {Promise<void>}
     */
    async clearCookiesData(tab) {
        try {
            await BrowsingDataManager.clearCookies({
                since: 0,
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
     * @returns {Promise<void>}
     */
    async clearIndexedDBData(tab) {
        try {
            await BrowsingDataManager.clearIndexedDB({
                since: 0,
                origins: [tab.url]
            });
            
            NotificationManager.success('IndexedDB 已清空');
        } catch (error) {
            throw error;
        }
    },
    
    /**
     * 清理历史记录
     * @returns {Promise<void>}
     */
    async clearHistoryData() {
        try {
            await BrowsingDataManager.clearHistory({ since: 0 });
            NotificationManager.success('历史记录已清空');
        } catch (error) {
            throw error;
        }
    },
    
    /**
     * 清理下载记录
     * @returns {Promise<void>}
     */
    async clearDownloadsData() {
        try {
            await BrowsingDataManager.clearDownloads({ since: 0 });
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
     * @returns {Promise<void>}
     */
    async hardReloadCacheOnly(tab) {
        try {
            const url = tab.url;
            
            // 只清理文件缓存，不清理 Cookies 和用户数据
            await BrowsingDataManager.clearCache({
                since: 0,
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
     * @returns {Promise<void>}
     */
    async hardReloadPage(tab, settings) {
        try {
            // 如果没有传递 settings，使用默认值
            const defaultSettings = {
                clearPasswords: true,
                clearFormData: true,
                includeProtected: false
            };
            const finalSettings = settings || defaultSettings;
            
            // 先清理所有数据
            await this.clearAllData(tab, finalSettings);
            
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


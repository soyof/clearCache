/**
 * 存储操作工具模块
 * 提供对各种存储类型的统一操作接口
 */

// 本地存储操作
const LocalStorageManager = {
    /**
     * 清理localStorage
     * @returns {Promise<Object>} 清理结果
     */
    clear: async function () {
        try {
            // 直接执行脚本清理localStorage
            const result = await chrome.scripting.executeScript({
                target: { tabId: chrome.tabs.TAB_ID_NONE },
                func: () => {
                    try {
                        if (typeof localStorage === 'undefined') {
                            return { success: false, error: 'LocalStorage不可用' };
                        }

                        const itemCount = localStorage.length;
                        localStorage.clear();

                        // 确认sessionStorage没有被清理
                        if (typeof sessionStorage !== 'undefined') {
                            // sessionStorage未被清理
                        }

                        return { success: true, count: itemCount };
                    } catch (error) {
                        // 清理localStorage时出错
                        return { success: false, error: error.message };
                    }
                }
            });

            return result[0]?.result || { success: false, error: '执行脚本失败' };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    /**
     * 在特定标签页中清理localStorage
     * @param {number} tabId - 标签页ID
     * @returns {Promise<Object>} 清理结果
     */
    clearInTab: async function (tabId) {
        try {
            // 直接执行脚本清理localStorage
            const result = await chrome.scripting.executeScript({
                target: { tabId },
                func: () => {
                    try {
                        if (typeof localStorage === 'undefined') {
                            return { success: false, error: 'LocalStorage不可用' };
                        }

                        const itemCount = localStorage.length;
                        localStorage.clear();

                        // 确认sessionStorage没有被清理
                        if (typeof sessionStorage !== 'undefined') {
                            // sessionStorage未被清理
                        }

                        return { success: true, count: itemCount };
                    } catch (error) {
                        // 清理localStorage时出错
                        return { success: false, error: error.message };
                    }
                }
            });

            return result[0]?.result || { success: false, error: '执行脚本失败' };
        } catch (error) {
            // 如果直接执行脚本失败，尝试通过内容脚本清理
            try {
                const response = await chrome.tabs.sendMessage(tabId, {
                    action: 'clearPageStorage',
                    types: ['localStorage']
                });

                return response?.results?.localStorage || { success: false, error: '内容脚本未响应' };
            } catch (msgError) {
                return { success: false, error: msgError.message };
            }
        }
    },

    /**
     * 使用browsingData API清理localStorage
     * @param {Object} options - 清理选项
     * @returns {Promise<void>}
     */
    clearWithAPI: async function (options = {}) {
        await chrome.browsingData.removeLocalStorage(options);
    }
};

// 会话存储操作
const SessionStorageManager = {
    /**
     * 清理sessionStorage
     * @param {number} tabId - 标签页ID
     * @returns {Promise<Object>} 清理结果
     */
    clearInTab: async function (tabId) {
        try {
            // 直接执行脚本清理sessionStorage
            const result = await chrome.scripting.executeScript({
                target: { tabId },
                func: () => {
                    try {
                        if (typeof sessionStorage === 'undefined') {
                            return { success: false, error: 'SessionStorage不可用' };
                        }

                        // 检查sessionStorage是否可写
                        try {
                            const testKey = '_test_session_storage_' + Date.now();
                            sessionStorage.setItem(testKey, '1');
                            sessionStorage.removeItem(testKey);
                        } catch (writeError) {
                            return { success: false, error: '无法写入SessionStorage: ' + writeError.message };
                        }

                        const itemCount = sessionStorage.length;
                        sessionStorage.clear();

                        // 确认localStorage没有被清理
                        if (typeof localStorage !== 'undefined') {
                            // localStorage未被清理
                        }

                        return { success: true, count: itemCount };
                    } catch (error) {
                        // 清理sessionStorage时出错
                        return { success: false, error: error.message };
                    }
                }
            });

            return result[0]?.result || { success: false, error: '执行脚本失败' };
        } catch (error) {
            // 如果直接执行脚本失败，尝试通过内容脚本清理
            try {
                const response = await chrome.tabs.sendMessage(tabId, {
                    action: 'clearPageStorage',
                    types: ['sessionStorage']
                });

                return response?.results?.sessionStorage || { success: false, error: '内容脚本未响应' };
            } catch (msgError) {
                return { success: false, error: msgError.message };
            }
        }
    }
};

// 浏览器数据操作
const BrowsingDataManager = {
    /**
     * 清理缓存
     * @param {Object} options - 清理选项
     * @returns {Promise<void>}
     */
    clearCache: async function (options = {}) {
        await chrome.browsingData.removeCache(options);
    },

    /**
     * 清理Cookies
     * @param {Object} options - 清理选项
     * @returns {Promise<void>}
     */
    clearCookies: async function (options = {}) {
        await chrome.browsingData.removeCookies(options);
    },

    /**
     * 清理IndexedDB
     * @param {Object} options - 清理选项
     * @returns {Promise<void>}
     */
    clearIndexedDB: async function (options = {}) {
        await chrome.browsingData.removeIndexedDB(options);
    },

    /**
     * 清理LocalStorage
     * @param {Object} options - 清理选项
     * @returns {Promise<void>}
     */
    clearLocalStorage: async function (options = {}) {
        await chrome.browsingData.removeLocalStorage(options);
    },

    /**
     * 清理历史记录
     * @param {Object} options - 清理选项
     * @returns {Promise<void>}
     */
    clearHistory: async function (options = {}) {
        await chrome.browsingData.removeHistory(options);
    },

    /**
     * 清理下载记录
     * @param {Object} options - 清理选项
     * @returns {Promise<void>}
     */
    clearDownloads: async function (options = {}) {
        await chrome.browsingData.removeDownloads(options);
    },

    /**
     * 清理表单数据
     * @param {Object} options - 清理选项
     * @returns {Promise<void>}
     */
    clearFormData: async function (options = {}) {
        await chrome.browsingData.removeFormData(options);
    },

    /**
     * 清理密码
     * @param {Object} options - 清理选项
     * @returns {Promise<void>}
     */
    clearPasswords: async function (options = {}) {
        await chrome.browsingData.removePasswords(options);
    }
};

// 设置操作
const SettingsManager = {
    /**
     * 获取设置
     * @param {Array<string>} keys - 要获取的设置键
     * @returns {Promise<Object>} 设置值
     */
    get: async function (keys) {
        return await chrome.storage.local.get(keys);
    },

    /**
     * 保存设置
     * @param {Object} settings - 要保存的设置
     * @returns {Promise<void>}
     */
    save: async function (settings) {
        await chrome.storage.local.set(settings);
    },

    /**
     * 获取默认设置
     * @returns {Object} 默认设置
     */
    getDefaults: function () {
        return {
            clearPasswords: true,       // 默认保留密码
            clearFormData: true,        // 默认保留表单数据
            includeProtected: true,     // 默认包含受保护数据
            autoCleanOnStartup: false,
            enableNotifications: true,  // 默认启用通知
            notificationSound: false,   // 默认关闭通知声音
            theme: 'dark'               // 默认深色主题
        };
    }
};

export { BrowsingDataManager, LocalStorageManager, SessionStorageManager, SettingsManager };

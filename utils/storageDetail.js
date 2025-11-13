/**
 * 存储详情查看工具模块
 * 提供存储详情数据的获取和展示功能
 */

/**
 * 获取存储类型的详细数据
 * @param {string} storageType - 存储类型 (localStorage, sessionStorage, cookies, indexedDB, cacheAPI)
 * @param {Object} tab - 当前标签页对象
 * @param {string} url - 当前页面URL
 * @returns {Promise<Object>} 详细数据
 */
export async function getStorageDetail(storageType, tab, url) {
    if (!tab || !tab.id) {
        throw new Error('无法获取当前标签页');
    }

    try {
        switch (storageType) {
            case 'localStorage':
                return await getLocalStorageDetail(tab.id);
            case 'sessionStorage':
                return await getSessionStorageDetail(tab.id);
            case 'cookies':
                return await getCookiesDetail(url);
            case 'indexedDB':
                return await getIndexedDBDetail(tab.id);
            case 'cacheAPI':
                return await getCacheAPIDetail(tab.id);
            default:
                throw new Error(`不支持的存储类型: ${storageType}`);
        }
    } catch (error) {
        throw new Error(`获取${storageType}详情失败: ${error.message}`);
    }
}

/**
 * 获取 LocalStorage 详细数据
 * @param {number} tabId - 标签页ID
 * @returns {Promise<Object>} LocalStorage 详细数据
 */
async function getLocalStorageDetail(tabId) {
    try {
        const results = await chrome.scripting.executeScript({
            target: { tabId },
            func: () => {
                const items = [];
                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    const value = localStorage.getItem(key);
                    items.push({
                        key: key,
                        value: value,
                        size: (key?.length || 0) + (value?.length || 0)
                    });
                }
                return items;
            }
        });
        
        const items = results[0]?.result || [];
        return {
            type: 'localStorage',
            items: items,
            total: items.length
        };
    } catch (error) {
        throw new Error(`获取LocalStorage详情失败: ${error.message}`);
    }
}

/**
 * 获取 SessionStorage 详细数据
 * @param {number} tabId - 标签页ID
 * @returns {Promise<Object>} SessionStorage 详细数据
 */
async function getSessionStorageDetail(tabId) {
    try {
        const results = await chrome.scripting.executeScript({
            target: { tabId },
            func: () => {
                const items = [];
                for (let i = 0; i < sessionStorage.length; i++) {
                    const key = sessionStorage.key(i);
                    const value = sessionStorage.getItem(key);
                    items.push({
                        key: key,
                        value: value,
                        size: (key?.length || 0) + (value?.length || 0)
                    });
                }
                return items;
            }
        });
        
        const items = results[0]?.result || [];
        return {
            type: 'sessionStorage',
            items: items,
            total: items.length
        };
    } catch (error) {
        throw new Error(`获取SessionStorage详情失败: ${error.message}`);
    }
}

/**
 * 获取 Cookies 详细数据
 * @param {string} url - 当前页面URL
 * @returns {Promise<Object>} Cookies 详细数据
 */
async function getCookiesDetail(url) {
    try {
        const domain = getDomainFromUrl(url);
        if (!domain) {
            return { type: 'cookies', items: [], total: 0 };
        }

        // 获取该域名的所有 cookies
        const allCookies = await chrome.cookies.getAll({ domain });
        const urlCookies = await chrome.cookies.getAll({ url }).catch(() => []);
        
        // 合并并去重
        const cookieMap = new Map();
        allCookies.forEach(cookie => {
            const key = `${cookie.name}|${cookie.domain}|${cookie.path}`;
            cookieMap.set(key, cookie);
        });
        urlCookies.forEach(cookie => {
            const key = `${cookie.name}|${cookie.domain}|${cookie.path}`;
            cookieMap.set(key, cookie);
        });
        
        const cookies = Array.from(cookieMap.values());
        const items = cookies.map(cookie => ({
            name: cookie.name,
            value: cookie.value,
            domain: cookie.domain,
            path: cookie.path,
            secure: cookie.secure,
            httpOnly: cookie.httpOnly,
            sameSite: cookie.sameSite,
            expirationDate: cookie.expirationDate,
            size: (cookie.name?.length || 0) + (cookie.value?.length || 0) + 
                  (cookie.domain?.length || 0) + (cookie.path?.length || 0)
        }));
        
        return {
            type: 'cookies',
            items: items,
            total: items.length
        };
    } catch (error) {
        throw new Error(`获取Cookies详情失败: ${error.message}`);
    }
}

/**
 * 获取 IndexedDB 详细数据
 * @param {number} tabId - 标签页ID
 * @returns {Promise<Object>} IndexedDB 详细数据
 */
async function getIndexedDBDetail(tabId) {
    try {
        const results = await chrome.scripting.executeScript({
            target: { tabId },
            func: async () => {
                if (!('indexedDB' in window) || !indexedDB.databases) {
                    return [];
                }
                const databases = await indexedDB.databases();
                return databases.map(db => ({
                    name: db.name,
                    version: db.version
                }));
            }
        });
        
        const databases = results[0]?.result || [];
        return {
            type: 'indexedDB',
            items: databases,
            total: databases.length
        };
    } catch (error) {
        throw new Error(`获取IndexedDB详情失败: ${error.message}`);
    }
}

/**
 * 获取 Cache API 详细数据
 * @param {number} tabId - 标签页ID
 * @returns {Promise<Object>} Cache API 详细数据
 */
async function getCacheAPIDetail(tabId) {
    try {
        const results = await chrome.scripting.executeScript({
            target: { tabId },
            func: async () => {
                if (!('caches' in window)) {
                    return [];
                }
                const cacheNames = await caches.keys();
                const cacheDetails = [];
                
                for (const cacheName of cacheNames) {
                    try {
                        const cache = await caches.open(cacheName);
                        const keys = await cache.keys();
                        cacheDetails.push({
                            name: cacheName,
                            count: keys.length,
                            urls: Array.from(keys).slice(0, 10).map(request => 
                                typeof request === 'string' ? request : request.url
                            )
                        });
                    } catch (e) {
                        cacheDetails.push({
                            name: cacheName,
                            count: 0,
                            urls: []
                        });
                    }
                }
                
                return cacheDetails;
            }
        });
        
        const caches = results[0]?.result || [];
        return {
            type: 'cacheAPI',
            items: caches,
            total: caches.length
        };
    } catch (error) {
        throw new Error(`获取Cache API详情失败: ${error.message}`);
    }
}

/**
 * 从 URL 中提取域名
 * @param {string} url - 网站URL
 * @returns {string|null} 域名
 */
function getDomainFromUrl(url) {
    try {
        if (!url) return null;
        const urlObj = new URL(url);
        return urlObj.hostname;
    } catch (error) {
        const match = url.match(/^(?:https?:\/\/)?(?:www\.)?([^\/]+)/i);
        return match ? match[1] : null;
    }
}

/**
 * 格式化值显示（截断过长内容）
 * @param {string} value - 要格式化的值
 * @param {number} maxLength - 最大长度
 * @returns {string} 格式化后的值
 */
export function formatValue(value, maxLength = 100) {
    if (value === null || value === undefined) return '';
    const str = String(value);
    if (str.length <= maxLength) return str;
    return str.substring(0, maxLength) + '...';
}

/**
 * 格式化日期显示
 * @param {number} timestamp - 时间戳
 * @returns {string} 格式化后的日期
 */
export function formatDate(timestamp) {
    if (!timestamp) return '-';
    const date = new Date(timestamp * 1000);
    return date.toLocaleString('zh-CN');
}


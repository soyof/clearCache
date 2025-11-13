/**
 * 存储使用情况工具模块
 * 提供存储使用情况相关的计算和获取功能
 */

/**
 * 格式化字节大小
 * @param {number} bytes - 字节数
 * @returns {string} 格式化后的大小
 */
export function formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

/**
 * 估算存储大小
 * @param {Object} storageData - 存储数据
 * @returns {number} 估算的字节数
 */
export function estimateStorageSize(storageData) {
    let size = 0;
    
    // 估算 LocalStorage 大小
    if (storageData.localStorage) {
        if (storageData.localStorage.keys && storageData.localStorage.keys.length > 0) {
            // 如果有 keys，估算每个 key-value 对的大小
            // 假设平均每个 key 20字节，每个 value 200字节
            size += storageData.localStorage.keys.length * 220;
        } else {
            // 使用计数估算
            size += (storageData.localStorage.count || 0) * 220; // 假设每个项平均220字节
        }
    }
    
    // 估算 SessionStorage 大小
    if (storageData.sessionStorage) {
        if (storageData.sessionStorage.keys && storageData.sessionStorage.keys.length > 0) {
            size += storageData.sessionStorage.keys.length * 220;
        } else {
            size += (storageData.sessionStorage.count || 0) * 220;
        }
    }
    
    // IndexedDB 大小估算（较复杂，使用粗略估算）
    if (storageData.indexedDB && storageData.indexedDB.count) {
        size += storageData.indexedDB.count * 5000; // 假设每个数据库平均5KB
    }
    
    // Cache API 大小估算
    if (storageData.cacheAPI && storageData.cacheAPI.count) {
        size += storageData.cacheAPI.count * 10000; // 假设每个缓存平均10KB
    }
    
    return size;
}

/**
 * 从 URL 中提取域名
 * @param {string} url - 网站URL
 * @returns {string|null} 域名
 */
export function getDomainFromUrl(url) {
    try {
        if (!url) return null;
        const urlObj = new URL(url);
        return urlObj.hostname;
    } catch (error) {
        // 如果 URL 解析失败，尝试手动提取
        const match = url.match(/^(?:https?:\/\/)?(?:www\.)?([^\/]+)/i);
        return match ? match[1] : null;
    }
}

/**
 * 获取 Cookies 大小和数量（通过 API）
 * @param {string} url - 网站URL
 * @returns {Promise<{size: number, count: number}>} Cookies 大小和数量
 */
export async function getCookiesInfo(url) {
    try {
        const domain = getDomainFromUrl(url);
        if (!domain) {
            return { size: 0, count: 0 };
        }

        // 获取该域名的所有 cookies（包括子域名）
        const allCookies = await chrome.cookies.getAll({ domain });
        
        // 也获取当前 URL 的 cookies（可能有一些路径特定的 cookies）
        const urlCookies = await chrome.cookies.getAll({ url }).catch(() => []);
        
        // 合并并去重（基于 name + domain + path）
        const cookieMap = new Map();
        
        // 先添加域名 cookies
        allCookies.forEach(cookie => {
            const key = `${cookie.name}|${cookie.domain}|${cookie.path}`;
            cookieMap.set(key, cookie);
        });
        
        // 再添加 URL cookies（可能覆盖或添加新的）
        urlCookies.forEach(cookie => {
            const key = `${cookie.name}|${cookie.domain}|${cookie.path}`;
            cookieMap.set(key, cookie);
        });
        
        const cookies = Array.from(cookieMap.values());
        let size = 0;
        cookies.forEach(cookie => {
            size += cookie.name.length + (cookie.value?.length || 0) + (cookie.domain?.length || 0) + (cookie.path?.length || 0);
        });
        
        return {
            size: size,
            count: cookies.length
        };
    } catch (error) {
        console.warn('获取 Cookies 信息失败:', error);
        return { size: 0, count: 0 };
    }
}

/**
 * 验证并规范化存储数量
 * @param {*} count - 存储数量（可能是字符串或数字）
 * @returns {number} 有效的非负整数
 */
export function validateStorageCount(count) {
    return Math.max(0, parseInt(count || 0, 10));
}

/**
 * 检查是否为受限制的页面
 * @param {string} url - 页面URL
 * @returns {boolean} 是否为受限制的页面
 */
export function isRestrictedPage(url) {
    if (!url) return true;
    
    const restrictedProtocols = [
        'chrome://',
        'chrome-extension://',
        'edge://',
        'about:',
        'view-source:',
        'data:',
        'javascript:'
    ];
    
    return restrictedProtocols.some(protocol => url.startsWith(protocol));
}

/**
 * 通过脚本获取存储使用情况（备用方案）
 * @param {number} tabId - 标签页ID
 * @returns {Promise<Object>} 存储使用情况数据
 */
export async function getStorageUsageViaScript(tabId) {
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


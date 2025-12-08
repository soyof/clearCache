/**
 * 域名过滤模块
 * 提供黑白名单功能，用于控制清理、右键菜单、存储扫描等操作
 */

import { SettingsManager } from './storage.js';

/**
 * 域名过滤器
 */
class DomainFilter {
    constructor() {
        this.cache = {
            whitelist: null,
            blacklist: null,
            mode: null // 'whitelist' | 'blacklist' | 'disabled'
        };
    }

    /**
     * 从URL提取域名
     * @param {string} url - 完整URL
     * @returns {string} 域名
     */
    extractDomain(url) {
        if (!url) return '';
        try {
            const urlObj = new URL(url);
            return urlObj.hostname;
        } catch (e) {
            // 如果URL解析失败，尝试简单提取
            const match = url.match(/^(?:https?:\/\/)?([^\/]+)/);
            return match ? match[1] : '';
        }
    }

    /**
     * 检查域名是否匹配列表中的规则
     * @param {string} domain - 域名
     * @param {Array<string>} list - 规则列表
     * @returns {boolean} 是否匹配
     */
    matchesDomain(domain, list) {
        if (!domain || !list || list.length === 0) return false;

        const normalizedDomain = domain.toLowerCase().trim();

        return list.some(rule => {
            const normalizedRule = rule.toLowerCase().trim();
            if (!normalizedRule) return false;

            // 精确匹配
            if (normalizedRule === normalizedDomain) {
                return true;
            }

            // 通配符匹配：*.example.com
            if (normalizedRule.startsWith('*.')) {
                const suffix = normalizedRule.slice(2);
                return normalizedDomain === suffix || normalizedDomain.endsWith('.' + suffix);
            }

            // 子域名匹配：example.com 匹配 www.example.com
            if (normalizedDomain.endsWith('.' + normalizedRule)) {
                return true;
            }

            return false;
        });
    }

    /**
     * 加载黑白名单设置
     * @returns {Promise<void>}
     */
    async loadSettings() {
        try {
            const settings = await SettingsManager.get([
                'domainWhitelist',
                'domainBlacklist',
                'domainFilterMode'
            ]);

            this.cache.whitelist = settings.domainWhitelist || [];
            this.cache.blacklist = settings.domainBlacklist || [];
            this.cache.mode = settings.domainFilterMode || 'disabled';
        } catch (error) {
            console.warn('加载域名过滤设置失败:', error);
            this.cache.whitelist = [];
            this.cache.blacklist = [];
            this.cache.mode = 'disabled';
        }
    }

    /**
     * 检查域名是否被允许
     * @param {string} url - 完整URL或域名
     * @param {string} operation - 操作类型：'cleanup' | 'contextMenu' | 'storageScan'
     * @returns {Promise<boolean>} 是否允许
     */
    async isAllowed(url, operation = 'cleanup') {
        // 如果未加载设置，先加载
        if (this.cache.mode === null) {
            await this.loadSettings();
        }

        // 如果禁用过滤，允许所有操作
        if (this.cache.mode === 'disabled') {
            return true;
        }

        const domain = this.extractDomain(url);
        if (!domain) {
            // 如果无法提取域名，默认允许（避免误拦截）
            return true;
        }

        if (this.cache.mode === 'whitelist') {
            // 白名单模式：只有在白名单中的才允许
            return this.matchesDomain(domain, this.cache.whitelist);
        } else if (this.cache.mode === 'blacklist') {
            // 黑名单模式：在黑名单中的不允许
            return !this.matchesDomain(domain, this.cache.blacklist);
        }

        return true;
    }

    /**
     * 检查域名是否被阻止
     * @param {string} url - 完整URL或域名
     * @param {string} operation - 操作类型
     * @returns {Promise<boolean>} 是否被阻止
     */
    async isBlocked(url, operation = 'cleanup') {
        return !(await this.isAllowed(url, operation));
    }

    /**
     * 清除缓存（当设置更新时调用）
     */
    clearCache() {
        this.cache.whitelist = null;
        this.cache.blacklist = null;
        this.cache.mode = null;
    }

    /**
     * 保存黑白名单设置
     * @param {Object} settings - 设置对象
     * @returns {Promise<void>}
     */
    async saveSettings(settings) {
        try {
            await SettingsManager.save({
                domainWhitelist: settings.whitelist || [],
                domainBlacklist: settings.blacklist || [],
                domainFilterMode: settings.mode || 'disabled'
            });
            this.clearCache();
        } catch (error) {
            console.error('保存域名过滤设置失败:', error);
            throw error;
        }
    }

    /**
     * 获取当前设置
     * @returns {Promise<Object>} 设置对象
     */
    async getSettings() {
        if (this.cache.mode === null) {
            await this.loadSettings();
        }
        return {
            whitelist: [...(this.cache.whitelist || [])],
            blacklist: [...(this.cache.blacklist || [])],
            mode: this.cache.mode || 'disabled'
        };
    }
}

// 创建单例
const domainFilter = new DomainFilter();

export default domainFilter;


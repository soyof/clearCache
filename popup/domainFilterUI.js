/**
 * 域名过滤UI管理模块
 * 处理黑白名单设置的UI交互
 */

import domainAddModal from '../utils/domainAddModal.js';
import domainFilter from '../utils/domainFilter.js';
import { StatusManager, getMessage } from '../utils/index.js';

/**
 * 域名过滤UI管理器
 */
class DomainFilterUI {
    constructor() {
        this.elements = null;
        this.settings = {
            whitelist: [],
            blacklist: [],
            mode: 'disabled'
        };
    }

    /**
     * 初始化UI
     * @param {Object} elements - DOM元素对象
     */
    async init(elements) {
        this.elements = elements;
        await this.loadSettings();
        // 初始化域名添加弹窗（延迟初始化，确保 getMessage 已准备好）
        setTimeout(() => {
            if (typeof getMessage === 'function') {
                domainAddModal.init(getMessage);
            }
        }, 100);
        this.bindEvents();
        this.render();
    }

    /**
     * 加载设置
     */
    async loadSettings() {
        try {
            this.settings = await domainFilter.getSettings();
        } catch (error) {
            console.warn('加载域名过滤设置失败:', error);
        }
    }

    /**
     * 绑定事件
     */
    bindEvents() {
        if (!this.elements) return;

        // 模式切换
        if (this.elements.filterModeSelect) {
            this.elements.filterModeSelect.addEventListener('change', async (e) => {
                this.settings.mode = e.target.value;
                this.updateUI();
                // 立即保存
                await this.saveSettings();
            });
        }

        // 添加白名单域名 - 打开弹窗
        if (this.elements.addWhitelistBtn) {
            this.elements.addWhitelistBtn.addEventListener('click', () => {
                this.showAddModal('whitelist');
            });
        }

        // 添加黑名单域名 - 打开弹窗
        if (this.elements.addBlacklistBtn) {
            this.elements.addBlacklistBtn.addEventListener('click', () => {
                this.showAddModal('blacklist');
            });
        }
    }

    /**
     * 显示添加域名弹窗
     * @param {string} type - 'whitelist' | 'blacklist'
     */
    showAddModal(type) {
        domainAddModal.show(type, async (domains) => {
            return await this.addDomains(type, domains);
        });
    }

    /**
     * 批量添加域名（从弹窗回调）
     * @param {string} type - 'whitelist' | 'blacklist'
     * @param {string[]} domains - 域名数组
     * @returns {Promise<boolean>} 是否添加成功
     */
    async addDomains(type, domains) {
        if (!domains || domains.length === 0) {
            return false;
        }

        const list = this.settings[type];
        let addedCount = 0;
        let skippedCount = 0;

        domains.forEach(domain => {
            // 验证域名格式
            if (!this.validateDomain(domain)) {
                skippedCount++;
                return;
            }

            // 检查是否已存在
            if (list.includes(domain)) {
                skippedCount++;
                return;
            }

            list.push(domain);
            addedCount++;
        });

        if (addedCount > 0) {
            this.render();
            // 立即保存
            await this.saveSettings();
        }

        // 显示添加结果提示
        if (addedCount > 0 && skippedCount === 0) {
            const message = getMessage('domainsAddedSuccess') || '成功添加 %d 个域名';
            StatusManager.show(
                this.elements.status,
                this.elements.statusContainer,
                message.replace(/%d/g, addedCount),
                'success'
            );
        } else if (addedCount > 0 && skippedCount > 0) {
            const message = getMessage('domainsAddedPartial') || '成功添加 %d 个域名，跳过 %d 个';
            // 替换第一个 %d 为 addedCount，第二个 %d 为 skippedCount
            const formattedMessage = message.replace(/%d/, addedCount).replace(/%d/, skippedCount);
            StatusManager.show(
                this.elements.status,
                this.elements.statusContainer,
                formattedMessage,
                'warning'
            );
        } else if (skippedCount > 0) {
            StatusManager.show(
                this.elements.status,
                this.elements.statusContainer,
                getMessage('domainsAddedFailed') || '所有域名都已存在或格式无效',
                'error'
            );
            return false;
        }

        return true;
    }

    /**
     * 删除域名（带二次确认）
     * @param {string} type - 'whitelist' | 'blacklist'
     * @param {number} index - 索引
     */
    async removeDomain(type, index) {
        const domain = this.settings[type][index];
        if (!domain) return;

        // 显示确认对话框
        const confirmMessage = (getMessage('confirmDeleteDomain') || `确定要删除域名 "${domain}" 吗？此操作不可恢复。`).replace(/\$\{domain\}/g, domain);
        const confirmed = await this.showConfirmDialog(
            getMessage('confirmDeleteTitle') || '确认删除',
            confirmMessage
        );

        if (!confirmed) {
            return;
        }

        // 删除域名
        this.settings[type].splice(index, 1);
        this.render();
        
        // 立即保存
        await this.saveSettings();
        
        // 显示成功提示
        StatusManager.show(
            this.elements.status,
            this.elements.statusContainer,
            getMessage('itemDeleted') || '项已删除',
            'success'
        );
    }

    /**
     * 显示确认对话框
     * @param {string} title - 标题
     * @param {string} message - 消息内容
     * @returns {Promise<boolean>} 用户确认结果
     */
    async showConfirmDialog(title, message) {
        return new Promise((resolve) => {
            const dangerConfirm = document.getElementById('danger-confirm');
            if (!dangerConfirm) {
                // 如果没有确认弹窗，直接确认
                resolve(confirm(message));
                return;
            }

            const titleEl = dangerConfirm.querySelector('.danger-confirm-title');
            const messageEl = dangerConfirm.querySelector('.danger-confirm-message');
            const okBtn = document.getElementById('danger-ok');
            const cancelBtn = document.getElementById('danger-cancel');

            if (!titleEl || !messageEl || !okBtn || !cancelBtn) {
                resolve(confirm(message));
                return;
            }

            titleEl.textContent = title;
            messageEl.textContent = message;

            dangerConfirm.classList.add('show');

            const cleanup = () => {
                dangerConfirm.classList.remove('show');
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
     * 验证域名格式
     * @param {string} domain - 域名
     * @returns {boolean} 是否有效
     */
    validateDomain(domain) {
        if (!domain || domain.length > 253) return false;
        
        // 允许通配符 *.example.com
        if (domain.startsWith('*.')) {
            domain = domain.slice(2);
        }

        // 简单的域名格式验证
        const domainRegex = /^([a-z0-9]([a-z0-9\-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/i;
        return domainRegex.test(domain) || domainRegex.test(domain + '.local');
    }

    /**
     * 更新UI显示
     */
    updateUI() {
        if (!this.elements) return;

        const isWhitelistMode = this.settings.mode === 'whitelist';
        const isBlacklistMode = this.settings.mode === 'blacklist';
        const isDisabled = this.settings.mode === 'disabled';

        // 显示/隐藏相关区域
        if (this.elements.whitelistContainer) {
            this.elements.whitelistContainer.style.display = isWhitelistMode ? 'block' : 'none';
        }
        if (this.elements.blacklistContainer) {
            this.elements.blacklistContainer.style.display = isBlacklistMode ? 'block' : 'none';
        }
    }

    /**
     * 渲染列表
     */
    render() {
        // 确保国际化已初始化
        if (typeof getMessage !== 'function') {
            console.warn('getMessage 函数未定义，延迟渲染');
            setTimeout(() => this.render(), 100);
            return;
        }
        this.renderList('whitelist');
        this.renderList('blacklist');
        this.updateUI();
    }

    /**
     * 渲染域名列表
     * @param {string} type - 'whitelist' | 'blacklist'
     */
    renderList(type) {
        const container = type === 'whitelist' 
            ? this.elements.whitelistList 
            : this.elements.blacklistList;
        
        if (!container) return;

        const list = this.settings[type];
        container.innerHTML = '';

        if (list.length === 0) {
            const empty = document.createElement('div');
            empty.className = 'domain-list-empty';
            empty.textContent = getMessage('noDomains') || '暂无域名';
            container.appendChild(empty);
            return;
        }

        list.forEach((domain, index) => {
            const item = document.createElement('div');
            item.className = 'domain-list-item';
            
            const domainText = document.createElement('span');
            domainText.className = 'domain-text';
            domainText.textContent = domain;
            
            const removeBtn = document.createElement('button');
            removeBtn.className = 'domain-remove-btn';
            removeBtn.textContent = '×';
            removeBtn.title = getMessage('remove') || '删除';
            removeBtn.addEventListener('click', () => {
                this.removeDomain(type, index);
            });
            
            item.appendChild(domainText);
            item.appendChild(removeBtn);
            container.appendChild(item);
        });
    }

    /**
     * 保存设置
     */
    async saveSettings() {
        try {
            await domainFilter.saveSettings(this.settings);
        } catch (error) {
            console.error('保存域名过滤设置失败:', error);
            StatusManager.show(
                this.elements.status,
                this.elements.statusContainer,
                getMessage('saveFailed') || '保存失败',
                'error'
            );
            throw error;
        }
    }

    /**
     * 更新国际化文本
     */
    updateI18n() {
        if (domainAddModal && typeof domainAddModal.updateI18n === 'function') {
            domainAddModal.updateI18n();
        }
    }
}

// 创建单例
const domainFilterUI = new DomainFilterUI();

export default domainFilterUI;


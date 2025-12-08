/**
 * 域名添加弹窗模块
 * 提供添加域名到黑白名单的弹窗功能
 */

/**
 * 域名添加弹窗管理器
 */
class DomainAddModal {
    constructor() {
        this.modal = null;
        this.getMessage = null;
        this.onAdd = null; // 批量添加回调函数
        this.currentType = null; // 'whitelist' | 'blacklist'
        this.pendingDomains = []; // 待添加的域名列表
    }

    /**
     * 初始化弹窗
     * @param {Function} getMessage - 国际化消息获取函数
     */
    init(getMessage) {
        this.getMessage = getMessage;
        this.createModal();
    }

    /**
     * 创建弹窗
     */
    createModal() {
        if (this.modal) return;

        const addText = this.getMessage ? this.getMessage('add') || '添加' : '添加';
        const cancelText = this.getMessage ? this.getMessage('cancel') || '取消' : '取消';
        const saveText = this.getMessage ? this.getMessage('save') || '保存' : '保存';
        const domainInputPlaceholder = this.getMessage ? this.getMessage('domainInputPlaceholder') || '输入域名，如 example.com 或 *.example.com' : '输入域名，如 example.com 或 *.example.com';
        const addDomainText = this.getMessage ? this.getMessage('addDomain') || '添加域名' : '添加域名';
        const addedDomainsText = this.getMessage ? this.getMessage('addedDomains') || '已添加域名' : '已添加域名';
        const noDomainsAddedText = this.getMessage ? this.getMessage('noDomainsAdded') || '暂无已添加域名' : '暂无已添加域名';

        this.modal = document.createElement('div');
        this.modal.className = 'domain-add-modal';
        this.modal.innerHTML = `
            <div class="domain-add-overlay"></div>
            <div class="domain-add-content">
                <div class="domain-add-header">
                    <h3 class="domain-add-title">${addDomainText}</h3>
                    <button class="domain-add-close" aria-label="${cancelText}">×</button>
                </div>
                <div class="domain-add-body">
                    <div class="domain-add-input-wrapper">
                        <input type="text" class="domain-add-input" 
                               placeholder="${domainInputPlaceholder}" 
                               autocomplete="off" />
                        <div class="domain-add-hint"></div>
                    </div>
                    <div class="domain-add-list-section">
                        <div class="domain-add-list-title">${addedDomainsText} (<span class="domain-add-count">0</span>)</div>
                        <div class="domain-add-list-container">
                            <div class="domain-add-list-empty">${noDomainsAddedText}</div>
                        </div>
                    </div>
                </div>
                <div class="domain-add-footer">
                    <button class="domain-add-btn domain-add-btn-cancel">${cancelText}</button>
                    <button class="domain-add-btn domain-add-btn-add">${addText}</button>
                    <button class="domain-add-btn domain-add-btn-confirm">${saveText}</button>
                </div>
            </div>
        `;

        document.body.appendChild(this.modal);
        this.bindEvents();
    }

    /**
     * 绑定事件
     */
    bindEvents() {
        if (!this.modal) return;

        const closeBtn = this.modal.querySelector('.domain-add-close');
        const cancelBtn = this.modal.querySelector('.domain-add-btn-cancel');
        const addBtn = this.modal.querySelector('.domain-add-btn-add');
        const confirmBtn = this.modal.querySelector('.domain-add-btn-confirm');
        const input = this.modal.querySelector('.domain-add-input');
        const overlay = this.modal.querySelector('.domain-add-overlay');

        // 关闭按钮
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.handleCancel());
        }

        // 取消按钮
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.handleCancel());
        }

        // 添加按钮（添加到待添加列表）
        if (addBtn) {
            addBtn.addEventListener('click', () => this.handleAdd());
        }

        // 确认按钮（批量添加）
        if (confirmBtn) {
            confirmBtn.addEventListener('click', () => this.handleConfirm());
        }

        // 输入框回车
        if (input) {
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    this.handleAdd();
                } else if (e.key === 'Escape') {
                    this.handleCancel();
                }
            });
        }

        // 点击遮罩层关闭
        if (overlay) {
            overlay.addEventListener('click', () => this.handleCancel());
        }
    }

    /**
     * 显示弹窗
     * @param {string} type - 'whitelist' | 'blacklist'
     * @param {Function} onAdd - 批量添加回调函数
     */
    show(type, onAdd) {
        if (!this.modal) {
            this.createModal();
        }

        this.currentType = type;
        this.onAdd = onAdd;
        this.pendingDomains = []; // 重置待添加列表

        const title = this.modal.querySelector('.domain-add-title');
        const typeText = type === 'whitelist' 
            ? (this.getMessage ? this.getMessage('whitelist') || '白名单' : '白名单')
            : (this.getMessage ? this.getMessage('blacklist') || '黑名单' : '黑名单');
        const addDomainText = this.getMessage ? this.getMessage('addDomain') || '添加域名' : '添加域名';

        if (title) {
            title.textContent = `${addDomainText} - ${typeText}`;
        }

        const input = this.modal.querySelector('.domain-add-input');
        if (input) {
            input.value = '';
            input.focus();
        }

        // 更新已添加列表显示
        this.updatePendingList();

        this.modal.classList.add('visible');
    }

    /**
     * 隐藏弹窗
     */
    hide() {
        if (this.modal) {
            this.modal.classList.remove('visible');
            const input = this.modal.querySelector('.domain-add-input');
            if (input) {
                input.value = '';
            }
            const hint = this.modal.querySelector('.domain-add-hint');
            if (hint) {
                hint.textContent = '';
                hint.className = 'domain-add-hint';
            }
        }
        this.pendingDomains = [];
        this.currentType = null;
        this.onAdd = null;
    }

    /**
     * 处理取消
     */
    handleCancel() {
        this.hide();
    }

    /**
     * 处理添加单个域名到待添加列表
     */
    handleAdd() {
        const input = this.modal.querySelector('.domain-add-input');
        if (!input) return;

        const domain = input.value.trim();
        if (!domain) {
            this.showHint(this.getMessage('invalidDomain') || '无效的域名格式', 'error');
            return;
        }

        // 验证域名格式
        if (!this.validateDomain(domain)) {
            this.showHint(this.getMessage('invalidDomain') || '无效的域名格式', 'error');
            return;
        }

        // 检查是否已存在于待添加列表
        if (this.pendingDomains.includes(domain)) {
            this.showHint(this.getMessage('domainExists') || '域名已存在', 'error');
            return;
        }

        // 添加到待添加列表
        this.pendingDomains.push(domain);
        input.value = '';
        input.focus();
        this.updatePendingList();
        this.showHint(this.getMessage('domainAdded') || '域名已添加到列表', 'success');
    }

    /**
     * 处理确认批量添加
     */
    async handleConfirm() {
        if (this.pendingDomains.length === 0) {
            this.showHint(this.getMessage('noDomainsAdded') || '请先添加至少一个域名', 'error');
            return;
        }

        // 调用批量添加回调函数
        if (this.onAdd && typeof this.onAdd === 'function') {
            try {
                const result = await Promise.resolve(this.onAdd(this.pendingDomains));
                if (result === false) {
                    // 如果回调返回 false，表示添加失败
                    return;
                }
            } catch (error) {
                console.error('批量添加域名失败:', error);
                this.showHint(this.getMessage('domainsAddedFailed') || '添加失败', 'error');
                return;
            }
        }

        // 添加成功，关闭弹窗
        this.hide();
    }

    /**
     * 从待添加列表中移除域名
     * @param {string} domain - 域名
     */
    removePendingDomain(domain) {
        const index = this.pendingDomains.indexOf(domain);
        if (index > -1) {
            this.pendingDomains.splice(index, 1);
            this.updatePendingList();
        }
    }

    /**
     * 更新待添加列表显示
     */
    updatePendingList() {
        const container = this.modal.querySelector('.domain-add-list-container');
        const countEl = this.modal.querySelector('.domain-add-count');
        const emptyEl = this.modal.querySelector('.domain-add-list-empty');
        
        if (!container) return;

        // 更新计数
        if (countEl) {
            countEl.textContent = this.pendingDomains.length;
        }

        // 清空容器
        container.innerHTML = '';

        if (this.pendingDomains.length === 0) {
            // 显示空状态
            if (emptyEl) {
                emptyEl.style.display = 'block';
            }
        } else {
            // 隐藏空状态
            if (emptyEl) {
                emptyEl.style.display = 'none';
            }

            // 渲染域名列表
            this.pendingDomains.forEach((domain) => {
                const item = document.createElement('div');
                item.className = 'domain-add-list-item';
                item.innerHTML = `
                    <span class="domain-add-list-domain">${domain}</span>
                    <button class="domain-add-list-remove" data-domain="${domain}" title="${this.getMessage('remove') || '删除'}">×</button>
                `;
                
                // 绑定删除事件
                const removeBtn = item.querySelector('.domain-add-list-remove');
                if (removeBtn) {
                    removeBtn.addEventListener('click', () => {
                        this.removePendingDomain(domain);
                    });
                }

                container.appendChild(item);
            });
        }
    }

    /**
     * 显示提示信息
     * @param {string} message - 提示信息
     * @param {string} type - 'error' | 'success'
     */
    showHint(message, type = 'error') {
        const hint = this.modal.querySelector('.domain-add-hint');
        if (hint) {
            hint.textContent = message;
            hint.className = `domain-add-hint ${type}`;
            setTimeout(() => {
                hint.textContent = '';
                hint.className = 'domain-add-hint';
            }, 3000);
        }
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
     * 更新国际化文本
     */
    updateI18n() {
        if (!this.modal || !this.getMessage) return;

        const addText = this.getMessage('add') || '添加';
        const cancelText = this.getMessage('cancel') || '取消';
        const saveText = this.getMessage('save') || '保存';
        const domainInputPlaceholder = this.getMessage('domainInputPlaceholder') || '输入域名，如 example.com 或 *.example.com';
        const addDomainText = this.getMessage('addDomain') || '添加域名';
        const addedDomainsText = this.getMessage('addedDomains') || '已添加域名';
        const noDomainsAddedText = this.getMessage('noDomainsAdded') || '暂无已添加域名';

        const addBtn = this.modal.querySelector('.domain-add-btn-add');
        const confirmBtn = this.modal.querySelector('.domain-add-btn-confirm');
        const cancelBtn = this.modal.querySelector('.domain-add-btn-cancel');
        const input = this.modal.querySelector('.domain-add-input');
        const title = this.modal.querySelector('.domain-add-title');
        const listTitle = this.modal.querySelector('.domain-add-list-title');
        const emptyEl = this.modal.querySelector('.domain-add-list-empty');

        if (addBtn) addBtn.textContent = addText;
        if (confirmBtn) confirmBtn.textContent = saveText;
        if (cancelBtn) cancelBtn.textContent = cancelText;
        if (input) input.placeholder = domainInputPlaceholder;
        if (listTitle) listTitle.innerHTML = `${addedDomainsText} (<span class="domain-add-count">${this.pendingDomains.length}</span>)`;
        if (emptyEl) emptyEl.textContent = noDomainsAddedText;
        if (title && this.currentType) {
            const typeText = this.currentType === 'whitelist' 
                ? (this.getMessage('whitelist') || '白名单')
                : (this.getMessage('blacklist') || '黑名单');
            title.textContent = `${addDomainText} - ${typeText}`;
        }

        // 更新列表中的删除按钮标题
        const removeBtns = this.modal.querySelectorAll('.domain-add-list-remove');
        removeBtns.forEach(btn => {
            btn.title = this.getMessage('remove') || '删除';
        });
    }
}

// 创建单例
const domainAddModal = new DomainAddModal();

export default domainAddModal;


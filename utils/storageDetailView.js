/**
 * 存储详情展示模块
 * 提供存储详情数据的展示功能，包括弹窗显示、数据渲染等
 */

import { formatDate, getStorageDetail } from './storageDetail.js';
import { formatBytes } from './storageUsage.js';

/**
 * 存储详情展示管理器
 */
class StorageDetailView {
    constructor() {
        this.modal = null;
        this.getMessage = null; // 国际化函数，由外部注入
        // 复制图标 SVG
        this.copyIconSvg = `<svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5.5 2C4.67157 2 4 2.67157 4 3.5V11.5C4 12.3284 4.67157 13 5.5 13H11.5C12.3284 13 13 12.3284 13 11.5V3.5C13 2.67157 12.3284 2 11.5 2H5.5Z" stroke="currentColor" stroke-width="1.2" fill="none"/>
            <path d="M2 5.5C2 4.67157 2.67157 4 3.5 4H11.5C12.3284 4 13 4.67157 13 5.5V13.5C13 14.3284 12.3284 15 11.5 15H3.5C2.67157 15 2 14.3284 2 13.5V5.5Z" stroke="currentColor" stroke-width="1.2" fill="none" opacity="0.6"/>
        </svg>`;
        // 展开/折叠图标 SVG（向下箭头）
        this.expandIconSvg = `<svg width="12" height="12" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 6L8 10L12 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
        </svg>`;
        // 全部展开图标 SVG（iconfont 风格：向下箭头）
        this.expandAllIconSvg = `<svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 6L8 10L12 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
        </svg>`;
        // 全部折叠图标 SVG（iconfont 风格：向上箭头）
        this.collapseAllIconSvg = `<svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 10L8 6L12 10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
        </svg>`;
        // 搜索图标 SVG
        this.searchIconSvg = `<svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="7" cy="7" r="4.5" stroke="currentColor" stroke-width="1.5" fill="none"/>
            <path d="M10.5 10.5L13.5 13.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>`;
    }

    /**
     * 初始化详情展示模块
     * @param {Function} getMessage - 国际化消息获取函数
     */
    init(getMessage) {
        this.getMessage = getMessage;
        this.createModal();
    }

    /**
     * 创建详情弹窗
     */
    createModal() {
        // 如果已存在，先移除
        const existingModal = document.getElementById('storage-detail-modal');
        if (existingModal) {
            existingModal.remove();
        }

        const modal = document.createElement('div');
        modal.id = 'storage-detail-modal';
        modal.className = 'storage-detail-modal';
        const searchPlaceholder = this.getMessage ? this.getMessage('searchPlaceholder') || '搜索键名或值...' : '搜索键名或值...';
        modal.innerHTML = `
            <div class="storage-detail-overlay"></div>
            <div class="storage-detail-content">
                <div class="storage-detail-header">
                    <h3 class="storage-detail-title"></h3>
                    <button class="storage-detail-close" aria-label="关闭">×</button>
                </div>
                <div class="storage-detail-search">
                    <input type="text" class="search-input" placeholder="${searchPlaceholder}" />
                    <span class="search-icon">${this.searchIconSvg}</span>
                </div>
                <div class="storage-detail-body">
                    <div class="storage-detail-loading">
                        <div class="loading-spinner"></div>
                        <span class="loading-text"></span>
                    </div>
                </div>
                <div class="copy-toast" id="copy-toast"></div>
            </div>
        `;
        
        document.body.appendChild(modal);
        this.modal = modal;

        // 绑定关闭事件
        const closeBtn = modal.querySelector('.storage-detail-close');
        const overlay = modal.querySelector('.storage-detail-overlay');
        
        closeBtn.addEventListener('click', () => this.hide());
        overlay.addEventListener('click', () => this.hide());
        
        // ESC 键关闭
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isVisible()) {
                this.hide();
            }
        });
    }

    /**
     * 显示详情弹窗
     * @param {string} storageType - 存储类型
     * @param {Object} tab - 当前标签页对象
     * @param {string} url - 当前页面URL
     */
    async show(storageType, tab, url) {
        if (!this.modal) {
            this.createModal();
        }

        const titleMap = {
            localStorage: 'localStorage',
            sessionStorage: 'sessionStorage',
            cookies: 'cookies',
            indexedDB: 'indexedDB',
            cacheAPI: 'cacheAPI'
        };

        const title = this.getMessage ? this.getMessage(titleMap[storageType]) || storageType : storageType;
        const titleEl = this.modal.querySelector('.storage-detail-title');
        if (titleEl) {
            titleEl.textContent = title;
        }

        // 显示加载状态
        this.showLoading();

        // 显示弹窗
        this.modal.classList.add('visible');

        try {
            // 获取详情数据
            const detailData = await getStorageDetail(storageType, tab, url);
            
            // 渲染详情数据
            this.renderDetail(detailData);
        } catch (error) {
            this.showError(error.message);
        }
    }

    /**
     * 显示加载状态
     */
    showLoading() {
        const body = this.modal.querySelector('.storage-detail-body');
        if (!body) return;

        const loadingText = this.getMessage ? this.getMessage('loadingDetail') || '正在加载详情...' : '正在加载详情...';
        body.innerHTML = `
            <div class="storage-detail-loading">
                <div class="loading-spinner"></div>
                <span class="loading-text">${loadingText}</span>
            </div>
        `;
    }

    /**
     * 显示错误信息
     * @param {string} errorMessage - 错误消息
     */
    showError(errorMessage) {
        const body = this.modal.querySelector('.storage-detail-body');
        if (!body) return;

        const errorText = this.getMessage ? this.getMessage('detailLoadFailed') || '加载详情失败' : '加载详情失败';
        body.innerHTML = `
            <div class="storage-detail-error">
                <span class="error-icon">⚠️</span>
                <span class="error-text">${errorText}: ${errorMessage}</span>
            </div>
        `;
    }

    /**
     * 渲染详情数据
     * @param {Object} detailData - 详情数据
     */
    renderDetail(detailData) {
        const body = this.modal.querySelector('.storage-detail-body');
        if (!body) return;

        const { type, items, total } = detailData;

        if (!items || items.length === 0) {
            const emptyText = this.getMessage ? this.getMessage('noDetailData') || '暂无数据' : '暂无数据';
            body.innerHTML = `
                <div class="storage-detail-empty">
                    <span class="empty-icon">📭</span>
                    <span class="empty-text">${emptyText}</span>
                </div>
            `;
            return;
        }

        // 根据不同类型渲染不同的内容
        let html = '';
        
        switch (type) {
            case 'localStorage':
            case 'sessionStorage':
                html = this.renderKeyValueItems(items);
                break;
            case 'cookies':
                html = this.renderCookiesItems(items);
                break;
            case 'indexedDB':
                html = this.renderIndexedDBItems(items);
                break;
            case 'cacheAPI':
                html = this.renderCacheAPIItems(items);
                break;
            default:
                html = this.renderGenericItems(items);
        }

        const totalText = this.getMessage ? this.getMessage('totalItems') || '总计' : '总计';
        const expandAllText = this.getMessage ? this.getMessage('expandAll') || '全部展开' : '全部展开';
        const collapseAllText = this.getMessage ? this.getMessage('collapseAll') || '全部折叠' : '全部折叠';
        
        html = `
            <div class="storage-detail-summary">
                <span class="summary-label">${totalText}:</span>
                <span class="summary-value">${total} ${this.getMessage ? this.getMessage('items') || '项' : '项'}</span>
                <div class="accordion-controls">
                    <button class="accordion-btn expand-all" data-action="expand-all">
                        <span class="accordion-btn-icon">${this.expandAllIconSvg}</span>
                        <span class="accordion-btn-text">${expandAllText}</span>
                    </button>
                    <button class="accordion-btn collapse-all" data-action="collapse-all">
                        <span class="accordion-btn-icon">${this.collapseAllIconSvg}</span>
                        <span class="accordion-btn-text">${collapseAllText}</span>
                    </button>
                </div>
            </div>
            <div class="storage-detail-list accordion-list">
                ${html}
            </div>
        `;

        body.innerHTML = html;
        
        // 绑定折叠面板事件
        this.bindAccordionEvents();
        
        // 绑定搜索事件
        this.bindSearchEvents();
        
        // 绑定复制事件
        this.bindCopyEvents();
    }
    
    /**
     * 绑定折叠面板事件
     */
    bindAccordionEvents() {
        const accordionItems = this.modal.querySelectorAll('.accordion-item');
        const expandAllBtn = this.modal.querySelector('.expand-all');
        const collapseAllBtn = this.modal.querySelector('.collapse-all');
        
        // 绑定单个面板的展开/折叠
        accordionItems.forEach(item => {
            const header = item.querySelector('.accordion-header');
            if (header) {
                header.addEventListener('click', () => {
                    const isExpanded = item.classList.contains('expanded');
                    if (isExpanded) {
                        item.classList.remove('expanded');
                    } else {
                        item.classList.add('expanded');
                    }
                });
            }
        });
        
        // 全部展开
        if (expandAllBtn) {
            expandAllBtn.addEventListener('click', () => {
                accordionItems.forEach(item => {
                    item.classList.add('expanded');
                });
            });
        }
        
        // 全部折叠
        if (collapseAllBtn) {
            collapseAllBtn.addEventListener('click', () => {
                accordionItems.forEach(item => {
                    item.classList.remove('expanded');
                });
            });
        }
    }
    
    /**
     * 绑定搜索事件
     */
    bindSearchEvents() {
        const searchInput = this.modal.querySelector('.search-input');
        if (!searchInput) return;
        
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase().trim();
            const accordionItems = this.modal.querySelectorAll('.accordion-item');
            
            if (!searchTerm) {
                // 清空搜索，显示所有项
                accordionItems.forEach(item => {
                    item.style.display = '';
                });
                return;
            }
            
            // 搜索过滤
            accordionItems.forEach(item => {
                const title = item.querySelector('.accordion-title');
                const valueContent = item.querySelector('.value-content');
                const detailValues = item.querySelectorAll('.detail-value');
                
                const titleText = title ? title.textContent.toLowerCase() : '';
                let valueText = valueContent ? valueContent.textContent.toLowerCase() : '';
                
                // 收集所有详情值
                detailValues.forEach(dv => {
                    valueText += ' ' + dv.textContent.toLowerCase();
                });
                
                if (titleText.includes(searchTerm) || valueText.includes(searchTerm)) {
                    item.style.display = '';
                    // 自动展开匹配的项
                    item.classList.add('expanded');
                } else {
                    item.style.display = 'none';
                }
            });
        });
    }
    
    /**
     * 绑定复制事件
     */
    bindCopyEvents() {
        const accordionItems = this.modal.querySelectorAll('.accordion-item');
        
        accordionItems.forEach(item => {
            const copyBtn = item.querySelector('.copy-btn');
            if (copyBtn) {
                copyBtn.addEventListener('click', async (e) => {
                    e.stopPropagation();
                    await this.copyItemValue(item);
                });
            }
        });
    }
    
    /**
     * 复制项目的值
     * @param {HTMLElement} item - 折叠面板项
     */
    async copyItemValue(item) {
        const valueContent = item.querySelector('.value-content');
        const detailValues = item.querySelectorAll('.detail-value');
        const urlItems = item.querySelectorAll('.url-item');
        const jsonContent = item.querySelector('.detail-item-json');
        
        let textToCopy = '';
        
        // LocalStorage/SessionStorage: 复制值内容
        if (valueContent) {
            textToCopy = valueContent.textContent.trim();
        }
        // Cookies: 复制值
        else if (detailValues.length > 0) {
            const valueDetail = Array.from(detailValues).find(dv => {
                const label = dv.previousElementSibling;
                return label && label.textContent.includes(this.getMessage ? this.getMessage('value') || '值' : '值');
            });
            textToCopy = valueDetail ? valueDetail.textContent.trim() : '';
        }
        // Cache API: 复制所有 URLs
        else if (urlItems.length > 0) {
            textToCopy = Array.from(urlItems).map(url => url.textContent.trim()).join('\n');
        }
        // 通用项目: 复制 JSON 内容
        else if (jsonContent) {
            textToCopy = jsonContent.textContent.trim();
        }
        
        if (textToCopy) {
            await this.copyToClipboard(textToCopy, 'value');
        }
    }
    
    /**
     * 复制到剪贴板
     * @param {string} text - 要复制的文本
     * @param {string} type - 类型 ('key' 或 'value')
     */
    async copyToClipboard(text, type) {
        try {
            await navigator.clipboard.writeText(text);
            this.showCopyToast(type === 'key' ? 'keyCopied' : 'valueCopied');
        } catch (error) {
            // 降级方案：使用传统方法
            try {
                const textArea = document.createElement('textarea');
                textArea.value = text;
                textArea.style.position = 'fixed';
                textArea.style.opacity = '0';
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                this.showCopyToast(type === 'key' ? 'keyCopied' : 'valueCopied');
            } catch (fallbackError) {
                console.error('复制失败:', fallbackError);
            }
        }
    }
    
    /**
     * 显示复制成功提示
     * @param {string} messageKey - 消息键
     */
    showCopyToast(messageKey) {
        const toast = this.modal.querySelector('#copy-toast');
        if (!toast) return;
        
        const message = this.getMessage ? this.getMessage(messageKey) || '复制成功' : '复制成功';
        toast.textContent = message;
        toast.classList.add('show');
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 2000);
    }

    /**
     * 渲染键值对类型的项目（LocalStorage、SessionStorage）
     * @param {Array} items - 项目列表
     * @returns {string} HTML字符串
     */
    renderKeyValueItems(items) {
        const copyText = this.getMessage ? this.getMessage('copy') || '复制' : '复制';
        return items.map((item, index) => {
            const sizeDisplay = formatBytes(item.size || 0);
            const fullValue = this.escapeHtml(item.value || '');
            
            return `
                <div class="accordion-item expanded" data-index="${index}" data-key="${this.escapeHtml(item.key)}" data-value="${this.escapeHtml(item.value || '')}">
                    <div class="accordion-header">
                        <span class="accordion-icon">${this.expandIconSvg}</span>
                        <span class="accordion-title">${this.escapeHtml(item.key)}</span>
                        <div class="accordion-header-right">
                            <span class="accordion-size">${sizeDisplay}</span>
                            <button class="copy-btn" title="${copyText}">${this.copyIconSvg}</button>
                        </div>
                    </div>
                    <div class="accordion-content">
                        <div class="accordion-content-inner">
                            <div class="value-content">${fullValue}</div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    /**
     * 渲染 Cookies 项目
     * @param {Array} items - Cookies列表
     * @returns {string} HTML字符串
     */
    renderCookiesItems(items) {
        const valueText = this.getMessage ? this.getMessage('value') || '值' : '值';
        const domainText = this.getMessage ? this.getMessage('domain') || '域名' : '域名';
        const pathText = this.getMessage ? this.getMessage('path') || '路径' : '路径';
        const secureText = this.getMessage ? this.getMessage('secure') || '安全' : '安全';
        const httpOnlyText = this.getMessage ? this.getMessage('httpOnly') || 'HttpOnly' : 'HttpOnly';
        const expirationText = this.getMessage ? this.getMessage('expiration') || '过期时间' : '过期时间';

        const copyText = this.getMessage ? this.getMessage('copy') || '复制' : '复制';
        return items.map((item, index) => {
            const fullValue = this.escapeHtml(item.value || '');
            const expirationDisplay = item.expirationDate ? formatDate(item.expirationDate) : '-';
            
            return `
                <div class="accordion-item expanded" data-index="${index}" data-key="${this.escapeHtml(item.name)}" data-value="${this.escapeHtml(item.value || '')}">
                    <div class="accordion-header">
                        <span class="accordion-icon">${this.expandIconSvg}</span>
                        <span class="accordion-title">${this.escapeHtml(item.name)}</span>
                        <div class="accordion-header-right">
                            <button class="copy-btn" title="${copyText}">${this.copyIconSvg}</button>
                        </div>
                    </div>
                    <div class="accordion-content">
                        <div class="accordion-content-inner">
                            <div class="detail-item-row">
                                <span class="detail-label">${valueText}:</span>
                                <span class="detail-value">${fullValue}</span>
                            </div>
                            <div class="detail-item-row">
                                <span class="detail-label">${domainText}:</span>
                                <span class="detail-value">${this.escapeHtml(item.domain)}</span>
                            </div>
                            <div class="detail-item-row">
                                <span class="detail-label">${pathText}:</span>
                                <span class="detail-value">${this.escapeHtml(item.path)}</span>
                            </div>
                            <div class="detail-item-row">
                                <span class="detail-label">${secureText}:</span>
                                <span class="detail-value">${item.secure ? '✓' : '✗'}</span>
                            </div>
                            <div class="detail-item-row">
                                <span class="detail-label">${httpOnlyText}:</span>
                                <span class="detail-value">${item.httpOnly ? '✓' : '✗'}</span>
                            </div>
                            <div class="detail-item-row">
                                <span class="detail-label">${expirationText}:</span>
                                <span class="detail-value">${expirationDisplay}</span>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    /**
     * 渲染 IndexedDB 项目
     * @param {Array} items - 数据库列表
     * @returns {string} HTML字符串
     */
    renderIndexedDBItems(items) {
        const versionText = this.getMessage ? this.getMessage('version') || '版本' : '版本';

        const copyText = this.getMessage ? this.getMessage('copy') || '复制' : '复制';
        return items.map((item, index) => {
            return `
                <div class="accordion-item expanded" data-index="${index}" data-key="${this.escapeHtml(item.name)}">
                    <div class="accordion-header">
                        <span class="accordion-icon">${this.expandIconSvg}</span>
                        <span class="accordion-title">${this.escapeHtml(item.name)}</span>
                        <div class="accordion-header-right">
                            <button class="copy-btn" title="${copyText}">${this.copyIconSvg}</button>
                        </div>
                    </div>
                    <div class="accordion-content">
                        <div class="accordion-content-inner">
                            <div class="detail-item-row">
                                <span class="detail-label">${versionText}:</span>
                                <span class="detail-value">${item.version || '-'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    /**
     * 渲染 Cache API 项目
     * @param {Array} items - 缓存列表
     * @returns {string} HTML字符串
     */
    renderCacheAPIItems(items) {
        const countText = this.getMessage ? this.getMessage('count') || '数量' : '数量';
        const urlsText = this.getMessage ? this.getMessage('urls') || 'URLs' : 'URLs';

        const copyText = this.getMessage ? this.getMessage('copy') || '复制' : '复制';
        return items.map((item, index) => {
            const urlsList = (item.urls || []).map(url => 
                `<div class="url-item">${this.escapeHtml(url)}</div>`
            ).join('');

            return `
                <div class="accordion-item expanded" data-index="${index}" data-key="${this.escapeHtml(item.name)}">
                    <div class="accordion-header">
                        <span class="accordion-icon">${this.expandIconSvg}</span>
                        <span class="accordion-title">${this.escapeHtml(item.name)}</span>
                        <div class="accordion-header-right">
                            <span class="accordion-size">${countText}: ${item.count || 0}</span>
                            <button class="copy-btn" title="${copyText}">${this.copyIconSvg}</button>
                        </div>
                    </div>
                    <div class="accordion-content">
                        <div class="accordion-content-inner">
                            <div class="detail-item-row">
                                <span class="detail-label">${urlsText}:</span>
                            </div>
                            <div class="urls-list">
                                ${urlsList}
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    /**
     * 渲染通用项目列表
     * @param {Array} items - 项目列表
     * @returns {string} HTML字符串
     */
    renderGenericItems(items) {
        const copyText = this.getMessage ? this.getMessage('copy') || '复制' : '复制';
        return items.map((item, index) => {
            const itemStr = JSON.stringify(item, null, 2);
            const itemKey = item.key || item.name || `Item ${index + 1}`;
            return `
                <div class="accordion-item expanded" data-index="${index}" data-key="${this.escapeHtml(itemKey)}">
                    <div class="accordion-header">
                        <span class="accordion-icon">${this.expandIconSvg}</span>
                        <span class="accordion-title">${this.escapeHtml(itemKey)}</span>
                        <div class="accordion-header-right">
                            <button class="copy-btn" title="${copyText}">${this.copyIconSvg}</button>
                        </div>
                    </div>
                    <div class="accordion-content">
                        <div class="accordion-content-inner">
                            <pre class="detail-item-json">${this.escapeHtml(itemStr)}</pre>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    /**
     * 转义 HTML 特殊字符
     * @param {string} str - 要转义的字符串
     * @returns {string} 转义后的字符串
     */
    escapeHtml(str) {
        if (str === null || str === undefined) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    /**
     * 隐藏详情弹窗
     */
    hide() {
        if (this.modal) {
            this.modal.classList.remove('visible');
        }
    }

    /**
     * 检查弹窗是否可见
     * @returns {boolean} 是否可见
     */
    isVisible() {
        return this.modal && this.modal.classList.contains('visible');
    }
}

// 创建单例实例
const storageDetailView = new StorageDetailView();

/**
 * 初始化存储详情展示模块
 * @param {Function} getMessage - 国际化消息获取函数
 */
export function initStorageDetailView(getMessage) {
    storageDetailView.init(getMessage);
}

/**
 * 显示存储详情
 * @param {string} storageType - 存储类型
 * @param {Object} tab - 当前标签页对象
 * @param {string} url - 当前页面URL
 */
export function showStorageDetail(storageType, tab, url) {
    return storageDetailView.show(storageType, tab, url);
}

/**
 * 隐藏存储详情
 */
export function hideStorageDetail() {
    storageDetailView.hide();
}


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
        // 全部展开图标 SVG（双向下箭头，表示展开所有）
        this.expandAllIconSvg = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 5L8 9L12 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
            <path d="M4 9L8 13L12 9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
        </svg>`;
        // 全部折叠图标 SVG（双向上箭头，表示折叠所有）
        this.collapseAllIconSvg = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 11L8 7L12 11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
            <path d="M4 7L8 3L12 7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
        </svg>`;
        // 搜索图标 SVG
        this.searchIconSvg = `<svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="7" cy="7" r="4.5" stroke="currentColor" stroke-width="1.5" fill="none"/>
            <path d="M10.5 10.5L13.5 13.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>`;
        // 滚动到顶部图标 SVG（向上箭头+横线，表示回到顶部）
        this.scrollToTopIconSvg = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 4V12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            <path d="M4 8L8 4L12 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
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
        const expandAllText = this.getMessage ? this.getMessage('expandAll') || '全部展开' : '全部展开';
        const collapseAllText = this.getMessage ? this.getMessage('collapseAll') || '全部折叠' : '全部折叠';
        const scrollToTopText = this.getMessage ? this.getMessage('scrollToTop') || '滚动到顶部' : '滚动到顶部';
        modal.innerHTML = `
            <div class="storage-detail-overlay animate__animated"></div>
            <div class="storage-detail-content animate__animated">
                <div class="storage-detail-header animate__animated animate__fadeInDown">
                    <h3 class="storage-detail-title"></h3>
                    <button class="storage-detail-close" aria-label="关闭">×</button>
                </div>
                <div class="storage-detail-search animate__animated animate__fadeInDown">
                    <div class="search-input-wrapper">
                        <input type="text" class="search-input" placeholder="${searchPlaceholder}" />
                        <span class="search-icon">${this.searchIconSvg}</span>
                    </div>
                    <div class="search-controls">
                        <button class="accordion-btn icon-only expand-all animate__animated" data-action="expand-all" title="${expandAllText}" aria-label="${expandAllText}">
                            <span class="accordion-btn-icon">${this.expandAllIconSvg}</span>
                        </button>
                        <button class="accordion-btn icon-only collapse-all animate__animated" data-action="collapse-all" title="${collapseAllText}" aria-label="${collapseAllText}">
                            <span class="accordion-btn-icon">${this.collapseAllIconSvg}</span>
                        </button>
                        <button class="accordion-btn icon-only scroll-to-top animate__animated" data-action="scroll-to-top" title="${scrollToTopText}" aria-label="${scrollToTopText}">
                            <span class="accordion-btn-icon">${this.scrollToTopIconSvg}</span>
                        </button>
                    </div>
                </div>
                <div class="storage-detail-body">
                    <div class="storage-detail-loading">
                        <div class="loading-spinner"></div>
                        <span class="loading-text"></span>
                    </div>
                </div>
                <div class="copy-toast animate__animated" id="copy-toast"></div>
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

        // 显示弹窗，添加动画
        const content = this.modal.querySelector('.storage-detail-content');
        const overlay = this.modal.querySelector('.storage-detail-overlay');

        // 重置动画类
        if (content) {
            content.classList.remove('animate__zoomOut', 'animate__fadeOut');
            content.classList.add('animate__zoomIn');
        }
        if (overlay) {
            overlay.classList.remove('animate__fadeOut');
            overlay.classList.add('animate__fadeIn');
        }

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
            <div class="storage-detail-loading animate__animated animate__fadeIn">
                <div class="loading-spinner animate__animated animate__rotateIn"></div>
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
            <div class="storage-detail-error animate__animated animate__shakeX">
                <span class="error-icon animate__animated animate__bounceIn">⚠️</span>
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
                <div class="storage-detail-empty animate__animated animate__fadeIn">
                    <span class="empty-icon animate__animated animate__bounceIn">📭</span>
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

        html = `
            <div class="storage-detail-summary animate__animated animate__fadeInDown">
                <span class="summary-label">${totalText}:</span>
                <span class="summary-value">${total} ${this.getMessage ? this.getMessage('items') || '项' : '项'}</span>
            </div>
            <div class="storage-detail-list accordion-list">
                ${html}
            </div>
        `;

        body.innerHTML = html;

        // 为列表项添加进入动画
        setTimeout(() => {
            const accordionItems = body.querySelectorAll('.accordion-item');
            accordionItems.forEach((item, index) => {
                // 添加动画类和延迟
                item.classList.add('animate__animated', 'animate__fadeInUp');
                item.style.setProperty('--animate-delay', `${index * 0.05}s`);
                item.style.animationDelay = `${index * 0.05}s`;
            });
        }, 100);

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
        const scrollToTopBtn = this.modal.querySelector('.scroll-to-top');
        const body = this.modal.querySelector('.storage-detail-body');

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

        // 滚动到顶部
        if (scrollToTopBtn && body) {
            scrollToTopBtn.addEventListener('click', () => {
                // 添加点击动画
                scrollToTopBtn.classList.remove('animate__bounce');
                void scrollToTopBtn.offsetWidth; // 触发重排
                scrollToTopBtn.classList.add('animate__bounce');

                body.scrollTo({
                    top: 0,
                    behavior: 'smooth'
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
                // 清空搜索，显示所有项（带动画）
                accordionItems.forEach((item, index) => {
                    item.style.display = '';
                    item.classList.remove('animate__fadeOut');
                    item.classList.add('animate__fadeInUp');
                    item.style.animationDelay = `${index * 0.03}s`;
                });
                return;
            }

            // 搜索过滤
            accordionItems.forEach((item, index) => {
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
                    // 添加显示动画
                    item.classList.remove('animate__fadeInUp', 'animate__fadeOut');
                    void item.offsetWidth;
                    item.classList.add('animate__fadeInUp');
                    // 自动展开匹配的项
                    setTimeout(() => {
                        item.classList.add('expanded');
                    }, 100);
                } else {
                    // 添加隐藏动画
                    item.classList.remove('animate__fadeInUp');
                    item.classList.add('animate__fadeOut');
                    setTimeout(() => {
                        item.style.display = 'none';
                        item.classList.remove('animate__fadeOut');
                    }, 300);
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

                    // 添加点击动画
                    copyBtn.classList.remove('animate__pulse', 'animate__rubberBand');
                    void copyBtn.offsetWidth; // 触发重排
                    copyBtn.classList.add('animate__rubberBand');

                    await this.copyItemValue(item);

                    // 动画结束后移除类
                    setTimeout(() => {
                        copyBtn.classList.remove('animate__rubberBand');
                    }, 1000);
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

        // 重置动画类
        toast.classList.remove('animate__bounceIn', 'animate__bounceOut', 'show');
        void toast.offsetWidth; // 触发重排

        // 添加进入动画
        toast.classList.add('show', 'animate__bounceIn');

        setTimeout(() => {
            // 添加退出动画
            toast.classList.remove('animate__bounceIn');
            toast.classList.add('animate__bounceOut');

            setTimeout(() => {
                toast.classList.remove('show', 'animate__bounceOut');
            }, 500);
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
            const content = this.modal.querySelector('.storage-detail-content');
            const overlay = this.modal.querySelector('.storage-detail-overlay');

            // 添加退出动画
            if (content) {
                content.classList.remove('animate__zoomIn');
                content.classList.add('animate__zoomOut');
            }
            if (overlay) {
                overlay.classList.remove('animate__fadeIn');
                overlay.classList.add('animate__fadeOut');
            }

            // 等待动画完成后再隐藏
            setTimeout(() => {
                this.modal.classList.remove('visible');
            }, 300);
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


/**
 * 存储使用情况视图管理模块
 * 负责存储使用情况的加载、渲染和事件绑定
 */

/**
 * 存储使用情况视图管理器
 */
export class StorageUsageView {
    /**
     * @param {Object} options - 配置选项
     * @param {HTMLElement} options.container - 容器元素
     * @param {Function} options.getMessage - 国际化函数
     * @param {Function} options.getCurrentTab - 获取当前标签页函数
     * @param {Function} options.getCurrentUrl - 获取当前URL函数
     * @param {Function} options.showStorageDetail - 显示存储详情函数
     * @param {Function} options.isRestrictedPage - 检查受限页面函数
     * @param {Function} options.getStorageUsageViaScript - 通过脚本获取存储使用情况函数
     * @param {Function} options.getCookiesInfo - 获取Cookies信息函数
     * @param {Function} options.estimateStorageSize - 估算存储大小函数
     * @param {Function} options.validateStorageCount - 验证存储数量函数
     * @param {Function} options.formatBytes - 格式化字节函数
     */
    constructor(options) {
        this.container = options.container;
        this.getMessage = options.getMessage;
        this.getCurrentTab = options.getCurrentTab;
        this.getCurrentUrl = options.getCurrentUrl;
        this.showStorageDetail = options.showStorageDetail;
        this.isRestrictedPage = options.isRestrictedPage;
        this.getStorageUsageViaScript = options.getStorageUsageViaScript;
        this.getCookiesInfo = options.getCookiesInfo;
        this.estimateStorageSize = options.estimateStorageSize;
        this.validateStorageCount = options.validateStorageCount;
        this.formatBytes = options.formatBytes;
    }

    /**
     * 加载存储使用情况
     */
    async loadStorageUsage() {
        const currentTab = this.getCurrentTab();
        const currentUrl = this.getCurrentUrl();

        if (!this.container || !currentTab || !currentTab.id) {
            return;
        }

        // 检查是否为受限制的页面
        if (this.isRestrictedPage(currentUrl)) {
            this.container.innerHTML = `
                <div class="storage-error" data-i18n="restrictedPageStorage">此页面受浏览器保护，无法获取存储信息</div>
            `;
            return;
        }

        try {
            // 显示加载状态
            this.container.innerHTML = `
                <div class="storage-loading" data-i18n="loadingStorage">${this.getMessage('loadingStorage') || '正在加载存储信息...'}</div>
            `;
            this.updateI18n();

            let usage = {};
            let response = null;

            // 首先尝试通过消息传递获取（更准确）
            try {
                response = await chrome.tabs.sendMessage(currentTab.id, {
                    action: 'getStorageUsage'
                });
                
                if (response && response.success && response.usage) {
                    usage = response.usage;
                } else {
                    throw new Error('消息响应无效');
                }
            } catch (messageError) {
                // 如果消息传递失败，使用备用方案：直接执行脚本
                // 这是正常情况，当内容脚本未加载或页面刚加载时会发生
                usage = await this.getStorageUsageViaScript(currentTab.id);
                
                // 如果备用方案也失败，尝试异步获取 IndexedDB、Cache API 和 Service Worker
                if (usage && !usage.error) {
                    // 异步存储数据获取配置
                    const asyncStorageConfig = [
                        {
                            type: 'indexedDB',
                            check: () => 'indexedDB' in window && indexedDB.databases,
                            getData: async () => {
                                const databases = await indexedDB.databases();
                                return { count: databases.length, databases: databases.map(db => ({ name: db.name, version: db.version })) };
                            }
                        },
                        {
                            type: 'cacheAPI',
                            check: () => 'caches' in window,
                            getData: async () => {
                                const cacheNames = await caches.keys();
                                return { count: cacheNames.length, names: cacheNames };
                            }
                        },
                        {
                            type: 'serviceWorker',
                            check: () => 'serviceWorker' in navigator,
                            getData: async () => {
                                const registrations = await navigator.serviceWorker.getRegistrations();
                                return { count: registrations.length, scopes: registrations.map(reg => reg.scope) };
                            }
                        }
                    ];

                    // 并行获取所有异步存储数据
                    const asyncStoragePromises = asyncStorageConfig.map(config =>
                        chrome.scripting.executeScript({
                            target: { tabId: currentTab.id },
                            func: async () => {
                                if (config.check()) {
                                    try {
                                        return { type: config.type, data: await config.getData() };
                                    } catch (e) {
                                        return { type: config.type, data: { count: 0 } };
                                    }
                                }
                                return { type: config.type, data: { count: 0 } };
                            }
                        }).catch(() => ({ type: config.type, data: { count: 0 } }))
                    );

                    // 合并结果到 usage 对象
                    try {
                        const asyncResults = await Promise.all(asyncStoragePromises);
                        asyncResults.forEach(result => {
                            const resultData = Array.isArray(result) && result[0]?.result ? result[0].result : result;
                            if (resultData?.type && resultData.data) {
                                usage[resultData.type] = resultData.data;
                            }
                        });
                    } catch (e) {
                        // 忽略异步数据获取失败
                    }
                }
            }

            // 如果获取失败，显示错误
            if (usage.error) {
                throw new Error(usage.error);
            }
            
            // 获取 Cookies 大小和数量
            const cookiesInfo = await this.getCookiesInfo(currentUrl);
            const cookiesSize = cookiesInfo.size;
            const cookiesCount = cookiesInfo.count;

            // 计算总大小
            const estimatedSize = this.estimateStorageSize(usage) + cookiesSize;

            // 准备存储数据
            const storageTypes = ['localStorage', 'sessionStorage', 'indexedDB', 'cacheAPI'];
            const storageData = {};
            
            storageTypes.forEach(type => {
                storageData[type] = {
                    count: this.validateStorageCount(usage[type]?.count),
                    size: this.estimateStorageSize({ [type]: usage[type] })
                };
            });

            storageData.cookies = {
                count: this.validateStorageCount(cookiesCount),
                size: cookiesSize
            };
            storageData.serviceWorker = {
                count: this.validateStorageCount(usage.serviceWorker?.count)
            };
            storageData.total = { size: estimatedSize };

            this.render(storageData);

        } catch (error) {
            const errorKey = error.message.includes('Cannot access') ? 'restrictedPageStorage' : 'storageLoadFailed';
            const errorMessage = this.getMessage(errorKey) || (errorKey === 'storageLoadFailed' ? `无法加载存储信息：${error.message}` : '此页面受浏览器保护，无法获取存储信息');
            this.container.innerHTML = `
                <div class="storage-error" data-i18n="${errorKey}">${errorMessage}</div>
            `;
            this.updateI18n();
        }
    }

    /**
     * 渲染存储使用情况
     * @param {Object} data - 存储数据
     */
    render(data) {
        // 存储项配置
        const storageConfig = [
            { key: 'localStorage', icon: '💾', fallback: 'LocalStorage' },
            { key: 'sessionStorage', icon: '📂', fallback: 'SessionStorage' },
            { key: 'cookies', icon: '🍪', fallback: 'Cookies' },
            { key: 'indexedDB', icon: '🗄️', fallback: 'IndexedDB' },
            { key: 'cacheAPI', icon: '📋', fallback: 'Cache API' }
        ];

        const storageItems = storageConfig.map(config => ({
            name: this.getMessage(config.key) || config.fallback,
            icon: config.icon,
            count: data[config.key].count,
            size: data[config.key].size,
            i18nKey: config.key
        }));

        // 过滤掉没有数据的项
        const activeItems = storageItems.filter(item => item.count > 0 || item.size > 0);

        if (activeItems.length === 0) {
            this.container.innerHTML = `
                <div class="storage-empty" data-i18n="noStorageData">${this.getMessage('noStorageData') || '当前网站没有存储数据'}</div>
            `;
            this.updateI18n();
            return;
        }

        const maxSize = Math.max(...activeItems.map(item => item.size), 1);
        const itemsText = this.getMessage('items') || '项';
        const totalStorageText = this.getMessage('totalStorage') || '总存储：';

        // 生成 HTML
        const html = `
            <div class="storage-items">
                ${activeItems.map(item => {
                    const percentage = (item.size / maxSize) * 100;
                    return `
                        <div class="storage-item clickable" data-storage-type="${item.i18nKey}" title="${this.getMessage('clickToViewDetail') || '点击查看详情'}">
                            <div class="storage-item-header">
                                <span class="storage-item-icon">${item.icon}</span>
                                <span class="storage-item-name" data-i18n="${item.i18nKey}">${item.name}</span>
                                <span class="storage-item-size">${this.formatBytes(item.size)}</span>
                                <span class="storage-item-count">(${item.count} ${itemsText})</span>
                            </div>
                            <div class="storage-item-bar">
                                <div class="storage-item-bar-fill" style="width: ${percentage}%"></div>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
            <div class="storage-total">
                <span class="storage-total-label" data-i18n="totalStorage">${totalStorageText}</span>
                <span class="storage-total-size">${this.formatBytes(data.total.size)}</span>
            </div>
        `;

        this.container.innerHTML = html;

        // 更新国际化文本
        this.updateI18n();

        // 绑定点击事件
        this.bindClickEvents();
    }

    /**
     * 绑定存储项点击事件
     */
    bindClickEvents() {
        const storageItems = this.container.querySelectorAll('.storage-item.clickable');
        storageItems.forEach(item => {
            item.addEventListener('click', async (e) => {
                const storageType = item.getAttribute('data-storage-type');
                const currentTab = this.getCurrentTab();
                const currentUrl = this.getCurrentUrl();
                if (storageType && currentTab && currentUrl) {
                    try {
                        await this.showStorageDetail(storageType, currentTab, currentUrl);
                    } catch (error) {
                        console.error('显示存储详情失败:', error);
                    }
                }
            });
        });
    }

    /**
     * 更新存储使用情况区域的国际化文本
     */
    updateI18n() {
        // 更新标题
        const storageTitle = document.querySelector('.storage-title');
        if (storageTitle?.hasAttribute('data-i18n')) {
            const text = this.getMessage(storageTitle.getAttribute('data-i18n'));
            if (text && text !== storageTitle.getAttribute('data-i18n')) {
                storageTitle.textContent = text;
            }
        }

        if (!this.container) return;

        const itemsText = this.getMessage('items') || '项';

        // 更新所有带 data-i18n 属性的元素
        this.container.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (!key) return;
            const text = this.getMessage(key);
            if (text && text !== key) {
                el.textContent = text;
            }
        });

        // 更新存储项数量单位（确保数量格式正确，处理可能遗漏的情况）
        this.container.querySelectorAll('.storage-item-count').forEach(el => {
            const match = el.textContent.match(/\((\d+)\s*/);
            if (match) {
                // 检查当前文本是否已经使用了正确的单位
                const currentText = el.textContent;
                if (!currentText.includes(itemsText)) {
                    // 如果单位不正确，更新为单位
                    el.textContent = `(${match[1]} ${itemsText})`;
                }
            }
        });
    }
}


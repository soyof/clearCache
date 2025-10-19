/**
 * UI工具模块
 * 提供UI相关的通用功能
 */

/**
 * 按钮状态管理器
 */
const ButtonManager = {
    /**
     * 设置按钮状态
     * @param {HTMLElement} button - 按钮元素
     * @param {string} state - 状态 (normal, loading, success, error)
     */
    setState: function (button, state) {
        if (!button) return;

        // 移除所有状态类
        button.classList.remove('loading', 'success', 'error');

        // 添加新状态类
        if (state !== 'normal') {
            button.classList.add(state);
        }

        // 禁用/启用按钮
        button.disabled = state === 'loading';
    },

    /**
     * 设置按钮为加载状态
     * @param {HTMLElement} button - 按钮元素
     */
    setLoading: function (button) {
        // 强制重排以确保样式立即应用
        if (button) {
            button.offsetHeight;
        }
        this.setState(button, 'loading');
    },

    /**
     * 设置按钮为成功状态
     * @param {HTMLElement} button - 按钮元素
     */
    setSuccess: function (button) {
        this.setState(button, 'success');

        // 强制重排以确保样式立即应用（与setLoading保持一致）
        if (button) {
            button.offsetHeight;
        }

        // 2秒后恢复正常状态
        setTimeout(() => {
            this.setState(button, 'normal');
        }, 2000);
    },

    /**
     * 设置按钮为错误状态
     * @param {HTMLElement} button - 按钮元素
     */
    setError: function (button) {
        this.setState(button, 'error');

        // 2秒后恢复正常状态
        setTimeout(() => {
            this.setState(button, 'normal');
        }, 2000);
    }
};

/**
 * 状态消息管理器
 */
const StatusManager = {
    /**
     * 显示状态消息
     * @param {HTMLElement} statusElement - 状态元素
     * @param {HTMLElement} containerElement - 容器元素
     * @param {string} message - 状态消息
     * @param {string} type - 状态类型 (info, success, warning, error)
     */
    show: function (statusElement, containerElement, message, type = 'info') {
        if (!statusElement || !containerElement) return;

        // 设置消息内容
        statusElement.textContent = message;

        // 移除所有状态类型
        statusElement.classList.remove('info', 'success', 'warning', 'error');

        // 添加新状态类型
        statusElement.classList.add(type);

        // 显示容器
        containerElement.classList.add('show');

        // 3秒后隐藏
        setTimeout(() => {
            containerElement.classList.remove('show');
        }, 3000);
    },

    /**
     * 显示成功状态
     * @param {HTMLElement} statusElement - 状态元素
     * @param {HTMLElement} containerElement - 容器元素
     * @param {string} message - 状态消息
     */
    success: function (statusElement, containerElement, message) {
        this.show(statusElement, containerElement, message, 'success');
    },

    /**
     * 显示错误状态
     * @param {HTMLElement} statusElement - 状态元素
     * @param {HTMLElement} containerElement - 容器元素
     * @param {string} message - 状态消息
     */
    error: function (statusElement, containerElement, message) {
        this.show(statusElement, containerElement, message, 'error');
    },

    /**
     * 显示警告状态
     * @param {HTMLElement} statusElement - 状态元素
     * @param {HTMLElement} containerElement - 容器元素
     * @param {string} message - 状态消息
     */
    warning: function (statusElement, containerElement, message) {
        this.show(statusElement, containerElement, message, 'warning');
    }
};

/**
 * 进度条管理器
 */
const ProgressManager = {
    /**
     * 显示进度
     * @param {HTMLElement} progressElement - 进度条元素
     * @param {HTMLElement} progressFillElement - 进度填充元素
     * @param {number} percent - 进度百分比 (0-100)
     */
    show: function (progressElement, progressFillElement, percent) {
        if (!progressElement || !progressFillElement) return;

        // 确保百分比在有效范围内
        const validPercent = Math.max(0, Math.min(100, percent));

        // 设置进度条宽度
        progressFillElement.style.width = `${validPercent}%`;

        // 显示进度条
        progressElement.style.display = 'block';

        // 如果进度为100%，则在短暂延迟后隐藏进度条
        if (validPercent >= 100) {
            setTimeout(() => {
                progressElement.style.display = 'none';
                progressFillElement.style.width = '0%';
            }, 500);
        }
    }
};

/**
 * 主题管理器
 */
const ThemeManager = {
    /**
     * 应用主题
     * @param {string} theme - 主题名称 (auto, dark, light)
     * @param {HTMLElement} container - 容器元素
     * @param {HTMLElement} body - body元素
     */
    apply: function (theme, container, body) {
        if (!container || !body) return;

        // 移除所有主题类
        container.classList.remove('theme-dark', 'theme-light', 'theme-auto');
        body.classList.remove('theme-dark', 'theme-light', 'theme-auto');

        // 添加主题过渡动画
        container.classList.add('theme-transition');

        // 处理自动主题 - 根据时间判断使用亮色还是暗色
        let actualTheme = theme;
        if (theme === 'auto') {
            // 获取当前小时
            const currentHour = new Date().getHours();
            // 6:00 - 19:00 使用浅色主题，其他时间使用深色主题
            actualTheme = (currentHour >= 6 && currentHour < 19) ? 'light' : 'dark';
            // 自动主题: 根据当前时间应用相应主题
        }

        // 应用实际的主题类
        container.classList.add(`theme-${actualTheme}`);
        body.classList.add(`theme-${actualTheme}`);

        // 移除过渡动画类
        setTimeout(() => {
            container.classList.remove('theme-transition');
        }, 500);
    },

    /**
     * 更新主题选择的视觉标识
     * @param {string} selectedTheme - 选中的主题
     */
    updateSelection: function (selectedTheme) {
        // 移除所有主题选项的选中样式
        document.querySelectorAll('.theme-option').forEach(option => {
            option.classList.remove('selected');
        });

        // 为选中的主题选项添加选中样式
        const selectedOption = document.querySelector(`.theme-option input[value="${selectedTheme}"]`);
        if (selectedOption) {
            selectedOption.closest('.theme-option').classList.add('selected');
        }
    }
};

/**
 * 标签页管理器
 */
const TabManager = {
    /**
     * 切换标签页
     * @param {string} tabId - 标签页ID
     * @param {NodeList} tabButtons - 标签按钮列表
     * @param {NodeList} tabContents - 标签内容列表
     */
    switchTo: function (tabId, tabButtons, tabContents) {
        // 移除所有活动状态
        tabButtons.forEach(btn => btn.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));

        // 激活当前Tab
        const button = document.querySelector(`[data-tab="${tabId}"]`);
        if (button) {
            button.classList.add('active');
        }

        const content = document.getElementById(tabId + '-tab');
        if (content) {
            content.classList.add('active');
        }

        // 保存当前Tab状态
        chrome.storage.local.set({ activeTab: tabId });
    }
};

export { ButtonManager, ProgressManager, StatusManager, TabManager, ThemeManager };


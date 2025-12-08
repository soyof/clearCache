/**
 * 设置处理模块
 * 处理应用设置相关逻辑
 */

import { SettingsManager, StatusManager, ThemeManager, getMessage, getUserLanguage } from '../utils/index.js';

/**
 * 加载设置
 * @param {Object} elements - DOM元素对象
 */
export async function loadSettings(elements) {
    try {
        // 添加超时保护
        const settingsPromise = SettingsManager.get([
            'clearPasswords',
            'clearFormData',
            'includeProtected',
            'confirmDangerous',
            'silentMode'
        ]);
        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('加载设置超时')), 1000)
        );

        const settings = await Promise.race([settingsPromise, timeoutPromise]);

        if (elements.clearPasswords) {
            elements.clearPasswords.checked = settings.clearPasswords !== false;
        }

        if (elements.clearFormData) {
            elements.clearFormData.checked = settings.clearFormData !== false;
        }

        if (elements.includeProtected) {
            elements.includeProtected.checked = settings.includeProtected !== false;
        }

        if (elements.confirmDangerous) {
            elements.confirmDangerous.checked = settings.confirmDangerous !== false;
        }

        if (elements.silentMode) {
            elements.silentMode.checked = settings.silentMode === true;
        }
    } catch (error) {
        console.warn('加载设置失败:', error);
        // 使用默认设置
        if (elements.clearPasswords) {
            elements.clearPasswords.checked = true;
        }
        if (elements.clearFormData) {
            elements.clearFormData.checked = true;
        }
        if (elements.includeProtected) {
            elements.includeProtected.checked = true;
        }
        if (elements.confirmDangerous) {
            elements.confirmDangerous.checked = true;
        }
        if (elements.silentMode) {
            elements.silentMode.checked = false;
        }
    }
}

/**
 * 应用主题
 * @param {string} theme - 主题名称
 */
function applyTheme(theme) {
    const container = document.querySelector('.container');
    const body = document.body;

    ThemeManager.apply(theme, container, body);
}

/**
 * 更新主题选择的视觉标识
 * @param {string} selectedTheme - 选中的主题
 */
function updateThemeSelection(selectedTheme) {
    ThemeManager.updateSelection(selectedTheme);
}

/**
 * 处理主题切换
 * @param {Event} event - 事件对象
 * @param {Object} elements - DOM元素对象
 */
export function handleThemeChange(event, elements) {
    const theme = event.target.value;
    applyTheme(theme);
    updateThemeSelection(theme);

    // 保存主题设置
    chrome.storage.local.set({ theme });
}

/**
 * 加载高级设置
 * @param {Object} elements - DOM元素对象
 */
async function loadAdvancedSettings(elements) {
    try {
        const settings = await SettingsManager.get([
            'theme',
            'enableNotifications',
            'notificationSound'
        ]);

        // 设置主题
        const theme = settings.theme || 'dark'; // 默认使用深色主题
        applyTheme(theme);

        // 更新主题菜单的激活状态
        if (elements.themeMenuItems) {
            elements.themeMenuItems.forEach(item => {
                const itemTheme = item.getAttribute('data-theme');
                if (itemTheme === theme) {
                    item.classList.add('active');
                } else {
                    item.classList.remove('active');
                }
            });
        }

        // 设置其他选项
        if (elements.enableNotifications) {
            elements.enableNotifications.checked = settings.enableNotifications !== false;
        }
        if (elements.notificationSound) {
            elements.notificationSound.checked = settings.notificationSound === true;
        }
    } catch (error) {
        // 加载高级设置失败
    }
}

/**
 * 加载语言设置
 * @param {Object} elements - DOM元素对象
 */
async function loadLanguageSettings(elements) {
    try {
        const userLanguage = await getUserLanguage();
        if (elements.languageSelect) {
            elements.languageSelect.value = userLanguage;
        }
        // 更新语言菜单的激活状态
        if (elements.languageMenuItems) {
            elements.languageMenuItems.forEach(item => {
                const lang = item.getAttribute('data-lang');
                if (lang === userLanguage) {
                    item.classList.add('active');
                } else {
                    item.classList.remove('active');
                }
            });
        }
    } catch (error) {
        // 加载语言设置失败，使用默认值
    }
}

/**
 * 初始化高级设置
 * @param {Object} elements - DOM元素对象
 */
export async function initializeAdvancedSettings(elements) {
    try {
        // 并行加载高级设置和语言设置
        await Promise.all([
            loadAdvancedSettings(elements).catch(err => console.warn('加载高级设置失败:', err)),
            loadLanguageSettings(elements).catch(err => console.warn('加载语言设置失败:', err))
        ]);
    } catch (error) {
        console.warn('初始化高级设置失败:', error);
    }
}

/**
 * 保存高级设置
 * @param {Object} elements - DOM元素对象
 */
export async function saveAdvancedSettings(elements) {
    try {
        const settings = {
            enableNotifications: elements.enableNotifications?.checked !== false,
            notificationSound: elements.notificationSound?.checked === true,
            clearPasswords: elements.clearPasswords?.checked !== false,
            clearFormData: elements.clearFormData?.checked !== false,
            includeProtected: elements.includeProtected?.checked !== false,
            confirmDangerous: elements.confirmDangerous?.checked !== false,
            silentMode: elements.silentMode?.checked === true
        };

        await SettingsManager.save(settings);
        StatusManager.show(elements.status, elements.statusContainer, getMessage('settingsSaved'), 'success');
    } catch (error) {
        // 保存高级设置失败
        StatusManager.show(elements.status, elements.statusContainer, getMessage('settingsSaveFailed'), 'error');
    }
}


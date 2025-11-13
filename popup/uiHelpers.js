/**
 * UI 辅助函数模块
 * 提供 UI 相关的工具函数
 */

import { getMessage } from '../utils/index.js';

/**
 * 格式化URL
 * @param {string} url - URL
 * @returns {string} 格式化后的URL
 */
export function formatUrl(url) {
    try {
        if (!url) return getMessage('unknownSite');

        // 移除协议
        let formattedUrl = url.replace(/^(https?:\/\/)/, '');

        // 移除路径和查询参数
        formattedUrl = formattedUrl.split('/')[0];

        // 如果URL太长，截断它
        if (formattedUrl.length > 30) {
            formattedUrl = formattedUrl.substring(0, 27) + '...';
        }

        return formattedUrl;
    } catch (error) {
        return getMessage('unknownSite');
    }
}

/**
 * 调整标签页文本大小以防止换行
 * 使用简化的CSS方案替代复杂的Canvas计算
 */
export function adjustTabTextSize() {
    try {
        const tabButtons = document.querySelectorAll('.tab-btn');

        tabButtons.forEach(button => {
            const textElement = button.querySelector('.tab-text');
            if (!textElement) return;

            const textContent = textElement.textContent;
            const textLength = textContent.length;

            // 检测文本语言类型（中文、日文、韩文字符密度更高）
            const isCJK = /[\u4e00-\u9fff\u3400-\u4dbf\u3040-\u309f\u30a0-\u30ff\uac00-\ud7af]/.test(textContent);

            // 简单的字体大小调整逻辑
            let fontSize;
            if (isCJK) {
                if (textLength <= 4) {
                    fontSize = '0.9rem';
                } else if (textLength <= 6) {
                    fontSize = '0.8rem';
                } else {
                    fontSize = '0.75rem';
                }
            } else {
                if (textLength <= 8) {
                    fontSize = '0.85rem';
                } else if (textLength <= 12) {
                    fontSize = '0.75rem';
                } else {
                    fontSize = '0.7rem';
                }
            }

            textElement.style.fontSize = fontSize;
        });
    } catch (error) {
        // 调整标签页文本大小失败，使用默认样式
        console.warn('调整标签页文本大小失败:', error);
    }
}

/**
 * 加载版本信息
 */
export async function loadVersionInfo() {
    try {
        const manifest = chrome.runtime.getManifest();
        const versionElement = document.querySelector('.version');
        if (versionElement && manifest && manifest.version) {
            versionElement.textContent = 'v' + manifest.version;
        }
    } catch (error) {
        // 忽略版本加载错误
        console.warn('加载版本信息失败:', error);
    }
}



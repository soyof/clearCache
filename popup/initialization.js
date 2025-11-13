/**
 * 初始化模块
 * 处理应用初始化相关逻辑
 */

import {
  getMessage,
  initializePageI18n,
  initStorageDetailView,
  StorageUsageView,
  estimateStorageSize,
  formatBytes,
  getCookiesInfo,
  getStorageUsageViaScript,
  isRestrictedPage,
  showStorageDetail,
  validateStorageCount
} from '../utils/index.js';
import { getCurrentTab, getCurrentUrl, setCurrentTab, setCurrentUrl } from './state.js';
import { formatUrl, loadVersionInfo } from './uiHelpers.js';
import { loadSettings, initializeAdvancedSettings } from './settingsHandlers.js';
import { restoreTabState } from './eventHandlers.js';

/**
 * 初始化当前标签页信息
 * @param {Object} elements - DOM元素对象
 */
export async function initializeCurrentTab(elements) {
  // 先显示国际化的"加载中..."
  if (elements.currentUrl) {
    elements.currentUrl.textContent = getMessage('loading') || '加载中...';
  }

  try {
    // 添加超时保护，防止chrome.tabs.query卡住
    const tabsPromise = chrome.tabs.query({ active: true, currentWindow: true });
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('获取标签页超时')), 1000)
    );

    const tabs = await Promise.race([tabsPromise, timeoutPromise]);

    if (tabs && tabs.length > 0) {
      setCurrentTab(tabs[0]);
      const url = tabs[0].url || '';
      setCurrentUrl(url);

      // 显示当前URL
      if (elements.currentUrl) {
        const formattedUrl = formatUrl(url);
        elements.currentUrl.textContent = formattedUrl;
        elements.currentUrl.title = url;
      }
    } else {
      // 如果没有获取到标签页，显示默认信息
      if (elements.currentUrl) {
        elements.currentUrl.textContent = getMessage('unknownSite') || '未知网站';
      }
    }
  } catch (error) {
    console.warn('获取当前标签页失败:', error);
    // 即使失败也显示友好信息
    if (elements.currentUrl) {
      elements.currentUrl.textContent = getMessage('unknownSite') || '未知网站';
    }
  }
}


/**
 * 初始化存储使用情况视图
 * @param {Object} elements - DOM元素对象
 */
export function initializeStorageUsageView(elements) {
  // 初始化存储详情展示模块
  initStorageDetailView(getMessage);

  // 初始化存储使用情况视图
  window.storageUsageView = new StorageUsageView({
    container: elements.storageUsageContent,
    getMessage,
    getCurrentTab: () => getCurrentTab(),
    getCurrentUrl: () => getCurrentUrl(),
    showStorageDetail,
    isRestrictedPage,
    getStorageUsageViaScript,
    getCookiesInfo,
    estimateStorageSize,
    validateStorageCount,
    formatBytes
  });
}

/**
 * 主初始化函数
 * @param {Object} elements - DOM元素对象
 */
export async function initialize(elements) {
  try {
    // 立即设置加载中状态
    if (elements.currentUrl) {
      elements.currentUrl.textContent = '加载中...';
    }

    // 第一步：快速初始化国际化（优先级最高）
    await Promise.race([
      initializePageI18n(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('i18n超时')), 1000))
    ]).catch(err => console.warn('i18n初始化失败:', err));

    // 初始化存储使用情况视图
    initializeStorageUsageView(elements);

    // 第二步：立即获取当前标签页信息（用户最关心的）
    initializeCurrentTab(elements).catch(err => console.warn('标签页初始化失败:', err));

    // 第二步半：加载存储使用情况（在获取标签页后，延迟执行避免阻塞）
    setTimeout(() => {
      if (window.storageUsageView) {
        window.storageUsageView.loadStorageUsage().catch(err => console.warn('加载存储使用情况失败:', err));
      }
    }, 300);

    // 第三步：并行执行其他初始化任务
    const otherInitPromises = [
      loadVersionInfo().catch(err => console.warn('版本信息加载失败:', err)),
      loadSettings(elements).catch(err => console.warn('设置加载失败:', err)),
      restoreTabState().catch(err => console.warn('标签页状态恢复失败:', err)),
      initializeAdvancedSettings(elements).catch(err => console.warn('高级设置初始化失败:', err))
    ];

    // 等待其他初始化完成，但设置超时防止卡死
    await Promise.race([
      Promise.all(otherInitPromises),
      new Promise((_, reject) => setTimeout(() => reject(new Error('初始化超时')), 2000))
    ]).catch(err => {
      console.warn('部分初始化失败或超时:', err);
    });

  } catch (error) {
    console.error('初始化过程出错:', error);
    // 即使出错也要确保基本功能可用
    if (elements.currentUrl && elements.currentUrl.textContent === '加载中...') {
      elements.currentUrl.textContent = '未知网站';
    }
  }
}


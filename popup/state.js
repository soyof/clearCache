/**
 * 状态管理模块
 * 管理全局应用状态
 */

// 当前标签页信息
let currentTab = null;
let currentUrl = '';

/**
 * 设置当前标签页
 * @param {chrome.tabs.Tab} tab - 标签页对象
 */
export function setCurrentTab(tab) {
  currentTab = tab;
  if (tab && tab.url) {
    currentUrl = tab.url;
  } else {
    currentUrl = '';
  }
}

/**
 * 获取当前标签页
 * @returns {chrome.tabs.Tab|null} 当前标签页
 */
export function getCurrentTab() {
  return currentTab;
}

/**
 * 获取当前URL
 * @returns {string} 当前URL
 */
export function getCurrentUrl() {
  return currentUrl;
}

/**
 * 设置当前URL
 * @param {string} url - URL字符串
 */
export function setCurrentUrl(url) {
  currentUrl = url || '';
}


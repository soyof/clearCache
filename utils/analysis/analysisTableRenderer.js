/**
 * 分析表格渲染模块
 */

import { getMessage } from '../index.js';
import { formatBytes } from './analysisUtils.js';

/**
 * 显示空状态
 * @param {HTMLElement} container - 容器元素
 * @param {string} text - 空状态文本
 */
export function emptyState(container, text) {
  if (!container) return;
  container.innerHTML = `<div class="empty">${text}</div>`;
}

/**
 * 渲染表格
 * @param {HTMLElement} container - 表格容器
 * @param {HTMLElement} summaryDomains - 域名数显示元素
 * @param {HTMLElement} summaryItems - 条目数显示元素
 * @param {HTMLElement} summarySize - 大小显示元素
 * @param {Array} domains - 域名数据列表
 * @param {Function} onClearDomain - 清除域名回调函数
 */
export function renderTable(container, summaryDomains, summaryItems, summarySize, domains, onClearDomain) {
  if (!container) return;
  if (!domains.length) {
    emptyState(container, getMessage('analysisEmpty') || '暂无数据');
    return;
  }

  let totalItems = 0;
  let totalSize = 0;
  domains.forEach((d) => {
    totalItems += d.local.count + d.session.count + d.indexed.count + d.cache.count + d.cookies.count;
    totalSize += d.local.size + d.session.size + d.indexed.size + d.cache.size + d.cookies.size;
  });

  if (summaryDomains) summaryDomains.textContent = domains.length.toString();
  if (summaryItems) summaryItems.textContent = totalItems.toString();
  if (summarySize) summarySize.textContent = formatBytes(totalSize);

  const metricTpl = (item) => {
    const hasData = (item.count > 0) || (item.size > 0);
    return `<div class="metric ${hasData ? 'has-data' : ''}">
      <span class="count">${item.count}</span>
      <span class="size">${formatBytes(item.size)}</span>
    </div>`;
  };

  container.innerHTML = domains
    .map((d) => {
      const total = d.local.size + d.session.size + d.indexed.size + d.cache.size + d.cookies.size;
      const label = getMessage('analysisClearDomain') || '清除此域';
      const totalHasData = total > 0;
      return `
        <div class="table-row">
          <div class="col domain">${d.domain}</div>
          <div class="col">
            ${metricTpl(d.local)}
          </div>
          <div class="col">
            ${metricTpl(d.session)}
          </div>
          <div class="col">
            ${metricTpl(d.indexed)}
          </div>
          <div class="col">
            ${metricTpl(d.cache)}
          </div>
          <div class="col">
            ${metricTpl(d.cookies)}
          </div>
          <div class="col">
            <div class="metric total-size ${totalHasData ? 'has-data' : ''}">${formatBytes(total)}</div>
          </div>
          <div class="col action">
            <button class="action-btn" data-domain="${d.domain}">${label}</button>
          </div>
        </div>
      `;
    })
    .join('');

  container.querySelectorAll('.action-btn').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const domain = btn.getAttribute('data-domain');
      const confirmText = getMessage('confirmDangerousTitle') || '确认执行当前操作？';
      if (window.confirm(`${confirmText}\n${getMessage('analysisClearDomain') || '清除此域'}：${domain}`)) {
        btn.disabled = true;
        btn.textContent = getMessage('cleaning') || '正在清理...';
        if (onClearDomain) {
          await onClearDomain(domain);
        }
        btn.textContent = getMessage('analysisRescan') || '重新扫描';
        btn.disabled = false;
      }
    });
  });
}


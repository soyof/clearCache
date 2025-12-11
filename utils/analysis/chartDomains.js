/**
 * 域名视角图表模块
 */

import { getMessage } from '../index.js';
import { chartColors, formatBytes } from './analysisUtils.js';
import { createHorizontalBarOptions } from './chartConfig.js';
import { renderChart } from './chartCore.js';

/**
 * 渲染域名视角图表
 * @param {Array} domains - 域名数据列表
 */
export function renderDomainCharts(domains) {
  const itemsText = getMessage('items') || '项';

  // Top 域名（按估算大小）
  const topDomains = [...domains]
    .map((d) => ({ label: d.domain, value: d.local.size + d.session.size + d.indexed.size + d.cache.size + d.cookies.size }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10);

  renderChart('chart-top-domains', {
    type: 'bar',
    data: {
      labels: topDomains.map((d) => d.label),
      datasets: [{ label: getMessage('total') || '总计', data: topDomains.map((d) => d.value), backgroundColor: chartColors.local, borderWidth: 0 }],
    },
    options: createHorizontalBarOptions({
      tooltipLabel: (ctx) => formatBytes(ctx.parsed.x),
      xAxisFormatter: formatBytes,
    }),
  });

  // Top 域名（按条目数）
  const topDomainsByCount = [...domains]
    .map((d) => ({ label: d.domain, value: d.local.count + d.session.count + d.indexed.count + d.cache.count + d.cookies.count }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10);

  renderChart('chart-top-domains-count', {
    type: 'bar',
    data: {
      labels: topDomainsByCount.map((d) => d.label),
      datasets: [{ label: getMessage('total') || '总计', data: topDomainsByCount.map((d) => d.value), backgroundColor: chartColors.local, borderWidth: 0 }],
    },
    options: createHorizontalBarOptions({
      tooltipLabel: (ctx) => `${ctx.parsed.x} ${itemsText}`,
    }),
  });

  // Top 域名（按 Cookies 大小）
  const topCookiesDomains = [...domains]
    .map((d) => ({ label: d.domain, value: d.cookies.size }))
    .sort((a, b) => b.value - a.value)
    .filter((d) => d.value > 0)
    .slice(0, 10);

  renderChart('chart-top-cookies', {
    type: 'bar',
    data: {
      labels: topCookiesDomains.map((d) => d.label),
      datasets: [{ label: getMessage('cookies') || 'Cookies', data: topCookiesDomains.map((d) => d.value), backgroundColor: chartColors.cookies, borderWidth: 0 }],
    },
    options: createHorizontalBarOptions({
      tooltipLabel: (ctx) => formatBytes(ctx.parsed.x),
      xAxisFormatter: formatBytes,
    }),
  });
}


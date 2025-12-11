/**
 * 分布视角图表模块
 */

import { getMessage } from '../index.js';
import { formatBytes } from './analysisUtils.js';
import { renderChart } from './chartCore.js';
import { getStorageTypeLabels, getStorageTypeColors, createHorizontalBarOptions, createDoughnutOptions } from './chartConfig.js';
import { chartColors } from './analysisUtils.js';

/**
 * 渲染分布视角图表
 * @param {Array} domains - 域名数据列表
 * @param {Object} stats - 统计信息
 */
export function renderDistributionCharts(domains, stats) {
  // 域名大小分布直方图
  if (stats?.sizeBins) {
    const maxSize = Math.max(...domains.map(d => d.local.size + d.session.size + d.indexed.size + d.cache.size + d.cookies.size), 1);
    renderChart('chart-size-distribution', {
      type: 'bar',
      data: {
        labels: Array.from({ length: 10 }, (_, i) => {
          const start = (i / 10) * maxSize;
          const end = ((i + 1) / 10) * maxSize;
          return `${formatBytes(start)} - ${formatBytes(end)}`;
        }),
        datasets: [{
          label: getMessage('domainCount') || '域名数',
          data: stats.sizeBins,
          backgroundColor: chartColors.total,
          borderWidth: 0,
        }],
      },
      options: createHorizontalBarOptions({
        tooltipLabel: (ctx) => `${ctx.parsed.x} ${getMessage('domains') || '个域名'}`,
      }),
    });
  }

  // 域名条目数分布直方图
  if (stats?.itemBins) {
    const maxItems = Math.max(...domains.map(d => d.local.count + d.session.count + d.indexed.count + d.cache.count + d.cookies.count), 1);
    renderChart('chart-item-distribution', {
      type: 'bar',
      data: {
        labels: Array.from({ length: 10 }, (_, i) => {
          const start = Math.floor((i / 10) * maxItems);
          const end = Math.floor(((i + 1) / 10) * maxItems);
          return `${start} - ${end}`;
        }),
        datasets: [{
          label: getMessage('domainCount') || '域名数',
          data: stats.itemBins,
          backgroundColor: chartColors.total,
          borderWidth: 0,
        }],
      },
      options: createHorizontalBarOptions({
        tooltipLabel: (ctx) => `${ctx.parsed.x} ${getMessage('domains') || '个域名'}`,
      }),
    });
  }

  // 存储类型使用率
  if (stats?.storageUsage && domains.length > 0) {
    const totalDomains = domains.length;
    const typeLabels = getStorageTypeLabels();
    const typeColors = getStorageTypeColors();
    
    renderChart('chart-storage-usage', {
      type: 'doughnut',
      data: {
        labels: typeLabels,
        datasets: [{
          data: [
            stats.storageUsage.local,
            stats.storageUsage.session,
            stats.storageUsage.indexed,
            stats.storageUsage.cache,
            stats.storageUsage.cookies,
          ],
          backgroundColor: typeColors,
          borderWidth: 0,
        }],
      },
      options: createDoughnutOptions((ctx) => {
        const value = ctx.parsed;
        const percentage = totalDomains > 0 ? ((value / totalDomains) * 100).toFixed(1) : 0;
        return `${ctx.label}: ${value} (${percentage}%)`;
      }),
    });
  }
}


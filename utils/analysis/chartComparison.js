/**
 * 对比视角图表模块
 */

import { getMessage } from '../index.js';
import { chartColors, formatBytes } from './analysisUtils.js';
import { createHorizontalBarOptions, createVerticalBarOptions, getStorageTypeColors, getStorageTypeLabels } from './chartConfig.js';
import { renderChart } from './chartCore.js';

/**
 * 渲染对比视角图表
 * @param {Object} stats - 统计信息
 */
export function renderComparisonCharts(stats) {
  const typeLabels = getStorageTypeLabels();
  const typeColors = getStorageTypeColors();

  // 存储类型效率对比
  if (stats?.avgItemSize) {
    renderChart('chart-type-efficiency', {
      type: 'bar',
      data: {
        labels: typeLabels,
        datasets: [{
          label: getMessage('avgItemSize') || '平均条目大小',
          data: [
            stats.avgItemSize.local,
            stats.avgItemSize.session,
            stats.avgItemSize.indexed,
            stats.avgItemSize.cache,
            stats.avgItemSize.cookies,
          ],
          backgroundColor: typeColors,
          borderWidth: 0,
        }],
      },
      options: createVerticalBarOptions({
        tooltipLabel: (ctx) => formatBytes(ctx.parsed.y),
        yAxisFormatter: formatBytes,
      }),
    });
  }

  // 域名存储类型偏好
  if (stats?.domainPreference) {
    renderChart('chart-domain-preference', {
      type: 'bar',
      data: {
        labels: [
          getMessage('localOnly') || '仅 LocalStorage',
          getMessage('cookiesOnly') || '仅 Cookies',
          getMessage('mixed') || '混合使用',
        ],
        datasets: [{
          label: getMessage('domainCount') || '域名数',
          data: [
            stats.domainPreference.localOnly,
            stats.domainPreference.cookiesOnly,
            stats.domainPreference.mixed,
          ],
          backgroundColor: [chartColors.local, chartColors.cookies, chartColors.total],
          borderWidth: 0,
        }],
      },
      options: createHorizontalBarOptions({
        tooltipLabel: (ctx) => `${ctx.parsed.x} ${getMessage('domains') || '个域名'}`,
      }),
    });
  }
}


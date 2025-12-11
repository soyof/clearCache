/**
 * 存储类型视角图表模块
 */

import { getMessage } from '../index.js';
import { formatBytes } from './analysisUtils.js';
import { createDoughnutOptions, getStorageTypeColors, getStorageTypeLabels } from './chartConfig.js';
import { renderChart } from './chartCore.js';

/**
 * 渲染存储类型分布图表
 * @param {Array} domains - 域名数据列表
 */
export function renderTypeCharts(domains) {
  const typeLabels = getStorageTypeLabels();
  const typeColors = getStorageTypeColors();
  const itemsText = getMessage('items') || '项';

  // 按存储类型分布（大小）
  renderChart('chart-types', {
    type: 'doughnut',
    data: {
      labels: typeLabels,
      datasets: [
        {
          data: [
            domains.reduce((s, d) => s + d.local.size, 0),
            domains.reduce((s, d) => s + d.session.size, 0),
            domains.reduce((s, d) => s + d.indexed.size, 0),
            domains.reduce((s, d) => s + d.cache.size, 0),
            domains.reduce((s, d) => s + d.cookies.size, 0),
          ],
          backgroundColor: typeColors,
          borderWidth: 0,
        },
      ],
    },
    options: createDoughnutOptions((ctx) => `${ctx.label}: ${formatBytes(ctx.parsed)}`),
  });

  // 按存储类型条目数分布
  renderChart('chart-types-count', {
    type: 'doughnut',
    data: {
      labels: typeLabels,
      datasets: [
        {
          data: [
            domains.reduce((s, d) => s + d.local.count, 0),
            domains.reduce((s, d) => s + d.session.count, 0),
            domains.reduce((s, d) => s + d.indexed.count, 0),
            domains.reduce((s, d) => s + d.cache.count, 0),
            domains.reduce((s, d) => s + d.cookies.count, 0),
          ],
          backgroundColor: typeColors,
          borderWidth: 0,
        },
      ],
    },
    options: createDoughnutOptions((ctx) => `${ctx.label}: ${ctx.parsed} ${itemsText}`),
  });
}


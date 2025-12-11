/**
 * 域名 × 类型视角图表模块
 */

import { getMessage } from '../index.js';
import { chartColors, formatBytes } from './analysisUtils.js';
import { createBaseChartOptions, getStorageTypeColors, getStorageTypeLabels } from './chartConfig.js';
import { renderChart } from './chartCore.js';

/**
 * 渲染域名×类型堆叠图表
 * @param {Array} domains - 域名数据列表
 */
export function renderStackCharts(domains) {
  const typeLabels = getStorageTypeLabels();
  const typeColors = getStorageTypeColors();
  const itemsText = getMessage('items') || '项';
  const top8 = [...domains].slice(0, 8);
  const domainLabels = top8.map((d) => d.domain);

  // Top 域名存储类型堆叠（大小）
  const stackedSizeDatasets = [
    { key: 'local', color: chartColors.local, label: typeLabels[0] },
    { key: 'session', color: chartColors.session, label: typeLabels[1] },
    { key: 'indexed', color: chartColors.indexed, label: typeLabels[2] },
    { key: 'cache', color: chartColors.cache, label: typeLabels[3] },
    { key: 'cookies', color: chartColors.cookies, label: typeLabels[4] },
  ].map((s) => ({
    label: s.label,
    data: top8.map((d) =>
      s.key === 'local'
        ? d.local.size
        : s.key === 'session'
        ? d.session.size
        : s.key === 'indexed'
        ? d.indexed.size
        : s.key === 'cache'
        ? d.cache.size
        : d.cookies.size
    ),
    backgroundColor: s.color,
    stack: 'size',
    borderWidth: 0,
  }));

  renderChart('chart-domain-type-size', {
    type: 'bar',
    data: { labels: domainLabels, datasets: stackedSizeDatasets },
    options: createBaseChartOptions({
      indexAxis: 'y',
      showLegend: true,
      legendPosition: 'bottom',
      tooltipLabel: (ctx) => `${ctx.dataset.label}: ${formatBytes(ctx.parsed.x)}`,
      xAxisFormatter: formatBytes,
      stacked: true,
    }),
  });

  // Top 域名存储类型堆叠（条目数）
  const stackedCountDatasets = [
    { key: 'local', color: chartColors.local, label: typeLabels[0] },
    { key: 'session', color: chartColors.session, label: typeLabels[1] },
    { key: 'indexed', color: chartColors.indexed, label: typeLabels[2] },
    { key: 'cache', color: chartColors.cache, label: typeLabels[3] },
    { key: 'cookies', color: chartColors.cookies, label: typeLabels[4] },
  ].map((s) => ({
    label: s.label,
    data: top8.map((d) =>
      s.key === 'local'
        ? d.local.count
        : s.key === 'session'
        ? d.session.count
        : s.key === 'indexed'
        ? d.indexed.count
        : s.key === 'cache'
        ? d.cache.count
        : d.cookies.count
    ),
    backgroundColor: s.color,
    stack: 'count',
    borderWidth: 0,
  }));

  renderChart('chart-domain-type-count', {
    type: 'bar',
    data: { labels: domainLabels, datasets: stackedCountDatasets },
    options: createBaseChartOptions({
      indexAxis: 'y',
      showLegend: true,
      legendPosition: 'bottom',
      tooltipLabel: (ctx) => `${ctx.dataset.label}: ${ctx.parsed.x} ${itemsText}`,
      stacked: true,
    }),
  });
}


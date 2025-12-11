/**
 * 统计摘要视角图表模块
 */

import { getMessage } from '../index.js';
import { chartColors, formatBytes } from './analysisUtils.js';
import { createVerticalBarOptions, getStorageTypeLabels } from './chartConfig.js';
import { renderChart } from './chartCore.js';

/**
 * 渲染统计摘要图表
 * @param {Array} domains - 域名数据列表
 * @param {Object} stats - 统计信息
 * @param {HTMLElement} statisticsListEl - 统计列表容器
 */
export function renderStatisticsCharts(domains, stats, statisticsListEl) {
  // 存储统计摘要
  if (stats?.statistics && statisticsListEl) {
    const s = stats.statistics;
    const html = `
      <div class="quality-item">
        <span>${getMessage('minSize') || '最小大小'}：</span>
        <strong>${formatBytes(s.min)}</strong>
      </div>
      <div class="quality-item">
        <span>${getMessage('maxSize') || '最大大小'}：</span>
        <strong>${formatBytes(s.max)}</strong>
      </div>
      <div class="quality-item">
        <span>${getMessage('avgSize') || '平均大小'}：</span>
        <strong>${formatBytes(s.avg)}</strong>
      </div>
      <div class="quality-item">
        <span>${getMessage('medianSize') || '中位数大小'}：</span>
        <strong>${formatBytes(s.median)}</strong>
      </div>
    `;
    statisticsListEl.innerHTML = html;
  }

  // 存储类型大小分布箱线图（使用条形图模拟）
  if (stats?.domainSizes && domains.length > 0) {
    const typeLabels = getStorageTypeLabels();
    const typeSizes = {
      local: domains.map(d => d.local.size).filter(s => s > 0),
      session: domains.map(d => d.session.size).filter(s => s > 0),
      indexed: domains.map(d => d.indexed.size).filter(s => s > 0),
      cache: domains.map(d => d.cache.size).filter(s => s > 0),
      cookies: domains.map(d => d.cookies.size).filter(s => s > 0),
    };
    
    const calculateStats = (arr) => {
      if (arr.length === 0) return { min: 0, q1: 0, median: 0, q3: 0, max: 0 };
      const sorted = [...arr].sort((a, b) => a - b);
      const q1 = sorted[Math.floor(sorted.length * 0.25)];
      const median = sorted[Math.floor(sorted.length * 0.5)];
      const q3 = sorted[Math.floor(sorted.length * 0.75)];
      return {
        min: sorted[0],
        q1,
        median,
        q3,
        max: sorted[sorted.length - 1],
      };
    };
    
    const boxData = [
      { label: typeLabels[0], stats: calculateStats(typeSizes.local) },
      { label: typeLabels[1], stats: calculateStats(typeSizes.session) },
      { label: typeLabels[2], stats: calculateStats(typeSizes.indexed) },
      { label: typeLabels[3], stats: calculateStats(typeSizes.cache) },
      { label: typeLabels[4], stats: calculateStats(typeSizes.cookies) },
    ];
    
    renderChart('chart-box-plot', {
      type: 'bar',
      data: {
        labels: boxData.map(d => d.label),
        datasets: [
          {
            label: getMessage('min') || '最小值',
            data: boxData.map(d => d.stats.min),
            backgroundColor: chartColors.local,
          },
          {
            label: getMessage('q1') || 'Q1',
            data: boxData.map(d => d.stats.q1),
            backgroundColor: chartColors.session,
          },
          {
            label: getMessage('median') || '中位数',
            data: boxData.map(d => d.stats.median),
            backgroundColor: chartColors.indexed,
          },
          {
            label: getMessage('q3') || 'Q3',
            data: boxData.map(d => d.stats.q3),
            backgroundColor: chartColors.cache,
          },
          {
            label: getMessage('max') || '最大值',
            data: boxData.map(d => d.stats.max),
            backgroundColor: chartColors.cookies,
          },
        ],
      },
      options: createVerticalBarOptions({
        showLegend: true,
        tooltipLabel: (ctx) => `${ctx.dataset.label}: ${formatBytes(ctx.parsed.y)}`,
        yAxisFormatter: formatBytes,
      }),
    });
  }
}


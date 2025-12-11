/**
 * 集中度视角图表模块
 */

import { getMessage } from '../index.js';
import { formatBytes } from './analysisUtils.js';
import { renderChart } from './chartCore.js';
import { chartColors } from './analysisUtils.js';
import { createHorizontalBarOptions, createDualAxisScales, createSafeTicksCallback } from './chartConfig.js';

/**
 * 渲染集中度视角图表
 * @param {Object} stats - 统计信息
 */
export function renderConcentrationCharts(stats) {
  // 存储集中度分析（帕累托图）
  if (stats?.concentration) {
    const top20 = stats.concentration.slice(0, 20);
    renderChart('chart-concentration', {
      type: 'line',
      data: {
        labels: top20.map((_, i) => (i + 1).toString()),
        datasets: [
          {
            label: getMessage('cumulativeRatio') || '累计占比',
            data: top20.map(d => d.cumulativeRatio * 100),
            borderColor: chartColors.local,
            backgroundColor: 'transparent',
            yAxisID: 'y',
            tension: 0.4,
            pointRadius: 4,
            pointHoverRadius: 6,
          },
        ],
      },
      options: {
        plugins: {
          legend: { labels: { color: '#e8f4ff' } },
          tooltip: {
            callbacks: {
              label: (ctx) => {
                if (ctx.datasetIndex === 0) {
                  return `${ctx.dataset.label}: ${ctx.parsed.y.toFixed(1)}%`;
                }
                return `${ctx.dataset.label}: ${formatBytes(ctx.parsed.y)}`;
              },
            },
          },
        },
        scales: createDualAxisScales({
          leftAxisFormatter: (v) => `${v.toFixed(1)}%`,
          rightAxisFormatter: formatBytes,
          leftMax: 100,
        }),
      },
    });
  }

  // Top 域名占比分析
  if (stats?.concentration) {
    const ratios = [10, 20, 50].map(n => {
      const topN = stats.concentration.slice(0, n);
      const totalSize = stats.concentration.reduce((sum, d) => sum + d.size, 0);
      const topNSize = topN.reduce((sum, d) => sum + d.size, 0);
      return {
        label: `Top ${n}`,
        ratio: totalSize > 0 ? (topNSize / totalSize) * 100 : 0,
      };
    });
    
    renderChart('chart-top-domain-ratio', {
      type: 'bar',
      data: {
        labels: ratios.map(r => r.label),
        datasets: [{
          label: getMessage('ratio') || '占比',
          data: ratios.map(r => r.ratio),
          backgroundColor: chartColors.total,
          borderWidth: 0,
        }],
      },
      options: createHorizontalBarOptions({
        tooltipLabel: (ctx) => `${ctx.parsed.x.toFixed(1)}%`,
        xAxisFormatter: (v) => `${v}%`,
        xMax: 100,
      }),
    });
  }
}


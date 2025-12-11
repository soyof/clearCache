/**
 * 细分视角图表模块
 */

import { getMessage } from '../index.js';
import { chartColors, formatBytes } from './analysisUtils.js';
import { createDualAxisScales, createHorizontalBarOptions } from './chartConfig.js';
import { renderChart } from './chartCore.js';

/**
 * 渲染细分视角图表
 * @param {Object} stats - 统计信息
 */
export function renderSegmentationCharts(stats) {
  // 按顶级域名（TLD）分组统计
  if (stats?.tldMap && stats.tldMap.length > 0) {
    const top10 = [...stats.tldMap]
      .sort((a, b) => b.size - a.size)
      .slice(0, 10);
    
    renderChart('chart-tld-distribution', {
      type: 'bar',
      data: {
        labels: top10.map(d => `.${d.tld}`),
        datasets: [
          {
            label: getMessage('domainCount') || '域名数',
            data: top10.map(d => d.count),
            backgroundColor: chartColors.local,
            yAxisID: 'y',
          },
          {
            label: getMessage('totalSize') || '总大小',
            data: top10.map(d => d.size),
            backgroundColor: chartColors.cookies,
            yAxisID: 'y1',
          },
        ],
      },
      options: {
        indexAxis: 'y',
        plugins: {
          legend: { labels: { color: '#e8f4ff' } },
          tooltip: {
            callbacks: {
              label: (ctx) => {
                if (ctx.datasetIndex === 0) {
                  return `${ctx.dataset.label}: ${ctx.parsed.x}`;
                }
                return `${ctx.dataset.label}: ${formatBytes(ctx.parsed.x)}`;
              },
            },
          },
        },
        scales: createDualAxisScales({
          leftAxisFormatter: (value) => {
            // 格式化左轴（域名数量）为整数
            const num = Math.round(value);
            return num.toString();
          },
          rightAxisFormatter: formatBytes,
        }),
      },
    });
  }

  // 按域名长度分组统计
  if (stats?.lengthBins) {
    renderChart('chart-domain-length', {
      type: 'bar',
      data: {
        labels: [
          getMessage('short') || '短 (<10)',
          getMessage('medium') || '中 (10-20)',
          getMessage('long') || '长 (20-30)',
          getMessage('veryLong') || '很长 (>30)',
        ],
        datasets: [{
          label: getMessage('domainCount') || '域名数',
          data: [
            stats.lengthBins.short,
            stats.lengthBins.medium,
            stats.lengthBins.long,
            stats.lengthBins.veryLong,
          ],
          backgroundColor: chartColors.total,
          borderWidth: 0,
        }],
      },
      options: createHorizontalBarOptions({
        tooltipLabel: (ctx) => `${ctx.parsed.x} ${getMessage('domains') || '个域名'}`,
      }),
    });
  }

  // 按存储类型组合分组
  if (stats?.storageCombination) {
    renderChart('chart-storage-combination', {
      type: 'bar',
      data: {
        labels: [
          getMessage('none') || '无',
          getMessage('localOnly') || '仅 LocalStorage',
          getMessage('cookiesOnly') || '仅 Cookies',
          getMessage('localAndCookies') || 'LocalStorage + Cookies',
          getMessage('all') || '全部类型',
          getMessage('other') || '其他组合',
        ],
        datasets: [{
          label: getMessage('domainCount') || '域名数',
          data: [
            stats.storageCombination.none,
            stats.storageCombination.localOnly,
            stats.storageCombination.cookiesOnly,
            stats.storageCombination.localAndCookies,
            stats.storageCombination.all,
            stats.storageCombination.other,
          ],
          backgroundColor: chartColors.total,
          borderWidth: 0,
        }],
      },
      options: createHorizontalBarOptions({
        tooltipLabel: (ctx) => `${ctx.parsed.x} ${getMessage('domains') || '个域名'}`,
      }),
    });
  }
}


/**
 * 效率与密度视角图表模块
 */

import { getMessage } from '../index.js';
import { chartColors, formatBytes } from './analysisUtils.js';
import { createHorizontalBarOptions, createSafeTicksCallback, getStorageTypeColors, getStorageTypeLabels } from './chartConfig.js';
import { renderChart } from './chartCore.js';

/**
 * 渲染效率与密度视角图表
 * @param {Array} domains - 域名数据列表
 * @param {Object} stats - 统计信息
 */
export function renderEfficiencyCharts(domains, stats) {
  const typeLabels = getStorageTypeLabels();
  const typeColors = getStorageTypeColors();
  const itemsText = getMessage('items') || '项';

  // 各存储类型平均条目大小
  if (stats?.avgItemSize) {
    renderChart('chart-avg-item-size', {
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
      options: createHorizontalBarOptions({
        tooltipLabel: (ctx) => formatBytes(ctx.parsed.x),
        xAxisFormatter: formatBytes,
      }),
    });
  }

  // 域名存储密度分布
  if (domains && domains.length > 0) {
    const densityData = domains.map(d => {
      const totalSize = d.local.size + d.session.size + d.indexed.size + d.cache.size + d.cookies.size;
      const totalCount = d.local.count + d.session.count + d.indexed.count + d.cache.count + d.cookies.count;
      return totalCount > 0 ? totalSize / totalCount : 0;
    }).filter(d => d > 0);
    
    if (densityData.length > 0) {
      const maxDensity = Math.max(...densityData);
      const densityBins = Array(10).fill(0);
      densityData.forEach(d => {
        const binIndex = Math.min(Math.floor((d / maxDensity) * 10), 9);
        densityBins[binIndex]++;
      });
      
      renderChart('chart-storage-density', {
        type: 'bar',
        data: {
          labels: Array.from({ length: 10 }, (_, i) => {
            const start = (i / 10) * maxDensity;
            const end = ((i + 1) / 10) * maxDensity;
            return `${formatBytes(start)} - ${formatBytes(end)}`;
          }),
          datasets: [{
            label: getMessage('domainCount') || '域名数',
            data: densityBins,
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

  // 域名大小与条目数散点图
  if (domains && domains.length > 0) {
    const scatterData = domains.slice(0, 50).map(d => ({
      x: d.local.count + d.session.count + d.indexed.count + d.cache.count + d.cookies.count,
      y: d.local.size + d.session.size + d.indexed.size + d.cache.size + d.cookies.size,
      domain: d.domain,
    }));
    
    renderChart('chart-size-item-scatter', {
      type: 'scatter',
      data: {
        datasets: [{
          label: getMessage('domains') || '域名',
          data: scatterData.map(d => ({ x: d.x, y: d.y })),
          backgroundColor: chartColors.local,
          borderColor: chartColors.local,
          pointRadius: 4,
        }],
      },
      options: {
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              title: () => '',
              label: (ctx) => {
                const idx = ctx.dataIndex;
                const d = scatterData[idx];
                return `${d.domain}: ${d.x} ${itemsText}, ${formatBytes(d.y)}`;
              },
            },
          },
        },
        scales: {
          x: {
            title: { display: true, text: getMessage('itemCount') || '条目数', color: '#e8f4ff' },
            ticks: { color: '#e8f4ff' },
          },
          y: {
            title: { display: true, text: getMessage('size') || '大小', color: '#e8f4ff' },
            ticks: { color: '#e8f4ff', callback: createSafeTicksCallback(formatBytes) },
          },
        },
      },
    });
  }
}


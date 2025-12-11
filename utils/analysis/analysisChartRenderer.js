/**
 * 分析图表渲染模块
 * 负责协调调用各个图表模块
 */

import { renderComparisonCharts } from './chartComparison.js';
import { renderConcentrationCharts } from './chartConcentration.js';
import { renderDistributionCharts } from './chartDistribution.js';
import { renderDomainCharts } from './chartDomains.js';
import { renderEfficiencyCharts } from './chartEfficiency.js';
import { renderQualityCharts } from './chartQuality.js';
import { renderSecurityCharts } from './chartSecurity.js';
import { renderSegmentationCharts } from './chartSegmentation.js';
import { renderStackCharts } from './chartStacks.js';
import { renderStatisticsCharts } from './chartStatistics.js';
import { renderTypeCharts } from './chartTypes.js';

/**
 * 渲染所有图表（分批渲染以优化性能）
 * @param {Array} domains - 域名数据列表
 * @param {Object} stats - 统计信息
 * @param {HTMLElement} qualityListEl - 质量列表容器
 * @param {HTMLElement} statisticsListEl - 统计列表容器
 */
export function renderCharts(domains, stats, qualityListEl, statisticsListEl) {
  if (!domains || !domains.length) return;

  // 使用 requestAnimationFrame 分批渲染，避免阻塞UI
  const renderTasks = [
    () => renderTypeCharts(domains),
    () => renderDomainCharts(domains),
    () => renderStackCharts(domains),
    () => renderQualityCharts(domains, stats, qualityListEl),
    () => renderEfficiencyCharts(domains, stats),
    () => renderConcentrationCharts(stats),
    () => renderDistributionCharts(domains, stats),
    () => renderComparisonCharts(stats),
    () => renderSecurityCharts(stats),
    () => renderSegmentationCharts(stats),
    () => renderStatisticsCharts(domains, stats, statisticsListEl),
  ];

  // 分批执行，每批渲染2-3个图表
  let index = 0;
  const batchSize = 2;
  
  function renderBatch() {
    const end = Math.min(index + batchSize, renderTasks.length);
    for (let i = index; i < end; i++) {
      renderTasks[i]();
    }
    index = end;
    
    if (index < renderTasks.length) {
      // 使用 requestAnimationFrame 延迟下一批，让浏览器有机会渲染
      requestAnimationFrame(() => {
        setTimeout(renderBatch, 10); // 小延迟确保UI更新
      });
    }
  }
  
  renderBatch();
}

// 导出 renderChart 供其他模块使用（如果需要）
export { renderChart } from './chartCore.js';

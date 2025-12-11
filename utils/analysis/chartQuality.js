/**
 * 存储质量与风险图表模块
 */

import { getMessage } from '../index.js';
import { chartColors } from './analysisUtils.js';
import { createDoughnutOptions, createHorizontalBarOptions } from './chartConfig.js';
import { renderChart } from './chartCore.js';

/**
 * 渲染存储质量与风险图表
 * @param {Array} domains - 域名数据列表
 * @param {Object} stats - 统计信息
 * @param {HTMLElement} qualityListEl - 质量列表容器
 */
export function renderQualityCharts(domains, stats, qualityListEl) {
  const itemsText = getMessage('items') || '项';

  // 存储条目大小分布
  if (stats?.sizeBuckets) {
    renderChart('chart-size-buckets', {
      type: 'bar',
      data: {
        labels: ['<1KB', '1-10KB', '10-100KB', '100KB+'],
        datasets: [
          {
            label: itemsText,
            data: [
              (stats.sizeBuckets.local.lt1k || 0) + (stats.sizeBuckets.session.lt1k || 0) + (stats.sizeBuckets.cookies.lt1k || 0),
              (stats.sizeBuckets.local.lt10k || 0) + (stats.sizeBuckets.session.lt10k || 0) + (stats.sizeBuckets.cookies.lt10k || 0),
              (stats.sizeBuckets.local.lt100k || 0) + (stats.sizeBuckets.session.lt100k || 0) + (stats.sizeBuckets.cookies.lt100k || 0),
              (stats.sizeBuckets.local.gte100k || 0) + (stats.sizeBuckets.session.gte100k || 0) + (stats.sizeBuckets.cookies.gte100k || 0),
            ],
            backgroundColor: chartColors.total,
            borderWidth: 0,
          },
        ],
      },
      options: createHorizontalBarOptions({
        tooltipLabel: (ctx) => `${ctx.parsed.x} ${itemsText}`,
      }),
    });
  }

  // Cookies 安全属性
  if (stats?.cookiesStats?.security) {
    const sec = stats.cookiesStats.security;
    renderChart('chart-cookies-security', {
      type: 'doughnut',
      data: {
        labels: ['Secure', 'Insecure', 'HttpOnly', 'Non-HttpOnly', 'SameSite=Lax', 'SameSite=Strict', 'SameSite=None', 'Unspecified'],
        datasets: [
          {
            data: [sec.secure, sec.insecure, sec.httpOnly, sec.notHttpOnly, sec.sameSiteLax, sec.sameSiteStrict, sec.sameSiteNone, sec.sameSiteUnspecified],
            backgroundColor: [chartColors.local, chartColors.cache, chartColors.session, chartColors.indexed, chartColors.cookies, '#9dd0ff', '#ffbf80', '#c0b2ff'],
            borderWidth: 0,
          },
        ],
      },
      options: createDoughnutOptions(),
    });
  }

  // Cookies 过期分布
  if (stats?.cookiesStats?.expiry) {
    const exp = stats.cookiesStats.expiry;
    renderChart('chart-cookies-expiry', {
      type: 'doughnut',
      data: {
        labels: [
          getMessage('cookiesExpiryLt7d') || '≤7天',
          getMessage('cookiesExpiryLt30d') || '≤30天',
          getMessage('cookiesExpiryMid') || '中期',
          getMessage('cookiesExpiryGt180d') || '≥180天',
          getMessage('cookiesExpiryNo') || '无过期',
          getMessage('cookiesExpiryExpired') || '已过期',
        ],
        datasets: [
          {
            data: [exp.lt7d, exp.lt30d, exp.mid, exp.gt180d, exp.noExpiry, exp.expired],
            backgroundColor: [chartColors.session, chartColors.local, chartColors.cache, chartColors.indexed, chartColors.cookies, '#ff6b6b'],
            borderWidth: 0,
          },
        ],
      },
      options: createDoughnutOptions(),
    });
  }

  // 7 天内即将过期的 Cookies 域名 Top
  if (stats?.cookiesStats?.expiringSoonDomains) {
    const arr = Array.from(stats.cookiesStats.expiringSoonDomains.entries())
      .map(([domain, count]) => ({ label: domain, value: count }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);

    renderChart('chart-cookies-expiring-soon', {
      type: 'bar',
      data: {
        labels: arr.map((a) => a.label),
        datasets: [{ label: getMessage('cookiesExpiryLt7d') || '≤7天', data: arr.map((a) => a.value), backgroundColor: chartColors.total, borderWidth: 0 }],
      },
      options: createHorizontalBarOptions({
        tooltipLabel: (ctx) => `${ctx.parsed.x} ${itemsText}`,
      }),
    });
  }

  // 质量与风险概要
  if (stats?.quality && qualityListEl) {
    const q = stats.quality;
    const html = `
      <div class="quality-item">
        <span>${getMessage('qualityLocalJsonFail') || 'LocalStorage JSON 解析失败'}：</span>
        <strong>${q.localJsonFail}</strong>
      </div>
      <div class="quality-item">
        <span>${getMessage('qualitySessionJsonFail') || 'SessionStorage JSON 解析失败'}：</span>
        <strong>${q.sessionJsonFail}</strong>
      </div>
      <div class="quality-item">
        <span>${getMessage('qualityLocalLarge') || 'LocalStorage 超大键(>100KB)'}：</span>
        <strong>${q.localLargeKeys}</strong>
      </div>
      <div class="quality-item">
        <span>${getMessage('qualitySessionLarge') || 'SessionStorage 超大键(>100KB)'}：</span>
        <strong>${q.sessionLargeKeys}</strong>
      </div>
    `;
    qualityListEl.innerHTML = html;
  }
}


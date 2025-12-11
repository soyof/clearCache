/**
 * 安全与风险视角图表模块
 */

import { getMessage } from '../index.js';
import { chartColors } from './analysisUtils.js';
import { createHorizontalBarOptions } from './chartConfig.js';
import { renderChart } from './chartCore.js';

/**
 * 渲染安全与风险视角图表
 * @param {Object} stats - 统计信息
 */
export function renderSecurityCharts(stats) {
  const itemsText = getMessage('items') || '项';

  // 不安全 Cookies 域名 Top
  if (stats?.insecureCookiesDomains && stats.insecureCookiesDomains.length > 0) {
    const top10 = stats.insecureCookiesDomains
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
    
    renderChart('chart-insecure-cookies', {
      type: 'bar',
      data: {
        labels: top10.map(d => d.domain),
        datasets: [{
          label: getMessage('insecureCookies') || '不安全 Cookies',
          data: top10.map(d => d.count),
          backgroundColor: '#ff6b6b',
          borderWidth: 0,
        }],
      },
      options: createHorizontalBarOptions({
        tooltipLabel: (ctx) => `${ctx.parsed.x} ${itemsText}`,
      }),
    });
  }

  // 过期 Cookies 域名分布
  if (stats?.expiredCookiesDomains && stats.expiredCookiesDomains.length > 0) {
    const top10 = stats.expiredCookiesDomains
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
    
    renderChart('chart-expired-cookies', {
      type: 'bar',
      data: {
        labels: top10.map(d => d.domain),
        datasets: [{
          label: getMessage('expiredCookies') || '过期 Cookies',
          data: top10.map(d => d.count),
          backgroundColor: '#ffa500',
          borderWidth: 0,
        }],
      },
      options: createHorizontalBarOptions({
        tooltipLabel: (ctx) => `${ctx.parsed.x} ${itemsText}`,
      }),
    });
  }

  // Cookies 安全属性组合分析
  if (stats?.securityCombination) {
    const sc = stats.securityCombination;
    const combinations = [
      { label: 'Secure+HttpOnly+Strict', value: sc.secureHttpOnlyStrict },
      { label: 'Secure+HttpOnly+Lax', value: sc.secureHttpOnlyLax },
      { label: 'Secure+HttpOnly+None', value: sc.secureHttpOnlyNone },
      { label: 'Secure+NotHttpOnly+Strict', value: sc.secureNotHttpOnlyStrict },
      { label: 'Secure+NotHttpOnly+Lax', value: sc.secureNotHttpOnlyLax },
      { label: 'Secure+NotHttpOnly+None', value: sc.secureNotHttpOnlyNone },
      { label: 'Insecure+HttpOnly+Strict', value: sc.insecureHttpOnlyStrict },
      { label: 'Insecure+HttpOnly+Lax', value: sc.insecureHttpOnlyLax },
      { label: 'Insecure+HttpOnly+None', value: sc.insecureHttpOnlyNone },
      { label: 'Insecure+NotHttpOnly+Strict', value: sc.insecureNotHttpOnlyStrict },
      { label: 'Insecure+NotHttpOnly+Lax', value: sc.insecureNotHttpOnlyLax },
      { label: 'Insecure+NotHttpOnly+None', value: sc.insecureNotHttpOnlyNone },
    ].filter(c => c.value > 0);
    
    if (combinations.length > 0) {
      renderChart('chart-security-combination', {
        type: 'bar',
        data: {
          labels: combinations.map(c => c.label),
          datasets: [{
            label: getMessage('cookieCount') || 'Cookies 数量',
            data: combinations.map(c => c.value),
            backgroundColor: chartColors.cookies,
            borderWidth: 0,
          }],
        },
        options: createHorizontalBarOptions({
          tooltipLabel: (ctx) => `${ctx.parsed.x} ${itemsText}`,
        }),
      });
    }
  }
}


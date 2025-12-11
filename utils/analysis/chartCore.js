/**
 * 图表核心渲染模块
 * 提供基础的图表渲染功能和兜底方案
 */

import { getMessage } from '../index.js';
import { chartColors, chartTextStyles, formatBytes } from './analysisUtils.js';

const chartInstances = {};

/**
 * 准备画布
 * @param {HTMLCanvasElement} canvas - 画布元素
 * @returns {Object|null} 画布上下文和尺寸
 */
function prepareCanvas(canvas) {
  if (!canvas) return null;
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  ctx.resetTransform?.();
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, rect.width, rect.height);
  return { ctx, width: rect.width, height: rect.height };
}

/**
 * 绘制环形图（兜底方案）
 * @param {string} canvasId - 画布ID
 * @param {Array} labels - 标签数组
 * @param {Array} data - 数据数组
 * @param {Array} colors - 颜色数组
 */
function drawDoughnut(canvasId, labels, data, colors) {
  const canvas = document.getElementById(canvasId);
  const prep = prepareCanvas(canvas);
  if (!prep) return;
  const { ctx, width, height } = prep;
  const total = data.reduce((s, v) => s + v, 0);
  if (!total) return;
  const centerX = width / 2;
  const centerY = height / 2;
  const outerR = Math.min(centerX, centerY) - 10;
  const innerR = outerR * 0.55;
  let start = -Math.PI / 2;
  data.forEach((val, i) => {
    if (val <= 0) return;
    const angle = (val / total) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, outerR, start, start + angle);
    ctx.closePath();
    ctx.fillStyle = colors[i] || chartColors.total;
    ctx.fill();
    start += angle;
  });
  ctx.globalCompositeOperation = 'destination-out';
  ctx.beginPath();
  ctx.arc(centerX, centerY, innerR, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = chartTextStyles.primary;
  ctx.font = '600 14px "Segoe UI", Arial';
  ctx.textAlign = 'center';
  ctx.fillText(getMessage('total') || '总计', centerX, centerY - 4);
  ctx.font = '700 16px "Segoe UI", Arial';
  ctx.fillText(formatBytes(total), centerX, centerY + 18);
}

/**
 * 绘制条形图（兜底方案）
 * @param {string} canvasId - 画布ID
 * @param {Array} labels - 标签数组
 * @param {Array} datasets - 数据集数组
 * @param {Object} options - 选项
 */
function drawBar(canvasId, labels, datasets, { stacked = false, horizontal = false, formatter = (v) => v.toString() } = {}) {
  const canvas = document.getElementById(canvasId);
  const prep = prepareCanvas(canvas);
  if (!prep) return;
  const { ctx, width, height } = prep;
  const padding = 20;
  const barHeight = 24;
  const gap = 10;
  const max = Math.max(
    ...labels.map((_, idx) => {
      if (stacked) {
        return datasets.reduce((s, ds) => s + (ds.data[idx] || 0), 0);
      }
      return Math.max(...datasets.map((ds) => ds.data[idx] || 0));
    }),
    1
  );
  labels.forEach((label, idx) => {
    const y = padding + idx * (barHeight + gap);
    if (y + barHeight > height - padding) return;
    let xCursor = padding;
    datasets.forEach((ds) => {
      const val = ds.data[idx] || 0;
      const w = ((width - padding * 2) * val) / max;
      if (w > 0) {
        ctx.fillStyle = ds.backgroundColor || chartColors.total;
        ctx.globalAlpha = 0.9;
        if (horizontal) {
          ctx.fillRect(xCursor, y, w, barHeight);
        } else {
          ctx.fillRect(y, height - padding - w, barHeight, w);
        }
      }
      xCursor += stacked ? w : 0;
    });
    ctx.globalAlpha = 1;
    ctx.fillStyle = chartTextStyles.primary;
    ctx.font = '600 12px "Segoe UI", Arial';
    ctx.textAlign = 'left';
    ctx.fillText(label, padding + 4, y + barHeight / 2 + 4);
    ctx.fillStyle = chartTextStyles.secondary;
    ctx.textAlign = 'right';
    const totalVal = stacked
      ? datasets.reduce((s, ds) => s + (ds.data[idx] || 0), 0)
      : Math.max(...datasets.map((ds) => ds.data[idx] || 0));
    ctx.fillText(formatter(totalVal), width - padding, y + barHeight / 2 + 4);
  });
}

/**
 * 渲染图表
 * @param {string} canvasId - 画布ID
 * @param {Object} config - Chart.js 配置对象
 */
export function renderChart(canvasId, config) {
  const el = document.getElementById(canvasId);
  if (!el) return;
  
  // 优先使用插件提供的 Chart（已放置于 /plugins）
  if (typeof Chart !== 'undefined') {
    if (chartInstances[canvasId]?.destroy) {
      chartInstances[canvasId].destroy();
    }
    chartInstances[canvasId] = new Chart(el, config);
    return;
  }

  // 兜底：无 Chart 时使用简易绘制，避免空白
  if (config.type === 'doughnut') {
    drawDoughnut(canvasId, config.data.labels, config.data.datasets[0].data, config.data.datasets[0].backgroundColor);
  } else if (config.type === 'bar') {
    const horizontal = config.options?.indexAxis === 'y';
    const stacked = config.data.datasets.some((d) => d.stack);
    const formatter = config.options?.plugins?.tooltip?.callbacks?.label || ((ctxVal) => ctxVal.toString());
    const fmt = (v) => {
      try {
        return formatter({ parsed: { x: v, y: v } });
      } catch (_) {
        return v.toString();
      }
    };
    drawBar(
      canvasId,
      config.data.labels,
      config.data.datasets.map((d) => ({ data: d.data, backgroundColor: d.backgroundColor })),
      { stacked, horizontal, formatter: fmt }
    );
  }
  chartInstances[canvasId] = { destroy() {} };
}


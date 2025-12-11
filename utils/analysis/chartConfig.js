/**
 * 图表通用配置模块
 * 提供通用的图表配置生成函数和工具
 */

import { getMessage } from '../index.js';
import { chartColors } from './analysisUtils.js';

/**
 * 获取存储类型标签
 */
export function getStorageTypeLabels() {
  return [
    getMessage('localStorage') || 'LocalStorage',
    getMessage('sessionStorage') || 'SessionStorage',
    getMessage('indexedDB') || 'IndexedDB',
    getMessage('cacheAPI') || 'Cache',
    getMessage('cookies') || 'Cookies',
  ];
}

/**
 * 获取存储类型颜色数组
 */
export function getStorageTypeColors() {
  return [chartColors.local, chartColors.session, chartColors.indexed, chartColors.cache, chartColors.cookies];
}

/**
 * 创建安全的 ticks callback 函数
 * @param {Function} formatter - 格式化函数
 * @returns {Function} callback 函数
 */
export function createSafeTicksCallback(formatter) {
  return function(value) {
    try {
      if (value === null || value === undefined) return '';
      const numValue = typeof value === 'number' ? value : Number(value);
      if (isNaN(numValue) || numValue < 0) return '';
      const result = formatter(numValue);
      return String(result || '');
    } catch (e) {
      return '';
    }
  };
}

/**
 * 创建通用的图表基础选项
 * @param {Object} options - 选项
 * @returns {Object} Chart.js 选项对象
 */
export function createBaseChartOptions(options = {}) {
  const {
    showLegend = false,
    legendPosition = 'bottom',
    tooltipLabel,
    indexAxis = null,
    xAxisFormatter = null,
    yAxisFormatter = null,
    xMax = null,
    yMax = null,
    stacked = false,
  } = options;

  const baseOptions = {
    plugins: {
      legend: {
        display: showLegend,
        position: legendPosition,
        labels: { color: '#e8f4ff' },
      },
      tooltip: {
        callbacks: {
          label: tooltipLabel || ((ctx) => ctx.parsed.x || ctx.parsed.y),
        },
      },
    },
    scales: {
      x: {
        ticks: { color: '#e8f4ff' },
      },
      y: {
        ticks: { color: '#e8f4ff' },
      },
    },
  };

  if (indexAxis === 'y') {
    baseOptions.indexAxis = 'y';
  }

  // X 轴配置
  if (xAxisFormatter) {
    baseOptions.scales.x.ticks.callback = createSafeTicksCallback(xAxisFormatter);
  }
  if (xMax !== null) {
    baseOptions.scales.x.max = xMax;
  }
  if (stacked) {
    baseOptions.scales.x.stacked = true;
  }

  // Y 轴配置
  if (yAxisFormatter) {
    baseOptions.scales.y.ticks.callback = createSafeTicksCallback(yAxisFormatter);
  }
  if (yMax !== null) {
    baseOptions.scales.y.max = yMax;
  }
  if (stacked) {
    baseOptions.scales.y.stacked = true;
  }

  return baseOptions;
}

/**
 * 创建双 Y 轴配置
 * @param {Object} options - 选项
 * @returns {Object} scales 配置
 */
export function createDualAxisScales(options = {}) {
  const {
    leftAxisFormatter = null,
    rightAxisFormatter = null,
    leftMax = null,
    rightMax = null,
  } = options;

  return {
    x: { ticks: { color: '#e8f4ff' } },
    y: {
      type: 'linear',
      position: 'left',
      ticks: {
        color: '#e8f4ff',
        callback: leftAxisFormatter ? createSafeTicksCallback(leftAxisFormatter) : function(value) {
          // 默认格式化：确保显示整数，避免浮点数精度问题
          const num = typeof value === 'number' ? value : Number(value);
          if (isNaN(num)) return '';
          // 四舍五入到最近的整数
          return Math.round(num).toString();
        },
      },
      max: leftMax,
    },
    y1: {
      type: 'linear',
      position: 'right',
      ticks: {
        color: '#e8f4ff',
        callback: rightAxisFormatter ? createSafeTicksCallback(rightAxisFormatter) : undefined,
      },
      grid: { drawOnChartArea: false },
    },
  };
}

/**
 * 创建环形图选项
 * @param {Function} tooltipFormatter - tooltip 格式化函数
 * @returns {Object} Chart.js 选项对象
 */
export function createDoughnutOptions(tooltipFormatter = null) {
  return {
    maintainAspectRatio: true,
    aspectRatio: 1.2,
    plugins: {
      legend: {
        position: 'bottom',
        labels: { color: '#e8f4ff' },
      },
      tooltip: {
        callbacks: {
          label: tooltipFormatter || ((ctx) => `${ctx.label}: ${ctx.parsed}`),
        },
      },
    },
  };
}

/**
 * 创建水平条形图选项
 * @param {Object} options - 选项
 * @returns {Object} Chart.js 选项对象
 */
export function createHorizontalBarOptions(options = {}) {
  return createBaseChartOptions({
    indexAxis: 'y',
    ...options,
  });
}

/**
 * 创建垂直条形图选项
 * @param {Object} options - 选项
 * @returns {Object} Chart.js 选项对象
 */
export function createVerticalBarOptions(options = {}) {
  return createBaseChartOptions({
    ...options,
  });
}


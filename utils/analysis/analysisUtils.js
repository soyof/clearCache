/**
 * 分析模块工具函数
 */

/**
 * 格式化字节大小
 * @param {number} bytes - 字节数
 * @returns {string} 格式化后的大小
 */
export function formatBytes(bytes = 0) {
  try {
    if (typeof bytes !== 'number' || isNaN(bytes) || bytes < 0) return '0 B';
    if (bytes === 0) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
    const value = bytes / Math.pow(1024, i);
    const unit = units[i] || 'B';
    const formatted = value.toFixed(value >= 10 ? 0 : 1);
    return `${formatted} ${unit}`;
  } catch (e) {
    return '0 B';
  }
}

/**
 * 图表颜色配置
 */
export const chartColors = {
  local: '#78dbff',
  session: '#9dd0ff',
  indexed: '#ffbf80',
  cache: '#c0b2ff',
  cookies: '#ff9bbb',
  total: '#78dbff',
};

/**
 * 图表文本样式配置
 */
export const chartTextStyles = {
  primary: '#ffffff',
  secondary: '#ffdca3',
  shadow: 'rgba(0, 0, 0, 0.45)',
};


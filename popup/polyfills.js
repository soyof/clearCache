/**
 * Polyfills 模块
 * 提供浏览器兼容性支持
 */

/**
 * requestIdleCallback polyfill
 */
export function initRequestIdleCallbackPolyfill() {
  if (!window.requestIdleCallback) {
    window.requestIdleCallback = function (callback, options) {
      const timeout = options && options.timeout ? options.timeout : 1;
      return setTimeout(() => {
        callback({
          didTimeout: false,
          timeRemaining: () => Math.max(0, 50)
        });
      }, timeout);
    };
  }
}


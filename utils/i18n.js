/**
 * 国际化工具函数
 * 提供多语言支持功能
 */

// 缓存的语言包数据
let cachedMessages = {};
let currentUserLanguage = null;

/**
 * 加载指定语言的消息包
 * @param {string} languageCode - 语言代码
 * @returns {Promise<Object>} 消息包对象
 */
async function loadLanguageMessages(languageCode, forceReload = false) {
  try {
    // 如果强制重新加载，清除现有缓存
    if (forceReload) {
      delete cachedMessages[languageCode];
      const cacheKey = `i18n_cache_${languageCode}`;
      try {
        localStorage.removeItem(cacheKey);
      } catch (e) {
        // 忽略清除缓存的错误
      }
    } else if (cachedMessages[languageCode]) {
      // 如果已经缓存了该语言包，直接返回
      return cachedMessages[languageCode];
    }

    // 尝试从localStorage加载缓存的语言包（仅在非强制重新加载时）
    if (!forceReload) {
      try {
        const cacheKey = `i18n_cache_${languageCode}`;
        const cachedData = localStorage.getItem(cacheKey);
        if (cachedData) {
          const parsed = JSON.parse(cachedData);
          // 检查缓存是否过期（24小时）
          const cacheAge = Date.now() - (parsed.timestamp || 0);
          if (cacheAge < 24 * 60 * 60 * 1000 && parsed.messages) {
            cachedMessages[languageCode] = parsed.messages;
            return parsed.messages;
          }
        }
      } catch (cacheError) {
        // 缓存加载失败，继续从网络加载
      }
    }

    // 构建语言包文件路径
    const messagesUrl = chrome.runtime.getURL(`_locales/${languageCode}/messages.json`);

    // 添加超时控制
    const fetchWithTimeout = (url, timeout = 2000) => {
      return Promise.race([
        fetch(url),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('语言包加载超时')), timeout)
        )
      ]);
    };

    // 获取语言包文件
    const response = await fetchWithTimeout(messagesUrl);

    if (!response.ok) {
      throw new Error(`Failed to load language pack: ${languageCode}, status: ${response.status}`);
    }

    const messages = await response.json();

    // 转换格式：从 {key: {message: "value"}} 到 {key: "value"}
    const flatMessages = {};
    Object.keys(messages).forEach(key => {
      // 如果 message 属性存在（包括空字符串），使用它；否则使用 key
      if (messages[key] && messages[key].hasOwnProperty('message')) {
        flatMessages[key] = messages[key].message;
      } else {
        flatMessages[key] = key;
      }
    });

    // 缓存语言包到内存
    cachedMessages[languageCode] = flatMessages;

    // 缓存到localStorage
    try {
      const cacheKey = `i18n_cache_${languageCode}`;
      localStorage.setItem(cacheKey, JSON.stringify({
        messages: flatMessages,
        timestamp: Date.now()
      }));
    } catch (storageError) {
      // localStorage存储失败，不影响功能
    }

    return flatMessages;
  } catch (error) {
    // 语言包加载失败，返回空对象，使用Chrome的默认i18n API
    return {};
  }
}

/**
 * 获取国际化消息
 * @param {string} key - 消息键
 * @param {string|Array} substitutions - 替换参数
 * @returns {string} 本地化后的消息
 */
export function getMessage(key, substitutions = null) {
  try {
    // 如果有用户选择的语言且已加载消息包，使用用户语言
    if (currentUserLanguage && cachedMessages[currentUserLanguage]) {
      const message = cachedMessages[currentUserLanguage][key];
      // 检查 message 是否存在（使用 !== undefined 检查，因为空字符串也是有效值）
      // 如果 key 存在于缓存中，即使值是空字符串，也应该使用它而不是回退到 Chrome API
      if (message !== undefined) {
        return formatMessageWithSubstitutions(message, substitutions);
      }
    }

    // 回退到 Chrome 默认的 i18n API
    // 注意：Chrome 的 i18n API 会根据 manifest.json 中的 default_locale 返回翻译
    // 所以如果用户选择了非默认语言，这里可能会返回错误的语言
    if (chrome && chrome.i18n && chrome.i18n.getMessage) {
      return chrome.i18n.getMessage(key, substitutions) || key;
    }

    return key;
  } catch (error) {
    return key;
  }
}

/**
 * 格式化消息（处理替换参数）
 * @param {string} message - 原始消息
 * @param {string|Array} substitutions - 替换参数
 * @returns {string} 格式化后的消息
 */
function formatMessageWithSubstitutions(message, substitutions) {
  if (!substitutions) {
    return message;
  }

  if (Array.isArray(substitutions)) {
    // 处理数组形式的替换参数 $1, $2, $3...
    let result = message;
    substitutions.forEach((sub, index) => {
      result = result.replace(new RegExp(`\\$${index + 1}`, 'g'), sub);
    });
    return result;
  } else {
    // 处理单个替换参数 $1
    return message.replace(/\$1/g, substitutions);
  }
}

/**
 * 获取当前语言
 * @returns {string} 当前语言代码
 */
export function getCurrentLanguage() {
  try {
    if (chrome && chrome.i18n && chrome.i18n.getUILanguage) {
      return chrome.i18n.getUILanguage();
    }
    return 'zh-CN';
  } catch (error) {
    return 'zh-CN';
  }
}

/**
 * 获取接受的语言列表
 * @returns {Promise<Array>} 接受的语言列表
 */
export async function getAcceptLanguages() {
  try {
    if (chrome && chrome.i18n && chrome.i18n.getAcceptLanguages) {
      return new Promise((resolve) => {
        chrome.i18n.getAcceptLanguages((languages) => {
          resolve(languages || ['zh-CN']);
        });
      });
    }
    return ['zh-CN'];
  } catch (error) {
    return ['zh-CN'];
  }
}

/**
 * 检测消息方向（LTR/RTL）
 * @param {string} message - 消息内容
 * @returns {string} 'ltr' 或 'rtl'
 */
export function detectTextDirection(message) {
  try {
    if (chrome && chrome.i18n && chrome.i18n.detectLanguage) {
      // Chrome扩展API暂不支持detectLanguage，使用简单的RTL语言检测
      const rtlLanguages = ['ar', 'he', 'fa', 'ur'];
      const currentLang = getCurrentLanguage().toLowerCase();

      for (const rtlLang of rtlLanguages) {
        if (currentLang.startsWith(rtlLang)) {
          return 'rtl';
        }
      }
    }
    return 'ltr';
  } catch (error) {
    return 'ltr';
  }
}

/**
 * 初始化页面国际化
 * 自动替换页面中的国际化标记
 */
export async function initializePageI18n() {
  try {
    // 如果还没有加载用户语言，先加载
    if (!currentUserLanguage) {
      const userLang = await getUserLanguage();
      let effectiveLanguage = userLang;

      if (userLang === 'auto') {
        effectiveLanguage = await getEffectiveLanguage();
      }

      // 加载语言包
      await loadLanguageMessages(effectiveLanguage);
      currentUserLanguage = effectiveLanguage;
    }

    // 替换所有带有 data-i18n 属性的元素
    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(element => {
      const key = element.getAttribute('data-i18n');
      if (key) {
        const message = getMessage(key);
        if (element.tagName === 'INPUT' && (element.type === 'button' || element.type === 'submit')) {
          element.value = message;
        } else if (element.tagName === 'INPUT' && element.type === 'text') {
          element.placeholder = message;
        } else {
          element.textContent = message;
        }
      }
    });

    // 替换所有带有 data-i18n-title 属性的元素的 title
    const titleElements = document.querySelectorAll('[data-i18n-title]');
    titleElements.forEach(element => {
      const key = element.getAttribute('data-i18n-title');
      if (key) {
        element.title = getMessage(key);
      }
    });

    // 替换所有带有 data-i18n-placeholder 属性的元素的 placeholder
    const placeholderElements = document.querySelectorAll('[data-i18n-placeholder]');
    placeholderElements.forEach(element => {
      const key = element.getAttribute('data-i18n-placeholder');
      if (key) {
        element.placeholder = getMessage(key);
      }
    });

    // 设置页面方向
    const direction = detectTextDirection('');
    document.documentElement.dir = direction;

  } catch (error) {
    // 初始化页面国际化失败，使用默认语言
  }
}

/**
 * 格式化消息（支持参数替换）
 * @param {string} key - 消息键
 * @param {Object} params - 参数对象
 * @returns {string} 格式化后的消息
 */
export function formatMessage(key, params = {}) {
  try {
    let message = getMessage(key);

    // 替换参数
    Object.keys(params).forEach(paramKey => {
      const placeholder = `{${paramKey}}`;
      message = message.replace(new RegExp(placeholder, 'g'), params[paramKey]);
    });

    return message;
  } catch (error) {
    return key;
  }
}

/**
 * 获取支持的语言列表
 * @returns {Array} 支持的语言列表
 */
export function getSupportedLanguages() {
  return [
    { code: 'zh_CN', name: '简体中文', nativeName: '简体中文' },
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'ja', name: 'Japanese', nativeName: '日本語' },
    { code: 'ko', name: 'Korean', nativeName: '한국어' },
    { code: 'fr', name: 'French', nativeName: 'Français' },
    { code: 'de', name: 'German', nativeName: 'Deutsch' },
    { code: 'es', name: 'Spanish', nativeName: 'Español' },
    { code: 'ru', name: 'Russian', nativeName: 'Русский' }
  ];
}

/**
 * 获取当前语言的本地化名称
 * @returns {string} 当前语言的本地化名称
 */
export function getCurrentLanguageName() {
  try {
    const currentLang = getCurrentLanguage();
    const supportedLangs = getSupportedLanguages();

    // 处理语言代码格式差异
    const normalizedLang = currentLang.replace('-', '_');

    const lang = supportedLangs.find(l =>
      l.code === normalizedLang ||
      l.code === currentLang ||
      l.code.startsWith(normalizedLang.split('_')[0]) ||
      l.code.startsWith(currentLang.split('-')[0])
    );

    return lang ? lang.nativeName : '简体中文';
  } catch (error) {
    return '简体中文';
  }
}

/**
 * 设置用户选择的语言
 * @param {string} languageCode - 语言代码
 * @returns {Promise<boolean>} 设置是否成功
 */
export async function setUserLanguage(languageCode) {
  try {
    await chrome.storage.local.set({ userLanguage: languageCode });
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * 获取用户选择的语言
 * @returns {Promise<string>} 用户选择的语言代码
 */
export async function getUserLanguage() {
  try {
    const result = await chrome.storage.local.get('userLanguage');
    return result.userLanguage || 'auto';
  } catch (error) {
    return 'auto';
  }
}

/**
 * 获取有效的语言代码（考虑用户设置和系统语言）
 * @returns {Promise<string>} 有效的语言代码
 */
export async function getEffectiveLanguage() {
  try {
    const userLang = await getUserLanguage();

    if (userLang === 'auto') {
      // 跟随系统语言
      const systemLang = getCurrentLanguage();
      const normalizedLang = systemLang.replace('-', '_');

      // 检查是否支持该语言
      const supportedLangs = getSupportedLanguages();
      const supported = supportedLangs.find(l =>
        l.code === normalizedLang ||
        l.code === systemLang ||
        l.code.startsWith(normalizedLang.split('_')[0]) ||
        l.code.startsWith(systemLang.split('-')[0])
      );

      return supported ? supported.code : 'zh_CN';
    }

    return userLang;
  } catch (error) {
    return 'zh_CN';
  }
}

/**
 * 切换语言并重新初始化界面
 * @param {string} languageCode - 目标语言代码
 * @returns {Promise<boolean>} 切换是否成功
 */
export async function switchLanguage(languageCode) {
  try {
    // 保存用户选择的语言
    await setUserLanguage(languageCode);

    // 确定实际要使用的语言代码
    let effectiveLanguage = languageCode;
    if (languageCode === 'auto') {
      effectiveLanguage = await getEffectiveLanguage();
    }

    // 强制重新加载目标语言的消息包（清除旧缓存）
    await loadLanguageMessages(effectiveLanguage, true);

    // 设置当前用户语言
    currentUserLanguage = effectiveLanguage;

    // 重新初始化页面国际化
    await initializePageI18n();

    return true;
  } catch (error) {
    return false;
  }
}

/**
 * 获取国际化消息（支持用户语言设置）
 * @param {string} key - 消息键
 * @param {string|Array} substitutions - 替换参数
 * @param {string} targetLang - 目标语言（可选）
 * @returns {Promise<string>} 本地化后的消息
 */
export async function getMessageAsync(key, substitutions = null, targetLang = null) {
  try {
    if (targetLang) {
      // 如果指定了目标语言，尝试获取该语言的消息
      // 注意：Chrome扩展API不直接支持指定语言获取消息
      // 这里只是为了API完整性，实际还是返回当前语言的消息
      return getMessage(key, substitutions);
    }

    return getMessage(key, substitutions);
  } catch (error) {
    return key;
  }
}

// 导出默认对象
export default {
  getMessage,
  getCurrentLanguage,
  getAcceptLanguages,
  detectTextDirection,
  initializePageI18n,
  formatMessage,
  getSupportedLanguages,
  getCurrentLanguageName,
  setUserLanguage,
  getUserLanguage,
  getEffectiveLanguage,
  switchLanguage,
  getMessageAsync
};

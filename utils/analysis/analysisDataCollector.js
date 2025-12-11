/**
 * 分析数据收集模块
 */

/**
 * 从标签页收集存储数据
 * @param {number} tabId - 标签页ID
 * @returns {Promise<Object|null>} 存储数据
 */
export async function collectFromTab(tabId) {
  try {
    const [{ result }] = await chrome.scripting.executeScript({
      target: { tabId },
      func: async () => {
        const bucketKey = (size) => {
          if (size < 1024) return 'lt1k';
          if (size < 10240) return 'lt10k';
          if (size < 102400) return 'lt100k';
          return 'gte100k';
        };

        const sumStorage = (storage) => {
          let size = 0;
          const buckets = { lt1k: 0, lt10k: 0, lt100k: 0, gte100k: 0 };
          let jsonFail = 0;
          let largeKeys = 0;
          for (let i = 0; i < storage.length; i++) {
            const key = storage.key(i) || '';
            const value = storage.getItem(key) || '';
            const entrySize = key.length + value.length;
            size += entrySize;
            buckets[bucketKey(entrySize)] += 1;
            if (entrySize > 100 * 1024) largeKeys += 1;
            if (value) {
              try {
                JSON.parse(value);
              } catch (_) {
                jsonFail += 1;
              }
            }
          }
          return { count: storage.length, size, buckets, jsonFail, largeKeys };
        };

        const local = sumStorage(localStorage);
        const session = sumStorage(sessionStorage);

        let indexed = { count: 0, size: 0 };
        if (indexedDB?.databases) {
          const dbs = await indexedDB.databases();
          indexed.count = dbs.length;
          indexed.size = dbs.reduce((s, d) => s + (d.size || 0), 0);
        }

        let cacheInfo = { count: 0, size: 0 };
        if (caches?.keys) {
          const names = await caches.keys();
          cacheInfo.count = names.length;
          // 估算 cache 大小代价高，这里不逐条统计，保持 0
        }

        return {
          origin: location.origin,
          host: location.hostname,
          local,
          session,
          indexed,
          cache: cacheInfo,
        };
      },
    });
    return result;
  } catch (error) {
    console.warn('collectFromTab failed', error);
    return null;
  }
}

/**
 * 按域名收集 Cookies 数据
 * @returns {Promise<Object>} Cookies 数据和统计信息
 */
export async function collectCookiesByDomain() {
  const cookies = await chrome.cookies.getAll({});
  const map = new Map();
  const bucketKey = (size) => {
    if (size < 1024) return 'lt1k';
    if (size < 10240) return 'lt10k';
    if (size < 102400) return 'lt100k';
    return 'gte100k';
  };
  const expiryBucket = (cookie) => {
    if (!cookie.expirationDate) return 'noExpiry';
    const now = Date.now() / 1000;
    const delta = cookie.expirationDate - now;
    if (delta < 0) return 'expired';
    if (delta <= 60 * 60 * 24 * 7) return 'lt7d';
    if (delta <= 60 * 60 * 24 * 30) return 'lt30d';
    if (delta >= 60 * 60 * 24 * 180) return 'gt180d';
    return 'mid';
  };

  const cookiesStats = {
    sizeBuckets: { lt1k: 0, lt10k: 0, lt100k: 0, gte100k: 0 },
    security: {
      secure: 0,
      insecure: 0,
      httpOnly: 0,
      notHttpOnly: 0,
      sameSiteStrict: 0,
      sameSiteLax: 0,
      sameSiteNone: 0,
      sameSiteUnspecified: 0,
    },
    expiry: {
      expired: 0,
      lt7d: 0,
      lt30d: 0,
      mid: 0,
      gt180d: 0,
      noExpiry: 0,
    },
    expiringSoonDomains: new Map(),
  };
  cookies.forEach((c) => {
    const domain = (c.domain || '').replace(/^\./, '');
    if (!domain) return;
    const size = (c.name?.length || 0) + (c.value?.length || 0);
    const entry = map.get(domain) || { count: 0, size: 0 };
    entry.count += 1;
    entry.size += size;
    map.set(domain, entry);

    // global stats
    cookiesStats.sizeBuckets[bucketKey(size)] += 1;
    if (c.secure) cookiesStats.security.secure += 1;
    else cookiesStats.security.insecure += 1;
    if (c.httpOnly) cookiesStats.security.httpOnly += 1;
    else cookiesStats.security.notHttpOnly += 1;
    if (c.sameSite === 'strict' || c.sameSite === 'Strict') cookiesStats.security.sameSiteStrict += 1;
    else if (c.sameSite === 'lax' || c.sameSite === 'Lax') cookiesStats.security.sameSiteLax += 1;
    else if (c.sameSite === 'none' || c.sameSite === 'None') cookiesStats.security.sameSiteNone += 1;
    else cookiesStats.security.sameSiteUnspecified += 1;

    const expB = expiryBucket(c);
    cookiesStats.expiry[expB] += 1;
    if (expB === 'lt7d') {
      const current = cookiesStats.expiringSoonDomains.get(domain) || 0;
      cookiesStats.expiringSoonDomains.set(domain, current + 1);
    }
  });
  return { map, cookiesStats };
}

/**
 * 收集所有存储数据
 * @returns {Promise<Object>} 域名数据和统计信息
 */
export async function collectData() {
  const domains = new Map();
  const sizeBuckets = {
    local: { lt1k: 0, lt10k: 0, lt100k: 0, gte100k: 0 },
    session: { lt1k: 0, lt10k: 0, lt100k: 0, gte100k: 0 },
    cookies: { lt1k: 0, lt10k: 0, lt100k: 0, gte100k: 0 },
  };
  const quality = {
    localJsonFail: 0,
    sessionJsonFail: 0,
    localLargeKeys: 0,
    sessionLargeKeys: 0,
  };

  const tabs = await chrome.tabs.query({ url: ['http://*/*', 'https://*/*'] });
  const hostToTab = new Map();
  tabs.forEach((tab) => {
    try {
      const url = new URL(tab.url || '');
      hostToTab.set(url.hostname, tab.id);
    } catch (_) { }
  });

  // 扫描已打开标签页的存储
  for (const [host, tabId] of hostToTab.entries()) {
    const data = await collectFromTab(tabId);
    if (data && data.host) {
      const originData = domains.get(data.host) || {
        domain: data.host,
        local: { count: 0, size: 0, buckets: { lt1k: 0, lt10k: 0, lt100k: 0, gte100k: 0 } },
        session: { count: 0, size: 0, buckets: { lt1k: 0, lt10k: 0, lt100k: 0, gte100k: 0 } },
        indexed: { count: 0, size: 0 },
        cache: { count: 0, size: 0 },
        cookies: { count: 0, size: 0 },
        quality: { localJsonFail: 0, sessionJsonFail: 0, localLargeKeys: 0, sessionLargeKeys: 0 },
      };
      originData.local.count += data.local.count;
      originData.local.size += data.local.size;
      ['lt1k', 'lt10k', 'lt100k', 'gte100k'].forEach((k) => {
        originData.local.buckets[k] += data.local.buckets[k] || 0;
      });
      originData.session.count += data.session.count;
      originData.session.size += data.session.size;
      ['lt1k', 'lt10k', 'lt100k', 'gte100k'].forEach((k) => {
        originData.session.buckets[k] += data.session.buckets[k] || 0;
      });
      originData.indexed.count += data.indexed.count;
      originData.indexed.size += data.indexed.size;
      originData.cache.count += data.cache.count;
      originData.cache.size += data.cache.size;
      originData.quality.localJsonFail += data.local.jsonFail || 0;
      originData.quality.sessionJsonFail += data.session.jsonFail || 0;
      originData.quality.localLargeKeys += data.local.largeKeys || 0;
      originData.quality.sessionLargeKeys += data.session.largeKeys || 0;
      quality.localJsonFail += data.local.jsonFail || 0;
      quality.sessionJsonFail += data.session.jsonFail || 0;
      quality.localLargeKeys += data.local.largeKeys || 0;
      quality.sessionLargeKeys += data.session.largeKeys || 0;
      domains.set(data.host, originData);
    }
  }

  // 合并 cookies 数据
  const { map: cookieMap, cookiesStats } = await collectCookiesByDomain();
  for (const [domain, info] of cookieMap.entries()) {
    const target = domains.get(domain) || {
      domain,
      local: { count: 0, size: 0, buckets: { lt1k: 0, lt10k: 0, lt100k: 0, gte100k: 0 } },
      session: { count: 0, size: 0, buckets: { lt1k: 0, lt10k: 0, lt100k: 0, gte100k: 0 } },
      indexed: { count: 0, size: 0 },
      cache: { count: 0, size: 0 },
      cookies: { count: 0, size: 0 },
      quality: { localJsonFail: 0, sessionJsonFail: 0, localLargeKeys: 0, sessionLargeKeys: 0 },
    };
    target.cookies.count += info.count;
    target.cookies.size += info.size;
    domains.set(domain, target);
  }

  // 聚合 size buckets（local/session 已在各域名）
  domains.forEach((d) => {
    ['lt1k', 'lt10k', 'lt100k', 'gte100k'].forEach((k) => {
      sizeBuckets.local[k] += d.local.buckets[k] || 0;
      sizeBuckets.session[k] += d.session.buckets[k] || 0;
    });
  });
  // cookies bucket 聚合
  Object.keys(sizeBuckets.cookies).forEach((k) => {
    sizeBuckets.cookies[k] = cookiesStats.sizeBuckets[k] || 0;
  });

  // 计算额外统计信息
  const domainArray = Array.from(domains.values());
  const totalSize = domainArray.reduce((sum, d) => sum + d.local.size + d.session.size + d.indexed.size + d.cache.size + d.cookies.size, 0);
  const totalItems = domainArray.reduce((sum, d) => sum + d.local.count + d.session.count + d.indexed.count + d.cache.count + d.cookies.count, 0);

  // 计算平均条目大小
  const avgItemSize = {
    local: domainArray.reduce((sum, d) => sum + d.local.size, 0) / Math.max(domainArray.reduce((sum, d) => sum + d.local.count, 0), 1),
    session: domainArray.reduce((sum, d) => sum + d.session.size, 0) / Math.max(domainArray.reduce((sum, d) => sum + d.session.count, 0), 1),
    indexed: domainArray.reduce((sum, d) => sum + d.indexed.size, 0) / Math.max(domainArray.reduce((sum, d) => sum + d.indexed.count, 0), 1),
    cache: domainArray.reduce((sum, d) => sum + d.cache.size, 0) / Math.max(domainArray.reduce((sum, d) => sum + d.cache.count, 0), 1),
    cookies: domainArray.reduce((sum, d) => sum + d.cookies.size, 0) / Math.max(domainArray.reduce((sum, d) => sum + d.cookies.count, 0), 1),
  };

  // 计算集中度（帕累托）
  const sortedBySize = [...domainArray].sort(
    (a, b) =>
      b.local.size + b.session.size + b.indexed.size + b.cache.size + b.cookies.size -
      (a.local.size + a.session.size + a.indexed.size + a.cache.size + a.cookies.size)
  );
  const concentration = [];
  let cumulativeSize = 0;
  sortedBySize.forEach((d, idx) => {
    const size = d.local.size + d.session.size + d.indexed.size + d.cache.size + d.cookies.size;
    cumulativeSize += size;
    concentration.push({
      domain: d.domain,
      size,
      cumulativeRatio: cumulativeSize / totalSize,
      rank: idx + 1,
    });
  });

  // 计算大小分布直方图（10个区间）
  const maxSize = Math.max(...domainArray.map(d => d.local.size + d.session.size + d.indexed.size + d.cache.size + d.cookies.size), 1);
  const sizeBins = Array(10).fill(0);
  domainArray.forEach(d => {
    const size = d.local.size + d.session.size + d.indexed.size + d.cache.size + d.cookies.size;
    const binIndex = Math.min(Math.floor((size / maxSize) * 10), 9);
    sizeBins[binIndex]++;
  });

  // 计算条目数分布直方图
  const maxItems = Math.max(...domainArray.map(d => d.local.count + d.session.count + d.indexed.count + d.cache.count + d.cookies.count), 1);
  const itemBins = Array(10).fill(0);
  domainArray.forEach(d => {
    const items = d.local.count + d.session.count + d.indexed.count + d.cache.count + d.cookies.count;
    const binIndex = Math.min(Math.floor((items / maxItems) * 10), 9);
    itemBins[binIndex]++;
  });

  // 存储类型使用率
  const storageUsage = {
    local: domainArray.filter(d => d.local.count > 0).length,
    session: domainArray.filter(d => d.session.count > 0).length,
    indexed: domainArray.filter(d => d.indexed.count > 0).length,
    cache: domainArray.filter(d => d.cache.count > 0).length,
    cookies: domainArray.filter(d => d.cookies.count > 0).length,
  };

  // 域名存储类型偏好（主要使用的存储类型）
  const domainPreference = {
    localOnly: domainArray.filter(d => d.local.count > 0 && d.session.count === 0 && d.indexed.count === 0 && d.cache.count === 0 && d.cookies.count === 0).length,
    cookiesOnly: domainArray.filter(d => d.cookies.count > 0 && d.local.count === 0 && d.session.count === 0 && d.indexed.count === 0 && d.cache.count === 0).length,
    mixed: domainArray.filter(d => {
      const types = [d.local.count > 0, d.session.count > 0, d.indexed.count > 0, d.cache.count > 0, d.cookies.count > 0].filter(Boolean).length;
      return types > 1;
    }).length,
  };

  // TLD 分布
  const tldMap = new Map();
  domainArray.forEach(d => {
    const parts = d.domain.split('.');
    const tld = parts.length > 1 ? parts[parts.length - 1] : 'other';
    const entry = tldMap.get(tld) || { count: 0, size: 0 };
    entry.count++;
    entry.size += d.local.size + d.session.size + d.indexed.size + d.cache.size + d.cookies.size;
    tldMap.set(tld, entry);
  });

  // 域名长度分布
  const lengthBins = { short: 0, medium: 0, long: 0, veryLong: 0 };
  domainArray.forEach(d => {
    const len = d.domain.length;
    if (len < 10) lengthBins.short++;
    else if (len < 20) lengthBins.medium++;
    else if (len < 30) lengthBins.long++;
    else lengthBins.veryLong++;
  });

  // 存储类型组合
  const storageCombination = {
    none: domainArray.filter(d => d.local.count === 0 && d.session.count === 0 && d.indexed.count === 0 && d.cache.count === 0 && d.cookies.count === 0).length,
    localOnly: domainArray.filter(d => d.local.count > 0 && d.session.count === 0 && d.indexed.count === 0 && d.cache.count === 0 && d.cookies.count === 0).length,
    cookiesOnly: domainArray.filter(d => d.cookies.count > 0 && d.local.count === 0 && d.session.count === 0 && d.indexed.count === 0 && d.cache.count === 0).length,
    localAndCookies: domainArray.filter(d => d.local.count > 0 && d.cookies.count > 0 && d.session.count === 0 && d.indexed.count === 0 && d.cache.count === 0).length,
    all: domainArray.filter(d => d.local.count > 0 && d.session.count > 0 && d.indexed.count > 0 && d.cache.count > 0 && d.cookies.count > 0).length,
    other: domainArray.length - domainArray.filter(d => {
      const hasLocal = d.local.count > 0;
      const hasCookies = d.cookies.count > 0;
      const hasSession = d.session.count > 0;
      const hasIndexed = d.indexed.count > 0;
      const hasCache = d.cache.count > 0;
      return (!hasLocal && !hasCookies && !hasSession && !hasIndexed && !hasCache) ||
        (hasLocal && !hasCookies && !hasSession && !hasIndexed && !hasCache) ||
        (hasCookies && !hasLocal && !hasSession && !hasIndexed && !hasCache) ||
        (hasLocal && hasCookies && !hasSession && !hasIndexed && !hasCache) ||
        (hasLocal && hasSession && hasIndexed && hasCache && hasCookies);
    }).length,
  };

  // 不安全 Cookies 域名统计
  const insecureCookiesDomains = new Map();
  if (cookiesStats.security) {
    const allCookies = await chrome.cookies.getAll({});
    allCookies.forEach(c => {
      if (!c.secure) {
        const domain = (c.domain || '').replace(/^\./, '');
        if (domain) {
          const count = insecureCookiesDomains.get(domain) || 0;
          insecureCookiesDomains.set(domain, count + 1);
        }
      }
    });
  }

  // 过期 Cookies 域名统计
  const expiredCookiesDomains = new Map();
  if (cookiesStats.expiry) {
    const allCookies = await chrome.cookies.getAll({});
    const now = Date.now() / 1000;
    allCookies.forEach(c => {
      if (c.expirationDate && c.expirationDate < now) {
        const domain = (c.domain || '').replace(/^\./, '');
        if (domain) {
          const count = expiredCookiesDomains.get(domain) || 0;
          expiredCookiesDomains.set(domain, count + 1);
        }
      }
    });
  }

  // 安全属性组合
  const securityCombination = {
    secureHttpOnlyStrict: 0,
    secureHttpOnlyLax: 0,
    secureHttpOnlyNone: 0,
    secureNotHttpOnlyStrict: 0,
    secureNotHttpOnlyLax: 0,
    secureNotHttpOnlyNone: 0,
    insecureHttpOnlyStrict: 0,
    insecureHttpOnlyLax: 0,
    insecureHttpOnlyNone: 0,
    insecureNotHttpOnlyStrict: 0,
    insecureNotHttpOnlyLax: 0,
    insecureNotHttpOnlyNone: 0,
  };
  if (cookiesStats.security) {
    const allCookies = await chrome.cookies.getAll({});
    allCookies.forEach(c => {
      const secure = c.secure ? 'secure' : 'insecure';
      const httpOnly = c.httpOnly ? 'HttpOnly' : 'NotHttpOnly';
      const sameSite = c.sameSite === 'Strict' || c.sameSite === 'strict' ? 'Strict' :
        c.sameSite === 'Lax' || c.sameSite === 'lax' ? 'Lax' :
        c.sameSite === 'None' || c.sameSite === 'none' ? 'None' : 'Unspecified';
      const key = `${secure}${httpOnly}${sameSite}`;
      if (securityCombination[key] !== undefined) {
        securityCombination[key]++;
      }
    });
  }

  // JSON 解析失败率（按域名）
  const jsonFailByDomain = domainArray
    .filter(d => d.local.count > 0 || d.session.count > 0)
    .map(d => ({
      domain: d.domain,
      failRate: d.local.count + d.session.count > 0
        ? (d.quality.localJsonFail + d.quality.sessionJsonFail) / (d.local.count + d.session.count)
        : 0,
      failCount: d.quality.localJsonFail + d.quality.sessionJsonFail,
    }))
    .filter(d => d.failCount > 0)
    .sort((a, b) => b.failRate - a.failRate)
    .slice(0, 10);

  // 超大键分布（按域名）
  const largeKeysByDomain = domainArray
    .filter(d => d.quality.localLargeKeys > 0 || d.quality.sessionLargeKeys > 0)
    .map(d => ({
      domain: d.domain,
      count: d.quality.localLargeKeys + d.quality.sessionLargeKeys,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // 统计摘要
  const sizes = domainArray.map(d => d.local.size + d.session.size + d.indexed.size + d.cache.size + d.cookies.size);
  const statistics = {
    min: Math.min(...sizes, 0),
    max: Math.max(...sizes, 0),
    avg: sizes.length > 0 ? sizes.reduce((a, b) => a + b, 0) / sizes.length : 0,
    median: sizes.length > 0 ? [...sizes].sort((a, b) => a - b)[Math.floor(sizes.length / 2)] : 0,
  };

  const stats = {
    sizeBuckets,
    cookiesStats,
    quality,
    avgItemSize,
    concentration,
    sizeBins,
    itemBins,
    storageUsage,
    domainPreference,
    tldMap: Array.from(tldMap.entries()).map(([tld, data]) => ({ tld, ...data })),
    lengthBins,
    storageCombination,
    insecureCookiesDomains: Array.from(insecureCookiesDomains.entries()).map(([domain, count]) => ({ domain, count })),
    expiredCookiesDomains: Array.from(expiredCookiesDomains.entries()).map(([domain, count]) => ({ domain, count })),
    securityCombination,
    jsonFailByDomain,
    largeKeysByDomain,
    statistics,
    domainSizes: sizes, // 用于箱线图
  };

  return {
    domains: sortedBySize,
    stats,
  };
}


import { getMessage, initializePageI18n } from './index.js';

const tableBody = () => document.getElementById('table-body');
const summaryDomains = () => document.getElementById('summary-domains');
const summaryItems = () => document.getElementById('summary-items');
const summarySize = () => document.getElementById('summary-size');
const searchInput = () => document.getElementById('analysis-search');
const chartTypesCanvas = () => document.getElementById('chart-types');
const chartTopCanvas = () => document.getElementById('chart-top-domains');
const chartTypesLegend = () => document.getElementById('chart-types-legend');
const chartTopLegend = () => document.getElementById('chart-top-domains-legend');

let cachedDomains = [];

const formatBytes = (bytes = 0) => {
  if (!bytes || bytes < 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / Math.pow(1024, i);
  return `${value.toFixed(value >= 10 ? 0 : 1)} ${units[i]}`;
};

const emptyState = (text) => {
  const body = tableBody();
  if (!body) return;
  body.innerHTML = `<div class="empty">${text}</div>`;
};

async function collectFromTab(tabId) {
  try {
    const [{ result }] = await chrome.scripting.executeScript({
      target: { tabId },
      func: async () => {
        const sumStorage = (storage) => {
          let size = 0;
          for (let i = 0; i < storage.length; i++) {
            const key = storage.key(i) || '';
            const value = storage.getItem(key) || '';
            size += key.length + value.length;
          }
          return { count: storage.length, size };
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

async function collectCookiesByDomain() {
  const cookies = await chrome.cookies.getAll({});
  const map = new Map();
  cookies.forEach((c) => {
    const domain = (c.domain || '').replace(/^\./, '');
    if (!domain) return;
    const size = (c.name?.length || 0) + (c.value?.length || 0);
    const entry = map.get(domain) || { count: 0, size: 0 };
    entry.count += 1;
    entry.size += size;
    map.set(domain, entry);
  });
  return map;
}

async function collectData() {
  const domains = new Map();

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
        local: { count: 0, size: 0 },
        session: { count: 0, size: 0 },
        indexed: { count: 0, size: 0 },
        cache: { count: 0, size: 0 },
        cookies: { count: 0, size: 0 },
      };
      originData.local.count += data.local.count;
      originData.local.size += data.local.size;
      originData.session.count += data.session.count;
      originData.session.size += data.session.size;
      originData.indexed.count += data.indexed.count;
      originData.indexed.size += data.indexed.size;
      originData.cache.count += data.cache.count;
      originData.cache.size += data.cache.size;
      domains.set(data.host, originData);
    }
  }

  // 合并 cookies 数据
  const cookieMap = await collectCookiesByDomain();
  for (const [domain, info] of cookieMap.entries()) {
    const target = domains.get(domain) || {
      domain,
      local: { count: 0, size: 0 },
      session: { count: 0, size: 0 },
      indexed: { count: 0, size: 0 },
      cache: { count: 0, size: 0 },
      cookies: { count: 0, size: 0 },
    };
    target.cookies.count += info.count;
    target.cookies.size += info.size;
    domains.set(domain, target);
  }

  return Array.from(domains.values()).sort((a, b) => (b.local.size + b.session.size + b.indexed.size + b.cache.size + b.cookies.size) - (a.local.size + a.session.size + a.indexed.size + a.cache.size + a.cookies.size));
}

async function clearDomain(domain) {
  const origins = [`https://${domain}`, `http://${domain}`];
  try {
    // 清除 cookies
    const cookies = await chrome.cookies.getAll({ domain });
    await Promise.all(
      cookies.map((c) =>
        chrome.cookies.remove({
          url: `${c.secure ? 'https' : 'http'}://${c.domain.replace(/^\./, '')}${c.path}`,
          name: c.name,
          storeId: c.storeId,
        }).catch(() => null)
      )
    );

    // 清除存储 (localStorage / IndexedDB / Cache)
    await chrome.browsingData.remove(
      { origins },
      {
        cache: true,
        cacheStorage: true,
        indexedDB: true,
        localStorage: true,
      }
    );

    // 尝试清理 sessionStorage / Cache API in-page（仅对已打开的同域 tab）
    const tabs = await chrome.tabs.query({ url: [`*://${domain}/*`] });
    await Promise.all(
      tabs.map((tab) =>
        chrome.scripting
          .executeScript({
            target: { tabId: tab.id },
            func: async () => {
              try {
                sessionStorage.clear();
              } catch (_) { }
              try {
                const names = await caches.keys();
                await Promise.all(names.map((n) => caches.delete(n)));
              } catch (_) { }
            },
          })
          .catch(() => null)
      )
    );
  } catch (error) {
    console.warn('clearDomain failed', domain, error);
  }
}

async function clearAll(domains) {
  for (const d of domains) {
    await clearDomain(d.domain);
  }
}

function render(domains) {
  const body = tableBody();
  if (!body) return;
  if (!domains.length) {
    emptyState(getMessage('analysisEmpty') || '暂无数据');
    return;
  }

  let totalItems = 0;
  let totalSize = 0;
  domains.forEach((d) => {
    totalItems += d.local.count + d.session.count + d.indexed.count + d.cache.count + d.cookies.count;
    totalSize += d.local.size + d.session.size + d.indexed.size + d.cache.size + d.cookies.size;
  });

  if (summaryDomains()) summaryDomains().textContent = domains.length.toString();
  if (summaryItems()) summaryItems().textContent = totalItems.toString();
  if (summarySize()) summarySize().textContent = formatBytes(totalSize);

  const metricTpl = (item) => {
    const hasData = (item.count > 0) || (item.size > 0);
    return `<div class="metric ${hasData ? 'has-data' : ''}">
      <span class="count">${item.count}</span>
      <span class="size">${formatBytes(item.size)}</span>
    </div>`;
  };

  body.innerHTML = domains
    .map((d) => {
      const total = d.local.size + d.session.size + d.indexed.size + d.cache.size + d.cookies.size;
      const label = getMessage('analysisClearDomain') || '清除此域';
      const totalHasData = total > 0;
      return `
        <div class="table-row">
          <div class="col domain">${d.domain}</div>
          <div class="col">
            ${metricTpl(d.local)}
          </div>
          <div class="col">
            ${metricTpl(d.session)}
          </div>
          <div class="col">
            ${metricTpl(d.indexed)}
          </div>
          <div class="col">
            ${metricTpl(d.cache)}
          </div>
          <div class="col">
            ${metricTpl(d.cookies)}
          </div>
          <div class="col">
            <div class="metric total-size ${totalHasData ? 'has-data' : ''}">${formatBytes(total)}</div>
          </div>
          <div class="col action">
            <button class="action-btn" data-domain="${d.domain}">${label}</button>
          </div>
        </div>
      `;
    })
    .join('');

  body.querySelectorAll('.action-btn').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const domain = btn.getAttribute('data-domain');
      const confirmText = getMessage('confirmDangerousTitle') || '确认执行当前操作？';
      if (window.confirm(`${confirmText}\n${getMessage('analysisClearDomain') || '清除此域'}：${domain}`)) {
        btn.disabled = true;
        btn.textContent = getMessage('cleaning') || '正在清理...';
        await clearDomain(domain);
        btn.textContent = getMessage('analysisRescan') || '重新扫描';
        btn.disabled = false;
        await loadData();
      }
    });
  });
}

export async function loadData() {
  emptyState(getMessage('analysisLoading') || '正在扫描...');
  const data = await collectData();
  cachedDomains = data;
  applyFilter();
}

function applyFilter() {
  const kw = (searchInput()?.value || '').trim().toLowerCase();
  const filtered = kw
    ? cachedDomains.filter((d) => d.domain.toLowerCase().includes(kw))
    : cachedDomains;
  render(filtered);
  // 图表始终基于全量数据，不受搜索过滤影响
  renderCharts(cachedDomains);
}

async function init() {
  await initializePageI18n();
  const inputEl = searchInput();
  if (inputEl) {
    const ph = getMessage('analysisSearchPlaceholder');
    if (ph && ph !== 'analysisSearchPlaceholder') {
      inputEl.placeholder = ph;
    }
  }
  await loadData();

  const rescanBtn = document.getElementById('rescan');
  const clearAllBtn = document.getElementById('clear-all-domains');
  const input = searchInput();

  if (rescanBtn) {
    rescanBtn.addEventListener('click', () => loadData());
  }
  if (clearAllBtn) {
    clearAllBtn.addEventListener('click', async () => {
      const confirmText = getMessage('confirmDangerousTitle') || '确认执行当前操作？';
      if (window.confirm(`${confirmText}\n${getMessage('analysisClearAll') || '清除所有域'}`)) {
        clearAllBtn.disabled = true;
        clearAllBtn.textContent = getMessage('cleaning') || '正在清理...';
        const data = await collectData();
        await clearAll(data);
        clearAllBtn.textContent = getMessage('analysisRescan') || '重新扫描';
        clearAllBtn.disabled = false;
        await loadData();
      }
    });
  }

  if (input) {
    input.addEventListener('input', () => applyFilter());
  }
}

document.addEventListener('DOMContentLoaded', init);

const chartColors = {
  local: '#78dbff',
  session: '#9dd0ff',
  indexed: '#ffbf80',
  cache: '#c0b2ff',
  cookies: '#ff9bbb',
  total: '#78dbff',
};

function prepareCanvas(canvas) {
  if (!canvas) return null;
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  // 记录 CSS 尺寸后将画布按 DPR 放大，避免高分屏模糊
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  if (ctx.resetTransform) ctx.resetTransform();
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, rect.width, rect.height);
  return { ctx, width: rect.width, height: rect.height };
}

function buildLegend(container, items) {
  if (!container) return;
  container.innerHTML = items
    .map(
      (item) => `
        <div class="legend-item">
          <span class="legend-dot" style="background:${item.color}"></span>
          <span class="legend-label">${item.label}</span>
          <span class="legend-value">${item.value}</span>
        </div>
      `
    )
    .join('');
}

function drawDonut(canvas, data) {
  const prep = prepareCanvas(canvas);
  if (!prep) return;
  const { ctx, width, height } = prep;
  const total = data.reduce((s, d) => s + d.value, 0);
  if (!total) return;

  const centerX = width / 2;
  const centerY = height / 2;
  const outerR = Math.min(centerX, centerY) - 10;
  const innerR = outerR * 0.6;

  let start = -Math.PI / 2;
  data.forEach((d) => {
    const angle = (d.value / total) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, outerR, start, start + angle);
    ctx.closePath();
    ctx.fillStyle = d.color;
    ctx.fill();
    start += angle;
  });

  ctx.globalCompositeOperation = 'destination-out';
  ctx.beginPath();
  ctx.arc(centerX, centerY, innerR, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalCompositeOperation = 'source-over';

  ctx.fillStyle = '#e8f4ff';
  ctx.font = '600 14px "Segoe UI", Arial';
  ctx.textAlign = 'center';
  ctx.fillText(getMessage('total') || '总计', centerX, centerY - 4);
  ctx.font = '700 16px "Segoe UI", Arial';
  ctx.fillText(formatBytes(total), centerX, centerY + 18);
}

function drawHorizontalBars(canvas, items) {
  const prep = prepareCanvas(canvas);
  if (!prep) return;
  const { ctx, width, height } = prep;
  if (!items.length) return;

  const padding = 20;
  const barHeight = 28;
  const gap = 8;
  const max = Math.max(...items.map((i) => i.value), 1);

  items.forEach((item, index) => {
    const y = padding + index * (barHeight + gap);
    // 确保不超出画布高度
    if (y + barHeight > height - padding) return;

    const w = ((width - padding * 2) * item.value) / max;
    ctx.fillStyle = chartColors.total;
    ctx.globalAlpha = 0.28;
    ctx.fillRect(padding, y, width - padding * 2, barHeight);
    ctx.globalAlpha = 1;
    ctx.fillStyle = chartColors.total;
    ctx.fillRect(padding, y, w, barHeight);

    ctx.fillStyle = '#e8f4ff';
    ctx.font = '600 13px "Segoe UI", Arial';
    ctx.textAlign = 'left';
    ctx.fillText(item.label, padding + 8, y + barHeight / 2 + 5);

    ctx.fillStyle = '#ffd9a6';
    ctx.font = '700 13px "Segoe UI", Arial';
    ctx.textAlign = 'right';
    ctx.fillText(formatBytes(item.value), width - padding - 8, y + barHeight / 2 + 5);
  });
}

function renderCharts(domains) {
  if (!domains || !domains.length) return;

  const typesData = [
    {
      key: 'local',
      label: getMessage('localStorage') || 'LocalStorage',
      value: domains.reduce((s, d) => s + d.local.size, 0),
      color: chartColors.local,
    },
    {
      key: 'session',
      label: getMessage('sessionStorage') || 'SessionStorage',
      value: domains.reduce((s, d) => s + d.session.size, 0),
      color: chartColors.session,
    },
    {
      key: 'indexed',
      label: getMessage('indexedDB') || 'IndexedDB',
      value: domains.reduce((s, d) => s + d.indexed.size, 0),
      color: chartColors.indexed,
    },
    {
      key: 'cache',
      label: getMessage('cacheAPI') || 'Cache',
      value: domains.reduce((s, d) => s + d.cache.size, 0),
      color: chartColors.cache,
    },
    {
      key: 'cookies',
      label: getMessage('cookies') || 'Cookies',
      value: domains.reduce((s, d) => s + d.cookies.size, 0),
      color: chartColors.cookies,
    },
  ].filter((item) => item.value > 0);

  const typesCanvasEl = chartTypesCanvas();
  drawDonut(typesCanvasEl, typesData);
  buildLegend(
    chartTypesLegend(),
    typesData.map((d) => ({ color: d.color, label: d.label, value: formatBytes(d.value) }))
  );

  const topDomains = [...domains]
    .map((d) => ({
      label: d.domain,
      value: d.local.size + d.session.size + d.indexed.size + d.cache.size + d.cookies.size,
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10); // 展示前十

  const topCanvasEl = chartTopCanvas();
  if (!topCanvasEl) return;
  drawHorizontalBars(topCanvasEl, topDomains);
}


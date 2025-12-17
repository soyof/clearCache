/**
 * 全局存储分析主入口
 */

import { renderCharts } from './analysis/analysisChartRenderer.js';
import { clearAll, clearDomain } from './analysis/analysisDataCleaner.js';
import { collectData } from './analysis/analysisDataCollector.js';
import { emptyState, renderTable } from './analysis/analysisTableRenderer.js';
import { getMessage, initializePageI18n } from './index.js';

// DOM 元素获取函数
const tableBody = () => document.getElementById('table-body');
const summaryDomains = () => document.getElementById('summary-domains');
const summaryItems = () => document.getElementById('summary-items');
const summarySize = () => document.getElementById('summary-size');
const searchInput = () => document.getElementById('analysis-search');
const qualityList = () => document.getElementById('quality-list');
const statisticsList = () => document.getElementById('statistics-list');

// 缓存数据
let cachedDomains = [];
let cachedStats = null;

/**
 * 加载数据
 */
export async function loadData() {
  const body = tableBody();
  if (body) {
    emptyState(body, getMessage('analysisLoading') || '正在扫描...');
  }
  
  // 使用 requestIdleCallback 或 setTimeout 让浏览器有机会渲染加载状态
  await new Promise(resolve => {
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => resolve(), { timeout: 100 });
    } else {
      setTimeout(resolve, 50);
    }
  });
  
  const { domains, stats } = await collectData();
  cachedDomains = domains;
  cachedStats = stats;
  applyFilter();
}

/**
 * 应用过滤
 */
function applyFilter() {
  const kw = (searchInput()?.value || '').trim().toLowerCase();
  const filtered = kw
    ? cachedDomains.filter((d) => d.domain.toLowerCase().includes(kw))
    : cachedDomains;
  
  renderTable(
    tableBody(),
    summaryDomains(),
    summaryItems(),
    summarySize(),
    filtered,
    async (domain) => {
      await clearDomain(domain);
      await loadData();
    }
  );
  
  // 图表始终基于全量数据，不受搜索过滤影响
  renderCharts(cachedDomains, cachedStats, qualityList(), statisticsList());
}

/**
 * 初始化
 */
async function init() {
  await initializePageI18n();
  const inputEl = searchInput();
  if (inputEl) {
    const ph = getMessage('analysisSearchPlaceholder');
    if (ph && ph !== 'analysisSearchPlaceholder') {
      inputEl.placeholder = ph;
    }
  }
  
  // Tab 切换逻辑
  const tabs = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');
  const searchEl = searchInput();
  tabs.forEach((btn) => {
    btn.addEventListener('click', () => {
      const tab = btn.getAttribute('data-tab');
      
      // 更新按钮状态
      tabs.forEach((b) => b.classList.toggle('active', b === btn));
      
      // 平滑切换内容区域
      tabContents.forEach((c) => {
        const isTarget = c.getAttribute('data-tab-content') === tab;
        if (isTarget) {
          // 显示目标内容
          c.classList.remove('hidden');
          c.classList.add('fade-in');
          // 动画结束后移除 fade-in 类
          setTimeout(() => {
            c.classList.remove('fade-in');
          }, 300);
        } else {
          // 隐藏非目标内容
          c.classList.add('hidden');
          c.classList.remove('fade-in');
        }
      });
      
      // 切换搜索框显示
      if (searchEl) {
        searchEl.style.transition = 'opacity 0.3s ease';
        if (tab === 'charts') {
          searchEl.style.opacity = '0';
          setTimeout(() => {
            searchEl.classList.add('hidden');
            searchEl.style.opacity = '';
          }, 300);
        } else {
          searchEl.classList.remove('hidden');
          searchEl.style.opacity = '0';
          requestAnimationFrame(() => {
            searchEl.style.opacity = '1';
          });
        }
      }
      
      // 切换导航容器显示
      const navContainer = document.querySelector('.chart-nav-container');
      
      if (navContainer) {
        if (tab === 'charts') {
          navContainer.classList.remove('hidden');
        } else {
          navContainer.classList.add('hidden');
          // 关闭菜单
          const navMenu = document.getElementById('chart-nav');
          if (navMenu) {
            navMenu.classList.remove('show');
          }
        }
      }
      
      // 更新导出按钮状态
      updateExportButtons(tab);
      
      if (tab === 'charts') {
        // 确保在显示后重绘图表，避免宽高为 0
        setTimeout(() => {
          renderCharts(cachedDomains, cachedStats, qualityList(), statisticsList());
          // 更新导航菜单活动状态
          updateActiveNavItemOnScroll();
        }, 50);
      }
    });
  });
  
  await loadData();
  
  // 初始化时更新导出按钮状态（默认为 table）
  updateExportButtons('table');

  const rescanBtn = document.getElementById('rescan');
  const exportBtn = document.getElementById('export-data');
  const clearAllBtn = document.getElementById('clear-all-domains');
  const input = searchInput();

  if (rescanBtn) {
    rescanBtn.addEventListener('click', () => loadData());
  }
  if (exportBtn) {
    exportBtn.addEventListener('click', () => exportData());
  }
  
  const exportExcelBtn = document.getElementById('export-excel');
  const exportPDFBtn = document.getElementById('export-pdf');

  if (exportExcelBtn) {
    exportExcelBtn.addEventListener('click', () => exportTableAsExcel());
  }
  if (exportPDFBtn) {
    exportPDFBtn.addEventListener('click', () => exportChartsAsPDF());
  }

  if (clearAllBtn) {
    clearAllBtn.addEventListener('click', async () => {
      const confirmText = getMessage('confirmDangerousTitle') || '确认执行当前操作？';
      if (window.confirm(`${confirmText}\n${getMessage('analysisClearAll') || '清除所有域'}`)) {
        clearAllBtn.disabled = true;
        clearAllBtn.textContent = getMessage('cleaning') || '正在清理...';
        const data = await collectData();
        await clearAll(data.domains);
        clearAllBtn.textContent = getMessage('analysisRescan') || '重新扫描';
        clearAllBtn.disabled = false;
        await loadData();
      }
    });
  }

  if (input) {
    input.addEventListener('input', () => applyFilter());
  }

  // 初始化图表导航菜单
  initChartNavigation();
  
  // 初始化滚动到顶部按钮
  initScrollToTop();
}

/**
 * 更新导出按钮显示状态
 * @param {string} activeTab - 当前激活的 Tab 名称
 */
function updateExportButtons(activeTab) {
  const exportExcelBtn = document.getElementById('export-excel');
  const exportPDFBtn = document.getElementById('export-pdf');
  
  if (activeTab === 'charts') {
    // Show PDF button, hide Excel button
    if (exportPDFBtn) exportPDFBtn.classList.remove('hidden');
    if (exportExcelBtn) exportExcelBtn.classList.add('hidden');
  } else {
    // Hide PDF button, show Excel button
    if (exportPDFBtn) exportPDFBtn.classList.add('hidden');
    if (exportExcelBtn) exportExcelBtn.classList.remove('hidden');
  }
}

/**
 * 格式化字节数
 */
function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 B';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * 导出数据 (JSON)
 */
function exportData() {
  if (!cachedDomains || cachedDomains.length === 0) {
    alert(getMessage('noStorageData') || '没有数据可导出');
    return;
  }

  const exportObj = {
    timestamp: new Date().toISOString(),
    domains: cachedDomains,
    stats: cachedStats
  };

  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportObj, null, 2));
  downloadFile(dataStr, 'json');
}

/**
 * 导出表格为 Excel (CSV)
 */
function exportTableAsExcel() {
  if (!cachedDomains || cachedDomains.length === 0) {
    alert(getMessage('noStorageData') || '没有数据可导出');
    return;
  }

  // CSV Header
  const headers = [
    getMessage('domain') || '域名',
    getMessage('localStorage') || 'LocalStorage',
    getMessage('sessionStorage') || 'SessionStorage',
    getMessage('indexedDB') || 'IndexedDB',
    getMessage('cacheAPI') || 'Cache',
    getMessage('cookies') || 'Cookies',
    getMessage('total') || '总计'
  ];

  // CSV Content
  let csvContent = "\uFEFF" + headers.join(",") + "\n"; // Add BOM for Excel

  // Helper to format cell: "Count | Size"
  const fmt = (item) => `${item.count} | ${formatBytes(item.size)}`;
  
  cachedDomains.forEach(d => {
    const totalSize = d.local.size + d.session.size + d.indexed.size + d.cache.size + d.cookies.size;
    const totalCount = d.local.count + d.session.count + d.indexed.count + d.cache.count + d.cookies.count;
    
    // Excel needs quoting for cells with special chars (like |)
    const quote = (str) => `"${str}"`;

    const row = [
      d.domain,
      quote(fmt(d.local)),
      quote(fmt(d.session)),
      quote(fmt(d.indexed)),
      quote(fmt(d.cache)),
      quote(fmt(d.cookies)),
      quote(`${totalCount} | ${formatBytes(totalSize)}`)
    ];
    csvContent += row.join(",") + "\n";
  });

  const dataStr = "data:text/csv;charset=utf-8," + encodeURIComponent(csvContent);
  downloadFile(dataStr, 'csv');
}

/**
 * 将文本转换为图片 Data URL
 */
function textToImage(text, options = {}) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  const fontSize = options.fontSize || 16;
  const color = options.color || '#f5f7fa';
  const fontFamily = options.fontFamily || '"Segoe UI", "Helvetica Neue", Arial, sans-serif';
  
  ctx.font = `bold ${fontSize}px ${fontFamily}`;
  const textMetrics = ctx.measureText(text);
  
  canvas.width = textMetrics.width + 10; // padding
  canvas.height = fontSize * 1.5;
  
  // Re-set font after resize
  ctx.font = `bold ${fontSize}px ${fontFamily}`;
  ctx.fillStyle = color;
  ctx.textBaseline = 'middle';
  
  ctx.fillText(text, 0, canvas.height / 2);
  
  return {
    dataUrl: canvas.toDataURL('image/png'),
    width: canvas.width,
    height: canvas.height,
    aspectRatio: canvas.width / canvas.height
  };
}

/**
 * 导出图表为 PDF
 */
async function exportChartsAsPDF() {
  if (!window.jspdf) {
    alert('PDF library not loaded');
    return;
  }
  
  const { jsPDF } = window.jspdf;
  // A4 size: 210 x 297 mm
  const doc = new jsPDF();
  
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 10;
  const bgColor = '#0f141c'; // Dark background
  
  // Helper to fill background
  const fillPage = () => {
    doc.setFillColor(bgColor);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');
  };
  
  // First page background
  fillPage();
  
  let yOffset = 15;
  
  // Title
  const mainTitle = getMessage('analysisTitle') || '全局存储分析';
  const titleImg = textToImage(mainTitle, { fontSize: 24 });
  // Scale title usually
  const titleWidth = 60; 
  const titleHeight = titleWidth / titleImg.aspectRatio;
  doc.addImage(titleImg.dataUrl, 'PNG', margin, yOffset, titleWidth, titleHeight);
  
  // Timestamp
  const timeStr = `Generated: ${new Date().toLocaleString()}`;
  const timeImg = textToImage(timeStr, { fontSize: 12, color: '#b3b8c4' });
  const timeWidth = 60;
  const timeHeight = timeWidth / timeImg.aspectRatio;
  doc.addImage(timeImg.dataUrl, 'PNG', margin, yOffset + titleHeight + 2, timeWidth, timeHeight);
  
  yOffset += titleHeight + timeHeight + 10;
  
  const charts = document.querySelectorAll('.chart-card canvas');
  
  for (let i = 0; i < charts.length; i++) {
    const canvas = charts[i];
    const card = canvas.closest('.chart-card');
    const titleEl = card.querySelector('.chart-title');
    const chartTitle = titleEl ? titleEl.textContent : '';
    
    // Check if we need a new page (estimate chart height + title height)
    // Assume chart takes about 80mm height
    if (yOffset > pageHeight - 100) {
      doc.addPage();
      fillPage();
      yOffset = 15;
    }
    
    // Add Chart Title
    const chartTitleImg = textToImage(chartTitle, { fontSize: 16 });
    const cTitleWidth = Math.min(pageWidth - margin * 2, chartTitleImg.width * 0.264583); // px to mm approx
    const cTitleHeight = cTitleWidth / chartTitleImg.aspectRatio;
    
    doc.addImage(chartTitleImg.dataUrl, 'PNG', margin, yOffset, cTitleWidth, cTitleHeight);
    yOffset += cTitleHeight + 3;
    
    try {
      // Calculate aspect ratio to fit width
      const imgData = canvas.toDataURL('image/png');
      const imgProps = doc.getImageProperties(imgData);
      
      const pdfWidth = pageWidth - (margin * 2);
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      // Double check page space
      if (yOffset + pdfHeight > pageHeight - margin) {
        doc.addPage();
        fillPage();
        yOffset = 15;
        // Re-print title
        doc.addImage(chartTitleImg.dataUrl, 'PNG', margin, yOffset, cTitleWidth, cTitleHeight);
        yOffset += cTitleHeight + 3;
      }
      
      doc.addImage(imgData, 'PNG', margin, yOffset, pdfWidth, pdfHeight);
      yOffset += pdfHeight + 15;
    } catch (err) {
      console.error('Error adding chart to PDF', err);
    }
  }
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  doc.save(`storage_analysis_charts_${timestamp}.pdf`);
}

/**
 * 通用下载函数
 */
function downloadFile(dataUri, ext) {
  const downloadAnchorNode = document.createElement('a');
  downloadAnchorNode.setAttribute("href", dataUri);
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  downloadAnchorNode.setAttribute("download", `storage_analysis_${timestamp}.${ext}`);
  document.body.appendChild(downloadAnchorNode); // required for firefox
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
}

/**
 * 初始化滚动到顶部按钮
 */
function initScrollToTop() {
  const scrollTopBtn = document.getElementById('chart-scroll-top');
  const tabContent = document.querySelector('.tab-content[data-tab-content="charts"]');
  
  if (!scrollTopBtn || !tabContent) return;
  
  // 监听滚动，显示/隐藏按钮
  const handleScroll = () => {
    if (tabContent.scrollTop > 300) {
      scrollTopBtn.classList.add('show');
    } else {
      scrollTopBtn.classList.remove('show');
    }
  };
  
  tabContent.addEventListener('scroll', handleScroll, { passive: true });
  
  // 点击滚动到顶部
  scrollTopBtn.addEventListener('click', () => {
    tabContent.scrollTo({ top: 0, behavior: 'smooth' });
  });
  
  // 初始检查滚动位置
  handleScroll();
}

/**
 * 初始化图表导航菜单
 */
function initChartNavigation() {
  const navContainer = document.querySelector('.chart-nav-container');
  const navEl = document.getElementById('chart-nav');
  const toggleBtn = document.getElementById('chart-nav-toggle');
  
  if (!navEl || !toggleBtn) return;

  // 按钮点击事件 - 切换菜单显示
  toggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    navEl.classList.toggle('show');
  });

  // 点击外部区域关闭菜单
  document.addEventListener('click', (e) => {
    if (!navContainer.contains(e.target)) {
      navEl.classList.remove('show');
    }
  });

  // 阻止菜单内部点击事件冒泡
  navEl.addEventListener('click', (e) => {
    e.stopPropagation();
  });

  // 定义所有图表区域
  const sections = [
    { id: 'section-types', key: 'analysisSectionTypes' },
    { id: 'section-domains', key: 'analysisSectionDomains' },
    { id: 'section-stacks', key: 'analysisSectionStacks' },
    { id: 'section-quality', key: 'analysisSectionQuality' },
    { id: 'section-efficiency', key: 'analysisSectionEfficiency' },
    { id: 'section-concentration', key: 'analysisSectionConcentration' },
    { id: 'section-distribution', key: 'analysisSectionDistribution' },
    { id: 'section-comparison', key: 'analysisSectionComparison' },
    { id: 'section-security', key: 'analysisSectionSecurity' },
    { id: 'section-segmentation', key: 'analysisSectionSegmentation' },
    { id: 'section-statistics', key: 'analysisSectionStatistics' },
  ];

  // 创建导航项
  sections.forEach((section) => {
    const item = document.createElement('a');
    item.href = `#${section.id}`;
    item.className = 'chart-navigation-item';
    item.textContent = getMessage(section.key) || section.id.replace('section-', '');
    item.setAttribute('data-section', section.id);
    
    // 点击事件
    item.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const targetEl = document.getElementById(section.id);
      if (targetEl) {
        // 图表页面是在 tab-content 容器内滚动的，需要计算容器内的滚动位置
        const tabContent = document.querySelector('.tab-content[data-tab-content="charts"]');
        if (tabContent) {
          // 获取目标元素相对于容器的位置
          const containerRect = tabContent.getBoundingClientRect();
          const targetRect = targetEl.getBoundingClientRect();
          // 计算需要滚动的距离（目标元素顶部 - 容器顶部）
          const scrollTop = tabContent.scrollTop + (targetRect.top - containerRect.top);
          tabContent.scrollTo({ top: scrollTop, behavior: 'smooth' });
        } else {
          // 回退到默认行为（如果容器不存在）
          targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        // 更新活动状态
        updateActiveNavItem(section.id);
        // 关闭菜单
        navEl.classList.remove('show');
      }
    });
    
    navEl.appendChild(item);
  });

  // 监听滚动，更新活动状态
  let scrollTimeout;
  const handleScroll = () => {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      updateActiveNavItemOnScroll();
    }, 100);
  };
  
  // 监听窗口滚动
  window.addEventListener('scroll', handleScroll, { passive: true });
  
  // 也监听图表容器的滚动（如果有独立滚动）
  const chartGrid = document.querySelector('.chart-grid');
  if (chartGrid) {
    chartGrid.addEventListener('scroll', handleScroll, { passive: true });
  }

  // 初始更新活动状态
  updateActiveNavItemOnScroll();
}

/**
 * 更新活动导航项
 */
function updateActiveNavItem(activeId) {
  const navItems = document.querySelectorAll('.chart-navigation-item');
  navItems.forEach((item) => {
    const sectionId = item.getAttribute('data-section');
    if (sectionId === activeId) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });
}

/**
 * 根据滚动位置更新活动导航项
 */
function updateActiveNavItemOnScroll() {
  const sections = document.querySelectorAll('.chart-divider[id]');
  const navItems = document.querySelectorAll('.chart-navigation-item');
  
  if (sections.length === 0 || navItems.length === 0) return;

  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  const viewportHeight = window.innerHeight;
  const scrollPosition = scrollTop + viewportHeight / 3; // 视口上方1/3处作为判断点

  let activeSection = null;
  
  // 从下往上查找第一个进入视口的区域
  for (let i = sections.length - 1; i >= 0; i--) {
    const section = sections[i];
    const rect = section.getBoundingClientRect();
    const sectionTop = scrollTop + rect.top;
    
    if (sectionTop <= scrollPosition) {
      activeSection = section.id;
      break;
    }
  }

  // 如果没有找到，使用第一个区域
  if (!activeSection && sections.length > 0) {
    activeSection = sections[0].id;
  }

  if (activeSection) {
    updateActiveNavItem(activeSection);
  }
}

document.addEventListener('DOMContentLoaded', init);

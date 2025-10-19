# 缓存清理助手 (Cache Cleaner Assistant)

<div align="center">

![版本](https://img.shields.io/badge/版本-1.6.0-blue.svg)
![平台](https://img.shields.io/badge/平台-Chrome%20%7C%20Edge-lightgrey.svg)
![许可证](https://img.shields.io/badge/许可证-MIT-green.svg)
[![GitHub](https://img.shields.io/badge/GitHub-项目地址-orange.svg)](https://github.com/soyof/clearCache)

</div>

> 一键清理浏览器缓存、Cookies、LocalStorage、SessionStorage 等数据的强大工具

**缓存清理助手**是一款专为开发人员和普通用户设计的 Chrome 扩展，提供快速、高效的浏览器数据清理功能。无论您是在调试网站、保护隐私还是解决网站加载问题，本扩展都能提供便捷的解决方案。通过简洁的界面和强大的右键菜单，让清理浏览器数据变得轻松简单。

### ⚡ v1.6.0 新特性

- **🚀 零延迟响应** - 彻底解决重新加载延迟问题，从 500-1000ms 优化到 <5ms，性能提升 99%+
- **⚡ 瞬间刷新** - 点击重新加载按钮立即响应，完全媲美浏览器原生功能
- **🎯 精确优化** - 采用强制重排机制确保 UI 变化立即可见，用户体验完美
- **🔧 智能处理** - 异步清理策略，缓存清理不阻塞页面重载

## 🚀 主要功能

### 🧹 数据清理

- **全面的清理选项** - 一键清理缓存、Cookies、LocalStorage、SessionStorage、IndexedDB 等
- **精准清理** - 可针对当前网站或整个浏览器进行清理
- **智能保留** - 自定义保留密码、表单数据、登录状态等重要信息

### 🔄 页面刷新

- **多种重载方式** - 支持正常重载、硬性重载、清空缓存并重载
- **一键操作** - 右键菜单快速访问所有重载功能
- **性能优化** - 解决因缓存导致的网站加载问题

### ⚙️ 个性化设置

- **主题切换** - 深色、浅色和自动主题（根据时间自动切换）
- **通知控制** - 根据用户偏好显示通知，支持静音模式
- **定期清理** - 设置自动清理计划，无需手动操作

### 🌍 国际化支持

- **多语言界面** - 支持 8 种主流语言，覆盖全球主要地区
  - 🇨🇳 简体中文、🇺🇸 英语、🇯🇵 日语、🇰🇷 韩语
  - 🇫🇷 法语、🇩🇪 德语、🇪🇸 西班牙语、🇷🇺 俄语
- **智能语言检测** - 自动跟随系统语言或手动选择
- **实时语言切换** - 无需重启扩展即可切换界面语言
- **完整本地化** - 所有文本、提示、通知均支持多语言

### 📊 数据管理

- **存储分析** - 直观查看各类存储使用情况
- **使用统计** - 了解清理历史和效果
- **性能监控** - 优化的 Service Worker 生命周期管理，确保扩展稳定运行

### ⚡ 性能优化

#### v1.6.0 - 零延迟响应

- **重载功能优化** - 彻底解决重新加载延迟问题
  - 从 500-1000ms 优化到 <5ms，性能提升 99%+
  - 移除所有中间层调用，直接调用 Chrome API
  - 采用强制重排机制，确保 UI 立即更新
  - 按钮状态和提示消息瞬间可见
- **智能异步处理** - 缓存清理不阻塞页面重载
  - 先触发页面重载，再后台清理缓存
  - 使用事件循环隔离，完全无阻塞
  - 用户体验完全媲美浏览器原生功能
- **多重强制重排** - 确保所有 UI 变化立即生效
  - 按钮元素强制重排
  - 状态容器强制重排
  - 消除浏览器批处理延迟

#### v1.5.0 - 极速启动

- **极速启动** - 面板打开时间从 2-5 秒降低至 0.3-0.8 秒
  - 移除外部 CDN 依赖，消除网络加载阻塞
  - 并行初始化机制，关键任务优先加载
  - 智能超时控制，防止卡死
- **智能缓存** - 国际化语言包本地缓存
  - 首次加载后，后续打开几乎无延迟
  - 24 小时缓存有效期，自动更新
  - 降低 localStorage 读写频率
- **高可靠性** - 全面的错误处理和容错机制
  - 初始化可靠性提升至 99%+
  - 单个功能失败不影响整体使用
  - 优雅降级，始终提供基本功能

## 💡 使用指南

### 📱 弹出面板

<div align="center">
  <img src="https://img.shields.io/badge/%F0%9F%96%BC%EF%B8%8F-%E5%BC%B9%E5%87%BA%E9%9D%A2%E6%9D%BF%E7%A4%BA%E4%BE%8B%E5%9B%BE-blue" alt="弹出面板示例" width="200">
  <p><i>弹出面板提供直观的清理选项和设置</i></p>
</div>

1. 点击浏览器工具栏中的扩展图标 <img src="https://img.shields.io/badge/🧹-blue.svg" height="16">
2. 在弹出面板中选择操作模式：
   - **当前网站** - 仅清理您正在浏览的网站数据
   - **整个浏览器** - 清理所有网站的数据
3. 选择要清理的数据类型（缓存、Cookies 等）
4. 点击"清理"按钮执行操作

### 📋 右键菜单

<div align="center">
  <img src="https://img.shields.io/badge/%F0%9F%96%B1%EF%B8%8F-%E5%8F%B3%E9%94%AE%E8%8F%9C%E5%8D%95%E7%A4%BA%E4%BE%8B%E5%9B%BE-green" alt="右键菜单示例" width="200">
  <p><i>右键菜单提供快速访问常用功能</i></p>
</div>

1. 在任意网页上**右键点击**
2. 从菜单中选择 **"清理缓存助手"**
3. 选择需要的操作：
   - **正常重新加载** - 普通刷新页面
   - **硬性重新加载** - 忽略缓存刷新页面
   - **清空缓存并硬性重新加载** - 清除缓存后刷新
   - **清空当前网站缓存** - 清理当前网站所有数据
   - **清空 Cookies/LocalStorage/SessionStorage** - 针对性清理
   - **全部清空重载** - 清理所有数据并刷新页面
   - **打开清理面板** - 打开扩展主界面

### ⚙️ 高级设置

<div align="center">
  <img src="https://img.shields.io/badge/%E2%9A%99%EF%B8%8F-%E9%AB%98%E7%BA%A7%E8%AE%BE%E7%BD%AE%E7%A4%BA%E4%BE%8B%E5%9B%BE-purple" alt="高级设置示例" width="200">
  <p><i>高级设置提供个性化配置选项</i></p>
</div>

1. 在弹出面板中点击**"高级设置"**选项卡
2. 自定义以下选项：
   - **语言设置** - 选择界面语言或跟随系统
   - **主题选择** - 深色/浅色/自动主题切换
   - **通知设置** - 开启/关闭通知，声音控制
   - **保留选项** - 密码、表单数据等保护设置
   - **定期清理** - 自动清理计划配置

### 🌐 语言设置

<div align="center">
  <img src="https://img.shields.io/badge/%F0%9F%8C%90-%E8%AF%AD%E8%A8%80%E8%AE%BE%E7%BD%AE%E7%A4%BA%E4%BE%8B%E5%9B%BE-green" alt="语言设置示例" width="200">
  <p><i>支持8种主流语言，实时切换界面</i></p>
</div>

1. 在**"高级设置"**中找到**"语言设置"**
2. 选择您偏好的语言：
   - **🌐 跟随系统** - 自动检测系统语言
   - **🇨🇳 简体中文** - 默认语言
   - **🇺🇸 English** - 英语界面
   - **🇯🇵 日本語** - 日语界面
   - **🇰🇷 한국어** - 韩语界面
   - **🇫🇷 Français** - 法语界面
   - **🇩🇪 Deutsch** - 德语界面
   - **🇪🇸 Español** - 西班牙语界面
   - **🇷🇺 Русский** - 俄语界面
3. 选择后界面将立即切换到新语言

## 🔧 技术架构

本扩展采用模块化设计，基于 Chrome 扩展 Manifest V3 规范开发，确保高性能和稳定性。

### 📂 项目结构

```
缓存清理助手/
├── 核心文件
│   ├── background-service-worker.js  # 后台服务工作器 (扩展核心)
│   ├── service-worker-bridge.js      # Service Worker桥接脚本 (保持活跃)
│   ├── contentScript.js              # 内容脚本 (页面交互)
│   └── manifest.json                 # 扩展清单 (配置文件)
│
├── 用户界面
│   ├── popup.html                    # 弹窗界面HTML
│   ├── popup.js                      # 弹窗界面脚本
│   └── popup.css                     # 弹窗界面样式
│
├── 工具模块
│   ├── utils/
│   │   ├── index.js                  # 工具模块入口
│   │   ├── storage.js                # 存储操作工具
│   │   ├── notification.js           # 通知工具
│   │   ├── ui.js                     # UI工具
│   │   ├── cleaner.js                # 清理工具
│   │   └── i18n.js                   # 国际化工具
│
├── 国际化文件
│   └── _locales/                     # 多语言支持
│       ├── zh_CN/messages.json       # 简体中文
│       ├── en/messages.json          # 英语
│       ├── ja/messages.json          # 日语
│       ├── ko/messages.json          # 韩语
│       ├── fr/messages.json          # 法语
│       ├── de/messages.json          # 德语
│       ├── es/messages.json          # 西班牙语
│       └── ru/messages.json          # 俄语
│
├── 资源文件
│   └── icons/                        # 图标资源
│       ├── icon16.png, icon32.png, icon48.png, icon128.png
│       └── clear-cache.svg
│
└── 文档
    ├── CHANGELOG.md                  # 更新日志
    ├── INSTALL.md                    # 安装说明
    ├── LICENSE                       # 许可证
    └── README.md                     # 项目说明
```

### 🔄 工作流程

1. **用户交互** - 通过弹出面板或右键菜单触发操作
2. **消息传递** - 操作请求传递给 Service Worker
3. **数据处理** - Service Worker 调用相应的 API 执行清理操作
4. **结果反馈** - 操作完成后通过通知系统反馈结果

## 👨‍💻 开发指南

### 🛠️ 关键组件

| 文件                             | 功能描述              | 开发要点                           |
| -------------------------------- | --------------------- | ---------------------------------- |
| **background-service-worker.js** | Service Worker 入口点 | 处理后台任务、右键菜单、通知系统   |
| **service-worker-bridge.js**     | 桥接脚本              | 保持 Service Worker 活跃、消息转发 |
| **contentScript.js**             | 内容脚本              | 页面级存储操作、DOM 交互           |
| **popup.js**                     | 弹窗界面控制          | 用户交互、数据展示、设置管理       |
| **utils/storage.js**             | 存储操作工具          | 统一的存储类型操作接口             |
| **utils/notification.js**        | 通知工具              | 通知显示与管理                     |
| **utils/ui.js**                  | UI 工具               | 界面相关通用功能                   |
| **utils/cleaner.js**             | 清理工具              | 各种清理操作的实现                 |
| **utils/i18n.js**                | 国际化工具            | 多语言支持、动态语言切换           |

### 🎨 设计规范

#### 颜色方案

```css
/* 主题颜色变量 */
:root {
  --primary-color: #f5222d; /* 主色调：鲜红色 */
  --secondary-color: #1890ff; /* 次要色：蓝色 */
  --success-color: #52c41a; /* 成功色：绿色 */
  --warning-color: #faad14; /* 警告色：黄色 */
  --error-color: #f5222d; /* 错误色：红色 */
  --text-color: #2d3748; /* 主要文字色 */
  --bg-color: #f7fafc; /* 背景色 */
}
```

#### 布局规范

- **弹窗尺寸**: 520px × 自适应高度
- **最小高度**: 720px
- **内边距**: 16px 标准间距
- **圆角半径**: 8px 统一圆角

#### 图标系统

| 功能     | 图标 | 含义       |
| -------- | ---- | ---------- |
| 清理缓存 | 🗑️   | 删除操作   |
| 刷新页面 | 🔄   | 重新加载   |
| Cookie   | 🍪   | 网站数据   |
| 存储     | 💾   | 本地数据   |
| 数据库   | 🗄️   | 结构化数据 |

### 🧩 扩展功能

如需添加新功能，请遵循以下步骤：

1. **设计规划**

   - 确定功能需求和用户体验目标
   - 选择合适的实现方式（弹窗界面/右键菜单/内容脚本）

2. **代码实现**

   - 在相应的工具模块中添加核心功能实现
   - 在`popup.js`或`background-service-worker.js`中调用该功能
   - 如需界面元素，在`popup.html`中添加并在`popup.js`中绑定事件

3. **测试与调试**
   - 使用 Chrome 开发者工具进行调试
   - 检查 Service Worker 状态和消息传递
   - 验证清理操作的有效性

### 🔍 构建与测试

1. **开发环境设置**

   ```bash
   # 克隆仓库
   git clone https://github.com/soyof/clearCache.git
   cd clearCache
   ```

2. **加载扩展**

   - 打开 Chrome 浏览器，访问`chrome://extensions/`
   - 启用右上角的"开发者模式"
   - 点击"加载已解压的扩展程序"，选择项目目录

3. **调试技巧**

   - **弹窗界面调试**: 右键点击扩展图标 → 检查，或使用 F12 打开开发者工具
   - **Service Worker 调试**: 在扩展管理页面点击"背景页"链接
   - **内容脚本调试**: 在网页上按 F12，在控制台中查看日志
   - **存储检查**: 在开发者工具中选择"应用程序"标签，查看存储变化
   - **错误处理**: 实现详细的错误捕获和日志记录机制

4. **代码规范**

   ```javascript
   // ✅ 推荐：使用现代 ES6+ 语法
   const clearCache = async () => {
     try {
       await chrome.browsingData.removeCache({ since: 0 })
       return { success: true, message: '缓存清理成功' }
     } catch (error) {
       handleError(error, '清理缓存')
       return { success: false, error: error.message }
     }
   }

   // ✅ 推荐：详细的错误处理
   function handleError(error, context) {
     console.error(`${context} 失败:`, error)
     showNotification(`操作失败: ${error.message}`, 'error')
   }
   ```

## 📝 文档

### 📋 更新日志

查看完整的版本历史和功能变更，请参阅[CHANGELOG.md](CHANGELOG.md)

### 📥 安装指南

获取安装和配置说明，请参阅[INSTALL.md](INSTALL.md)

## 🤝 贡献指南

**欢迎所有形式的贡献！让我们一起让这个项目变得更好！**

### 🚀 如何贡献

#### 1. 🍴 Fork 项目

```bash
# 1. Fork 项目到你的 GitHub 账户
# 2. 克隆你的 Fork
git clone https://github.com/your-username/clearCache.git
cd clearCache
```

#### 2. 🌿 创建功能分支

```bash
# 创建并切换到新分支
git checkout -b feature/your-feature-name
# 或修复 bug
git checkout -b fix/bug-description
```

#### 3. 💻 开发和测试

- 遵循项目的代码规范
- 添加必要的测试
- 确保所有功能正常工作

#### 4. 📤 提交更改

```bash
git add .
git commit -m "feat: 添加新功能描述"
git push origin feature/your-feature-name
```

#### 5. 🔄 发起 Pull Request

- 详细描述你的更改
- 关联相关的 Issue
- 等待代码审查

### 🐛 报告问题

发现 Bug？请通过以下方式报告：

1. **检查现有 Issues** - 避免重复报告
2. **使用 Issue 模板** - 提供详细信息
3. **包含复现步骤** - 帮助快速定位问题
4. **提供环境信息** - 浏览器版本、操作系统等

### 💡 功能建议

有好的想法？我们很乐意听到：

- 📋 **使用 Feature Request 模板**
- 🎯 **描述使用场景和预期效果**
- 🤔 **考虑实现的可行性**

## 📞 联系方式

> 邮箱：somuns.os@qq.com

### 💬 获取帮助

| 方式            | 链接                                                        | 说明               |
| --------------- | ----------------------------------------------------------- | ------------------ |
| 🐛 **报告问题** | [GitHub Issues](https://github.com/soyof/clearCache/issues) | Bug 报告和功能请求 |
| 💡 **功能建议** | [GitHub Issues](https://github.com/soyof/clearCache/issues) | 想法交流和讨论     |
| 📧 **邮件联系** | somuns.os@qq.com                                            | 私人咨询和合作     |

## 📄 许可证

本项目采用 MIT 许可证 - 详见[LICENSE](LICENSE)文件

### 📋 许可证要点

- ✅ **商业使用** - 可用于商业项目
- ✅ **修改** - 可以修改源代码
- ✅ **分发** - 可以分发原始或修改版本
- ✅ **私人使用** - 可用于个人项目
- ⚠️ **责任** - 作者不承担任何责任
- ⚠️ **保证** - 不提供任何保证

---

<div align="center">
  <p>
    <strong>⚡ 让浏览器保持清洁，让网页运行更快！</strong>
  </p>
  <p>
    <i>如果这个项目对您有帮助，请给我们一个 ⭐ Star！</i>
  </p>
  <p>
    版本 1.4.0 | 作者：soyof | © 2025
  </p>
</div>

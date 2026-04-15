# 张满堂官网设计系统

本目录记录当前官网的设计系统基线，基于以下真实实现整理：
- [site/css/style.css](/C:/Users/weixi/Desktop/zhangmantang-website/site/css/style.css)
- [site/js/state.js](/C:/Users/weixi/Desktop/zhangmantang-website/site/js/state.js)
- [site/js/components.js](/C:/Users/weixi/Desktop/zhangmantang-website/site/js/components.js)
- [site/js/renderers.js](/C:/Users/weixi/Desktop/zhangmantang-website/site/js/renderers.js)
- [site/js/renderers-secondary.js](/C:/Users/weixi/Desktop/zhangmantang-website/site/js/renderers-secondary.js)
- [site/js/main.js](/C:/Users/weixi/Desktop/zhangmantang-website/site/js/main.js)
- [data/profile.json](/C:/Users/weixi/Desktop/zhangmantang-website/data/profile.json)

适用范围：
- 官网视觉风格
- 排版与页面层级
- 组件结构与状态
- 内容展示规则

目录说明：
- `00-governance.md`：治理规则与文档维护边界
- `01-brand-principles.md`：品牌气质、视觉语言与使用禁忌
- `02-foundations.md`：颜色、排版、间距、边界、阴影、动效
- `03-design-tokens.json`：可被机器读取的设计令牌
- `04-layout-and-responsive.md`：网格、断点、响应式规则
- `05-components.md`：导航、搜索、筛选、卡片、年份轨道、详情媒体、联系模块
- `06-page-patterns.md`：首页、作品、展览、新闻、关于、详情页模式
- `07-content-guidelines.md`：中英文字段、图片、摘要、搜索与内容录入规则
- `CHANGELOG.md`：设计系统版本变更记录
- `新版网站设计规范.txt`：给非技术协作者快速浏览的文本版摘要

维护原则：
1. 代码优先。若文档与前端实现冲突，以当前真实实现为准，再回写文档。
2. 基础色、边界、年份轨道、联系区变体这类基线变化，必须同步更新 `02-foundations.md` 和 `03-design-tokens.json`。
3. 组件结构级调整必须同步 `05-components.md` 和 `06-page-patterns.md`。
4. 搜索交互、详情页媒体导航、年份轨道、联系模块这类行为变化，也属于设计系统变更，必须同步回写文档。
5. 每次显著改版后更新 `CHANGELOG.md`。

# 张满堂书法艺术官网项目文档

## 项目概述
张满堂书法艺术官网是一个展示艺术家作品、展览和新闻的静态网站。

## 技术栈
- 前端：原生 HTML + CSS + JS
- 数据：JSON
- 构建工具：Python 脚本
- 部署：静态托管（GitHub Pages / Vercel）

## 目录结构
- `site/`：前端代码
- `data/`：JSON 数据
- `excel/`：内容源文件
- `images/`：图片资源
- `scripts/`：工具脚本
- `docs/`：项目文档

## 开发流程
1. 更新 Excel 内容源
2. 运行脚本生成 JSON 数据
3. 本地预览
4. 部署到静态托管服务

## 常用命令
- 本地预览：`python -m http.server 8080`
- 导出 JSON：`python scripts/excel_to_json.py --workbook excel/content.xlsx --output-dir data`
- 压缩图片：`python scripts/compress_images.py --images-root images --max-width 1920 --thumb-width 480 --quality 80`
- 优化字体：`python scripts/optimize_fonts.py --repo-root .`

## 优化措施
- 图片懒加载
- 资源预加载
- 关键 CSS 内联
- 错误处理增强
- 防御性编程

## 维护说明
- 若页面结构或视觉改动较大，请同步更新文档
- 若修改作品筛选、字段或图片路径，请先改 Excel 或 `profile.json`
- 仓库中的 `.docx`、原始履历资料和备份 Excel 不属于前端代码真相源
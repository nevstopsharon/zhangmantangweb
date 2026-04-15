# Zhang Mantang Website

张满堂书法艺术官网项目仓库。

当前站点模式：
- 原生 `HTML + CSS + JS`
- 内容通过 `JSON` 读取
- 图片使用本地压缩后的 `webp`
- 适合静态部署到 GitHub Pages / Vercel

## 目录
- `site/`：当前官网前端代码
- `data/`：网站直接读取的 JSON 数据
- `excel/`：内容源与字段规范
- `images/`：正式图片资源与缩略图
- `scripts/`：压缩图片、导出 JSON、初始化目录、字体优化脚本
- `templates/`：线框与设计系统文档

## 当前内容来源
- 作品 / 展览 / 新闻：
  `excel/content.xlsx` -> `data/*.json`
- 品牌 / 首页 / about / contact：
  `data/profile.json`

## 常用命令
本地预览：

```powershell
cd C:\Users\weixi\Desktop\zhangmantang-website
py -m http.server 8000
```

打开：

`http://127.0.0.1:8000/site/`

导出 JSON：

```powershell
py scripts/excel_to_json.py --workbook excel/content.xlsx --output-dir data
```

压缩图片：

```powershell
py scripts/compress_images.py --images-root images --max-width 1920 --thumb-width 480 --quality 80
```

优化网页字体：

```powershell
py scripts/optimize_fonts.py --repo-root .
```

## 维护说明
- 若页面结构或视觉改动较大，请同步更新 `templates/design-system/`
- 若修改作品筛选、字段或图片路径，请先改 Excel 或 `profile.json`
- 仓库中的 `.docx`、原始履历资料和备份 Excel 不属于前端代码真相源

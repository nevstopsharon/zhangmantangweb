# content.xlsx 字段规范

本文档定义 [content.xlsx](C:\Users\weixi\Desktop\zhangmantang-website\excel\content.xlsx) 的结构，供 [excel_to_json.py](C:\Users\weixi\Desktop\zhangmantang-website\scripts\excel_to_json.py) 读取。

## 总说明
- `content.xlsx` 当前只负责：
  - 作品
  - 展览
  - 新闻
- 不负责：
  - 首页品牌信息
  - about 页人物介绍
  - 全站 contact

这些站点级内容请维护在 [profile.json](C:\Users\weixi\Desktop\zhangmantang-website\data\profile.json)。

## Sheet 1: works

列顺序：
- `id`
- `title_zh`
- `title_en`
- `year`
- `material`
- `project`
- `size`
- `location`
- `description_zh`
- `description_en`
- `cover_image`
- `gallery_images`

说明：
- `id` 示例：`work-001`
- `cover_image` 示例：`/images/works/work-001/cover.webp`
- `gallery_images` 多图用分号分隔
- 当前作品页筛选读取：
  - `project`
  - `material`

## Sheet 2: exhibitions

列顺序：
- `id`
- `title_zh`
- `title_en`
- `year`
- `location_zh`
- `location_en`
- `description_zh`
- `description_en`
- `cover_image`
- `gallery_images`

说明：
- `id` 示例：`exhibition-001`
- `cover_image` 示例：`/images/exhibitions/exhibition-001/cover.webp`

## Sheet 3: news

列顺序：
- `id`
- `title_zh`
- `title_en`
- `date`
- `content_zh`
- `content_en`
- `cover_image`
- `gallery_images`

说明：
- `id` 示例：`news-001`
- `date` 建议写成 `2026-03` 或 `2026-04-07`
- `cover_image` 示例：`/images/news/news-001/cover.webp`

## 图片路径规则
- 首页：`/images/home/hero-main.webp`
- 作品：`/images/works/work-001/cover.webp`
- 展览：`/images/exhibitions/exhibition-001/cover.webp`
- 新闻：`/images/news/news-001/cover.webp`

## 命名规则
- 全部小写
- 使用短横线
- 不使用中文文件名
- 编号统一三位：`001`、`002`、`003`

## 图片尺寸修改方式
图片尺寸不在 Excel 中控制，而由压缩脚本参数控制。

示例：

```powershell
py scripts/compress_images.py --images-root images --max-width 1600 --thumb-width 360 --quality 78
```

常改参数：
- `--max-width`：正式图最大宽度
- `--thumb-width`：缩略图最大宽度
- `--quality`：压缩质量

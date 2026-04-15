from __future__ import annotations

import argparse
import os
from pathlib import Path


README_CONTENT = {
    "data/README.txt": """用途：
- 存放网站读取的 JSON 数据文件。

文件说明：
- works.json：作品数据
- exhibitions.json：展览数据
- news.json：新闻数据

更新方式：
1. 先维护 excel/content.xlsx
2. 再运行 scripts/excel_to_json.py
3. 自动覆盖这里的 JSON 文件
""",
    "excel/README.txt": """用途：
- 存放内容维护用 Excel 文件。

推荐文件：
- content.xlsx：给 scripts/excel_to_json.py 读取

说明：
- 请勿在这里放临时截图或无关文件。
- 字段定义见 excel/content-spec.md
""",
    "images/README.txt": """用途：
- 存放网站正式使用的图片资源。

一级目录说明：
- home：首页主视觉
- works：作品图片
- exhibitions：展览图片
- news：新闻图片
- thumbnails：缩略图输出目录

命名规则：
- 全小写
- 使用短横线
- 不使用空格和中文文件名
""",
    "images/home/README.txt": """用途：
- 首页 Hero 主视觉图

推荐命名：
- hero-main.webp
- hero-main-mobile.webp

建议尺寸：
- 桌面端：宽 1920px 左右
- 移动端：宽 900px 左右
""",
    "images/works/README.txt": """用途：
- 每件作品一个子文件夹

示例：
- work-001/cover.webp
- work-001/detail.webp
- work-001/gallery-01.webp

命名规则：
- 文件夹：work-001, work-002
- 图片：cover.webp, detail.webp, gallery-01.webp
""",
    "images/exhibitions/README.txt": """用途：
- 每个展览一个子文件夹

示例：
- exhibition-001/cover.webp
- exhibition-001/hero.webp
- exhibition-001/gallery-01.webp

命名规则：
- 文件夹：exhibition-001, exhibition-002
- 图片：cover.webp, hero.webp, gallery-01.webp
""",
    "images/news/README.txt": """用途：
- 每条新闻一个子文件夹

示例：
- news-001/cover.webp
- news-001/detail.webp

命名规则：
- 文件夹：news-001, news-002
- 图片：cover.webp, detail.webp
""",
    "images/thumbnails/README.txt": """用途：
- 自动生成的缩略图输出目录

说明：
- 由 scripts/compress_images.py 生成
- 不建议手工修改
""",
    "site/assets/fonts/README.txt": """用途：
- 存放本地字体文件，替代在线字体。

推荐字体：
- NotoSerifSC-Light.woff2
- NotoSansSC-Light.woff2

说明：
- 上传前确认字体授权可用
- CSS 通过 @font-face 引用这里的文件
""",
}


PLACEHOLDER_DIRS = [
    "data",
    "excel",
    "images/home",
    "images/works/work-001",
    "images/exhibitions/exhibition-001",
    "images/news/news-001",
    "images/thumbnails",
    "site/assets/fonts",
]


def initialize_project(root: Path) -> None:
    os.makedirs(root, exist_ok=True)

    for relative_dir in PLACEHOLDER_DIRS:
        os.makedirs(root / relative_dir, exist_ok=True)

    for relative_file, content in README_CONTENT.items():
        path = root / relative_file
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(content.strip() + "\n", encoding="utf-8")


def main() -> None:
    parser = argparse.ArgumentParser(description="Initialize folders and README instructions for the Zhang Mantang website project.")
    parser.add_argument("--root", type=Path, default=Path.cwd(), help="Project root directory.")
    args = parser.parse_args()

    initialize_project(args.root.resolve())
    print(f"Initialized structure under: {args.root.resolve()}")


if __name__ == "__main__":
    main()

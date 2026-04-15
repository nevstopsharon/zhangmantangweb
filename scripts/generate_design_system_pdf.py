from __future__ import annotations

import json
import shutil
from datetime import date
from pathlib import Path

from reportlab.lib.colors import HexColor
from reportlab.lib.pagesizes import A4, landscape
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas


ROOT = Path(r"C:\Users\weixi\Desktop\zhangmantang-website")
TOKENS_PATH = ROOT / "templates" / "design-system" / "03-design-tokens.json"
OUTPUT_PATH = ROOT / "templates" / "design-system" / "张满堂官网 Design System 速查表.pdf"
OUTPUT_PATH_ASCII = ROOT / "templates" / "design-system" / "design-system-quick-reference.pdf"

PAGE_WIDTH, PAGE_HEIGHT = landscape(A4)
MARGIN = 34
CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2


def register_fonts() -> None:
    pdfmetrics.registerFont(TTFont("DSBody", r"C:\Windows\Fonts\msyh.ttc"))
    pdfmetrics.registerFont(TTFont("DSBodyBold", r"C:\Windows\Fonts\msyhbd.ttc"))
    pdfmetrics.registerFont(TTFont("DSHeading", r"C:\Windows\Fonts\simsun.ttc"))


def load_tokens() -> dict:
    return json.loads(TOKENS_PATH.read_text(encoding="utf-8"))


def draw_page_header(c: canvas.Canvas, title: str, subtitle: str, colors: dict, page_no: int) -> None:
    x = MARGIN
    y = PAGE_HEIGHT - MARGIN
    c.setFillColor(HexColor(colors["ink"]))
    c.setFont("DSHeading", 22)
    c.drawString(x, y, title)
    c.setStrokeColor(HexColor(colors["accent"]))
    c.setLineWidth(2)
    c.line(x, y - 10, x + 130, y - 10)
    c.setFillColor(HexColor(colors["mid"]))
    c.setFont("DSBody", 9)
    c.drawRightString(PAGE_WIDTH - MARGIN, y, f"Page {page_no}")
    c.drawString(x, y - 24, subtitle)


def section_title(c: canvas.Canvas, x: float, y: float, title: str, colors: dict) -> None:
    c.setFillColor(HexColor(colors["accent"]))
    c.setFont("DSBodyBold", 10)
    c.drawString(x, y, title.upper())
    c.setFillColor(HexColor(colors["ink"]))


def card(c: canvas.Canvas, x: float, y: float, w: float, h: float, colors: dict, fill: str | None = None) -> None:
    c.setLineWidth(0.8)
    c.setStrokeColor(HexColor(colors["borderSoft"]))
    c.setFillColor(HexColor(fill or colors["card"]))
    c.roundRect(x, y, w, h, 12, stroke=1, fill=1)


def draw_color_swatches(c: canvas.Canvas, x: float, y: float, w: float, h: float, tokens: dict) -> None:
    colors = tokens["color"]
    section_title(c, x, y + h + 14, "Color", colors)
    swatches = [
        ("bg", colors["bg"]),
        ("card", colors["card"]),
        ("accent", colors["accent"]),
        ("ink", colors["ink"]),
        ("mid", colors["mid"]),
        ("soft", colors["soft"]),
        ("borderSoft", colors["borderSoft"]),
        ("heroFallback", colors["heroFallback"]),
    ]
    gap = 12
    cols = 4
    tile_w = (w - gap * (cols - 1)) / cols
    tile_h = (h - gap) / 2
    for idx, (name, value) in enumerate(swatches):
        row = idx // cols
        col = idx % cols
        sx = x + col * (tile_w + gap)
        sy = y + h - (row + 1) * tile_h - row * gap
        card(c, sx, sy, tile_w, tile_h, colors, fill=colors["card"])
        c.setFillColor(HexColor(value))
        c.roundRect(sx + 12, sy + tile_h - 48, tile_w - 24, 36, 8, stroke=0, fill=1)
        c.setFillColor(HexColor(colors["ink"]))
        c.setFont("DSBodyBold", 10)
        c.drawString(sx + 12, sy + 26, name)
        c.setFont("DSBody", 9)
        c.setFillColor(HexColor(colors["mid"]))
        c.drawString(sx + 12, sy + 12, value.upper())


def draw_typography(c: canvas.Canvas, x: float, y: float, w: float, h: float, tokens: dict) -> None:
    colors = tokens["color"]
    type_tokens = tokens["typography"]
    section_title(c, x, y + h + 14, "Typography", colors)
    card(c, x, y, w, h, colors)
    col_gap = 18
    left_w = (w - col_gap) * 0.54
    right_w = w - left_w - col_gap
    left_x = x + 18
    right_x = x + left_w + col_gap + 18
    top = y + h - 26

    c.setFont("DSBodyBold", 10)
    c.setFillColor(HexColor(colors["mid"]))
    c.drawString(left_x, top, "Heading Family")
    c.setFillColor(HexColor(colors["ink"]))
    c.setFont("DSHeading", 24)
    c.drawString(left_x, top - 34, "张满堂书法艺术")
    c.setFont("DSBody", 10)
    c.setFillColor(HexColor(colors["mid"]))
    c.drawString(left_x, top - 50, type_tokens["fontFamilyHeading"])

    c.setFont("DSBodyBold", 10)
    c.drawString(left_x, top - 82, "Body Family")
    c.setFillColor(HexColor(colors["ink"]))
    c.setFont("DSBody", 12)
    c.drawString(left_x, top - 108, "专注于中国书法传统与当代表达。")
    c.setFillColor(HexColor(colors["mid"]))
    c.setFont("DSBody", 10)
    c.drawString(left_x, top - 124, type_tokens["fontFamilyBody"])

    c.setFillColor(HexColor(colors["accent"]))
    c.roundRect(right_x - 6, y + 18, right_w - 24, h - 36, 10, stroke=0, fill=1)
    c.setFillColor(HexColor(colors["card"]))
    c.roundRect(right_x, y + 22, right_w - 36, h - 44, 10, stroke=0, fill=1)
    specimen_x = right_x + 16
    specimen_top = y + h - 34
    c.setFillColor(HexColor(colors["ink"]))
    c.setFont("DSHeading", 28)
    c.drawString(specimen_x, specimen_top, "H1 48px")
    c.setFont("DSHeading", 18)
    c.drawString(specimen_x, specimen_top - 34, "H2 24px")
    c.setFont("DSBody", 11)
    c.drawString(specimen_x, specimen_top - 62, "Body 16px / line-height 1.6")
    c.setFillColor(HexColor(colors["mid"]))
    c.setFont("DSBody", 9)
    c.drawString(specimen_x, specimen_top - 88, "Weights: 300 / 400")
    c.drawString(specimen_x, specimen_top - 104, "Mood: calm, museum-like, editorial")


def draw_sizes_layout(c: canvas.Canvas, x: float, y: float, w: float, h: float, tokens: dict) -> None:
    colors = tokens["color"]
    section_title(c, x, y + h + 14, "Sizes & Layout", colors)
    left_w = w * 0.48
    right_w = w - left_w - 12
    card(c, x, y, left_w, h, colors)
    card(c, x + left_w + 12, y, right_w, h, colors)

    type_tokens = tokens["typography"]
    spacing = tokens["spacing"]
    layout = tokens["layout"]

    lx = x + 16
    ly = y + h - 22
    c.setFont("DSBodyBold", 11)
    c.setFillColor(HexColor(colors["ink"]))
    c.drawString(lx, ly, "字号速查")
    items = [
        ("H1", type_tokens["h1"]["fontSize"]),
        ("H2", type_tokens["h2"]["fontSize"]),
        ("Body", type_tokens["fontSizeBase"]),
        ("Lead", "18px"),
        ("Meta", "12px"),
    ]
    row_y = ly - 28
    for label, value in items:
        c.setFillColor(HexColor(colors["mid"]))
        c.setFont("DSBody", 10)
        c.drawString(lx, row_y, label)
        c.setFillColor(HexColor(colors["ink"]))
        c.setFont("DSBodyBold", 10)
        c.drawRightString(x + left_w - 16, row_y, value)
        c.setStrokeColor(HexColor(colors["borderSoft"]))
        c.setLineWidth(0.5)
        c.line(lx, row_y - 8, x + left_w - 16, row_y - 8)
        row_y -= 24

    rx = x + left_w + 28
    ry = y + h - 22
    c.setFillColor(HexColor(colors["ink"]))
    c.setFont("DSBodyBold", 11)
    c.drawString(rx, ry, "布局速查")
    layout_items = [
        ("Max width", layout["maxWidth"]),
        ("Nav height", layout["navHeight"]),
        ("Tablet", layout["breakpointTablet"]),
        ("Mobile", layout["breakpointMobile"]),
        ("Space S / M / L", f"{spacing['s']} / {spacing['m']} / {spacing['l']}"),
    ]
    row_y = ry - 28
    for label, value in layout_items:
        c.setFillColor(HexColor(colors["mid"]))
        c.setFont("DSBody", 10)
        c.drawString(rx, row_y, label)
        c.setFillColor(HexColor(colors["ink"]))
        c.setFont("DSBodyBold", 10)
        c.drawString(rx, row_y - 14, value)
        row_y -= 36


def draw_nav_component(c: canvas.Canvas, x: float, y: float, w: float, h: float, colors: dict) -> None:
    card(c, x, y, w, h, colors)
    c.setFillColor(HexColor(colors["accent"]))
    c.circle(x + 20, y + h - 24, 8, stroke=0, fill=1)
    c.setFillColor(HexColor(colors["ink"]))
    c.setFont("DSHeading", 16)
    c.drawString(x + 36, y + h - 28, "张满堂")
    c.setFont("DSBody", 8)
    c.setFillColor(HexColor(colors["mid"]))
    c.drawString(x + 94, y + h - 26, "ZHANG MANTANG")
    menu_x = x + 36
    for idx, item in enumerate(["首页", "作品", "展览", "新闻", "关于"]):
        c.setFont("DSBody", 9)
        c.setFillColor(HexColor(colors["ink"]))
        item_x = menu_x + idx * 44
        c.drawString(item_x, y + 16, item)
        if item == "作品":
            c.setStrokeColor(HexColor(colors["accent"]))
            c.setLineWidth(1.5)
            c.line(item_x, y + 11, item_x + 18, y + 11)
    c.setFillColor(HexColor(colors["bg"]))
    c.roundRect(x + w - 108, y + 10, 68, 18, 9, stroke=0, fill=1)
    c.setFillColor(HexColor(colors["soft"]))
    c.setFont("DSBody", 8)
    c.drawString(x + w - 96, y + 16, "搜索")
    c.setFillColor(HexColor(colors["mid"]))
    c.drawString(x + w - 28, y + 16, "中 / EN")


def draw_filter_component(c: canvas.Canvas, x: float, y: float, w: float, h: float, colors: dict) -> None:
    card(c, x, y, w, h, colors)
    c.setFillColor(HexColor(colors["mid"]))
    c.setFont("DSBodyBold", 9)
    c.drawString(x + 14, y + h - 22, "作品筛选")
    labels = [("项目", False), ("材质", True)]
    for idx, (label, active) in enumerate(labels):
        bx = x + 14 + idx * 84
        by = y + 16
        fill = colors["accent"] if active else colors["card"]
        text = colors["card"] if active else colors["ink"]
        c.setStrokeColor(HexColor(colors["borderSoft"]))
        c.setFillColor(HexColor(fill))
        c.roundRect(bx, by, 70, 24, 12, stroke=1, fill=1)
        c.setFillColor(HexColor(text))
        c.setFont("DSBody", 9)
        c.drawCentredString(bx + 35, by + 8, label)


def draw_search_component(c: canvas.Canvas, x: float, y: float, w: float, h: float, colors: dict) -> None:
    card(c, x, y, w, h, colors)
    c.setFillColor(HexColor(colors["mid"]))
    c.setFont("DSBodyBold", 9)
    c.drawString(x + 14, y + h - 20, "搜索推荐")
    c.setStrokeColor(HexColor(colors["ink"]))
    c.setLineWidth(0.8)
    c.roundRect(x + 14, y + h - 52, w - 28, 24, 12, stroke=1, fill=0)
    c.setFont("DSBody", 8)
    c.setFillColor(HexColor(colors["soft"]))
    c.drawString(x + 26, y + h - 42, "搜索作品、展览、新闻")
    suggestions = ["固定推荐", "标题匹配", "详情页直达"]
    for idx, label in enumerate(suggestions):
        sy = y + h - 80 - idx * 20
        c.setFillColor(HexColor(colors["accent"]))
        c.circle(x + 20, sy + 4, 2.5, stroke=0, fill=1)
        c.setFillColor(HexColor(colors["ink"]))
        c.drawString(x + 30, sy, label)


def draw_work_card(c: canvas.Canvas, x: float, y: float, w: float, h: float, colors: dict) -> None:
    card(c, x, y, w, h, colors)
    c.setFillColor(HexColor("#F7F3EE"))
    c.roundRect(x + 12, y + 56, w - 24, h - 72, 8, stroke=0, fill=1)
    c.setFillColor(HexColor(colors["soft"]))
    c.rect(x + 28, y + 84, w - 56, h - 128, stroke=0, fill=1)
    c.setFillColor(HexColor(colors["card"]))
    c.rect(x + 42, y + 98, w - 84, h - 156, stroke=0, fill=1)
    c.setFillColor(HexColor(colors["mid"]))
    c.setFont("DSBody", 8)
    c.drawString(x + 14, y + 36, "毛体 / 立轴")
    c.setFillColor(HexColor(colors["ink"]))
    c.setFont("DSHeading", 13)
    c.drawString(x + 14, y + 18, "重阳")


def draw_exhibit_card(c: canvas.Canvas, x: float, y: float, w: float, h: float, colors: dict) -> None:
    card(c, x, y, w, h, colors)
    img_w = w * 0.36
    c.setFillColor(HexColor("#F7F3EE"))
    c.roundRect(x + 12, y + 12, img_w, h - 24, 8, stroke=0, fill=1)
    c.setFillColor(HexColor(colors["soft"]))
    c.rect(x + 24, y + 26, img_w - 24, h - 52, stroke=0, fill=1)
    tx = x + img_w + 28
    top = y + h - 26
    c.setFillColor(HexColor(colors["mid"]))
    c.setFont("DSBody", 8)
    c.drawString(tx, top, "2025 / 巴黎")
    c.setFillColor(HexColor(colors["ink"]))
    c.setFont("DSHeading", 13)
    c.drawString(tx, top - 26, "国际文化艺术展")
    c.setFont("DSBody", 9)
    c.drawString(tx, top - 48, "封面图居中显示，文字左对齐跟随。")


def draw_year_rail(c: canvas.Canvas, x: float, y: float, w: float, h: float, colors: dict) -> None:
    card(c, x, y, w, h, colors)
    c.setStrokeColor(HexColor(colors["borderSoft"]))
    c.setLineWidth(1)
    c.line(x + 24, y + 16, x + 24, y + h - 16)
    years = ["2026", "2025", "2024", "2023", "2016"]
    step = (h - 42) / (len(years) - 1)
    for idx, year in enumerate(years):
        cy = y + h - 22 - idx * step
        is_current = year == "2024"
        if is_current:
            c.setFillColor(HexColor("#F8F1E5"))
            c.roundRect(x + 30, cy - 10, w - 44, 20, 10, stroke=0, fill=1)
            c.setFillColor(HexColor(colors["accent"]))
            c.circle(x + 24, cy, 5, stroke=0, fill=1)
        else:
            c.setFillColor(HexColor(colors["card"]))
            c.circle(x + 24, cy, 5, stroke=1, fill=1)
        c.setFillColor(HexColor(colors["ink"] if is_current else colors["mid"]))
        c.setFont("DSBodyBold" if is_current else "DSBody", 8)
        c.drawString(x + 38, cy - 3, year)


def draw_detail_media_component(c: canvas.Canvas, x: float, y: float, w: float, h: float, colors: dict) -> None:
    card(c, x, y, w, h, colors)
    c.setFillColor(HexColor(colors["mid"]))
    c.setFont("DSBodyBold", 9)
    c.drawString(x + 14, y + h - 20, "详情页媒体")
    image_x = x + 44
    image_y = y + 34
    image_w = w - 88
    image_h = h - 78
    c.setFillColor(HexColor("#F7F3EE"))
    c.roundRect(image_x, image_y, image_w, image_h, 8, stroke=0, fill=1)
    c.setFillColor(HexColor(colors["soft"]))
    c.rect(image_x + 18, image_y + 14, image_w - 36, image_h - 28, stroke=0, fill=1)
    for bx in [x + 16, x + w - 30]:
        c.setFillColor(HexColor(colors["card"]))
        c.circle(bx, y + h / 2, 12, stroke=1, fill=1)
    c.setStrokeColor(HexColor(colors["ink"]))
    c.setLineWidth(1.2)
    c.line(x + 20, y + h / 2, x + 14, y + h / 2 + 4)
    c.line(x + 20, y + h / 2, x + 14, y + h / 2 - 4)
    c.line(x + w - 20, y + h / 2, x + w - 14, y + h / 2 + 4)
    c.line(x + w - 20, y + h / 2, x + w - 14, y + h / 2 - 4)
    c.setFillColor(HexColor(colors["mid"]))
    c.setFont("DSBody", 7)
    c.drawString(x + 14, y + 14, "外置按钮 / 缩略图联动 / 首尾禁用")


def draw_detail_info(c: canvas.Canvas, x: float, y: float, w: float, h: float, colors: dict) -> None:
    card(c, x, y, w, h, colors)
    c.setFillColor(HexColor(colors["mid"]))
    c.setFont("DSBodyBold", 9)
    c.drawString(x + 14, y + h - 20, "详情信息区")
    rows = [("时间", "2024"), ("地点", "北京"), ("说明", "图下右侧紧凑排布")]
    row_y = y + h - 42
    for label, value in rows:
        c.setFillColor(HexColor(colors["mid"]))
        c.setFont("DSBody", 8)
        c.drawString(x + 14, row_y, label)
        c.setFillColor(HexColor(colors["ink"]))
        c.drawString(x + 58, row_y, value)
        c.setStrokeColor(HexColor(colors["borderSoft"]))
        c.setLineWidth(0.5)
        c.line(x + 14, row_y - 8, x + w - 14, row_y - 8)
        row_y -= 22


def draw_contact_component(c: canvas.Canvas, x: float, y: float, w: float, h: float, colors: dict, compact: bool = False) -> None:
    card(c, x, y, w, h, colors, fill="#F5F2EE" if not compact else colors["card"])
    c.setFillColor(HexColor(colors["ink"]))
    c.setFont("DSHeading", 13 if compact else 16)
    c.drawString(x + 16, y + h - 26, "Contact")
    c.setFillColor(HexColor(colors["mid"]))
    c.setFont("DSBody", 7)
    c.drawString(x + 16, y + h - 40, "Compact" if compact else "Home")
    rows = [("邮箱", "studio@example.com"), ("城市", "北京"), ("Instagram", "@zhangmantang")]
    row_y = y + h - (38 if compact else 28)
    for label, value in rows:
        c.setFillColor(HexColor(colors["mid"]))
        c.setFont("DSBody", 8)
        c.drawString(x + (96 if compact else 112), row_y, label)
        c.setFillColor(HexColor(colors["ink"]))
        c.drawString(x + (138 if compact else 160), row_y, value)
        row_y -= 18 if compact else 22


def page_one(c: canvas.Canvas, tokens: dict) -> None:
    colors = tokens["color"]
    subtitle = f"Current website visual baseline · Version {tokens['meta']['version']} · {date.today().isoformat()}"
    draw_page_header(c, "Design System Quick Reference", subtitle, colors, 1)
    top_y = 300
    draw_color_swatches(c, MARGIN, top_y, CONTENT_WIDTH * 0.48, 178, tokens)
    draw_typography(c, MARGIN + CONTENT_WIDTH * 0.52, top_y, CONTENT_WIDTH * 0.48, 178, tokens)
    draw_sizes_layout(c, MARGIN, 84, CONTENT_WIDTH, 164, tokens)


def page_two(c: canvas.Canvas, tokens: dict) -> None:
    colors = tokens["color"]
    draw_page_header(c, "Component Quick Reference", "Aligned to current split JavaScript + JSON site", colors, 2)
    section_title(c, MARGIN, PAGE_HEIGHT - 110, "Core Components", colors)

    row1_y = 366
    draw_nav_component(c, MARGIN, row1_y, CONTENT_WIDTH * 0.44, 82, colors)
    draw_search_component(c, MARGIN + CONTENT_WIDTH * 0.47, row1_y, CONTENT_WIDTH * 0.24, 82, colors)
    draw_filter_component(c, MARGIN + CONTENT_WIDTH * 0.74, row1_y, CONTENT_WIDTH * 0.26, 82, colors)

    row2_y = 182
    draw_work_card(c, MARGIN, row2_y, 150, 146, colors)
    draw_exhibit_card(c, MARGIN + 166, row2_y, 280, 146, colors)
    draw_year_rail(c, MARGIN + 462, row2_y, 112, 146, colors)
    draw_detail_media_component(c, MARGIN + 590, row2_y, 180, 146, colors)

    section_title(c, MARGIN, 148, "Contact Variants", colors)
    draw_contact_component(c, MARGIN, 44, CONTENT_WIDTH * 0.44, 86, colors, compact=False)
    draw_contact_component(c, MARGIN + CONTENT_WIDTH * 0.47, 44, CONTENT_WIDTH * 0.31, 86, colors, compact=True)
    draw_detail_info(c, MARGIN + CONTENT_WIDTH * 0.81, 44, CONTENT_WIDTH * 0.19, 86, colors)


def build_pdf() -> Path:
    register_fonts()
    tokens = load_tokens()
    c = canvas.Canvas(str(OUTPUT_PATH), pagesize=landscape(A4))
    c.setTitle("张满堂官网 Design System 速查表")
    c.setAuthor("OpenAI Codex")
    c.setSubject("字体 字号 组件 颜色速查表")
    page_one(c, tokens)
    c.showPage()
    page_two(c, tokens)
    c.save()
    shutil.copyfile(OUTPUT_PATH, OUTPUT_PATH_ASCII)
    return OUTPUT_PATH


if __name__ == "__main__":
    output = build_pdf()
    print(output.as_posix().encode("unicode_escape").decode("ascii"))

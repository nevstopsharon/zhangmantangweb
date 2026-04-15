from __future__ import annotations

import argparse
import html
import json
from datetime import date
from pathlib import Path


VERSION = "20260413b"
SITE_URL = "https://zhangmantangweb.vercel.app"
SITE_MOUNT = ""


def read_json(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def text_of(item: dict, lang: str, zh_key: str, en_key: str) -> str:
    if lang == "en" and item.get(en_key):
        return str(item[en_key])
    return str(item.get(zh_key) or item.get(en_key) or "")


def plain_snippet(value: str, limit: int = 180) -> str:
    return " ".join(str(value or "").split())[:limit].strip()


def page_title(label: str, site_name: str) -> str:
    return f"{label} | {site_name}" if label else site_name


def route_relative_path(route: str, lang: str) -> str:
    prefix = "en/" if lang == "en" else ""
    if route in ("", "home"):
        return prefix
    if route.startswith("search"):
        query = route.split("?", 1)[1] if "?" in route else ""
        return f"{prefix}search/{'?' + query if query else ''}"
    return f"{prefix}{route}/"


def route_href(route: str, lang: str) -> str:
    relative = route_relative_path(route, lang)
    query = ""
    if "?" in relative:
        relative, query = relative.split("?", 1)
        query = f"?{query}"
    mount = SITE_MOUNT.strip("/")
    path = f"/{mount}/{relative}" if mount else f"/{relative}"
    path = path.replace("//", "/")
    return f"{path}{query}"


def route_url(route: str, lang: str) -> str:
    relative = route_relative_path(route, lang)
    return f"{SITE_URL.rstrip('/')}/{relative}"


def page_output_path(site_dir: Path, route: str, lang: str) -> Path:
    relative = route_relative_path(route, lang).split("?", 1)[0].strip("/")
    if not relative:
        return site_dir / "index.html"
    return site_dir / Path(relative) / "index.html"


def page_site_base() -> str:
    return "/"


def absolute_asset_url(path: str) -> str:
    return f"{SITE_URL.rstrip('/')}{path}"


def first_nonempty(*values: str) -> str:
    for value in values:
        if str(value or "").strip():
            return str(value).strip()
    return ""


def detail_labels(lang: str) -> dict[str, str]:
    if lang == "en":
        return {
            "work_detail": "Work Detail",
            "exhibition_detail": "Exhibition Detail",
            "news_detail": "News Detail",
            "material": "Material",
            "size": "Size",
            "year": "Year",
            "project": "Project",
            "location": "Location",
            "date": "Date",
            "content": "Summary",
        }
    return {
        "work_detail": "作品详情",
        "exhibition_detail": "展览详情",
        "news_detail": "新闻详情",
        "material": "材质",
        "size": "尺寸",
        "year": "年份",
        "project": "项目",
        "location": "地点",
        "date": "日期",
        "content": "摘要",
    }


def lead_text_for_work(item: dict, lang: str) -> str:
    description = first_nonempty(
        text_of(item, lang, "description_zh", "description_en"),
        text_of(item, lang, "inspiration_zh", "inspiration_en"),
    )
    if description:
        return description

    title = text_of(item, lang, "title_zh", "title_en")
    material = text_of(item, lang, "material_zh", "material_en")
    project = text_of(item, lang, "project_zh", "project_en")
    year = str(item.get("year") or "").strip()
    location = text_of(item, lang, "location_zh", "location_en")

    if lang == "en":
        parts = [f'"{title}" is a calligraphy work by Zhang Mantang.']
        if material:
            parts.append(f"Material: {material}.")
        if project:
            parts.append(f"Project: {project}.")
        if year:
            parts.append(f"Year: {year}.")
        if location:
            parts.append(f"Location: {location}.")
        return " ".join(parts)

    parts = [f"{title}为张满堂创作的书法作品。"]
    if material:
        parts.append(f"材质为{material}。")
    if project:
        parts.append(f"所属项目为{project}。")
    if year:
        parts.append(f"创作时间为{year}。")
    if location:
        parts.append(f"相关地点为{location}。")
    return "".join(parts)


def lead_text_for_exhibition(item: dict, lang: str) -> str:
    description = text_of(item, lang, "description_zh", "description_en")
    if description:
        return description

    title = text_of(item, lang, "title_zh", "title_en")
    year = str(item.get("year") or "").strip()
    location = text_of(item, lang, "location_zh", "location_en")
    if lang == "en":
        parts = [f'"{title}" is an exhibition record related to Zhang Mantang.']
        if year:
            parts.append(f"It was held in {year}.")
        if location:
            parts.append(f"Location: {location}.")
        return " ".join(parts)
    parts = [f"{title}为张满堂相关展览记录。"]
    if year:
        parts.append(f"展出时间为{year}。")
    if location:
        parts.append(f"地点为{location}。")
    return "".join(parts)


def lead_text_for_news(item: dict, lang: str) -> str:
    content = text_of(item, lang, "content_zh", "content_en")
    if content:
        return content

    title = text_of(item, lang, "title_zh", "title_en")
    published = str(item.get("date") or "").strip()
    if lang == "en":
        return f'"{title}" is a news record related to Zhang Mantang{f" from {published}" if published else ""}.'
    return f"{title}为张满堂相关资讯记录{f'，时间为{published}' if published else ''}。"


def spec_rows_markup(rows: list[tuple[str, str]]) -> str:
    rendered = []
    for label, value in rows:
        cleaned = " ".join(str(value or "").split()).strip()
        if not cleaned:
            continue
        rendered.append(
            f'            <div class="detail-spec-row"><div class="detail-label body">{html.escape(label)}</div><div class="body">{html.escape(cleaned)}</div></div>'
        )
    return "\n".join(rendered)


def static_detail_shell(route: str, lang: str, works: list[dict], exhibitions: list[dict], news: list[dict]) -> tuple[str, str]:
    labels = detail_labels(lang)
    loading_text = "正在加载网站内容…" if lang == "zh" else "Loading site content…"

    if route.startswith("works/"):
        item_id = route.split("/", 1)[1]
        item = next((entry for entry in works if entry["id"] == item_id), None)
        if not item:
            return ("app-loading", loading_text)
        title = text_of(item, lang, "title_zh", "title_en")
        lead = lead_text_for_work(item, lang)
        rows = spec_rows_markup([
            (labels["material"], text_of(item, lang, "material_zh", "material_en")),
            (labels["size"], text_of(item, lang, "size_zh", "size_en")),
            (labels["year"], str(item.get("year") or "")),
            (labels["project"], text_of(item, lang, "project_zh", "project_en")),
            (labels["location"], text_of(item, lang, "location_zh", "location_en")),
        ])
        return (
            "site static-route-shell",
            f"""<main id="main-content" class="page" tabindex="-1">
    <section class="detail-page works-shell" data-static-shell="work-detail">
      <div class="detail-subnav detail-subnav-simple">
        <div>
          <div class="section-kicker body">{html.escape(labels["work_detail"])}</div>
          <h1 class="h2">{html.escape(title)}</h1>
        </div>
      </div>
      <div class="detail-meta-grid">
        <div>
          <div class="detail-copy body"><p>{html.escape(lead)}</p></div>
        </div>
        <div class="detail-specs">
{rows}
        </div>
      </div>
    </section>
  </main>""",
        )

    if route.startswith("exhibitions/"):
        item_id = route.split("/", 1)[1]
        item = next((entry for entry in exhibitions if entry["id"] == item_id), None)
        if not item:
            return ("app-loading", loading_text)
        title = text_of(item, lang, "title_zh", "title_en")
        lead = lead_text_for_exhibition(item, lang)
        rows = spec_rows_markup([
            (labels["location"], text_of(item, lang, "location_zh", "location_en")),
            (labels["date"], str(item.get("year") or "")),
            (labels["content"], lead),
        ])
        return (
            "site static-route-shell",
            f"""<main id="main-content" class="page" tabindex="-1">
    <section class="detail-page" data-static-shell="exhibition-detail">
      <div class="detail-content-shell">
        <div></div>
        <div class="detail-content-main">
          <div class="tag">{html.escape(labels["exhibition_detail"])}</div>
          <h1 class="h2" style="max-width:980px;margin-top:12px;">{html.escape(title)}</h1>
          <div class="detail-specs detail-specs-compact exhibition-detail-specs">
{rows}
          </div>
        </div>
      </div>
    </section>
  </main>""",
        )

    if route.startswith("news/"):
        item_id = route.split("/", 1)[1]
        item = next((entry for entry in news if entry["id"] == item_id), None)
        if not item:
            return ("app-loading", loading_text)
        title = text_of(item, lang, "title_zh", "title_en")
        lead = lead_text_for_news(item, lang)
        rows = spec_rows_markup([
            (labels["date"], str(item.get("date") or "")),
            (labels["content"], lead),
        ])
        return (
            "site static-route-shell",
            f"""<main id="main-content" class="page" tabindex="-1">
    <section class="detail-page" data-static-shell="news-detail">
      <div class="detail-content-shell">
        <div></div>
        <div class="detail-content-main">
          <div class="tag">{html.escape(labels["news_detail"])}</div>
          <h1 class="h2" style="max-width:980px;margin-top:12px;">{html.escape(title)}</h1>
          <div class="detail-meta-grid" style="margin-top:24px;">
            <div>
              <div class="detail-copy body"><p>{html.escape(lead)}</p></div>
            </div>
            <div class="detail-specs detail-specs-compact exhibition-detail-specs">
{rows}
            </div>
          </div>
        </div>
      </div>
    </section>
  </main>""",
        )

    return ("app-loading", loading_text)


def schema_base(lang: str, canonical: str) -> dict:
    return {
        "@context": "https://schema.org",
        "inLanguage": "en" if lang == "en" else "zh-CN",
        "url": canonical,
    }


def metadata_for_route(route: str, lang: str, profile: dict, works: list[dict], exhibitions: list[dict], news: list[dict]) -> dict:
    site_name = profile["hero"]["title_en"] if lang == "en" else profile["hero"]["title_zh"]
    default_description = profile["hero"]["subtitle_en"] if lang == "en" else profile["hero"]["subtitle_zh"]
    default_image = absolute_asset_url(profile["hero"]["background_image"])
    canonical = route_url(route, lang)
    alternate_zh = route_url(route, "zh")
    alternate_en = route_url(route, "en")
    base_schema = schema_base(lang, canonical)

    result = {
        "title": site_name,
        "description": default_description,
        "image": default_image,
        "canonical": canonical,
        "alternate_zh": alternate_zh,
        "alternate_en": alternate_en,
        "schema": {
            **base_schema,
            "@type": "WebSite",
            "name": site_name,
            "description": default_description,
            "image": default_image,
        },
    }

    if route == "works":
        label = "Works" if lang == "en" else "作品"
        result["title"] = page_title(label, site_name)
        result["schema"] = {**base_schema, "@type": "CollectionPage", "name": result["title"], "description": default_description}
        return result

    if route == "exhibitions":
        label = "Exhibitions" if lang == "en" else "展览"
        result["title"] = page_title(label, site_name)
        result["description"] = (
            "Browse exhibitions, venues, and dates from Zhang Mantang's practice."
            if lang == "en"
            else "浏览张满堂的展览、场馆与时间信息。"
        )
        result["schema"] = {**base_schema, "@type": "CollectionPage", "name": result["title"], "description": result["description"]}
        return result

    if route == "news":
        label = "News" if lang == "en" else "新闻"
        result["title"] = page_title(label, site_name)
        result["description"] = (
            "Browse interviews, reports, and media coverage related to Zhang Mantang."
            if lang == "en"
            else "浏览与张满堂相关的专访、报道与媒体动态。"
        )
        result["schema"] = {**base_schema, "@type": "CollectionPage", "name": result["title"], "description": result["description"]}
        return result

    if route == "about":
        label = profile["about"]["headline_en"] if lang == "en" else profile["about"]["headline_zh"]
        result["title"] = page_title(label, site_name)
        result["description"] = plain_snippet(profile["about"]["bio_en"] if lang == "en" else profile["about"]["bio_zh"], 180) or default_description
        result["schema"] = {
            **base_schema,
            "@type": "AboutPage",
            "name": result["title"],
            "description": result["description"],
            "mainEntity": {
                "@type": "Person",
                "name": profile["artist_name_en"],
                "alternateName": profile["artist_name_zh"],
                "email": profile["contact"]["email"],
                "image": [absolute_asset_url(path) for path in profile["about"]["portrait_images"]],
            },
        }
        return result

    if route.startswith("search"):
        query = route.split("?", 1)[1].replace("q=", "", 1) if "?" in route else ""
        query = query.replace("+", " ")
        result["title"] = page_title("Search Results" if lang == "en" else "搜索结果", site_name)
        result["description"] = (
            f"Search results for {query} on the official Zhang Mantang website." if lang == "en" and query else
            f"张满堂官方网站中与“{query}”相关的检索结果。" if query else
            default_description
        )
        result["schema"] = {**base_schema, "@type": "SearchResultsPage", "name": result["title"], "description": result["description"]}
        return result

    if route.startswith("works/"):
        item_id = route.split("/", 1)[1]
        item = next((entry for entry in works if entry["id"] == item_id), None)
        if item:
            title = text_of(item, lang, "title_zh", "title_en")
            result["title"] = page_title(title, site_name)
            result["description"] = plain_snippet(text_of(item, lang, "description_zh", "description_en"), 180) or default_description
            result["image"] = absolute_asset_url(item.get("cover_image") or profile["hero"]["background_image"])
            result["schema"] = {
                **base_schema,
                "@type": "VisualArtwork",
                "name": title,
                "description": result["description"],
                "image": [absolute_asset_url(path) for path in [item.get("cover_image"), *(item.get("gallery_images") or [])] if path],
                "artMedium": text_of(item, lang, "material_zh", "material_en"),
                "dateCreated": item.get("year", ""),
                "creator": {"@type": "Person", "name": profile["artist_name_en"], "alternateName": profile["artist_name_zh"]},
            }
        return result

    if route.startswith("exhibitions/"):
        item_id = route.split("/", 1)[1]
        item = next((entry for entry in exhibitions if entry["id"] == item_id), None)
        if item:
            title = text_of(item, lang, "title_zh", "title_en")
            result["title"] = page_title(title, site_name)
            result["description"] = plain_snippet(text_of(item, lang, "description_zh", "description_en"), 180) or default_description
            result["image"] = absolute_asset_url(item.get("cover_image") or profile["hero"]["background_image"])
            result["schema"] = {
                **base_schema,
                "@type": "Event",
                "name": title,
                "description": result["description"],
                "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
                "startDate": str(item.get("year") or ""),
                "location": text_of(item, lang, "location_zh", "location_en"),
                "image": [absolute_asset_url(path) for path in [item.get("cover_image"), *(item.get("gallery_images") or [])] if path],
            }
        return result

    if route.startswith("news/"):
        item_id = route.split("/", 1)[1]
        item = next((entry for entry in news if entry["id"] == item_id), None)
        if item:
            title = text_of(item, lang, "title_zh", "title_en")
            result["title"] = page_title(title, site_name)
            result["description"] = plain_snippet(text_of(item, lang, "content_zh", "content_en"), 180) or default_description
            result["image"] = absolute_asset_url(item.get("cover_image") or profile["hero"]["background_image"])
            result["schema"] = {
                **base_schema,
                "@type": "NewsArticle",
                "headline": title,
                "description": result["description"],
                "datePublished": str(item.get("date") or ""),
                "image": [absolute_asset_url(path) for path in [item.get("cover_image"), *(item.get("gallery_images") or [])] if path],
                "author": {"@type": "Person", "name": profile["artist_name_en"], "alternateName": profile["artist_name_zh"]},
            }
        return result

    return result


def html_shell(route: str, lang: str, metadata: dict) -> str:
    site_base = page_site_base()
    loading_text = "正在加载网站内容…" if lang == "zh" else "Loading site content…"
    noscript_text = "请开启 JavaScript 以浏览本网站。" if lang == "zh" else "Please enable JavaScript to browse this website."
    search_robots = '  <meta name="robots" content="noindex,follow">\n' if route.startswith("search") else '  <meta name="robots" content="index,follow">\n'

    def href(value: str) -> str:
        return html.escape(value, quote=True)

    site_asset_prefix = "" if site_base == "/" else site_base.rstrip("/")
    schema_json = json.dumps(metadata["schema"], ensure_ascii=False).replace("</", "<\\/")
    return f"""<!DOCTYPE html>
<html lang="{ 'en' if lang == 'en' else 'zh-CN' }" data-site-base="{href(site_base)}" data-site-url="{href(SITE_URL)}" data-site-mount="{SITE_MOUNT}" data-route="{href(route)}" data-route-lang="{lang}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{html.escape(metadata['title'])}</title>
  <meta name="description" content="{html.escape(metadata['description'], quote=True)}">
{search_robots}  <meta property="og:type" content="website">
  <meta property="og:title" content="{html.escape(metadata['title'], quote=True)}">
  <meta property="og:description" content="{html.escape(metadata['description'], quote=True)}">
  <meta property="og:url" content="{href(metadata['canonical'])}">
  <meta property="og:image" content="{href(metadata['image'])}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="{html.escape(metadata['title'], quote=True)}">
  <meta name="twitter:description" content="{html.escape(metadata['description'], quote=True)}">
  <meta name="twitter:image" content="{href(metadata['image'])}">
  <link rel="canonical" href="{href(metadata['canonical'])}">
  <link rel="alternate" hreflang="zh-CN" href="{href(metadata['alternate_zh'])}">
  <link rel="alternate" hreflang="en" href="{href(metadata['alternate_en'])}">
  <link rel="alternate" hreflang="x-default" href="{href(metadata['alternate_zh'])}">
  <link rel="preload" href="{site_asset_prefix}/assets/fonts/web/noto-sans-sc-light.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="{site_asset_prefix}/assets/fonts/web/noto-serif-sc-light.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="stylesheet" href="{site_asset_prefix}/assets/fonts/web/fonts.css?v={VERSION}">
  <link rel="stylesheet" href="{site_asset_prefix}/css/style.css?v={VERSION}">
  <script id="structured-data" type="application/ld+json">{schema_json}</script>
</head>
<body>
  <a class="skip-link" href="#main-content">{'跳过导航，直达正文' if lang == 'zh' else 'Skip navigation and jump to content'}</a>
  <div id="app" class="app-loading">{loading_text}</div>
  <noscript>{noscript_text}</noscript>
  <script src="{site_asset_prefix}/js/state.js?v={VERSION}" defer></script>
  <script src="{site_asset_prefix}/js/components.js?v={VERSION}" defer></script>
  <script src="{site_asset_prefix}/js/router.js?v={VERSION}" defer></script>
  <script src="{site_asset_prefix}/js/renderers.js?v={VERSION}" defer></script>
  <script src="{site_asset_prefix}/js/data-loader.js?v={VERSION}" defer></script>
  <script src="{site_asset_prefix}/js/main.js?v={VERSION}" defer></script>
</body>
</html>
"""


def html_shell_v2(route: str, lang: str, metadata: dict, works: list[dict], exhibitions: list[dict], news: list[dict]) -> str:
    site_base = page_site_base()
    noscript_text = "请开启 JavaScript 以浏览本网站。" if lang == "zh" else "Please enable JavaScript to browse this website."
    search_robots = '  <meta name="robots" content="noindex,follow">\n' if route.startswith("search") else '  <meta name="robots" content="index,follow">\n'

    def href(value: str) -> str:
        return html.escape(value, quote=True)

    site_asset_prefix = "" if site_base == "/" else site_base.rstrip("/")
    schema_json = json.dumps(metadata["schema"], ensure_ascii=False).replace("</", "<\\/")
    app_class, app_markup = static_detail_shell(route, lang, works, exhibitions, news)
    return f"""<!DOCTYPE html>
<html lang="{ 'en' if lang == 'en' else 'zh-CN' }" data-site-base="{href(site_base)}" data-site-url="{href(SITE_URL)}" data-site-mount="{SITE_MOUNT}" data-route="{href(route)}" data-route-lang="{lang}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{html.escape(metadata['title'])}</title>
  <meta name="description" content="{html.escape(metadata['description'], quote=True)}">
{search_robots}  <meta property="og:type" content="website">
  <meta property="og:title" content="{html.escape(metadata['title'], quote=True)}">
  <meta property="og:description" content="{html.escape(metadata['description'], quote=True)}">
  <meta property="og:url" content="{href(metadata['canonical'])}">
  <meta property="og:image" content="{href(metadata['image'])}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="{html.escape(metadata['title'], quote=True)}">
  <meta name="twitter:description" content="{html.escape(metadata['description'], quote=True)}">
  <meta name="twitter:image" content="{href(metadata['image'])}">
  <link rel="canonical" href="{href(metadata['canonical'])}">
  <link rel="alternate" hreflang="zh-CN" href="{href(metadata['alternate_zh'])}">
  <link rel="alternate" hreflang="en" href="{href(metadata['alternate_en'])}">
  <link rel="alternate" hreflang="x-default" href="{href(metadata['alternate_zh'])}">
  <link rel="preload" href="{site_asset_prefix}/assets/fonts/web/noto-sans-sc-light.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="{site_asset_prefix}/assets/fonts/web/noto-serif-sc-light.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="stylesheet" href="{site_asset_prefix}/assets/fonts/web/fonts.css?v={VERSION}">
  <link rel="stylesheet" href="{site_asset_prefix}/css/style.css?v={VERSION}">
  <script id="structured-data" type="application/ld+json">{schema_json}</script>
</head>
<body>
  <a class="skip-link" href="#main-content">{'跳过导航，直达正文' if lang == 'zh' else 'Skip navigation and jump to content'}</a>
  <div id="app" class="{app_class}">{app_markup}</div>
  <noscript>{noscript_text}</noscript>
  <script src="{site_asset_prefix}/js/state.js?v={VERSION}" defer></script>
  <script src="{site_asset_prefix}/js/components.js?v={VERSION}" defer></script>
  <script src="{site_asset_prefix}/js/router.js?v={VERSION}" defer></script>
  <script src="{site_asset_prefix}/js/renderers.js?v={VERSION}" defer></script>
  <script src="{site_asset_prefix}/js/data-loader.js?v={VERSION}" defer></script>
  <script src="{site_asset_prefix}/js/main.js?v={VERSION}" defer></script>
</body>
</html>
"""


def write_page(site_dir: Path, route: str, lang: str, metadata: dict, works: list[dict], exhibitions: list[dict], news: list[dict]) -> None:
    output_path = page_output_path(site_dir, route, lang)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(html_shell_v2(route, lang, metadata, works, exhibitions, news), encoding="utf-8")


def write_robots(site_dir: Path) -> None:
    (site_dir / "robots.txt").write_text(
        f"User-agent: *\nAllow: /\n\nSitemap: {SITE_URL.rstrip('/')}/sitemap.xml\n",
        encoding="utf-8",
    )


def write_sitemap(site_dir: Path, routes: list[str]) -> None:
    lastmod = date.today().isoformat()
    lines = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
    for lang in ("zh", "en"):
        for route in routes:
            if route.startswith("search"):
                continue
            lines.append(f"  <url><loc>{html.escape(route_url(route, lang))}</loc><lastmod>{lastmod}</lastmod></url>")
    lines.append("</urlset>")
    (site_dir / "sitemap.xml").write_text("\n".join(lines) + "\n", encoding="utf-8")


def collect_routes(works: list[dict], exhibitions: list[dict], news: list[dict]) -> list[str]:
    routes = ["home", "works", "exhibitions", "news", "about", "search"]
    routes.extend(f"works/{item['id']}" for item in works)
    routes.extend(f"exhibitions/{item['id']}" for item in exhibitions)
    routes.extend(f"news/{item['id']}" for item in news)
    return routes


def main() -> None:
    parser = argparse.ArgumentParser(description="Generate static route shells and sitemap for the Zhang Mantang site.")
    parser.add_argument("--repo-root", type=Path, required=True)
    args = parser.parse_args()

    repo_root = args.repo_root.resolve()
    site_dir = repo_root / "site"
    data_dir = repo_root / "data"

    profile = read_json(data_dir / "profile.json")
    works = read_json(data_dir / "works.json")
    exhibitions = read_json(data_dir / "exhibitions.json")
    news = read_json(data_dir / "news.json")
    routes = collect_routes(works, exhibitions, news)

    for lang in ("zh", "en"):
        for route in routes:
            metadata = metadata_for_route(route, lang, profile, works, exhibitions, news)
            write_page(site_dir, route, lang, metadata, works, exhibitions, news)

    write_robots(site_dir)
    write_sitemap(site_dir, routes)
    print(f"Generated {len(routes) * 2} static route shells in {site_dir}")


if __name__ == "__main__":
    main()

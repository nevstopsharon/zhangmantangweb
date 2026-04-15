from __future__ import annotations

import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


class RouteShellAndAccessibilityTests(unittest.TestCase):
    def test_router_uses_history_api_navigation(self) -> None:
        router_js = (ROOT / "site" / "js" / "router.js").read_text(encoding="utf-8")
        self.assertIn("history.pushState", router_js)
        self.assertNotIn("window.location.hash = route", router_js)

    def test_sitemap_uses_real_paths_for_both_languages(self) -> None:
        sitemap_xml = (ROOT / "site" / "sitemap.xml").read_text(encoding="utf-8")
        self.assertIn("https://zhangmantangweb.vercel.app/works/work-001/", sitemap_xml)
        self.assertIn("https://zhangmantangweb.vercel.app/en/works/work-001/", sitemap_xml)
        self.assertNotIn("#works/", sitemap_xml)
        self.assertNotIn("#exhibitions/", sitemap_xml)
        self.assertNotIn("#news/", sitemap_xml)

    def test_representative_route_shells_exist(self) -> None:
        expected = [
            ROOT / "site" / "index.html",
            ROOT / "site" / "works" / "index.html",
            ROOT / "site" / "works" / "work-001" / "index.html",
            ROOT / "site" / "news" / "news-001" / "index.html",
            ROOT / "site" / "en" / "index.html",
            ROOT / "site" / "en" / "works" / "work-001" / "index.html",
            ROOT / "site" / "en" / "news" / "news-001" / "index.html",
        ]
        for page in expected:
            self.assertTrue(page.exists(), f"Missing static route shell: {page}")

    def test_route_shells_include_page_specific_route_context(self) -> None:
        work_shell = (ROOT / "site" / "works" / "work-001" / "index.html").read_text(encoding="utf-8")
        en_shell = (ROOT / "site" / "en" / "works" / "work-001" / "index.html").read_text(encoding="utf-8")
        self.assertIn('data-route="works/work-001"', work_shell)
        self.assertIn('data-route-lang="zh"', work_shell)
        self.assertIn('data-route="works/work-001"', en_shell)
        self.assertIn('data-route-lang="en"', en_shell)

    def test_route_shells_use_root_relative_assets_instead_of_site_prefixed_assets(self) -> None:
        samples = [
            ROOT / "site" / "index.html",
            ROOT / "site" / "about" / "index.html",
            ROOT / "site" / "works" / "work-001" / "index.html",
            ROOT / "site" / "en" / "about" / "index.html",
            ROOT / "site" / "en" / "works" / "work-001" / "index.html",
        ]
        for page in samples:
            shell = page.read_text(encoding="utf-8")
            self.assertNotIn("/site/js/", shell)
            self.assertNotIn("/site/css/", shell)
            self.assertNotIn("/site/assets/", shell)
            self.assertIn('src="/js/state.js', shell)
            self.assertIn('href="/css/style.css', shell)

    def test_detail_route_shells_include_static_indexable_content(self) -> None:
        work_shell = (ROOT / "site" / "works" / "work-001" / "index.html").read_text(encoding="utf-8")
        exhibition_shell = (ROOT / "site" / "exhibitions" / "exhibition-001" / "index.html").read_text(encoding="utf-8")
        news_shell = (ROOT / "site" / "news" / "news-001" / "index.html").read_text(encoding="utf-8")

        self.assertIn('id="main-content"', work_shell)
        self.assertIn('data-static-shell="work-detail"', work_shell)
        self.assertIn("<h1", work_shell)
        self.assertIn("紫砂", work_shell)

        self.assertIn('data-static-shell="exhibition-detail"', exhibition_shell)
        self.assertIn("<h1", exhibition_shell)
        self.assertIn("2007", exhibition_shell)
        self.assertIn("北京", exhibition_shell)

        self.assertIn('data-static-shell="news-detail"', news_shell)
        self.assertIn("<h1", news_shell)
        self.assertIn("2009", news_shell)
        self.assertIn("东京", news_shell)

    def test_search_suggestions_support_keyboard_navigation(self) -> None:
        main_js = (ROOT / "site" / "js" / "main.js").read_text(encoding="utf-8")
        renderers_js = (ROOT / "site" / "js" / "renderers.js").read_text(encoding="utf-8")
        self.assertIn("keydown", main_js)
        for marker in ("ArrowDown", "ArrowUp", "Escape", "Enter", "aria-activedescendant"):
            self.assertIn(marker, main_js + renderers_js)

    def test_secondary_renderer_bundle_uses_site_root_path(self) -> None:
        renderers_js = (ROOT / "site" / "js" / "renderers.js").read_text(encoding="utf-8")
        self.assertIn("site.siteBase", renderers_js)
        self.assertIn('/js/renderers-secondary.js', renderers_js)
        self.assertNotIn('script.src = "./js/renderers-secondary.js', renderers_js)

    def test_font_css_references_only_light_weights(self) -> None:
        fonts_css = (ROOT / "site" / "assets" / "fonts" / "web" / "fonts.css").read_text(encoding="utf-8")
        self.assertIn("noto-sans-sc-light", fonts_css)
        self.assertIn("noto-serif-sc-light", fonts_css)
        self.assertNotIn("noto-sans-sc-regular", fonts_css)
        self.assertNotIn("noto-serif-sc-regular", fonts_css)


if __name__ == "__main__":
    unittest.main()

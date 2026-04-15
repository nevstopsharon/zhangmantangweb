from __future__ import annotations

import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


class FrontendAuditQuickWinsTests(unittest.TestCase):
    def test_filter_close_listener_is_not_one_shot(self) -> None:
        main_js = (ROOT / "site" / "js" / "main.js").read_text(encoding="utf-8")
        self.assertNotIn("{ once: true }", main_js)

    def test_site_includes_basic_seo_files(self) -> None:
        robots = ROOT / "site" / "robots.txt"
        sitemap = ROOT / "site" / "sitemap.xml"
        self.assertTrue(robots.exists(), "robots.txt should exist")
        self.assertTrue(sitemap.exists(), "sitemap.xml should exist")

    def test_secondary_renderer_bundle_is_lazy_loaded(self) -> None:
        index_html = (ROOT / "site" / "index.html").read_text(encoding="utf-8")
        renderers_js = (ROOT / "site" / "js" / "renderers.js").read_text(encoding="utf-8")
        self.assertNotIn("renderers-secondary.js", index_html)
        self.assertIn("renderers-secondary.js", renderers_js)

    def test_index_has_share_and_preload_meta(self) -> None:
        index_html = (ROOT / "site" / "index.html").read_text(encoding="utf-8")
        for marker in (
            'property="og:title"',
            'property="og:description"',
            'property="og:image"',
            'property="og:type"',
            'name="twitter:card"',
            'rel="preload"',
        ):
            self.assertIn(marker, index_html)

    def test_accessibility_shell_markers_exist(self) -> None:
        index_html = (ROOT / "site" / "index.html").read_text(encoding="utf-8")
        renderers_js = (ROOT / "site" / "js" / "renderers.js").read_text(encoding="utf-8")
        components_js = (ROOT / "site" / "js" / "components.js").read_text(encoding="utf-8")
        style_css = (ROOT / "site" / "css" / "style.css").read_text(encoding="utf-8")
        self.assertIn('href="#main-content"', index_html)
        self.assertIn('id="main-content"', renderers_js)
        self.assertIn('role="listbox"', renderers_js)
        self.assertIn('role="option"', renderers_js)
        self.assertIn('aria-label="${escapeHtml(currentUI().detail.previousImage)}"', components_js)
        self.assertIn('aria-label="${escapeHtml(currentUI().detail.nextImage)}"', components_js)
        self.assertIn("@media (prefers-reduced-motion: reduce)", style_css)

    def test_search_input_uses_real_label_and_safe_error_copy(self) -> None:
        renderers_js = (ROOT / "site" / "js" / "renderers.js").read_text(encoding="utf-8")
        state_js = (ROOT / "site" / "js" / "state.js").read_text(encoding="utf-8")
        self.assertIn("<label", renderers_js)
        self.assertNotIn("py -m http.server 8000", state_js)


if __name__ == "__main__":
    unittest.main()

from __future__ import annotations

import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


def section_between(text: str, start: str, end: str) -> str:
    start_index = text.index(start)
    end_index = text.index(end, start_index)
    return text[start_index:end_index]


class UIConvergenceTests(unittest.TestCase):
    def test_work_detail_markup_no_longer_contains_filters(self) -> None:
        source = (ROOT / "site" / "js" / "renderers-secondary.js").read_text(encoding="utf-8")
        section = section_between(source, "function workDetailMarkup(item) {", "function exhibitionDetailMarkup(item) {")
        self.assertNotIn('data-reset-filters="works"', section)
        self.assertNotIn("dropdownMarkup(", section)
        self.assertNotIn('class="filters"', section)

    def test_contact_markup_supports_compact_variant(self) -> None:
        source = (ROOT / "site" / "js" / "renderers-secondary.js").read_text(encoding="utf-8")
        self.assertIn("contactMarkup(route)", source)
        self.assertIn("contact-section is-compact", source)

    def test_render_uses_route_aware_contact_markup(self) -> None:
        source = (ROOT / "site" / "js" / "renderers.js").read_text(encoding="utf-8")
        self.assertIn("${contactMarkup(route)}", source)

    def test_site_shell_no_longer_uses_side_borders(self) -> None:
        source = (ROOT / "site" / "css" / "style.css").read_text(encoding="utf-8")
        site_section = section_between(source, ".site {", ".nav {")
        self.assertNotIn("border-left", site_section)
        self.assertNotIn("border-right", site_section)

    def test_year_rail_and_compact_contact_have_dedicated_styles(self) -> None:
        source = (ROOT / "site" / "css" / "style.css").read_text(encoding="utf-8")
        self.assertIn(".year-node.current", source)
        self.assertIn(".year-node:hover", source)
        self.assertIn(".contact-section.is-compact", source)


if __name__ == "__main__":
    unittest.main()

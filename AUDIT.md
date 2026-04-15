# Website Audit Report — zhangmantang-website
Date: 2026-04-11

**Stack:** Vanilla HTML/CSS/JS (no framework), Python build tools, static SPA with hash routing, JSON data files

---

## Critical Issues

### Bug
- **Filter dropdown close bug** — `{ once: true }` on the click listener in `main.js` means "click outside to close" only works once per page load. Remove that option.

### SEO
- No `robots.txt` or `sitemap.xml`
- No Open Graph / Twitter Card meta tags — links shared on WeChat/Twitter show bare URLs
- No structured data (JSON-LD Schema.org for artist, artworks, exhibitions)
- No canonical URL tag — hash routes (`/#/works/042`) can confuse crawlers
- No hreflang tags for Chinese/English versions
- Meta description is the same for every page — need dynamic per-page descriptions

### Performance
- **368KB of fonts load without preload hints** — add `<link rel="preload">` for the top 2 fonts
- No font subsetting — Noto Serif SC at 96KB could be much smaller if subsetted to characters actually used
- Hero image (`background-image`) bypasses lazy loading

### Accessibility
- No `<header>`, `<main>`, `<footer>` semantic landmarks (all divs)
- No skip-to-content link for keyboard users
- Focus not reset on route changes (screen readers lose position)
- Search input has no `<label>` element
- `year-node` buttons have no descriptive aria-labels
- No `@media (prefers-reduced-motion)` for CSS transitions
- Search suggestions panel missing `role="listbox"` / ARIA combobox pattern

---

## Quick Wins (1–2 hours)

| # | Fix |
|---|-----|
| 1 | Add `site/robots.txt` + `site/sitemap.xml` |
| 2 | Remove `{ once: true }` from filter close listener (`main.js`) |
| 3 | Add Open Graph tags in `index.html` |
| 4 | Add `<link rel="preload">` for 2 primary fonts |
| 5 | Add `aria-label="Filter by year 2025"` to year-node buttons |
| 6 | Add `...` truncation to search snippets |
| 7 | Fix production error message — it tells users to run `py -m http.server 8000` |

---

## Medium Effort (1–2 days)

- **Code splitting** — `renderers.js` (28KB) loads fully even on home page; split by route
- **Service worker** — cache JSON data so network failure doesn't show blank page
- **Per-page meta tags** — update `<title>` + `<meta description>` on each route render
- **Form validation** — contact form accepts empty/invalid email
- **Null checks** — several places in `renderers.js` assume `store.siteData` is loaded

---

## Strategic (1–2 weeks)

- **Switch from hash routing (`/#/`) to History API** — better SEO, cleaner URLs, requires server-side fallback to `index.html`
- **Add Google Analytics / Web Vitals tracking** — no visibility into real user performance
- **TypeScript or JSDoc** — global `window.ZMTSite` object with no types makes refactoring risky
- **GitHub Actions CI/CD** — automate build + deploy instead of manual scripts
- **SSR / pre-rendering** — for proper SEO on detail pages (artworks, exhibitions)

---

## Estimated Scores

| Area | Score |
|------|-------|
| SEO | ~50/100 |
| Accessibility | ~60/100 |
| Performance | ~70/100 |
| Code Quality | ~65/100 |

---

## Full Findings (Detailed)

### Code Quality

1. **Missing Canonical URL Tag** — No `<link rel="canonical">` in `index.html`. Duplicate content across hash routes not properly indicated to crawlers.
2. **Hardcoded Search Suggestions** — `state.js` lines 18–22 only suggest 3 hardcoded IDs (`work-042`, `work-041`, `news-009`). Will break if items are removed.
3. **Global State Pollution** — All state stored in `window.ZMTSite`. Multiple global objects (`state`, `store`, `ui`, `WORK_FILTERS`) risk namespace conflicts.
4. **Weak Error Handling** — Only 1 try-catch block in `main.js`. No retry logic for data loading failures. Generic error doesn't help users.
5. **Invalid ID Not Caught in Router** — Hash routes don't validate that an ID exists before rendering, so invalid IDs show empty detail pages instead of 404.
6. **Inline Styles in Renderers** — Multiple `style="margin-bottom:24px;"` type strings in `renderers.js`. Hard to maintain, violates separation of concerns.
7. **Manual Cache Busting** — `?v=20260408h` is error-prone. Use a git hash or build timestamp instead.

### Performance

1. **No Preload for Fonts** — Current flow: HTML → CSS → @font-face → network. Add `<link rel="preload" as="font">` for top 2 fonts.
2. **Full Re-render on Route Change** — `appRoot.innerHTML` is replaced entirely on every navigation. No diffing, causes DOM churn.
3. **No Service Worker** — Network failure = blank error page. Cache JSON data and assets for resilience.
4. **Search Not Debounced** — `searchSuggestions()` called on every keystroke; will cause jank on large datasets.
5. **No Minification** — CSS (1.1KB) and JS (~60KB) served unminified.

### SEO

1. **Hash-Based Routing** — `/#/works/042` format. Older crawlers ignore hash fragments. Consider History API.
2. **No JSON-LD Structured Data** — Missing Schema.org markup for Person (artist), CreativeWork (artworks), ExhibitEvent (exhibitions).
3. **Thin Content on Detail Pages** — Work entries show only title, year, material, size, location — not enough for search ranking.
4. **No Breadcrumb Schema** — Deep pages lack breadcrumb markup for SERP enhancement.

### Accessibility

1. **Search Button Icon** — Uses Unicode "⌕" with aria-label; visually unclear. Prefer icon + text.
2. **No Skip Link** — Keyboard users must tab through all nav items. Add `<a href="#main" class="skip-link">Skip to content</a>`.
3. **Focus Trap Risk** — Media navigation (prev/next) may trap keyboard focus; test with Tab key.
4. **No `focus-visible` Styling** — Focus rings may not be visible; add explicit `:focus-visible` styles.
5. **Reduced Motion** — CSS transitions don't respect `prefers-reduced-motion: reduce`.

### Security / Best Practices

1. **No Security Headers** — Missing `Content-Security-Policy`, `X-Frame-Options`, `X-Content-Type-Options`. Configure on hosting provider.
2. **No Analytics or Error Monitoring** — No Google Analytics, no Sentry/Rollbar. Can't monitor user behavior or production errors.
3. **No Tests** — `/tests` folder exists but appears empty. No unit, integration, or E2E tests.
4. **Production Error Shows Dev Command** — Error message tells users to run `py -m http.server 8000`. Replace with a user-friendly message.
5. **`.gitignore` Incomplete** — Missing `dist/`, `*.log`, `.DS_Store`, IDE config files.

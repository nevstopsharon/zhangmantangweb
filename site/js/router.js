(function () {
  const site = window.ZMTSite;
  const rootNode = document.documentElement;

  function siteMount() {
    const raw = String(rootNode.dataset.siteMount || "site").trim().replace(/^\/+|\/+$/g, "");
    return raw ? `/${raw}` : "";
  }

  function normalizeRoute(route) {
    const value = String(route || "home").replace(/^#\/?/, "").trim();
    return value || "home";
  }

  function setRouteContext(route, lang) {
    rootNode.dataset.route = normalizeRoute(route);
    rootNode.dataset.routeLang = lang === "en" ? "en" : "zh";
  }

  function legacyHashRoute() {
    return normalizeRoute(window.location.hash);
  }

  function languageFromUrl() {
    const pathLang = rootNode.dataset.routeLang;
    if (pathLang === "en" || pathLang === "zh") return pathLang;
    const queryLang = new URLSearchParams(window.location.search).get("lang");
    return queryLang === "en" ? "en" : "zh";
  }

  function setLanguageInUrl(lang) {
    const route = currentRouteString();
    const href = routeHref(route, lang);
    window.history.replaceState({ route, lang }, "", href);
    setRouteContext(route, lang);
  }

  function currentRouteString() {
    const route = normalizeRoute(rootNode.dataset.route || legacyHashRoute() || "home");
    if (route === "search") {
      const query = new URLSearchParams(window.location.search).toString();
      return query ? `search?${query}` : route;
    }
    return route;
  }

  function routeRelativePath(route, lang = languageFromUrl()) {
    const normalizedRoute = normalizeRoute(route);
    const langPrefix = lang === "en" ? "en/" : "";
    if (normalizedRoute === "home") return `${langPrefix}`;
    if (normalizedRoute.startsWith("search")) {
      const query = normalizedRoute.split("?")[1] || "";
      return `${langPrefix}search/${query ? `?${query}` : ""}`;
    }
    return `${langPrefix}${normalizedRoute}/`;
  }

  function routeHref(route, lang = languageFromUrl()) {
    const relative = routeRelativePath(route, lang);
    const [pathPart, queryPart] = relative.split("?");
    const path = `${siteMount()}/${pathPart}`.replace(/\/+/g, "/");
    return queryPart ? `${path}?${queryPart}` : path;
  }

  function routeUrl(route, lang = languageFromUrl()) {
    const base = String(site.siteUrl || "").replace(/\/+$/, "");
    const relative = routeRelativePath(route, lang);
    return new URL(relative, `${base}/`).toString();
  }

  function parseHash() {
    const raw = currentRouteString();
    if (!raw) return { page: "home" };
    if (raw.startsWith("search")) {
      const params = new URLSearchParams(raw.split("?")[1] || "");
      return { page: "search", query: params.get("q") || "" };
    }
    const parts = raw.split("/");
    if (parts[0] === "works" && parts[1]) return { page: "work-detail", id: parts[1] };
    if (parts[0] === "exhibitions" && parts[1]) return { page: "exhibition-detail", id: parts[1] };
    if (parts[0] === "news" && parts[1]) return { page: "news-detail", id: parts[1] };
    const known = new Set(["home", "works", "exhibitions", "news", "about"]);
    return { page: known.has(parts[0]) ? parts[0] : "home" };
  }

  function go(route) {
    const normalizedRoute = normalizeRoute(route);
    const lang = site.state?.lang || languageFromUrl();
    const href = routeHref(normalizedRoute, lang);
    window.history.pushState({ route: normalizedRoute, lang }, "", href);
    setRouteContext(normalizedRoute, lang);
    if (typeof site.renderPage === "function") {
      void site.renderPage({ focusMain: true });
    }
  }

  function searchRoute(query) {
    return `search?q=${encodeURIComponent((query || "").trim())}`;
  }

  function yearValue(item) {
    const raw = String(item.year || item.date || "");
    const match = raw.match(/\d{4}/);
    return match ? Number(match[0]) : 0;
  }

  function sortByYearDesc(items) {
    return [...items].sort((a, b) => yearValue(b) - yearValue(a));
  }

  function groupByYear(items) {
    const grouped = new Map();
    sortByYearDesc(items).forEach((item) => {
      const year = String(yearValue(item) || "未标注");
      if (!grouped.has(year)) grouped.set(year, []);
      grouped.get(year).push(item);
    });
    return [...grouped.entries()].map(([year, entries]) => ({ year, entries }));
  }

  function isWorkLandscape(item) {
    const gallerySize = (item.gallery_images || []).length;
    return gallerySize > 0 || item.material_zh === "宣纸";
  }

  Object.assign(site, {
    siteMount,
    normalizeRoute,
    setRouteContext,
    legacyHashRoute,
    languageFromUrl,
    setLanguageInUrl,
    currentRouteString,
    routeRelativePath,
    routeHref,
    routeUrl,
    parseHash,
    go,
    searchRoute,
    yearValue,
    sortByYearDesc,
    groupByYear,
    isWorkLandscape
  });
})();

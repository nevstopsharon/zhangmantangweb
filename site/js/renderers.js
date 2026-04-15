(function () {
  const site = window.ZMTSite;
  const {
    appRoot,
    state,
    store,
    SEARCH_SUGGESTIONS,
    currentUI,
    assetUrl,
    textOf,
    escapeHtml,
    currentRouteString,
    routeUrl,
    sortByYearDesc,
    isWorkLandscape
  } = site;

  const SEARCH_SUGGESTIONS_ID = "global-search-suggestions";
  let secondaryBundlePromise = null;

  function absoluteUrl(value) {
    return new URL(value, window.location.href).toString();
  }

  function searchSuggestionsLabel() {
    return state.lang === "en" ? "Suggested searches" : "推荐搜索";
  }

  function searchSuggestions(query) {
    const keyword = (query || "").trim().toLowerCase();
    if (!store.siteData) return [];
    if (!keyword) {
      return SEARCH_SUGGESTIONS.map((item) => {
        const route = String(item.route || "");
        const [scope, id] = route.split("/");
        let source = null;
        if (scope === "works") source = store.siteData.works.find((entry) => entry.id === id);
        if (scope === "exhibitions") source = store.siteData.exhibitions.find((entry) => entry.id === id);
        if (scope === "news") source = store.siteData.news.find((entry) => entry.id === id);
        if (!source) return null;
        return {
          label: textOf(source, "title_zh", "title_en"),
          route
        };
      }).filter(Boolean);
    }

    const titles = [
      ...store.siteData.works.map((item) => ({ label: textOf(item, "title_zh", "title_en"), route: `works/${item.id}` })),
      ...store.siteData.exhibitions.map((item) => ({ label: textOf(item, "title_zh", "title_en"), route: `exhibitions/${item.id}` })),
      ...store.siteData.news.map((item) => ({ label: textOf(item, "title_zh", "title_en"), route: `news/${item.id}` }))
    ];

    const matched = [];
    const seen = new Set();
    titles.forEach((item) => {
      const label = String(item.label || "");
      if (!label || seen.has(label) || !label.toLowerCase().includes(keyword)) return;
      seen.add(label);
      matched.push({ label, route: item.route });
    });
    return matched.slice(0, 3);
  }

  function headerMarkup(currentPage, route) {
    const profile = store.siteData.profile;
    const nav = currentUI().nav;
    const copy = currentUI();
    const inputValue = route.page === "search" ? route.query : state.searchQuery;
    const suggestionMarkup = searchSuggestions(inputValue)
      .map(
        (item) => `
          <button class="search-suggestion" type="button" role="option" aria-selected="false" data-search-suggestion="${escapeHtml(item.label)}" ${item.route ? `data-search-route="${escapeHtml(item.route)}"` : ""}>
            ${escapeHtml(item.label)}
          </button>`
      )
      .join("");
    const items = [
      ["home", nav.home],
      ["works", nav.works],
      ["exhibitions", nav.exhibitions],
      ["news", nav.news],
      ["about", nav.about]
    ];

    return `
      <header class="nav">
        <button class="brand" data-route="home" aria-label="${escapeHtml(profile.artist_name_zh)}">
          <span class="brand-name">
            <img class="brand-signature" src="${assetUrl(profile.brand.signature_image)}" alt="${escapeHtml(profile.artist_name_zh)}" loading="eager">
            <span class="brand-en">${escapeHtml(profile.artist_name_en)}</span>
          </span>
          <img class="seal-mark" src="${assetUrl(profile.brand.seal_image)}" alt="印章" loading="eager">
        </button>
        <nav class="menu">
          ${items
            .map(
              ([key, label]) => `
              <button class="nav-link ${currentPage === key ? "active" : ""}" data-route="${key}">
                ${escapeHtml(label)}
              </button>`
            )
            .join("")}
        </nav>
        <div class="nav-tools">
          <div class="search-shell" data-search-shell role="combobox" aria-haspopup="listbox" aria-expanded="false" aria-owns="${SEARCH_SUGGESTIONS_ID}">
            <label class="sr-only" for="global-search-input">${escapeHtml(copy.search)}</label>
            <form class="search-box" data-search-form>
              <input id="global-search-input" class="search-input" type="search" name="q" value="${escapeHtml(inputValue)}" placeholder="${escapeHtml(copy.searchPlaceholder)}" aria-label="${escapeHtml(copy.search)}" aria-controls="${SEARCH_SUGGESTIONS_ID}" aria-autocomplete="list" aria-expanded="false" autocomplete="off">
              <button class="search-submit" type="submit" aria-label="${escapeHtml(copy.search)}">⌕</button>
            </form>
            <div id="${SEARCH_SUGGESTIONS_ID}" class="search-suggestions" data-search-suggestions role="listbox" aria-label="${escapeHtml(searchSuggestionsLabel())}">
              ${suggestionMarkup}
            </div>
          </div>
          <div class="lang-switch">
            <button class="lang-btn ${state.lang === "zh" ? "active" : ""}" data-lang="zh">中</button>
            <button class="lang-btn ${state.lang === "en" ? "active" : ""}" data-lang="en">EN</button>
          </div>
        </div>
      </header>
    `;
  }

  function contactMarkup(route) {
    const profile = store.siteData.profile;
    const copy = currentUI().home;
    const compact = route?.page && route.page !== "home";
    return `
      <section class="${compact ? "section contact-section is-compact" : "section contact-section"}">
        <div class="${compact ? "contact is-compact" : "contact"}">
          <div>
            <div class="section-kicker body">${escapeHtml(copy.contactKicker)}</div>
            <div class="h1">${escapeHtml(copy.contactTitle)}</div>
          </div>
          <div class="contact-meta">
            <div class="contact-row"><div class="meta">${escapeHtml(copy.city)}</div><div class="body">${escapeHtml(state.lang === "en" ? profile.contact.city_en : profile.contact.city_zh)}</div></div>
            <div class="contact-row"><div class="meta">${escapeHtml(copy.email)}</div><div class="body">${escapeHtml(profile.contact.email)}</div></div>
            <div class="contact-row"><div class="meta">${escapeHtml(copy.response)}</div><div class="body">${escapeHtml(state.lang === "en" ? profile.contact.reply_en : profile.contact.reply_zh)}</div></div>
            <div class="contact-row"><div class="meta">${escapeHtml(copy.instagram)}</div><div class="body">${escapeHtml(profile.contact.instagram)}</div></div>
          </div>
        </div>
      </section>
    `;
  }

  function footerMarkup() {
    return `
      <footer class="footer">
        <div>${escapeHtml(currentUI().footerStudio)}</div>
        <div>${escapeHtml(currentUI().footerCopy)}</div>
      </footer>
    `;
  }

  function workCardMarkup(item) {
    const title = textOf(item, "title_zh", "title_en");
    const project = state.lang === "en" ? item.project_en : item.project_zh;
    const material = state.lang === "en" ? item.material_en : item.material_zh;
    const meta = [project, material].filter(Boolean).join(" / ");
    const landscape = isWorkLandscape(item);
    return `
      <article class="work-card">
        <button class="card-button" data-route="works/${item.id}">
          <div class="art-frame ${landscape ? "landscape" : ""}">
            ${item.cover_image ? `<img src="${assetUrl(item.cover_image)}" alt="${escapeHtml(title)}" loading="lazy" style="object-fit:contain;">` : `<div class="empty-state">${escapeHtml(currentUI().noImage)}</div>`}
          </div>
          <div class="card-body">
            <div class="tag">${escapeHtml(project || material || currentUI().searchTypeWork)}</div>
            <div class="h2">${escapeHtml(title)}</div>
            <div class="meta">${escapeHtml(meta)}</div>
          </div>
        </button>
      </article>
    `;
  }

  function exhibitionCardMarkup(item) {
    const title = textOf(item, "title_zh", "title_en");
    return `
      <article class="exhibition-block">
        <button class="card-button" data-route="exhibitions/${item.id}">
          <div class="feature-card-shell">
            ${site.imageOrPlaceholder(item.cover_image, title, "exhibition-image", "contain")}
            <div class="exhibition-info">
              <div class="tag">${escapeHtml(item.year || "")}</div>
              <div class="h2">${escapeHtml(title)}</div>
              <div class="meta">${escapeHtml(textOf(item, "location_zh", "location_en"))}</div>
              <div class="body">${escapeHtml(textOf(item, "description_zh", "description_en"))}</div>
            </div>
          </div>
        </button>
      </article>
    `;
  }

  function homeMarkup() {
    const siteData = store.siteData;
    const profile = siteData.profile;
    const copy = currentUI().home;
    const featuredWorks = siteData.works.slice(0, 6);
    const recentExhibitions = sortByYearDesc(siteData.exhibitions).slice(0, 1);

    return `
      <section class="hero">
        <div class="hero-art">
          <img class="hero-art-image" src="${assetUrl(profile.hero.background_image)}" alt="${escapeHtml(state.lang === "en" ? profile.hero.title_en : profile.hero.title_zh)}" loading="eager" fetchpriority="high" decoding="async">
        </div>
      </section>

      <section class="section">
        <div class="section-head">
          <div>
            <div class="h1">${escapeHtml(copy.featuredTitle)}</div>
          </div>
          <button class="section-link" data-route="works">${escapeHtml(copy.featuredLink)}</button>
        </div>
        <div class="grid-3 home-feature-grid">
          ${featuredWorks.map((item) => workCardMarkup(item)).join("")}
        </div>
      </section>

      <section class="section">
        <div class="section-head">
          <div>
            <div class="section-kicker body">${escapeHtml(copy.exhibitionsKicker)}</div>
            <div class="h1">${escapeHtml(copy.exhibitionsTitle)}</div>
          </div>
          <button class="section-link" data-route="exhibitions">${escapeHtml(copy.exhibitionsLink)}</button>
        </div>
        <div class="timeline">
          ${recentExhibitions.map(exhibitionCardMarkup).join("")}
        </div>
      </section>
    `;
  }

  function ensureRouteBundle(route) {
    if (!route || route.page === "home" || site.fullRendererReady) return Promise.resolve();
    if (!secondaryBundlePromise) {
      secondaryBundlePromise = new Promise((resolve, reject) => {
        const script = document.createElement("script");
        const base = site.siteBase === "/" ? "" : site.siteBase;
        script.src = `${base}/js/renderers-secondary.js?v=20260413a`;
        script.defer = true;
        script.onload = () => {
          site.fullRendererReady = true;
          resolve();
        };
        script.onerror = () => reject(new Error("Failed to load secondary page renderer bundle."));
        document.head.appendChild(script);
      });
    }
    return secondaryBundlePromise;
  }

  function bodyMarkup(route) {
    if (route.page !== "home" && site.secondaryPageRenderers?.[route.page]) {
      return site.secondaryPageRenderers[route.page](route);
    }
    return homeMarkup();
  }

  function metadataForRoute(route) {
    const profile = store.siteData.profile;
    const title = state.lang === "en" ? profile.hero.title_en : profile.hero.title_zh;
    const description = state.lang === "en" ? profile.hero.subtitle_en : profile.hero.subtitle_zh;
    const image = absoluteUrl(assetUrl(profile.hero.background_image));
    const currentRoute = currentRouteString();
    const canonical = routeUrl(currentRoute, state.lang);
    return {
      title,
      description,
      image,
      canonical,
      alternateZh: routeUrl(currentRoute, "zh"),
      alternateEn: routeUrl(currentRoute, "en"),
      schema: {
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: title,
        description,
        image,
        inLanguage: state.lang === "en" ? "en" : "zh-CN",
        url: canonical
      }
    };
  }

  function setMetaContent(selector, content) {
    const node = document.querySelector(selector);
    if (node) node.setAttribute("content", content);
  }

  function setLinkHref(selector, href) {
    const node = document.querySelector(selector);
    if (node) node.setAttribute("href", href);
  }

  function syncDocumentState() {
    if (!store.siteData) return;
    const metadata = metadataForRoute(site.parseHash());
    document.documentElement.lang = state.lang === "en" ? "en" : "zh-CN";
    document.title = metadata.title;
    setMetaContent('meta[name="description"]', metadata.description);
    setMetaContent('meta[property="og:title"]', metadata.title);
    setMetaContent('meta[property="og:description"]', metadata.description);
    setMetaContent('meta[property="og:url"]', metadata.canonical);
    setMetaContent('meta[property="og:image"]', metadata.image);
    setMetaContent('meta[name="twitter:title"]', metadata.title);
    setMetaContent('meta[name="twitter:description"]', metadata.description);
    setMetaContent('meta[name="twitter:image"]', metadata.image);
    setLinkHref('link[rel="canonical"]', metadata.canonical);
    setLinkHref('link[hreflang="zh-CN"]', metadata.alternateZh);
    setLinkHref('link[hreflang="en"]', metadata.alternateEn);
    setLinkHref('link[hreflang="x-default"]', metadata.alternateZh);
    const structuredData = document.getElementById("structured-data");
    if (structuredData) structuredData.textContent = JSON.stringify(metadata.schema);
  }

  function render() {
    if (!store.siteData) return;
    const route = site.parseHash();
    const currentPage =
      route.page === "work-detail"
        ? "works"
        : route.page === "exhibition-detail"
          ? "exhibitions"
          : route.page === "news-detail"
            ? "news"
            : route.page;

    appRoot.className = "site";
    appRoot.innerHTML = `
      ${headerMarkup(currentPage, route)}
      <main id="main-content" class="page" tabindex="-1">${bodyMarkup(route)}</main>
      ${contactMarkup(route)}
      ${footerMarkup()}
    `;
    site.bindUI();
  }

  Object.assign(site, {
    searchSuggestions,
    headerMarkup,
    contactMarkup,
    footerMarkup,
    workCardMarkup,
    exhibitionCardMarkup,
    homeMarkup,
    ensureRouteBundle,
    bodyMarkup,
    metadataForRoute,
    syncDocumentState,
    render
  });
})();

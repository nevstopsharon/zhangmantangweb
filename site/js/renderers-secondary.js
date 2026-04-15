(function () {
  const site = window.ZMTSite;
  const {
    appRoot,
    state,
    store,
    WORK_FILTERS,
    SEARCH_SUGGESTIONS,
    currentUI,
    assetUrl,
    textOf,
    localizedField,
    workFacetLabel,
    escapeHtml,
    parseHash,
    currentRouteString,
    routeUrl,
    sortByYearDesc,
    groupByYear,
    isWorkLandscape,
    specRow,
    detailLinkRow,
    imageOrPlaceholder,
    paragraphs,
    plainSnippet,
    detailMediaMarkup,
    bindUI
  } = site;
  const SEARCH_SUGGESTIONS_ID = "global-search-suggestions";

  function absoluteUrl(value) {
    return new URL(value, window.location.href).toString();
  }

  function pageTitle(label) {
    const profile = store.siteData.profile;
    const siteName = state.lang === "en" ? profile.hero.title_en : profile.hero.title_zh;
    return label ? `${label} | ${siteName}` : siteName;
  }

  function yearNodeLabel(scope, year) {
    if (state.lang === "en") {
      return scope === "exhibitions" ? `View exhibitions from ${year}` : `View news from ${year}`;
    }
    return scope === "exhibitions" ? `查看 ${year} 年展览` : `查看 ${year} 年新闻`;
  }

  function searchSuggestionsLabel() {
    return state.lang === "en" ? "Suggested searches" : "推荐搜索";
  }

  function searchEntries(query) {
    const siteData = store.siteData;
    const keyword = (query || "").trim().toLowerCase();
    if (!keyword) return [];
    const isEnglish = state.lang === "en";
    const sources = [
      ...siteData.works.map((item) => ({
        type: "work",
        route: `works/${item.id}`,
        title: textOf(item, "title_zh", "title_en"),
        snippet: [
          isEnglish ? item.description_en : item.description_zh,
          isEnglish ? item.project_en : item.project_zh,
          isEnglish ? item.material_en : item.material_zh,
          isEnglish ? item.size_en : item.size_zh,
          isEnglish ? item.location_en : item.location_zh,
          item.year
        ]
          .filter(Boolean)
          .join(" ")
      })),
      ...siteData.exhibitions.map((item) => ({
        type: "exhibition",
        route: `exhibitions/${item.id}`,
        title: textOf(item, "title_zh", "title_en"),
        snippet: [isEnglish ? item.description_en : item.description_zh, isEnglish ? item.location_en : item.location_zh, item.year].filter(Boolean).join(" ")
      })),
      ...siteData.news.map((item) => ({
        type: "news",
        route: `news/${item.id}`,
        title: textOf(item, "title_zh", "title_en"),
        snippet: [isEnglish ? item.content_en : item.content_zh, item.date].filter(Boolean).join(" ")
      }))
    ];

    return sources.filter((item) => `${item.title} ${item.snippet}`.toLowerCase().includes(keyword));
  }

  function searchSuggestions(query) {
    const keyword = (query || "").trim().toLowerCase();
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
    const project = localizedField(item, "project");
    const material = localizedField(item, "material");
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
            ${imageOrPlaceholder(item.cover_image, title, "exhibition-image", "contain")}
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

  function newsCardMarkup(item) {
    const title = textOf(item, "title_zh", "title_en");
    return `
      <article class="news-card">
        <button class="card-button" data-route="news/${item.id}">
          <div class="feature-card-shell">
            ${imageOrPlaceholder(item.cover_image, title, "news-image", "contain")}
            <div class="news-info">
              <div class="h2">${escapeHtml(title)}</div>
              <div class="body">${escapeHtml(plainSnippet(textOf(item, "content_zh", "content_en"), 180))}</div>
            </div>
          </div>
        </button>
      </article>
    `;
  }

  function yearRailMarkup(groups, scope, activeYear) {
    return `
      <aside class="year-rail">
        ${groups
          .map(
            ({ year }) => `
            <button class="year-node ${String(activeYear) === String(year) ? "current" : ""}" data-year-scope="${scope}" data-year-target="${scope}-${year}" data-year-value="${year}" aria-label="${escapeHtml(yearNodeLabel(scope, year))}" ${String(activeYear) === String(year) ? 'aria-current="true"' : ""}>
              ${escapeHtml(year)}
            </button>`
          )
          .join("")}
      </aside>
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
          ${featuredWorks.map((item, index) => workCardMarkup(item, index)).join("")}
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

  function dropdownMarkup(type, label, allLabel, options, selected) {
    const isOpen = state.openFilter === type;
    const buttonLabel = selected ? workFacetLabel(type, selected) : label;
    return `
      <div class="preview-anchor ${isOpen ? "open" : ""}">
        <button class="filter-btn ${selected ? "active" : ""}" data-filter-toggle="${type}">
          ${escapeHtml(buttonLabel)}
        </button>
        <div class="preview-panel">
          <div class="preview-list">
            <button class="preview-link ${!selected ? "active" : ""}" data-filter-group="${type}" data-filter-value="">${escapeHtml(allLabel)}</button>
            ${options
              .map(
                (option) => `
                <button class="preview-link ${selected === option ? "active" : ""}" data-filter-group="${type}" data-filter-value="${escapeHtml(option)}">
                  ${escapeHtml(workFacetLabel(type, option))}
                </button>`
              )
              .join("")}
          </div>
        </div>
      </div>
    `;
  }

  function worksMarkup() {
    const siteData = store.siteData;
    const copy = currentUI().works;
    const projectOptions = WORK_FILTERS.project;
    const materialOptions = WORK_FILTERS.material;
    const filtered = siteData.works.filter((item) => {
      const projectOk = !state.worksFilter.project || item.project_zh === state.worksFilter.project;
      const materialOk = !state.worksFilter.material || item.material_zh === state.worksFilter.material;
      return projectOk && materialOk;
    });

    return `
      <section class="section works-shell">
        <div class="filter-row">
          <div>
            <div class="h1">${escapeHtml(copy.title)}</div>
          </div>
          <div class="filters">
            <button class="filter-btn ${!state.worksFilter.project && !state.worksFilter.material ? "active" : ""}" data-reset-filters="works">${escapeHtml(copy.all)}</button>
            ${dropdownMarkup("project", copy.filterProject, copy.allProjects, projectOptions, state.worksFilter.project)}
            ${dropdownMarkup("material", copy.filterMaterial, copy.allMaterials, materialOptions, state.worksFilter.material)}
          </div>
        </div>
        <div class="grid-3">
          ${filtered.map((item, index) => workCardMarkup(item, index)).join("")}
        </div>
      </section>
    `;
  }

  function groupedListingMarkup(groups, scope, activeYear, cardRenderer) {
    return `
      <div class="year-layout">
        ${yearRailMarkup(groups, scope, activeYear)}
        <div class="timeline">
          ${groups
            .map(
              ({ year, entries }) => `
              <section class="year-block" id="${scope}-${year}">
                ${entries.map(cardRenderer).join("")}
              </section>`
            )
            .join("")}
        </div>
      </div>
    `;
  }

  function exhibitionsMarkup() {
    const groups = groupByYear(store.siteData.exhibitions);
    if (!state.activeExhibitionYear && groups.length) state.activeExhibitionYear = groups[0].year;
    return `
      <section class="section">
        <div class="h1" style="margin-bottom:40px;">${escapeHtml(currentUI().exhibitions.title)}</div>
        ${groupedListingMarkup(groups, "exhibitions", state.activeExhibitionYear, exhibitionCardMarkup)}
      </section>
    `;
  }

  function newsMarkup() {
    const groups = groupByYear(store.siteData.news);
    if (!state.activeNewsYear && groups.length) state.activeNewsYear = groups[0].year;
    return `
      <section class="section">
        <div class="h1" style="margin-bottom:40px;">${escapeHtml(currentUI().news.title)}</div>
        ${groupedListingMarkup(groups, "news", state.activeNewsYear, newsCardMarkup)}
      </section>
    `;
  }

  function searchMarkup(query) {
    const copy = currentUI();
    const results = searchEntries(query);
    const labels = {
      work: copy.searchTypeWork,
      exhibition: copy.searchTypeExhibition,
      news: copy.searchTypeNews
    };

    return `
      <section class="section">
        <div class="section-head" style="margin-bottom:24px;">
          <div class="h1">${escapeHtml(copy.searchResults)}</div>
          <div class="meta">${escapeHtml((query || "").trim())}</div>
        </div>
        <div class="search-results">
          ${results.length
            ? results
                .map(
                  (item) => `
                  <article class="search-result">
                    <button class="card-button search-result-button" data-route="${item.route}">
                      <div class="tag">${escapeHtml(labels[item.type])}</div>
                      <div class="h2">${escapeHtml(item.title)}</div>
                      <div class="body">${escapeHtml(plainSnippet(item.snippet, 180))}</div>
                    </button>
                  </article>`
                )
                .join("")
            : `<div class="empty-state">${escapeHtml(copy.searchEmpty)}</div>`}
        </div>
      </section>
    `;
  }

  function aboutMarkup() {
    const profile = store.siteData.profile;
    return `
      <section class="section">
        <div class="section-head">
          <div>
            <div class="h1">${escapeHtml(state.lang === "en" ? profile.about.headline_en : profile.about.headline_zh)}</div>
          </div>
        </div>
        <div class="about-wrap">
          <div class="portrait-stack">
            ${(profile.about.portrait_images || [])
              .map(
                (path, index) => `
                <div class="portrait-frame ${index === 0 ? "is-primary" : "is-secondary"}">
                  <img src="${assetUrl(path)}" alt="${escapeHtml(profile.artist_name_zh)}-${index + 1}" loading="lazy">
                </div>`
              )
              .join("")}
          </div>
          <div class="bio-block">
            <div class="detail-copy body">${paragraphs(state.lang === "en" ? profile.about.bio_en : profile.about.bio_zh)}</div>
            <div class="timeline-list">
              ${profile.milestones
                .map(
                  (item) => `
                  <div class="timeline-item">
                    <div class="timeline-year body">${escapeHtml(item.year)}</div>
                    <div class="timeline-copy body">${escapeHtml(state.lang === "en" ? item.label_en : item.label_zh)}</div>
                  </div>`
                )
                .join("")}
            </div>
          </div>
        </div>
      </section>
    `;
  }

  function workDetailMarkup(item) {
    if (!item) return `<section class="detail-page"><div class="empty-state">${escapeHtml(currentUI().noContent)}</div></section>`;
    const copy = currentUI().detail;
    const gallery = [item.cover_image, ...(item.gallery_images || [])].filter(Boolean);
    const project = localizedField(item, "project");
    const material = localizedField(item, "material");
    const size = localizedField(item, "size");
    const location = localizedField(item, "location");

    return `
      <section class="detail-page works-shell">
        <button class="back-link body" data-route="works">${escapeHtml(copy.backWorks)}</button>
        <div class="detail-subnav detail-subnav-simple">
          <div>
            <div class="section-kicker body">${escapeHtml(copy.workTemplate)}</div>
            <div class="h2">${escapeHtml(textOf(item, "title_zh", "title_en"))}</div>
          </div>
        </div>
        ${detailMediaMarkup(gallery, textOf(item, "title_zh", "title_en"), "work-hero")}
        <div class="detail-meta-grid">
          <div>
            <div class="detail-copy body">${paragraphs(textOf(item, "description_zh", "description_en"))}</div>
          </div>
          <div class="detail-specs">
            ${specRow(copy.material, material)}
            ${specRow(copy.size, size)}
            ${specRow(copy.year, item.year)}
            ${specRow(copy.project, project)}
            ${specRow(copy.location, location)}
          </div>
        </div>
      </section>
    `;
  }

  function exhibitionDetailMarkup(item) {
    if (!item) return `<section class="detail-page"><div class="empty-state">${escapeHtml(currentUI().noContent)}</div></section>`;
    const copy = currentUI().detail;
    const groups = groupByYear(store.siteData.exhibitions);
    const activeYear = String(site.yearValue(item) || "");
    const gallery = [item.cover_image, ...(item.gallery_images || [])].filter(Boolean);

    return `
      <section class="detail-page">
        <button class="back-link body" data-route="exhibitions">${escapeHtml(copy.backExhibitions)}</button>
        <div class="detail-content-shell">
          ${yearRailMarkup(groups, "exhibitions", activeYear)}
          <div class="detail-content-main">
            <div class="tag">${escapeHtml(copy.exhibitionTemplate)}</div>
            <div class="h2" style="max-width:980px;margin-top:12px;">${escapeHtml(textOf(item, "title_zh", "title_en"))}</div>
            ${detailMediaMarkup(gallery, textOf(item, "title_zh", "title_en"), "exhibition-hero", "contain", "margin-top:32px;")}
            <div class="detail-specs detail-specs-compact exhibition-detail-specs">
              ${specRow(copy.location, textOf(item, "location_zh", "location_en"))}
              ${specRow(copy.date, item.year)}
              ${specRow(copy.content, textOf(item, "description_zh", "description_en"))}
            </div>
          </div>
        </div>
      </section>
    `;
  }

  function newsDetailMarkup(item) {
    if (!item) return `<section class="detail-page"><div class="empty-state">${escapeHtml(currentUI().noContent)}</div></section>`;
    const copy = currentUI().detail;
    const groups = groupByYear(store.siteData.news);
    const activeYear = String(site.yearValue(item) || "");
    const gallery = [item.cover_image, ...(item.gallery_images || [])].filter(Boolean);
    const relatedReportRow = detailLinkRow(textOf(item, "related_report_label_zh", "related_report_label_en"), item.related_report_url);
    const fullVideoRow = detailLinkRow(textOf(item, "full_video_label_zh", "full_video_label_en"), item.full_video_url);

    return `
      <section class="detail-page">
        <button class="back-link body" data-route="news">${escapeHtml(copy.backNews)}</button>
        <div class="detail-content-shell">
          ${yearRailMarkup(groups, "news", activeYear)}
          <div class="detail-content-main">
            <div class="tag">${escapeHtml(copy.newsTemplate)}</div>
            <div class="h2" style="max-width:980px;margin-top:12px;">${escapeHtml(textOf(item, "title_zh", "title_en"))}</div>
            ${detailMediaMarkup(gallery, textOf(item, "title_zh", "title_en"), "exhibition-hero", "contain", "margin-top:32px;")}
            <div class="detail-meta-grid" style="margin-top:24px;">
              <div>
                <div class="detail-copy body">${paragraphs(textOf(item, "content_zh", "content_en"))}</div>
                ${relatedReportRow || fullVideoRow ? `<div class="detail-link-list">${relatedReportRow}${fullVideoRow}</div>` : ""}
              </div>
              <div class="detail-specs detail-specs-compact exhibition-detail-specs">
                ${specRow(copy.date, item.date)}
                ${specRow(copy.content, textOf(item, "content_zh", "content_en"))}
              </div>
            </div>
          </div>
        </div>
      </section>
    `;
  }

  function bodyMarkup(route) {
    const siteData = store.siteData;
    switch (route.page) {
      case "works":
        return worksMarkup();
      case "exhibitions":
        return exhibitionsMarkup();
      case "news":
        return newsMarkup();
      case "search":
        return searchMarkup(route.query);
      case "about":
        return aboutMarkup();
      case "work-detail":
        return workDetailMarkup(siteData.works.find((item) => item.id === route.id));
      case "exhibition-detail":
        return exhibitionDetailMarkup(siteData.exhibitions.find((item) => item.id === route.id));
      case "news-detail":
        return newsDetailMarkup(siteData.news.find((item) => item.id === route.id));
      case "home":
      default:
        return homeMarkup();
    }
  }

  function metadataForRoute(route) {
    const siteData = store.siteData;
    const profile = siteData.profile;
    const siteName = state.lang === "en" ? profile.hero.title_en : profile.hero.title_zh;
    const defaultDescription = state.lang === "en" ? profile.hero.subtitle_en : profile.hero.subtitle_zh;
    const defaultImage = absoluteUrl(assetUrl(profile.hero.background_image));
    const currentRoute = currentRouteString();
    const canonical = routeUrl(currentRoute, state.lang);
    const alternateZh = routeUrl(currentRoute, "zh");
    const alternateEn = routeUrl(currentRoute, "en");
    const baseSchema = {
      "@context": "https://schema.org",
      inLanguage: state.lang === "en" ? "en" : "zh-CN",
      url: canonical
    };

    const result = {
      title: siteName,
      description: defaultDescription,
      image: defaultImage,
      canonical,
      alternateZh,
      alternateEn,
      schema: {
        ...baseSchema,
        "@type": "WebSite",
        name: siteName,
        description: defaultDescription,
        image: defaultImage
      }
    };

    if (route.page === "works") {
      result.title = pageTitle(currentUI().works.title);
      result.description = defaultDescription;
      result.schema = {
        ...baseSchema,
        "@type": "CollectionPage",
        name: result.title,
        description: result.description
      };
      return result;
    }

    if (route.page === "exhibitions") {
      result.title = pageTitle(currentUI().exhibitions.title);
      result.description = state.lang === "en" ? "Browse exhibitions, venues, and dates from Zhang Mantang's practice." : "浏览张满堂的展览、场馆与时间信息。";
      result.schema = {
        ...baseSchema,
        "@type": "CollectionPage",
        name: result.title,
        description: result.description
      };
      return result;
    }

    if (route.page === "news") {
      result.title = pageTitle(currentUI().news.title);
      result.description = state.lang === "en" ? "Browse interviews, reports, and media coverage related to Zhang Mantang." : "浏览与张满堂相关的专访、报道与媒体动态。";
      result.schema = {
        ...baseSchema,
        "@type": "CollectionPage",
        name: result.title,
        description: result.description
      };
      return result;
    }

    if (route.page === "about") {
      result.title = pageTitle(state.lang === "en" ? profile.about.headline_en : profile.about.headline_zh);
      result.description = plainSnippet(state.lang === "en" ? profile.about.bio_en : profile.about.bio_zh, 180);
      result.schema = {
        ...baseSchema,
        "@type": "AboutPage",
        name: result.title,
        description: result.description,
        mainEntity: {
          "@type": "Person",
          name: profile.artist_name_en,
          alternateName: profile.artist_name_zh,
          email: profile.contact.email,
          image: profile.about.portrait_images.map((path) => absoluteUrl(assetUrl(path)))
        }
      };
      return result;
    }

    if (route.page === "search") {
      const query = (route.query || "").trim();
      result.title = pageTitle(currentUI().searchResults);
      result.description = query
        ? state.lang === "en"
          ? `Search results for ${query} on the official Zhang Mantang website.`
          : `张满堂官方网站中与“${query}”相关的检索结果。`
        : defaultDescription;
      result.schema = {
        ...baseSchema,
        "@type": "SearchResultsPage",
        name: result.title,
        description: result.description
      };
      return result;
    }

    if (route.page === "work-detail") {
      const item = siteData.works.find((entry) => entry.id === route.id);
      if (item) {
        result.title = pageTitle(textOf(item, "title_zh", "title_en"));
        result.description = plainSnippet(textOf(item, "description_zh", "description_en"), 180) || defaultDescription;
        result.image = absoluteUrl(assetUrl(item.cover_image || profile.hero.background_image));
        result.schema = {
          ...baseSchema,
          "@type": "VisualArtwork",
          name: textOf(item, "title_zh", "title_en"),
          description: result.description,
          image: [item.cover_image, ...(item.gallery_images || [])].filter(Boolean).map((path) => absoluteUrl(assetUrl(path))),
          artMedium: localizedField(item, "material"),
          dateCreated: item.year,
          creator: {
            "@type": "Person",
            name: profile.artist_name_en,
            alternateName: profile.artist_name_zh
          }
        };
      }
      return result;
    }

    if (route.page === "exhibition-detail") {
      const item = siteData.exhibitions.find((entry) => entry.id === route.id);
      if (item) {
        result.title = pageTitle(textOf(item, "title_zh", "title_en"));
        result.description = plainSnippet(textOf(item, "description_zh", "description_en"), 180) || defaultDescription;
        result.image = absoluteUrl(assetUrl(item.cover_image || profile.hero.background_image));
        result.schema = {
          ...baseSchema,
          "@type": "Event",
          name: textOf(item, "title_zh", "title_en"),
          description: result.description,
          eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
          startDate: String(item.year || ""),
          location: textOf(item, "location_zh", "location_en"),
          image: [item.cover_image, ...(item.gallery_images || [])].filter(Boolean).map((path) => absoluteUrl(assetUrl(path)))
        };
      }
      return result;
    }

    if (route.page === "news-detail") {
      const item = siteData.news.find((entry) => entry.id === route.id);
      if (item) {
        result.title = pageTitle(textOf(item, "title_zh", "title_en"));
        result.description = plainSnippet(textOf(item, "content_zh", "content_en"), 180) || defaultDescription;
        result.image = absoluteUrl(assetUrl(item.cover_image || profile.hero.background_image));
        result.schema = {
          ...baseSchema,
          "@type": "NewsArticle",
          headline: textOf(item, "title_zh", "title_en"),
          description: result.description,
          datePublished: String(item.date || ""),
          image: [item.cover_image, ...(item.gallery_images || [])].filter(Boolean).map((path) => absoluteUrl(assetUrl(path))),
          author: {
            "@type": "Person",
            name: profile.artist_name_en,
            alternateName: profile.artist_name_zh
          }
        };
      }
      return result;
    }

    return result;
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
    const route = parseHash();
    const metadata = metadataForRoute(route);
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
    if (structuredData) {
      structuredData.textContent = JSON.stringify(metadata.schema);
    }
  }

  function render() {
    if (!store.siteData) return;
    const route = parseHash();
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
    searchEntries,
    searchSuggestions,
    headerMarkup,
    contactMarkup,
    footerMarkup,
    workCardMarkup,
    exhibitionCardMarkup,
    newsCardMarkup,
    yearRailMarkup,
    homeMarkup,
    dropdownMarkup,
    worksMarkup,
    groupedListingMarkup,
    exhibitionsMarkup,
    newsMarkup,
    searchMarkup,
    aboutMarkup,
    workDetailMarkup,
    exhibitionDetailMarkup,
    newsDetailMarkup,
    bodyMarkup,
    metadataForRoute,
    syncDocumentState,
    render
  });
})();

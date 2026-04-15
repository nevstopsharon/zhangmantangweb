const app = document.getElementById("app");
const siteBase = document.documentElement.dataset.siteBase || "..";

const state = {
  lang: "zh",
  worksFilter: { project: "", material: "" },
  openFilter: null,
  selectedMedia: null,
  activeExhibitionYear: null,
  activeNewsYear: null,
  searchQuery: ""
};

const ui = {
  zh: {
    search: "搜索",
    searchPlaceholder: "搜索作品、展览、新闻",
    searchResults: "检索结果",
    searchEmpty: "暂未找到该内容",
    searchTypeWork: "作品",
    searchTypeExhibition: "展览",
    searchTypeNews: "新闻",
    nav: { home: "首页", works: "作品", exhibitions: "展览", news: "新闻", about: "关于" },
    home: {
      kicker: "艺术家官网",
      featuredKicker: "精选作品",
      featuredTitle: "作品",
      featuredLink: "查看全部作品",
      exhibitionsKicker: "近期展览",
      exhibitionsTitle: "展览",
      exhibitionsLink: "查看全部展览",
      contactKicker: "联系",
      contactTitle: "合作与收藏咨询",
      city: "城市",
      email: "邮箱",
      response: "回复",
      instagram: "Instagram"
    },
    works: {
      kicker: "作品",
      title: "作品",
      all: "全部",
      filterProject: "项目",
      filterMaterial: "材质",
      allProjects: "全部项目",
      allMaterials: "全部材质"
    },
    exhibitions: { kicker: "展览", title: "展览" },
    news: { kicker: "新闻", title: "新闻" },
    about: { kicker: "关于", title: "艺术家介绍", timeline: "重要经历" },
    detail: {
      workTemplate: "作品详情",
      exhibitionTemplate: "展览详情",
      newsTemplate: "新闻详情",
      backWorks: "← 返回作品",
      backExhibitions: "← 返回展览",
      backNews: "← 返回新闻",
      material: "介质",
      size: "尺寸",
      year: "创作时间",
      project: "项目归属",
      location: "地点",
      date: "时间",
      content: "内容"
    },
    footerStudio: "张满堂书法工作室",
    footerCopy: "© 2026 张满堂书法工作室",
    noImage: "暂无图片",
    noContent: "暂无内容",
    loadError: "内容加载失败。请用本地服务器打开 `site/`，例如在仓库根目录运行 `py -m http.server 8000`。"
  },
  en: {
    search: "Search",
    searchPlaceholder: "Search works, exhibitions, news",
    searchResults: "Search Results",
    searchEmpty: "No matching content found",
    searchTypeWork: "Work",
    searchTypeExhibition: "Exhibition",
    searchTypeNews: "News",
    nav: { home: "Home", works: "Works", exhibitions: "Exhibitions", news: "News", about: "About" },
    home: {
      kicker: "Official Website",
      featuredKicker: "Selected Works",
      featuredTitle: "Works",
      featuredLink: "View all works",
      exhibitionsKicker: "Recent Exhibitions",
      exhibitionsTitle: "Exhibitions",
      exhibitionsLink: "View all exhibitions",
      contactKicker: "Contact",
      contactTitle: "Commissions and Collection Enquiries",
      city: "City",
      email: "Email",
      response: "Response",
      instagram: "Instagram"
    },
    works: {
      kicker: "Works",
      title: "Works",
      all: "All",
      filterProject: "Project",
      filterMaterial: "Material",
      allProjects: "All Projects",
      allMaterials: "All Materials"
    },
    exhibitions: { kicker: "Exhibitions", title: "Exhibitions" },
    news: { kicker: "News", title: "News" },
    about: { kicker: "About", title: "Artist Profile", timeline: "Milestones" },
    detail: {
      workTemplate: "Work Detail",
      exhibitionTemplate: "Exhibition Detail",
      newsTemplate: "News Detail",
      backWorks: "← Back to Works",
      backExhibitions: "← Back to Exhibitions",
      backNews: "← Back to News",
      material: "Medium",
      size: "Size",
      year: "Year",
      project: "Project",
      location: "Location",
      date: "Date",
      content: "Content"
    },
    footerStudio: "Zhang Mantang Calligraphy Studio",
    footerCopy: "© 2026 Zhang Mantang Calligraphy Studio",
    noImage: "No image",
    noContent: "No content yet",
    loadError: "Failed to load content. Run a local server from the repo root, for example `py -m http.server 8000`."
  }
};

let siteData = null;

const currentUI = () => ui[state.lang];

const WORK_FILTERS = {
  material: ["紫砂", "瓷", "宣纸", "其他"],
  project: ["欧亚国家名片-中国文化邮票", "走向胜利", "人民大会堂藏品", "毛泽东诗词精选"]
};

const WORK_FILTER_LABELS = {
  zh: {
    material: {
      紫砂: "紫砂",
      瓷: "瓷",
      宣纸: "宣纸",
      其他: "其他"
    },
    project: {
      "欧亚国家名片-中国文化邮票": "欧亚国家名片-中国文化邮票",
      "走向胜利": "走向胜利",
      "人民大会堂藏品": "人民大会堂藏品",
      "毛泽东诗词精选": "毛泽东诗词精选"
    }
  },
  en: {
    material: {
      紫砂: "Zisha Clay",
      瓷: "Porcelain",
      宣纸: "Xuan Paper",
      其他: "Other"
    },
    project: {
      "欧亚国家名片-中国文化邮票": "Eurasian National Calling Cards: Chinese Culture Stamps",
      "走向胜利": "Marching Toward Victory",
      "人民大会堂藏品": "Great Hall of the People Collection",
      "毛泽东诗词精选": "Selected Mao Zedong Poems"
    }
  }
};

function assetUrl(path) {
  if (!path) return "";
  if (/^https?:/i.test(path)) return path;
  if (path.startsWith("/")) return `${siteBase}${path}`;
  return `${siteBase}/${path.replace(/^\.?\//, "")}`;
}

function dataUrl(fileName) {
  return `${siteBase}/data/${fileName}`;
}

function textOf(item, zhKey, enKey) {
  if (!item) return "";
  if (state.lang === "en" && item[enKey]) return item[enKey];
  return item[zhKey] || item[enKey] || "";
}

function localizedField(item, baseKey) {
  return textOf(item, `${baseKey}_zh`, `${baseKey}_en`);
}

function workFacetValue(item, type) {
  return item?.[`${type}_zh`] || "";
}

function workFacetLabel(type, value) {
  if (!value) return "";
  return WORK_FILTER_LABELS[state.lang]?.[type]?.[value] || value;
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function uniqueValues(values) {
  return [...new Set(values)];
}

function parseHash() {
  const raw = window.location.hash.replace(/^#\/?/, "");
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
  window.location.hash = route;
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

function specRow(label, value) {
  if (!value) return "";
  return `
    <div class="detail-spec-row">
      <div class="detail-label body">${escapeHtml(label)}</div>
      <div class="body">${escapeHtml(value)}</div>
    </div>
  `;
}

function detailLinkRow(label, url) {
  const labels = splitLinkField(label);
  const urls = splitLinkField(url);
  if (!urls.length) return "";
  const usePairedLabels = labels.length === urls.length && urls.length > 1;
  const rowLabel = usePairedLabels ? "" : labels[0] || "";
  const linkMarkup = urls
    .map((entry, index) => {
      const linkText = usePairedLabels ? labels[index] : entry;
      return `<a class="detail-link-anchor" href="${escapeHtml(entry)}" target="_blank" rel="noreferrer">${escapeHtml(linkText)}</a>`;
    })
    .join('<span class="detail-link-separator"> / </span>');
  return `
    <div class="detail-link-row body">
      ${rowLabel ? `<span class="detail-link-label">${escapeHtml(rowLabel)}</span>` : ""}
      ${linkMarkup}
    </div>
  `;
}

function imageOrPlaceholder(path, alt, className, fit = "cover") {
  if (!path) {
    return `<div class="${className}"><div class="empty-state">${escapeHtml(currentUI().noImage)}</div></div>`;
  }
  return `
    <div class="${className}">
      <img src="${assetUrl(path)}" alt="${escapeHtml(alt)}" loading="lazy" style="object-fit:${fit};">
    </div>
  `;
}

function paragraphs(value) {
  if (!value) return `<p class="body">${escapeHtml(currentUI().noContent)}</p>`;
  return String(value)
    .split(/\n+/)
    .filter(Boolean)
    .map((paragraph) => `<p class="body">${escapeHtml(paragraph)}</p>`)
    .join("");
}

function plainSnippet(value, limit = 180) {
  return String(value || "").replace(/\s+/g, " ").trim().slice(0, limit);
}

function splitLinkField(value) {
  return String(value || "")
    .split(/[\n;]+/)
    .map((part) => part.trim())
    .filter(Boolean);
}

function searchEntries(query) {
  const keyword = (query || "").trim().toLowerCase();
  if (!keyword) return [];
  const sources = [
    ...siteData.works.map((item) => ({
      type: "work",
      route: `works/${item.id}`,
      title: textOf(item, "title_zh", "title_en"),
      snippet: [
        item.description_zh,
        item.description_en,
        item.project_zh,
        item.project_en,
        item.material_zh,
        item.material_en,
        item.size_zh,
        item.size_en,
        item.location_zh,
        item.location_en,
        item.year
      ]
        .filter(Boolean)
        .join(" ")
    })),
    ...siteData.exhibitions.map((item) => ({
      type: "exhibition",
      route: `exhibitions/${item.id}`,
      title: textOf(item, "title_zh", "title_en"),
      snippet: [item.description_zh, item.description_en, item.location_zh, item.location_en, item.year].filter(Boolean).join(" ")
    })),
    ...siteData.news.map((item) => ({
      type: "news",
      route: `news/${item.id}`,
      title: textOf(item, "title_zh", "title_en"),
      snippet: [item.content_zh, item.content_en, item.date].filter(Boolean).join(" ")
    }))
  ];

  return sources.filter((item) => `${item.title} ${item.snippet}`.toLowerCase().includes(keyword));
}

function headerMarkup(currentPage, route) {
  const profile = siteData.profile;
  const nav = currentUI().nav;
  const copy = currentUI();
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
        <img class="seal-mark" src="${assetUrl(profile.brand.seal_image)}" alt="印章" loading="eager">
        <span class="brand-name">
          <img class="brand-signature" src="${assetUrl(profile.brand.signature_image)}" alt="${escapeHtml(profile.artist_name_zh)}" loading="eager">
          <span class="brand-en">${escapeHtml(profile.artist_name_en)}</span>
        </span>
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
        <form class="search-box" data-search-form>
          <input class="search-input" type="search" name="q" value="${escapeHtml(route.page === "search" ? route.query : state.searchQuery)}" placeholder="${escapeHtml(copy.searchPlaceholder)}" aria-label="${escapeHtml(copy.search)}">
          <button class="search-submit" type="submit" aria-label="${escapeHtml(copy.search)}">⌕</button>
        </form>
        <div class="lang-switch">
          <button class="lang-btn ${state.lang === "zh" ? "active" : ""}" data-lang="zh">中</button>
          <button class="lang-btn ${state.lang === "en" ? "active" : ""}" data-lang="en">EN</button>
        </div>
      </div>
    </header>
  `;
}

function contactMarkup() {
  const profile = siteData.profile;
  const copy = currentUI().home;
  return `
    <section class="section contact-section">
      <div class="contact">
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

function workCardMarkup(item, index = 0) {
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
          <button class="year-node ${String(activeYear) === String(year) ? "current" : ""}" data-year-scope="${scope}" data-year-target="${scope}-${year}" data-year-value="${year}">
            ${escapeHtml(year)}
          </button>`
        )
        .join("")}
    </aside>
  `;
}

function homeMarkup() {
  const profile = siteData.profile;
  const copy = currentUI().home;
  const featuredWorks = siteData.works.slice(0, 6);
  const recentExhibitions = sortByYearDesc(siteData.exhibitions).slice(0, 1);

  return `
    <section class="hero">
      <div class="hero-art" style="background-image:linear-gradient(to bottom, rgba(17, 17, 17, 0.06), rgba(17, 17, 17, 0.22)), url('${assetUrl(profile.hero.background_image)}')"></div>
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
  const copy = currentUI().exhibitions;
  const groups = groupByYear(siteData.exhibitions);
  if (!state.activeExhibitionYear && groups.length) state.activeExhibitionYear = groups[0].year;
  return `
    <section class="section">
      <div class="h1" style="margin-bottom:40px;">${escapeHtml(copy.title)}</div>
      ${groupedListingMarkup(groups, "exhibitions", state.activeExhibitionYear, exhibitionCardMarkup)}
    </section>
  `;
}

function newsMarkup() {
  const copy = currentUI().news;
  const groups = groupByYear(siteData.news);
  if (!state.activeNewsYear && groups.length) state.activeNewsYear = groups[0].year;
  return `
    <section class="section">
      <div class="h1" style="margin-bottom:40px;">${escapeHtml(copy.title)}</div>
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
      <div class="section-kicker body">${escapeHtml(copy.search)}</div>
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
  const profile = siteData.profile;
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
  const selected = state.selectedMedia && gallery.includes(state.selectedMedia) ? state.selectedMedia : gallery[0] || "";
  const project = localizedField(item, "project");
  const material = localizedField(item, "material");
  const size = localizedField(item, "size");
  const location = localizedField(item, "location");

  return `
    <section class="detail-page works-shell">
      <button class="back-link body" data-route="works">${escapeHtml(copy.backWorks)}</button>
      <div class="detail-subnav">
        <div>
          <div class="section-kicker body">${escapeHtml(copy.workTemplate)}</div>
          <div class="h2">${escapeHtml(textOf(item, "title_zh", "title_en"))}</div>
        </div>
        <div class="filters">
          <button class="filter-btn ${!state.worksFilter.project && !state.worksFilter.material ? "active" : ""}" data-reset-filters="works">${escapeHtml(currentUI().works.all)}</button>
          ${dropdownMarkup("project", currentUI().works.filterProject, currentUI().works.allProjects, WORK_FILTERS.project, state.worksFilter.project)}
          ${dropdownMarkup("material", currentUI().works.filterMaterial, currentUI().works.allMaterials, WORK_FILTERS.material, state.worksFilter.material)}
        </div>
      </div>
      <div class="detail-hero work-hero">
        ${selected ? `<img src="${assetUrl(selected)}" alt="${escapeHtml(textOf(item, "title_zh", "title_en"))}" loading="lazy">` : `<div class="empty-state">${escapeHtml(currentUI().noImage)}</div>`}
      </div>
      ${gallery.length
        ? `
          <div class="detail-thumbs">
            ${gallery
              .map(
                (path, index) => `
                <button class="detail-thumb ${selected === path ? "active" : ""}" data-media="${escapeHtml(path)}" aria-label="media-${index + 1}">
                  <img src="${assetUrl(path)}" alt="thumbnail-${index + 1}" loading="lazy">
                </button>`
              )
              .join("")}
          </div>`
        : ""}
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
  const groups = groupByYear(siteData.exhibitions);
  const activeYear = String(yearValue(item) || "");
  const gallery = [item.cover_image, ...(item.gallery_images || [])].filter(Boolean);
  const selected = state.selectedMedia && gallery.includes(state.selectedMedia) ? state.selectedMedia : gallery[0] || "";

  return `
    <section class="detail-page">
      <button class="back-link body" data-route="exhibitions">${escapeHtml(copy.backExhibitions)}</button>
      <div class="detail-content-shell">
        ${yearRailMarkup(groups, "exhibitions", activeYear)}
        <div class="detail-content-main">
          <div class="tag">${escapeHtml(copy.exhibitionTemplate)}</div>
          <div class="h2" style="max-width:980px;margin-top:12px;">${escapeHtml(textOf(item, "title_zh", "title_en"))}</div>
          <div class="detail-hero exhibition-hero" style="margin-top:32px;">
            ${selected ? `<img src="${assetUrl(selected)}" alt="${escapeHtml(textOf(item, "title_zh", "title_en"))}" loading="lazy" style="object-fit:contain;">` : `<div class="empty-state">${escapeHtml(currentUI().noImage)}</div>`}
          </div>
          ${gallery.length
            ? `
              <div class="detail-thumbs">
                ${gallery
                  .map(
                    (path, index) => `
                    <button class="detail-thumb ${selected === path ? "active" : ""}" data-media="${escapeHtml(path)}" aria-label="media-${index + 1}">
                      <img src="${assetUrl(path)}" alt="thumbnail-${index + 1}" loading="lazy">
                    </button>`
                  )
                  .join("")}
              </div>`
            : ""}
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
  const groups = groupByYear(siteData.news);
  const activeYear = String(yearValue(item) || "");
  const gallery = [item.cover_image, ...(item.gallery_images || [])].filter(Boolean);
  const selected = state.selectedMedia && gallery.includes(state.selectedMedia) ? state.selectedMedia : gallery[0] || "";
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
          <div class="detail-hero exhibition-hero" style="margin-top:32px;">
            ${selected ? `<img src="${assetUrl(selected)}" alt="${escapeHtml(textOf(item, "title_zh", "title_en"))}" loading="lazy" style="object-fit:contain;">` : `<div class="empty-state">${escapeHtml(currentUI().noImage)}</div>`}
          </div>
          ${gallery.length
            ? `
              <div class="detail-thumbs">
                ${gallery
                  .map(
                    (path, index) => `
                    <button class="detail-thumb ${selected === path ? "active" : ""}" data-media="${escapeHtml(path)}" aria-label="media-${index + 1}">
                      <img src="${assetUrl(path)}" alt="thumbnail-${index + 1}" loading="lazy">
                    </button>`
                  )
                  .join("")}
              </div>`
            : ""}
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

function render() {
  if (!siteData) return;
  const route = parseHash();
  const currentPage =
    route.page === "work-detail"
      ? "works"
      : route.page === "exhibition-detail"
        ? "exhibitions"
        : route.page === "news-detail"
          ? "news"
          : route.page;

  app.className = "site";
  app.innerHTML = `
    ${headerMarkup(currentPage, route)}
    <main class="page">${bodyMarkup(route)}</main>
    ${contactMarkup()}
    ${footerMarkup()}
  `;
  bindUI();
}

function bindUI() {
  app.querySelectorAll("[data-route]").forEach((node) => {
    node.addEventListener("click", () => {
      state.selectedMedia = null;
      state.openFilter = null;
      go(node.dataset.route);
    });
  });

  app.querySelectorAll("[data-lang]").forEach((node) => {
    node.addEventListener("click", () => {
      state.lang = node.dataset.lang;
      render();
    });
  });

  app.querySelectorAll("[data-search-form]").forEach((node) => {
    node.addEventListener("submit", (event) => {
      event.preventDefault();
      const formData = new FormData(node);
      const query = String(formData.get("q") || "").trim();
      state.searchQuery = query;
      go(searchRoute(query));
    });
  });

  app.querySelectorAll("[data-filter-toggle]").forEach((node) => {
    node.addEventListener("click", (event) => {
      event.stopPropagation();
      const next = node.dataset.filterToggle;
      state.openFilter = state.openFilter === next ? null : next;
      render();
    });
  });

  app.querySelectorAll("[data-filter-group]").forEach((node) => {
    node.addEventListener("click", () => {
      const { filterGroup, filterValue } = node.dataset;
      state.worksFilter[filterGroup] = filterValue;
      state.openFilter = null;
      render();
    });
  });

  app.querySelectorAll("[data-reset-filters='works']").forEach((node) => {
    node.addEventListener("click", () => {
      state.worksFilter = { project: "", material: "" };
      state.openFilter = null;
      render();
    });
  });

  app.querySelectorAll("[data-media]").forEach((node) => {
    node.addEventListener("click", () => {
      state.selectedMedia = node.dataset.media;
      render();
    });
  });

  app.querySelectorAll("[data-year-target]").forEach((node) => {
    node.addEventListener("click", () => {
      const scope = node.dataset.yearScope;
      const value = node.dataset.yearValue;
      if (scope === "exhibitions") state.activeExhibitionYear = value;
      if (scope === "news") state.activeNewsYear = value;
      render();
      requestAnimationFrame(() => {
        const target = document.getElementById(node.dataset.yearTarget);
        if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
  });

  document.addEventListener(
    "click",
    () => {
      if (state.openFilter !== null) {
        state.openFilter = null;
        render();
      }
    },
    { once: true }
  );
}

async function loadData() {
  const [profile, works, exhibitions, news] = await Promise.all([
    fetch(dataUrl("profile.json")).then((res) => res.json()),
    fetch(dataUrl("works.json")).then((res) => res.json()),
    fetch(dataUrl("exhibitions.json")).then((res) => res.json()),
    fetch(dataUrl("news.json")).then((res) => res.json())
  ]);
  siteData = { profile, works, exhibitions, news };
}

async function init() {
  try {
    await loadData();
    if (!window.location.hash) {
      go("home");
      return;
    }
    const route = parseHash();
    state.searchQuery = route.page === "search" ? route.query : "";
    render();
  } catch (error) {
    app.className = "app-error";
    app.textContent = currentUI().loadError;
    console.error(error);
  }
}

window.addEventListener("hashchange", () => {
  const route = parseHash();
  state.selectedMedia = null;
  state.openFilter = null;
  state.searchQuery = route.page === "search" ? route.query : "";
  render();
});

init();

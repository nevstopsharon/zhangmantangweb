(function () {
  const site = window.ZMTSite;
  const { state, ui, siteBase, WORK_FILTER_LABELS } = site;

  function currentUI() {
    return ui[state.lang];
  }

  function assetUrl(path) {
    if (!path) return "";
    if (/^https?:/i.test(path)) return path;
    if (path.startsWith("/")) {
      return siteBase === "/" ? path : `${siteBase}${path}`;
    }
    return siteBase === "/" ? `/${path.replace(/^\.?\//, "")}` : `${siteBase}/${path.replace(/^\.?\//, "")}`;
  }

  function dataUrl(fileName) {
    const base = siteBase === "/" ? "" : siteBase;
    return `${base}/data/${fileName}`;
  }

  function textOf(item, zhKey, enKey) {
    if (!item) return "";
    if (state.lang === "en") return item[enKey] || "";
    return item[zhKey] || "";
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

  function specRow(label, value) {
    if (!value) return "";
    return `
      <div class="detail-spec-row">
        <div class="detail-label body">${escapeHtml(label)}</div>
        <div class="body">${escapeHtml(value)}</div>
      </div>
    `;
  }

  function splitLinkField(value) {
    return String(value || "")
      .split(/[\n;]+/)
      .map((part) => part.trim())
      .filter(Boolean);
  }

  function detailLinkRow(label, url) {
    const labels = splitLinkField(label);
    const urls = splitLinkField(url);
    if (!urls.length) return "";
    const usePairedLabels = labels.length === urls.length && urls.length > 1;
    const rowLabel = usePairedLabels ? "" : labels[0] || "";
    const linkMarkup = urls
      .map((entry, index) => {
        if (entry.includes("player.bilibili.com")) {
          return `<div class="bilibili-player"><iframe src="${escapeHtml(entry)}" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true" style="width:100%;height:400px;max-width:800px;"></iframe></div>`;
        }
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
      // 确保 className 是字符串
      const safeClassName = String(className || "");
      return `<div class="${safeClassName}"><div class="empty-state">${escapeHtml(currentUI().noImage)}</div></div>`;
    }
    // 确保 className 是字符串
    const safeClassName = String(className || "");
    // 确保 alt 是字符串
    const safeAlt = String(alt || "");
    // 确保 fit 是有效的值
    const safeFit = ["cover", "contain", "fill", "none", "scale-down"].includes(fit) ? fit : "cover";
    
    return `
      <div class="${safeClassName}">
        <img src="${assetUrl(path)}" alt="${safeAlt}" loading="lazy" style="object-fit:${safeFit};">
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

  function detailMediaMarkup(gallery, title, heroClass, fit = "contain", inlineStyle = "") {
    const media = Array.isArray(gallery) ? gallery.filter(Boolean) : [];
    const selected = state.selectedMedia && media.includes(state.selectedMedia) ? state.selectedMedia : media[0] || "";
    const currentIndex = media.indexOf(selected);
    const hasMultiple = media.length > 1;
    const prevDisabled = currentIndex <= 0;
    const nextDisabled = currentIndex === -1 || currentIndex >= media.length - 1;
    const galleryValue = escapeHtml(media.join("|"));
    const heroStyle = fit ? ` style="object-fit:${fit};"` : "";
    const wrapperStyle = inlineStyle ? ` style="${inlineStyle}"` : "";

    return `
      <div class="detail-media"${wrapperStyle}>
        <div class="detail-media-frame ${hasMultiple ? "has-nav" : ""}">
          ${hasMultiple ? `
            <button class="detail-media-nav is-prev" type="button" data-media-nav="prev" data-media-index="${currentIndex}" data-media-gallery="${galleryValue}" aria-label="${escapeHtml(currentUI().detail.previousImage)}" ${prevDisabled ? "disabled" : ""}>
              <span class="detail-media-nav-icon" aria-hidden="true"></span>
            </button>` : ""}
          <div class="detail-hero ${heroClass}">
            ${selected ? `<img src="${assetUrl(selected)}" alt="${escapeHtml(title)}" loading="lazy"${heroStyle}>` : `<div class="empty-state">${escapeHtml(currentUI().noImage)}</div>`}
          </div>
          ${hasMultiple ? `
            <button class="detail-media-nav is-next" type="button" data-media-nav="next" data-media-index="${currentIndex}" data-media-gallery="${galleryValue}" aria-label="${escapeHtml(currentUI().detail.nextImage)}" ${nextDisabled ? "disabled" : ""}>
              <span class="detail-media-nav-icon" aria-hidden="true"></span>
            </button>` : ""}
        </div>
        ${media.length
          ? `
            <div class="detail-thumbs">
              ${media
                .map(
                  (path, index) => `
                  <button class="detail-thumb ${selected === path ? "active" : ""}" data-media="${escapeHtml(path)}" aria-label="media-${index + 1}">
                    <img src="${assetUrl(path)}" alt="thumbnail-${index + 1}" loading="lazy">
                  </button>`
                )
                .join("")}
            </div>`
          : ""}
      </div>
    `;
  }

  Object.assign(site, {
    currentUI,
    assetUrl,
    dataUrl,
    textOf,
    localizedField,
    workFacetValue,
    workFacetLabel,
    escapeHtml,
    uniqueValues,
    specRow,
    splitLinkField,
    detailLinkRow,
    imageOrPlaceholder,
    paragraphs,
    plainSnippet,
    detailMediaMarkup
  });
})();

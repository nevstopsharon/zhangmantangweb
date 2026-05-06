/**
 * 主应用模块
 * 初始化应用，处理路由和事件绑定
 */
(function () {
  const site = window.ZMTSite;
  const { appRoot, state, currentUI, go, readCurrentRoute, searchRoute, loadData, escapeHtml, setLanguageInUrl, languageFromUrl, setRouteContext, legacyHashRoute, routeHref } = site;
  
  /**
 * 全局事件处理器是否已绑定
 * @type {boolean}
 */
let globalHandlersBound = false;

/**
 * 时间轴滚动观察者
 * @type {IntersectionObserver|null}
 */
let yearSectionObserver = null;

/**
 * 初始化时间轴滚动监听
 */
function initYearScrollObserver() {
  if (yearSectionObserver) {
    yearSectionObserver.disconnect();
  }
  
  yearSectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          const [scope, year] = id.split("-");
          if (scope === "exhibitions" && year) {
            state.activeExhibitionYear = year;
          }
          if (scope === "news" && year) {
            state.activeNewsYear = year;
          }
          updateYearRailHighlight(scope, year);
        }
      });
    },
    {
      rootMargin: "-15% 0% -35% 0%",
      threshold: 0.3
    }
  );

  document.querySelectorAll('[id^="exhibitions-"], [id^="news-"]').forEach((section) => {
    yearSectionObserver.observe(section);
  });
}

/**
 * 更新时间轴高亮
 * @param {string} scope - 范围 exhibitions|news
 * @param {string} year - 年份
 */
function updateYearRailHighlight(scope, year) {
  const yearNodes = document.querySelectorAll(`.year-node[data-year-scope="${scope}"]`);
  yearNodes.forEach((node) => {
    const isActive = node.dataset.yearValue === year;
    node.classList.toggle("current", isActive);
    node.setAttribute("aria-current", isActive ? "true" : "false");
  });
}
  
  /**
   * 渲染请求 ID，用于防止并发渲染冲突
   * @type {number}
   */
  let renderRequestId = 0;

  /**
   * 队列年份滚动
   * @param {string} scope - 范围
   * @param {string} value - 年份值
   * @param {string} targetId - 目标元素 ID
   */
  function queueYearScroll(scope, value, targetId) {
    state.pendingYearScroll = { scope, value, targetId };
  }

  function initInkHeroReveal() {
    appRoot.querySelectorAll("[data-ink-hero]").forEach((hero) => {
      const canvas = hero.querySelector("[data-ink-canvas]");
      const coverSrc = hero.dataset.coverSrc;
      if (!canvas || !coverSrc || canvas.dataset.inkInitialized === "true") return;

      canvas.dataset.inkInitialized = "true";
      const context = canvas.getContext("2d", { willReadFrequently: false });
      const cover = new Image();
      const pointer = { x: 0, y: 0 };
      let inkStrength = 0;
      let targetStrength = 0;
      let ready = false;
      let startTime = performance.now();
      let animationFrame = 0;

      cover.src = coverSrc;

      function fitImage(image, width, height) {
        const scale = Math.max(width / image.naturalWidth, height / image.naturalHeight);
        const drawWidth = image.naturalWidth * scale;
        const drawHeight = image.naturalHeight * scale;
        const x = (width - drawWidth) / 2;
        const y = (height - drawHeight) / 2;
        context.drawImage(image, x, y, drawWidth, drawHeight);
      }

      function resizeCanvas() {
        const rect = hero.getBoundingClientRect();
        const ratio = window.devicePixelRatio || 1;
        canvas.width = Math.max(1, Math.round(rect.width * ratio));
        canvas.height = Math.max(1, Math.round(rect.height * ratio));
        canvas.style.width = `${rect.width}px`;
        canvas.style.height = `${rect.height}px`;
        context.setTransform(ratio, 0, 0, ratio, 0, 0);
        ready = true;
      }

      function repaintCover() {
        const rect = hero.getBoundingClientRect();
        context.globalCompositeOperation = "source-over";
        context.globalAlpha = 1;
        context.clearRect(0, 0, rect.width, rect.height);
        fitImage(cover, rect.width, rect.height);
      }

      function inkBloom(x, y, strength, time) {
        if (strength <= 0.01) return;

        const pulse = 1 + Math.sin(time * 0.003) * 0.035;
        const baseRadius = (72 + strength * 92) * pulse;
        const satelliteCount = 20;

        context.save();
        context.globalCompositeOperation = "destination-out";

        const core = context.createRadialGradient(x, y, baseRadius * 0.04, x, y, baseRadius);
        core.addColorStop(0, `rgba(0,0,0,${0.98 * strength})`);
        core.addColorStop(0.22, `rgba(0,0,0,${0.82 * strength})`);
        core.addColorStop(0.6, `rgba(0,0,0,${0.32 * strength})`);
        core.addColorStop(1, "rgba(0,0,0,0)");
        context.fillStyle = core;
        context.beginPath();
        context.arc(x, y, baseRadius, 0, Math.PI * 2);
        context.fill();

        for (let index = 0; index < satelliteCount; index += 1) {
          const angle = index * 2.399 + Math.sin(time * 0.001 + index) * 0.16;
          const ring = baseRadius * (0.18 + (index % 5) * 0.105);
          const offset = ring * (0.86 + Math.sin(time * 0.002 + index * 1.7) * 0.14);
          const px = x + Math.cos(angle) * offset;
          const py = y + Math.sin(angle) * offset * 0.72;
          const radius = baseRadius * (0.13 + (index % 4) * 0.034);
          const alpha = strength * (0.2 + (index % 3) * 0.08);
          const blot = context.createRadialGradient(px, py, radius * 0.05, px, py, radius);
          blot.addColorStop(0, `rgba(0,0,0,${alpha})`);
          blot.addColorStop(0.62, `rgba(0,0,0,${alpha * 0.4})`);
          blot.addColorStop(1, "rgba(0,0,0,0)");
          context.fillStyle = blot;
          context.beginPath();
          context.arc(px, py, radius, 0, Math.PI * 2);
          context.fill();
        }

        context.globalAlpha = strength * 0.22;
        context.fillStyle = "rgba(0,0,0,1)";
        for (let index = 0; index < 26; index += 1) {
          const angle = index * 1.87;
          const spread = baseRadius * (0.48 + (index % 6) * 0.085);
          const px = x + Math.cos(angle) * spread;
          const py = y + Math.sin(angle) * spread;
          context.beginPath();
          context.arc(px, py, 2 + (index % 4), 0, Math.PI * 2);
          context.fill();
        }

        context.restore();
      }

      function pointFromEvent(event) {
        const rect = canvas.getBoundingClientRect();
        pointer.x = event.clientX - rect.left;
        pointer.y = event.clientY - rect.top;
      }

      function setPointer(event) {
        pointFromEvent(event);
        targetStrength = 1;
      }

      function animate(time) {
        if (!hero.isConnected) {
          window.cancelAnimationFrame(animationFrame);
          return;
        }

        if (ready && cover.complete && cover.naturalWidth) {
          inkStrength += (targetStrength - inkStrength) * 0.09;
          repaintCover();
          inkBloom(pointer.x, pointer.y, inkStrength, time - startTime);
        }
        animationFrame = window.requestAnimationFrame(animate);
      }

      cover.onload = () => {
        resizeCanvas();
        repaintCover();
        hero.classList.add("ink-ready");
      };

      if (cover.complete && cover.naturalWidth) {
        resizeCanvas();
        repaintCover();
        hero.classList.add("ink-ready");
      }

      window.addEventListener("resize", () => {
        if (!hero.isConnected) return;
        resizeCanvas();
        repaintCover();
      });

      hero.addEventListener("pointerenter", setPointer);
      hero.addEventListener("pointermove", setPointer);
      hero.addEventListener("pointerleave", () => {
        targetStrength = 0;
      });
      hero.addEventListener("pointerdown", (event) => {
        hero.setPointerCapture(event.pointerId);
        setPointer(event);
      });
      hero.addEventListener("pointerup", () => {
        targetStrength = 0;
      });

      animationFrame = window.requestAnimationFrame(animate);
    });
  }

  /**
   * 执行待处理的年份滚动
   */
  function flushPendingYearScroll() {
    const pending = state.pendingYearScroll;
    if (!pending?.targetId) return;
    requestAnimationFrame(() => {
      const target = document.getElementById(pending.targetId);
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
      state.pendingYearScroll = null;
    });
  }

  /**
   * 聚焦主内容
   */
  function focusMainContent() {
    const mainContent = appRoot.querySelector("#main-content");
    if (!mainContent) return;
    requestAnimationFrame(() => {
      mainContent.focus({ preventScroll: true });
    });
  }

  /**
   * 渲染页面
   * @param {Object} options - 选项
   * @param {boolean} options.focusMain - 是否聚焦主内容
   */
  async function renderPage(options = {}) {
    const requestId = ++renderRequestId;
    if (requestId !== renderRequestId) return;
    site.render();
    site.syncDocumentState();
    flushPendingYearScroll();
    requestAnimationFrame(() => {
      initYearScrollObserver();
    });
    if (options.focusMain) {
      focusMainContent();
    }
  }

  /**
   * 绑定搜索建议
   * @param {HTMLElement} shell - 搜索容器元素
   */
  function bindSearchSuggestions(shell) {
    const input = shell.querySelector(".search-input");
    const panel = shell.querySelector("[data-search-suggestions]");
    if (!input || !panel) return;
    let activeIndex = -1;
    const optionIdPrefix = input.id || "search-option";

    const applyActiveState = () => {
      const options = [...panel.querySelectorAll("[data-search-suggestion]")];
      options.forEach((node, index) => {
        const isActive = index === activeIndex;
        node.classList.toggle("is-active", isActive);
        node.setAttribute("aria-selected", String(isActive));
      });
      const activeOption = activeIndex >= 0 ? options[activeIndex] : null;
      if (activeOption?.id) {
        input.setAttribute("aria-activedescendant", activeOption.id);
      } else {
        input.removeAttribute("aria-activedescendant");
      }
    };

    const paintSuggestions = () => {
      const suggestions = site.searchSuggestions(input.value);
      panel.innerHTML = suggestions
        .map(
          (item, index) => `
            <button id="${optionIdPrefix}-suggestion-${index}" class="search-suggestion" type="button" role="option" aria-selected="false" data-search-suggestion="${escapeHtml(item.label)}" ${item.route ? `data-search-route="${escapeHtml(item.route)}"` : ""}>
              ${escapeHtml(item.label)}
            </button>`
        )
        .join("");
      activeIndex = -1;
      applyActiveState();
      return suggestions.length > 0;
    };

    const syncSuggestionPanel = () => {
      const hasSuggestions = paintSuggestions();
      const shouldShow = document.activeElement === input && hasSuggestions;
      panel.classList.toggle("is-visible", shouldShow);
      panel.setAttribute("aria-hidden", String(!shouldShow));
      input.setAttribute("aria-expanded", String(shouldShow));
      shell.setAttribute("aria-expanded", String(shouldShow));
      if (!shouldShow) {
        activeIndex = -1;
        applyActiveState();
      }
    };

    const closeSuggestionPanel = () => {
      panel.classList.remove("is-visible");
      panel.setAttribute("aria-hidden", "true");
      input.setAttribute("aria-expanded", "false");
      shell.setAttribute("aria-expanded", "false");
      activeIndex = -1;
      applyActiveState();
    };

    const activateSuggestion = (button) => {
      if (!button) return;
      const query = button.dataset.searchSuggestion || "";
      const targetRoute = button.dataset.searchRoute || "";
      if (!query) return;
      input.value = query;
      state.searchQuery = query;
      state.mobileSearchOpen = false;
      state.mobileMenuOpen = false;
      closeSuggestionPanel();
      if (targetRoute) {
        go(targetRoute);
      } else {
        go(searchRoute(query));
      }
    };

    shell.addEventListener("click", (event) => {
      event.stopPropagation();
    });

    input.addEventListener("focus", syncSuggestionPanel);
    input.addEventListener("click", syncSuggestionPanel);
    input.addEventListener("input", () => {
      state.searchQuery = input.value.trim();
      syncSuggestionPanel();
    });
    input.addEventListener("keydown", (event) => {
      const options = [...panel.querySelectorAll("[data-search-suggestion]")];
      if (!options.length) return;
      if (event.key === "ArrowDown") {
        event.preventDefault();
        activeIndex = activeIndex < 0 ? 0 : Math.min(activeIndex + 1, options.length - 1);
        applyActiveState();
        panel.classList.add("is-visible");
        panel.setAttribute("aria-hidden", "false");
        input.setAttribute("aria-expanded", "true");
        shell.setAttribute("aria-expanded", "true");
        return;
      }
      if (event.key === "ArrowUp") {
        event.preventDefault();
        activeIndex = activeIndex <= 0 ? 0 : activeIndex - 1;
        applyActiveState();
        return;
      }
      if (event.key === "Escape") {
        event.preventDefault();
        closeSuggestionPanel();
        return;
      }
      if (event.key === "Enter" && activeIndex >= 0) {
        event.preventDefault();
        activateSuggestion(options[activeIndex]);
      }
    });

    panel.addEventListener("mousedown", (event) => {
      if (event.target.closest("[data-search-suggestion]")) {
        event.preventDefault();
      }
    });

    panel.addEventListener("click", (event) => {
      const button = event.target.closest("[data-search-suggestion]");
      if (!button) return;
      activateSuggestion(button);
    });
  }

  /**
   * 绑定 UI 事件
   */
  function bindUI() {
    appRoot.querySelectorAll("[data-route]").forEach((node) => {
      node.addEventListener("click", () => {
        state.selectedMedia = null;
        state.openFilter = null;
        state.mobileMenuOpen = false;
        state.mobileSearchOpen = false;
        go(node.dataset.route);
      });
    });

    appRoot.querySelectorAll("[data-lang]").forEach((node) => {
      node.addEventListener("click", async () => {
        state.lang = node.dataset.lang;
        state.mobileMenuOpen = false;
        state.mobileSearchOpen = false;
        setLanguageInUrl(state.lang);
        await loadData();
        void renderPage({ focusMain: true });
      });
    });

    appRoot.querySelectorAll("[data-search-form]").forEach((node) => {
      node.addEventListener("submit", (event) => {
        event.preventDefault();
        const formData = new FormData(node);
        const query = String(formData.get("q") || "").trim();
        state.searchQuery = query;
        state.mobileMenuOpen = false;
        state.mobileSearchOpen = false;
        go(searchRoute(query));
      });
    });

    appRoot.querySelectorAll("[data-search-shell]").forEach((node) => {
      bindSearchSuggestions(node);
    });

    appRoot.querySelectorAll("[data-mobile-menu-toggle]").forEach((node) => {
      node.addEventListener("click", (event) => {
        event.stopPropagation();
        state.mobileMenuOpen = !state.mobileMenuOpen;
        state.mobileSearchOpen = false;
        void renderPage();
      });
    });

    appRoot.querySelectorAll("[data-mobile-search-toggle]").forEach((node) => {
      node.addEventListener("click", (event) => {
        event.stopPropagation();
        state.mobileSearchOpen = !state.mobileSearchOpen;
        state.mobileMenuOpen = false;
        void renderPage();
      });
    });

    appRoot.querySelectorAll("[data-mobile-close]").forEach((node) => {
      node.addEventListener("click", (event) => {
        event.stopPropagation();
        state.mobileMenuOpen = false;
        state.mobileSearchOpen = false;
        void renderPage();
      });
    });

    if (state.mobileSearchOpen) {
      const mobileSearchInput = appRoot.querySelector("#mobile-search-input");
      if (mobileSearchInput) {
        requestAnimationFrame(() => {
          mobileSearchInput.focus({ preventScroll: true });
          mobileSearchInput.select();
        });
      }
    }

    initInkHeroReveal();

    appRoot.querySelectorAll("[data-filter-toggle]").forEach((node) => {
      node.addEventListener("click", (event) => {
        event.stopPropagation();
        const next = node.dataset.filterToggle;
        state.openFilter = state.openFilter === next ? null : next;
        renderPage();
      });
    });

    appRoot.querySelectorAll("[data-filter-group]").forEach((node) => {
      node.addEventListener("click", () => {
        const { filterGroup, filterValue } = node.dataset;
        state.worksFilter[filterGroup] = filterValue;
        state.openFilter = null;
        void renderPage();
      });
    });

    appRoot.querySelectorAll("[data-reset-filters='works']").forEach((node) => {
      node.addEventListener("click", () => {
        state.worksFilter = { project: "", material: "" };
        state.openFilter = null;
        void renderPage();
      });
    });

    appRoot.querySelectorAll("[data-media]").forEach((node) => {
      node.addEventListener("click", () => {
        state.selectedMedia = node.dataset.media;
        void renderPage();
      });
    });

    appRoot.querySelectorAll("[data-media-nav]").forEach((node) => {
      node.addEventListener("click", () => {
        const gallery = String(node.dataset.mediaGallery || "")
          .split("|")
          .map((value) => value.trim())
          .filter(Boolean);
        const currentIndex = Number(node.dataset.mediaIndex || -1);
        if (!gallery.length || currentIndex < 0) return;
        const offset = node.dataset.mediaNav === "next" ? 1 : -1;
        const nextIndex = currentIndex + offset;
        if (nextIndex < 0 || nextIndex >= gallery.length) return;
        state.selectedMedia = gallery[nextIndex];
        void renderPage();
      });
    });

    appRoot.querySelectorAll("[data-year-target]").forEach((node) => {
      node.addEventListener("click", () => {
        const route = readCurrentRoute();
        const scope = node.dataset.yearScope;
        const value = node.dataset.yearValue;
        const targetId = node.dataset.yearTarget;
        if (scope === "exhibitions") state.activeExhibitionYear = value;
        if (scope === "news") state.activeNewsYear = value;
        if ((route.page === "exhibition-detail" && scope === "exhibitions") || (route.page === "news-detail" && scope === "news")) {
          state.selectedMedia = null;
          queueYearScroll(scope, value, targetId);
          go(scope);
          return;
        }
        queueYearScroll(scope, value, targetId);
        void renderPage();
      });
    });

    if (!globalHandlersBound) {
      document.addEventListener("click", () => {
        let shouldRender = false;
        if (state.openFilter !== null) {
          state.openFilter = null;
          shouldRender = true;
        }
        if (state.mobileMenuOpen || state.mobileSearchOpen) {
          state.mobileMenuOpen = false;
          state.mobileSearchOpen = false;
          shouldRender = true;
        }
        appRoot.querySelectorAll("[data-search-suggestions].is-visible").forEach((node) => {
          node.classList.remove("is-visible");
          node.setAttribute("aria-hidden", "true");
        });
        appRoot.querySelectorAll("[data-search-shell]").forEach((node) => {
          node.setAttribute("aria-expanded", "false");
        });
        appRoot.querySelectorAll(".search-input[aria-expanded='true']").forEach((node) => {
          node.setAttribute("aria-expanded", "false");
        });
        if (shouldRender) {
          void renderPage();
        }
      });
      globalHandlersBound = true;
    }
  }

  /**
   * 初始化图片懒加载
   */
  function initLazyLoading() {
    const lazyImages = document.querySelectorAll('img[loading="lazy"]');
    
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const image = entry.target;
            image.src = image.dataset.src || image.src;
            imageObserver.unobserve(image);
          }
        });
      });
      
      lazyImages.forEach(image => {
        imageObserver.observe(image);
      });
    } else {
      // 降级方案
      lazyImages.forEach(image => {
        image.src = image.dataset.src || image.src;
      });
    }
  }

  /**
   * 初始化应用
   */
  async function init() {
    try {
      state.lang = languageFromUrl();
      const legacyRoute = legacyHashRoute();
      if (window.location.hash && legacyRoute) {
        window.history.replaceState({ route: legacyRoute, lang: state.lang }, "", routeHref(legacyRoute, state.lang));
        setRouteContext(legacyRoute, state.lang);
      } else {
        setRouteContext(site.currentRouteString(), state.lang);
      }
      await loadData();
      const route = readCurrentRoute();
      state.searchQuery = route.page === "search" ? route.query : "";
      await renderPage({ focusMain: true });
      initLazyLoading();
    } catch (error) {
      appRoot.className = "app-error";
      appRoot.textContent = currentUI().loadError;
      console.error(error);
    }
  }

  window.addEventListener("popstate", () => {
    const route = readCurrentRoute();
    state.lang = languageFromUrl();
    state.selectedMedia = null;
    state.openFilter = null;
    state.mobileMenuOpen = false;
    state.mobileSearchOpen = false;
    state.searchQuery = route.page === "search" ? route.query : "";
    void renderPage({ focusMain: true });
  });

  Object.assign(site, {
    renderPage,
    bindUI,
    init
  });

  init();
})();

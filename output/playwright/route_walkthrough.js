async (page) => {
  async function gotoHash(hash) {
    await page.goto(`http://127.0.0.1:8000/site/#${hash}`, { waitUntil: "networkidle" });
    await page.waitForTimeout(250);
  }

  async function imageHealth(selector = "img") {
    const stats = await page.$$eval(selector, (nodes) =>
      nodes.map((img) => ({
        alt: img.getAttribute("alt") || "",
        src: img.getAttribute("src") || "",
        complete: img.complete,
        naturalWidth: img.naturalWidth,
      }))
    );

    return {
      total: stats.length,
      broken: stats
        .filter((item) => !item.complete || item.naturalWidth === 0)
        .map((item) => item.alt || item.src),
    };
  }

  async function textList(selector, limit = 6) {
    const values = await page.$$eval(selector, (nodes) =>
      nodes.map((node) => (node.textContent || "").replace(/\s+/g, " ").trim()).filter(Boolean)
    );
    return values.slice(0, limit);
  }

  const summary = {};

  await gotoHash("works");
  if (await page.locator('[data-reset-filters="works"]').count()) {
    await page.locator('[data-reset-filters="works"]').click();
    await page.waitForTimeout(250);
  }
  await page.screenshot({ path: "./output/playwright/works-list.png", fullPage: true });
  summary.worksList = {
    url: page.url(),
    heading: ((await page.locator("main .h1").first().textContent()) || "").trim(),
    cardCount: await page.locator("main .work-card").count(),
    firstCards: await textList("main .work-card .card-body", 3),
    images: await imageHealth("main .work-card img"),
  };

  await page.locator('[data-filter-toggle="material"]').click();
  await page.locator('[data-filter-group="material"][data-filter-value="瓷"]').click();
  await page.waitForTimeout(250);
  summary.worksFilterPorcelain = {
    cardCount: await page.locator("main .work-card").count(),
    cards: await textList("main .work-card .card-body", 10),
  };

  const firstWork = page.locator('main [data-route^="works/"]').first();
  const firstWorkRoute = await firstWork.getAttribute("data-route");
  await firstWork.click();
  await page.waitForSelector(".detail-page.works-shell");
  await page.screenshot({ path: "./output/playwright/works-detail.png", fullPage: true });
  summary.workDetail = {
    route: firstWorkRoute,
    url: page.url(),
    title: ((await page.locator(".detail-page .h2").first().textContent()) || "").trim(),
    specRows: await textList(".detail-spec-row", 10),
    thumbnails: await page.locator(".detail-thumbs .detail-thumb").count(),
    images: await imageHealth(".detail-page img"),
  };

  await gotoHash("exhibitions");
  await page.screenshot({ path: "./output/playwright/exhibitions-list.png", fullPage: true });
  summary.exhibitionsList = {
    url: page.url(),
    heading: ((await page.locator("main .h1").first().textContent()) || "").trim(),
    cardCount: await page.locator('main [data-route^="exhibitions/"]').count(),
    firstCards: await textList('main [data-route^="exhibitions/"]', 3),
    images: await imageHealth('main [data-route^="exhibitions/"] img'),
  };

  const firstExhibition = page.locator('main [data-route^="exhibitions/"]').first();
  const firstExhibitionRoute = await firstExhibition.getAttribute("data-route");
  await firstExhibition.click();
  await page.waitForTimeout(300);
  await page.screenshot({ path: "./output/playwright/exhibitions-detail.png", fullPage: true });
  summary.exhibitionDetail = {
    route: firstExhibitionRoute,
    url: page.url(),
    title: ((await page.locator(".detail-page .h2").first().textContent()) || "").trim(),
    yearRailCount: await page.locator(".year-rail [data-year-target]").count(),
    specRows: await textList(".detail-spec-row", 10),
    images: await imageHealth(".detail-page img"),
  };

  await gotoHash("news");
  await page.screenshot({ path: "./output/playwright/news-list.png", fullPage: true });
  summary.newsList = {
    url: page.url(),
    heading: ((await page.locator("main .h1").first().textContent()) || "").trim(),
    cardCount: await page.locator('main [data-route^="news/"]').count(),
    firstCards: await textList('main [data-route^="news/"]', 4),
    images: await imageHealth('main [data-route^="news/"] img'),
  };

  const firstNews = page.locator('main [data-route^="news/"]').first();
  const firstNewsRoute = await firstNews.getAttribute("data-route");
  await firstNews.click();
  await page.waitForTimeout(300);
  await page.screenshot({ path: "./output/playwright/news-detail-first.png", fullPage: true });
  summary.newsDetailFirst = {
    route: firstNewsRoute,
    url: page.url(),
    title: ((await page.locator(".detail-page .h2").first().textContent()) || "").trim(),
    linkCount: await page.locator(".detail-link-anchor").count(),
    specRows: await textList(".detail-spec-row", 10),
    images: await imageHealth(".detail-page img"),
  };

  await gotoHash("news/news-010");
  await page.waitForTimeout(300);
  await page.screenshot({ path: "./output/playwright/news-detail-010.png", fullPage: true });
  summary.newsDetail010 = {
    url: page.url(),
    title: ((await page.locator(".detail-page .h2").first().textContent()) || "").trim(),
    links: await textList(".detail-link-anchor", 10),
    images: await imageHealth(".detail-page img"),
  };

  return summary;
}

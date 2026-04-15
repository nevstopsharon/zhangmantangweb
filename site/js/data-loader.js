(function () {
  const site = window.ZMTSite;
  const { dataUrl, store } = site;

  async function fetchJson(fileName) {
    try {
      const response = await fetch(dataUrl(fileName));
      if (!response.ok) {
        throw new Error(`Failed to load ${fileName}: ${response.status}`);
      }
      return response.json();
    } catch (error) {
      console.error(`Error loading ${fileName}:`, error);
      // 返回空数据，确保应用不会崩溃
      return [];
    }
  }

  async function loadData() {
    try {
      const [profile, works, exhibitions, news] = await Promise.all([
        fetchJson("profile.json"),
        fetchJson("works.json"),
        fetchJson("exhibitions.json"),
        fetchJson("news.json")
      ]);

      store.siteData = { profile, works, exhibitions, news };
      return store.siteData;
    } catch (error) {
      console.error("Error loading data:", error);
      // 确保 store.siteData 至少是一个空对象
      store.siteData = store.siteData || { profile: {}, works: [], exhibitions: [], news: [] };
      return store.siteData;
    }
  }

  Object.assign(site, {
    fetchJson,
    loadData
  });
})();

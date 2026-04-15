/**
 * 状态管理模块
 * 管理应用的全局状态，包括语言、过滤器、搜索等
 */
(function () {
  const site = (window.ZMTSite = window.ZMTSite || {});

  /**
   * 应用根元素
   * @type {HTMLElement}
   */
  site.appRoot = document.getElementById("app");
  
  /**
   * 站点基础路径
   * @type {string}
   */
  site.siteBase = document.documentElement.dataset.siteBase || "..";
  
  /**
   * 站点 URL
   * @type {string}
   */
  site.siteUrl = document.documentElement.dataset.siteUrl || "";
  
  /**
   * 数据存储
   * @type {Object}
   * @property {Object|null} siteData - 网站数据
   */
  site.store = { siteData: null };
  
  /**
   * 应用状态
   * @type {Object}
   * @property {string} lang - 当前语言
   * @property {Object} worksFilter - 作品过滤器
   * @property {string|null} openFilter - 当前打开的过滤器
   * @property {string|null} selectedMedia - 当前选中的媒体
   * @property {string|null} activeExhibitionYear - 当前活跃的展览年份
   * @property {string|null} activeNewsYear - 当前活跃的新闻年份
   * @property {string} searchQuery - 搜索查询
   * @property {Object|null} pendingYearScroll - 待处理的年份滚动
   */
  site.state = {
    lang: "zh",
    worksFilter: { project: "", material: "" },
    openFilter: null,
    selectedMedia: null,
    activeExhibitionYear: null,
    activeNewsYear: null,
    searchQuery: "",
    pendingYearScroll: null
  };

  /**
   * 搜索建议
   * @type {Array<Object>}
   */
  site.SEARCH_SUGGESTIONS = [
    { route: "works/work-042" },
    { route: "works/work-041" },
    { route: "news/news-009" }
  ];

  /**
   * UI 文本
   * @type {Object}
   * @property {Object} zh - 中文 UI 文本
   * @property {Object} en - 英文 UI 文本
   */
  site.ui = {
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
        previousImage: "上一张图片",
        nextImage: "下一张图片",
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
      loadError: "内容加载失败，请刷新页面或稍后重试。若问题持续存在，请联系网站维护人员。"
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
        previousImage: "Previous image",
        nextImage: "Next image",
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
      loadError: "Failed to load content. Please refresh the page or try again later. If the problem persists, contact the site maintainer."
    }
  };

  /**
   * 作品过滤器
   * @type {Object}
   */
  site.WORK_FILTERS = {
    material: ["紫砂", "瓷", "宣纸", "其他"],
    project: ["欧亚国家名片-中国文化邮票", "走向胜利", "人民大会堂藏品", "毛泽东诗词精选"]
  };

  /**
   * 作品过滤器标签
   * @type {Object}
   */
  site.WORK_FILTER_LABELS = {
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
})();

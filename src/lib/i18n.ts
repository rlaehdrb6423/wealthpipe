export type Locale = "en" | "ko";

export interface I18nTexts {
  nav: {
    tools: string;
    newsletter: string;
    agency: string;
    subscribeCta: string;
  };
  hero: {
    tagline: string;
    line1a: string;
    line1b: string;
    line2a: string;
    line2b: string;
    desc: string;
    descHighlight: string;
    ctaPrimary: string;
    ctaSecondary: string;
  };
  stats: [string, string][];
  tools: {
    heading1: string;
    heading2: string;
    subtext: string;
    items: { n: string; tag: string; title: string; desc: string; status: string }[];
  };
  newsletter: {
    frequency: string;
    heading: string;
    benefits: string[];
    formNote: string;
    namePlaceholder: string;
    emailPlaceholder: string;
    submitBtn: string;
    successTitle: string;
    successDesc: string;
  };
  agency: {
    label: string;
    heading: string;
    desc: string;
    services: string[];
    formLabel: string;
    namePlaceholder: string;
    emailPlaceholder: string;
    msgPlaceholder: string;
    submitBtn: string;
    successTitle: string;
    successDesc: string;
  };
  footer: {
    copyright: string;
    langSwitchLabel: string;
    langSwitchHref: string;
  };
  auth: {
    loginTitle: string;
    loginDesc: string;
    emailPlaceholder: string;
    sendMagicLink: string;
    sending: string;
    checkEmail: string;
    checkEmailDesc: string;
    loginBtn: string;
    logoutBtn: string;
    backLink: string;
  };
  keyword: {
    title: string;
    description: string;
    backLink: string;
    heading: string;
    subheading: string;
    placeholder: string;
    analyzeBtn: string;
    analyzingBtn: string;
    remainingLabel: string;
    totalVolume: string;
    pcLabel: string;
    mobileLabel: string;
    competition: string;
    profitability: string;
    gradeLabel: string;
    detailTitle: string;
    blogDocs: string;
    newsDocs: string;
    cafeDocs: string;
    webDocs: string;
    totalCompetition: string;
    ratio: string;
    avgClicks: string;
    avgCtr: string;
    adCompIdx: string;
    successRate: string;
    relatedTitle: string;
    shareBonusText: string;
    copyLink: string;
    twitterShare: string;
    nlCtaTitle: string;
    nlCtaDesc: string;
    nlCtaBtn: string;
    networkError: string;
    ogTitle: string;
    ogDesc: string;
    ogTitleWithKeyword: string;
    ogDescWithKeyword: string;
    langSwitchHref: string;
    langSwitchLabel: string;
    revenueTitle: string;
    pcCpc: string;
    mobileCpc: string;
    avgCpc: string;
    shareRate: string;
    estimatedMonthlyRevenue: string;
    revenueDisclaimer: string;
    titleAnalysisTitle: string;
    avgTitleLength: string;
    charUnit: string;
    topTitleType: string;
    topWords: string;
    titleTypeDistribution: string;
    topPostTitles: string;
    opportunityScore: string;
    verdictGo: string;
    verdictNiche: string;
    verdictDiff: string;
    verdictLong: string;
    revenueConservative: string;
    revenueRealistic: string;
    revenueOptimistic: string;
    aiStructureTitle: string;
    aiStructureBtn: string;
    aiStructureLoading: string;
    aiStructureH1: string;
    aiStructureH2: string;
    aiStructureLsi: string;
    aiStructureLength: string;
    aiStructureTip: string;
    aiStructureLimit: string;
    limitTitle: string;
    limitDesc: string;
    limitProCta: string;
    limitShareCta: string;
    limitEmailPlaceholder: string;
    limitEmailBtn: string;
    limitEmailSuccess: string;
    shareNative: string;
  };
  news: {
    title: string;
    description: string;
    backLink: string;
    heading: string;
    subheading: string;
    todayLabel: string;
    archiveLabel: string;
    aiInsightLabel: string;
    categories: {
      stock: string;
      realestate: string;
      exchange: string;
      rate: string;
      crypto: string;
    };
    readMore: string;
    loadingText: string;
    errorText: string;
    noDataText: string;
    nlCtaTitle: string;
    nlCtaDesc: string;
    nlCtaBtn: string;
    ogTitle: string;
    ogDesc: string;
    langSwitchHref: string;
    langSwitchLabel: string;
  };
  signals: {
    title: string;
    description: string;
    backLink: string;
    heading: string;
    subheading: string;
    todayLabel: string;
    archiveLabel: string;
    aiInsightLabel: string;
    signalLabels: {
      bullish: string;
      bearish: string;
      neutral: string;
    };
    loadingText: string;
    errorText: string;
    noDataText: string;
    nlCtaTitle: string;
    nlCtaDesc: string;
    nlCtaBtn: string;
    ogTitle: string;
    ogDesc: string;
    langSwitchHref: string;
    langSwitchLabel: string;
  };
  ranking: {
    title: string;
    description: string;
    heading: string;
    subheading: string;
    backLink: string;
    rankLabel: string;
    keywordLabel: string;
    volumeLabel: string;
    competitionLabel: string;
    scoreLabel: string;
    sharesLabel: string;
    shareThisPage: string;
    kakaoShare: string;
    loadingText: string;
    errorText: string;
    noDataText: string;
    nlCtaTitle: string;
    nlCtaBtn: string;
    ogTitle: string;
    ogDesc: string;
    langSwitchHref: string;
    langSwitchLabel: string;
    referralTitle: string;
    referralDesc: string;
    referralLink: string;
    referralCopied: string;
    referralStats: string;
  };
  screener: {
    backLink: string;
    heading: string;
    subheading: string;
    stocksLabel: string;
    updatedLabel: string;
    searchPlaceholder: string;
    searchBtn: string;
    filterToggle: string;
    maxLabel: string;
    minLabel: string;
    divLabel: string;
    capLabel: string;
    marketLabel: string;
    marketAll: string;
    applyBtn: string;
    colName: string;
    colScore: string;
    colDiv: string;
    colCap: string;
    colPrice: string;
    loadingText: string;
    errorText: string;
    resultsLabel: string;
    noResultText: string;
    scoreGuideTitle: string;
    scoreGuideDesc: string;
    nlCtaDesc: string;
    nlCtaTitle: string;
    nlCtaBtn: string;
    ogTitle: string;
    ogDesc: string;
    langSwitchHref: string;
    langSwitchLabel: string;
  };
}

const en: I18nTexts = {
  nav: {
    tools: "Tools",
    newsletter: "Newsletter",
    agency: "Agency",
    subscribeCta: "Subscribe Free",
  },
  hero: {
    tagline: "— AI-Powered Market Intelligence",
    line1a: "GLOBAL MARKETS,",
    line1b: "LOCAL INSIGHTS.",
    line2a: "AI DECODES",
    line2b: "THE SIGNALS.",
    desc: "Korean market keywords, global economic signals, and AI-driven analysis — intelligence tools built for cross-border sellers and investors.",
    descHighlight: "100% free. No login required.",
    ctaPrimary: "Explore Free Tools \u2192",
    ctaSecondary: "Subscribe",
  },
  stats: [
    ["24/7", "AI market monitoring"],
    ["100%", "Automated pipeline"],
    ["4+", "Free intelligence tools"],
    ["Global", "Korea \u00b7 Global Markets"],
  ],
  tools: {
    heading1: "FREE",
    heading2: "TOOLS",
    subtext: "No login. 100% Free.\nUse right now.",
    items: [
      { n: "01", tag: "KOREA SEO", title: "Korean Market Keyword Analyzer", desc: "Unlock Naver search data — volume, competition, and revenue potential. The essential tool for global sellers entering the Korean market.", status: "LIVE" },
      { n: "02", tag: "MARKET", title: "Economic News Digest", desc: "AI distills global economic headlines daily. Stocks, FX, crypto, and rates — the full picture in under 10 minutes.", status: "LIVE" },
      { n: "03", tag: "SIGNALS", title: "Asset Signal Tracker", desc: "AI detects buy/sell signals across KOSPI, S&P 500, NASDAQ, Bitcoin, and Gold before the crowd moves.", status: "LIVE" },
      { n: "04", tag: "SCREENER", title: "KRX Factor Screener", desc: "Screen 2,700+ KOSPI & KOSDAQ stocks by PER, PBR, ROE, dividend yield — ranked by AI factor score.", status: "LIVE" },
    ],
  },
  newsletter: {
    frequency: "— Every Morning",
    heading: "WEALTH\nINTEL\nWEEKLY",
    benefits: [
      "Global economic trends, distilled",
      "AI-powered finance & invest signals",
      "Automation tips you can use today",
      "Exclusive early tool access",
    ],
    formNote: "Free \u00b7 No spam \u00b7 Unsubscribe anytime",
    namePlaceholder: "Name",
    emailPlaceholder: "Email address",
    submitBtn: "Start Free Subscription \u2192",
    successTitle: "You\u2019re in.",
    successDesc: "First issue lands tomorrow morning.",
  },
  agency: {
    label: "— Agency",
    heading: "AI\nPIPE\nLINE",
    desc: "From crawling automation to AI agents. We design and ship data systems your business actually needs \u2014 fast.",
    services: ["Crawling & Scraping", "AI Agents", "Data Pipelines", "SEO Automation", "Chatbot Development", "Analytics Dashboard"],
    formLabel: "Project Inquiry",
    namePlaceholder: "Name / Company",
    emailPlaceholder: "Email",
    msgPlaceholder: "Tell us about your project",
    submitBtn: "Send Inquiry \u2192",
    successTitle: "Received.",
    successDesc: "We\u2019ll get back to you shortly.",
  },
  footer: {
    copyright: "\u00a9 2026 WEALTHPIPE \u00b7 AI Intelligence for Wealth",
    langSwitchLabel: "\ud55c\uad6d\uc5b4",
    langSwitchHref: "/ko",
  },
  auth: {
    loginTitle: "Sign in to WealthPipe",
    loginDesc: "Enter your email and we'll send you a magic link to sign in.",
    emailPlaceholder: "Email address",
    sendMagicLink: "Send Magic Link",
    sending: "Sending...",
    checkEmail: "Check your email",
    checkEmailDesc: "We sent a magic link to your email. Click it to sign in.",
    loginBtn: "Login",
    logoutBtn: "Logout",
    backLink: "\u2190 Back to WealthPipe",
  },
  keyword: {
    title: "Korean Market Keyword Analyzer - WealthPipe",
    description: "Unlock the Korean market. Analyze Naver search volume, competition, and revenue potential — the essential tool for global sellers targeting Korea.",
    backLink: "\u2190 WealthPipe",
    heading: "Korean Market Keyword Analyzer",
    subheading: "Unlock Naver SEO data to find high-opportunity keywords in the Korean market.",
    placeholder: "Enter a Korean keyword (e.g. \uc8fc\uc2dd \ud22c\uc790)",
    analyzeBtn: "Analyze",
    analyzingBtn: "Analyzing...",
    remainingLabel: "remaining today",
    totalVolume: "Monthly Volume",
    pcLabel: "PC",
    mobileLabel: "Mobile",
    competition: "Competition",
    profitability: "Profitability",
    gradeLabel: "Grade",
    detailTitle: "Detailed Data",
    blogDocs: "Blog Posts",
    newsDocs: "News Articles",
    cafeDocs: "Cafe Posts",
    webDocs: "Web Documents",
    totalCompetition: "Total Competition",
    ratio: "Volume/Post Ratio",
    avgClicks: "Avg. Clicks",
    avgCtr: "Avg. CTR",
    adCompIdx: "Ad Competition",
    successRate: "Success Rate",
    relatedTitle: "Related Keywords",
    shareBonusText: "Share to get +3 bonus analyses (up to 3x/day)",
    copyLink: "Copy Link",
    twitterShare: "Share on X",
    nlCtaTitle: "Get weekly hot keyword analysis via email",
    nlCtaDesc: "WealthPipe Newsletter - Every Morning",
    nlCtaBtn: "Subscribe Newsletter",
    networkError: "A network error occurred.",
    ogTitle: "Free Naver Keyword Analyzer | Korean SEO Tool - WealthPipe",
    ogDesc: "Free Naver keyword analysis — search volume, competition, and revenue potential. The essential SEO tool for the Korean market.",
    ogTitleWithKeyword: "Keyword Analysis Result",
    ogDescWithKeyword: "Naver search volume, competition, and profitability analysis",
    langSwitchHref: "/ko/tools/keyword",
    langSwitchLabel: "\ud55c\uad6d\uc5b4",
    revenueTitle: "Estimated Monthly Revenue",
    pcCpc: "PC CPC",
    mobileCpc: "Mobile CPC",
    avgCpc: "Avg. CPC",
    shareRate: "Market Share",
    estimatedMonthlyRevenue: "Est. Monthly Revenue",
    revenueDisclaimer: "Based on Naver ad CPC. Actual revenue may vary by ad platform and niche.",
    titleAnalysisTitle: "Top Post Title Analysis",
    avgTitleLength: "Avg. Title Length",
    charUnit: "chars",
    topTitleType: "Top Title Type",
    topWords: "Frequent Words",
    titleTypeDistribution: "Title Type Distribution",
    topPostTitles: "Top Blog Post Titles",
    opportunityScore: "Opportunity Score",
    verdictGo: "Go for it now",
    verdictNiche: "Niche opportunity",
    verdictDiff: "Differentiation needed",
    verdictLong: "Long-term strategy needed",
    revenueConservative: "Conservative (1%)",
    revenueRealistic: "Realistic (5%)",
    revenueOptimistic: "Optimistic (15%)",
    aiStructureTitle: "AI Blog Structure",
    aiStructureBtn: "Get AI Structure Recommendation",
    aiStructureLoading: "AI is generating...",
    aiStructureH1: "Recommended Title",
    aiStructureH2: "Subtopics",
    aiStructureLsi: "LSI Keywords",
    aiStructureLength: "Recommended Length",
    aiStructureTip: "Writing Tip",
    aiStructureLimit: "3 free AI recommendations per day",
    limitTitle: "You've used all free analyses today",
    limitDesc: "Upgrade to Pro for unlimited keyword analysis, AI blog structures, and keyword history.",
    limitProCta: "Get notified when Pro launches",
    limitShareCta: "Share to get +3 bonus analyses",
    limitEmailPlaceholder: "Enter your email for Pro launch alert",
    limitEmailBtn: "Notify Me",
    limitEmailSuccess: "We'll notify you when Pro launches!",
    shareNative: "Share",
  },
  news: {
    title: "Economic News Digest - WealthPipe",
    description: "AI-curated daily economic news digest. Get key market signals across stocks, real estate, FX, rates, and crypto in under 10 minutes.",
    backLink: "\u2190 WealthPipe",
    heading: "Economic News Digest",
    subheading: "AI distills global economic headlines daily. Get the full picture in under 10 minutes.",
    todayLabel: "Today's Digest",
    archiveLabel: "Archive (Last 7 Days)",
    aiInsightLabel: "AI Market Insight",
    categories: {
      stock: "Stock Market",
      realestate: "Real Estate",
      exchange: "FX / Exchange Rate",
      rate: "Interest Rate",
      crypto: "Crypto",
    },
    readMore: "Read Full Article \u2192",
    loadingText: "Loading news digest...",
    errorText: "Failed to load news. Please try again later.",
    noDataText: "No digest available for today yet. Check back after 08:00 KST.",
    nlCtaTitle: "Get daily economic insights via email",
    nlCtaDesc: "WealthPipe Newsletter \u2014 Every Morning",
    nlCtaBtn: "Subscribe Newsletter",
    ogTitle: "Daily Economic News Summary | AI News Digest - WealthPipe",
    ogDesc: "Free AI-curated daily economic news digest. Stocks, real estate, FX, rates, and crypto summarized in one place.",
    langSwitchHref: "/ko/tools/news",
    langSwitchLabel: "\ud55c\uad6d\uc5b4",
  },
  signals: {
    title: "Asset Signal Tracker - WealthPipe",
    description: "AI-powered daily buy/sell signals for KOSPI, S&P 500, NASDAQ, Bitcoin, Gold, and USD/KRW. Spot opportunities before the market moves.",
    backLink: "\u2190 WealthPipe",
    heading: "Asset Signal Tracker",
    subheading: "AI scans KOSPI, S&P 500, NASDAQ, Bitcoin, and Gold daily — so you see the signal before the crowd.",
    todayLabel: "Today's Signals",
    archiveLabel: "Archive (Last 7 Days)",
    aiInsightLabel: "AI Market Insight",
    signalLabels: {
      bullish: "Bullish",
      bearish: "Bearish",
      neutral: "Neutral",
    },
    loadingText: "Loading market signals...",
    errorText: "Failed to load signals. Please try again later.",
    noDataText: "No signals available for today yet. Check back after 18:00 KST.",
    nlCtaTitle: "Get weekly market signals via email",
    nlCtaDesc: "WealthPipe Newsletter \u2014 Every Morning",
    nlCtaBtn: "Subscribe Newsletter",
    ogTitle: "Free Stock Trading Signals | AI Buy/Sell Signals - WealthPipe",
    ogDesc: "Free AI-powered daily buy/sell signals for KOSPI, S&P 500, NASDAQ, Bitcoin, Gold, Oil, and USD/KRW.",
    langSwitchHref: "/ko/tools/signals",
    langSwitchLabel: "\ud55c\uad6d\uc5b4",
  },
  ranking: {
    title: "Weekly Hot Keywords TOP 20 - WealthPipe",
    description: "The most analyzed keywords of the week. Find trending SEO opportunities on WealthPipe.",
    heading: "Weekly Keyword Ranking",
    subheading: "Top 20 most analyzed keywords this week.",
    backLink: "\u2190 WealthPipe",
    rankLabel: "Rank",
    keywordLabel: "Keyword",
    volumeLabel: "Monthly Volume",
    competitionLabel: "Competition",
    scoreLabel: "Opportunity",
    sharesLabel: "Shares",
    shareThisPage: "Share this ranking",
    kakaoShare: "Share on KakaoTalk",
    loadingText: "Loading keyword rankings...",
    errorText: "Failed to load rankings. Please try again later.",
    noDataText: "No ranking data available yet.",
    nlCtaTitle: "Get weekly hot keyword analysis via email",
    nlCtaBtn: "Subscribe Newsletter",
    ogTitle: "Weekly Hot Keywords TOP 20 - WealthPipe",
    ogDesc: "The most analyzed keywords of the week. Find SEO opportunities now.",
    langSwitchHref: "/ko/tools/ranking",
    langSwitchLabel: "\ud55c\uad6d\uc5b4",
    referralTitle: "Invite friends, get bonus analyses",
    referralDesc: "Both you and your friend get +5 bonus analyses when they sign up with your link.",
    referralLink: "Your referral link",
    referralCopied: "Copied!",
    referralStats: "referrals completed",
  },
  screener: {
    backLink: "← WealthPipe",
    heading: "KRX Factor Screener",
    subheading: "Screen all KRX-listed stocks by valuation, profitability, and AI score. Find undervalued, high-dividend, and quality stocks instantly.",
    stocksLabel: "stocks tracked",
    updatedLabel: "Updated",
    searchPlaceholder: "Search by name or ticker...",
    searchBtn: "Search",
    filterToggle: "Advanced Filters",
    maxLabel: "Max",
    minLabel: "Min",
    divLabel: "Dividend %",
    capLabel: "Market Cap (억)",
    marketLabel: "Market",
    marketAll: "All Markets",
    applyBtn: "Apply",
    colName: "Stock",
    colScore: "AI Score",
    colDiv: "Div %",
    colCap: "Mkt Cap",
    colPrice: "Price",
    loadingText: "Screening stocks...",
    errorText: "Failed to load data. Please try again.",
    resultsLabel: "results",
    noResultText: "No stocks match your filters. Try adjusting the criteria.",
    scoreGuideTitle: "About AI Score",
    scoreGuideDesc: "The AI Score is a composite factor score (0–100) calculated from valuation (PER, PBR), profitability (ROE), dividend yield, and earnings stability. Higher scores indicate stronger factor characteristics.",
    nlCtaDesc: "Weekly market intelligence",
    nlCtaTitle: "Get top-scored KRX stocks in your inbox every week",
    nlCtaBtn: "Subscribe Free",
    ogTitle: "Free Stock Screener | Find Undervalued Stocks - WealthPipe",
    ogDesc: "Free AI-scored stock screener — filter 2,700+ KOSPI and KOSDAQ stocks by PER, PBR, ROE, dividend yield, and AI factor score.",
    langSwitchHref: "/ko/tools/screener",
    langSwitchLabel: "\ud55c\uad6d\uc5b4",
  },
};

const ko: I18nTexts = {
  nav: {
    tools: "Tools",
    newsletter: "Newsletter",
    agency: "Agency",
    subscribeCta: "\ubb34\ub8cc \uad6c\ub3c5",
  },
  hero: {
    tagline: "— AI 수익화 도구",
    line1a: "데이터로",
    line1b: "수익을 만드세요.",
    line2a: "AI가",
    line2b: "도와드립니다.",
    desc: "재테크, 투자, 마케팅의 핵심 데이터를 AI가 자동으로 수집하고 분석합니다.",
    descHighlight: "100% 무료. 지금 바로 시작하세요.",
    ctaPrimary: "무료 도구 시작하기 \u2192",
    ctaSecondary: "뉴스레터 구독",
  },
  stats: [
    ["24/7", "AI \uc2dc\uc7a5 \ubaa8\ub2c8\ud130\ub9c1"],
    ["100%", "\uc790\ub3d9\ud654 \ud30c\uc774\ud504\ub77c\uc778"],
    ["4+", "\ubb34\ub8cc \ubd84\uc11d \ud234"],
    ["Global", "\ud55c\uad6d + \uc804 \uc138\uacc4"],
  ],
  tools: {
    heading1: "FREE",
    heading2: "TOOLS",
    subtext: "\ub85c\uadf8\uc778 \uc5c6\uc74c. \uc644\uc804 \ubb34\ub8cc.\n\uc9c0\uae08 \ubc14\ub85c \uc0ac\uc6a9.",
    items: [
      { n: "01", tag: "SEO", title: "\ud0a4\uc6cc\ub4dc \ubd84\uc11d\uae30", desc: "\uac80\uc0c9\ub7c9\u00b7\uacbd\uc7c1\ub3c4\u00b7\uc218\uc775\uc131 \ubd84\uc11d. \ube14\ub85c\uac70\uc640 \ub9c8\ucf00\ud130\uc758 \ud544\uc218 \ud234.", status: "LIVE" },
      { n: "02", tag: "MARKET", title: "\uacbd\uc81c \ub274\uc2a4 \ub2e4\uc774\uc81c\uc2a4\ud2b8", desc: "\uae00\ub85c\ubc8c \uacbd\uc81c \ud575\uc2ec\uc744 \ub9e4\uc77c AI\uac00 \uc694\uc57d. 10\ubd84 \uc548\uc5d0 \uc2dc\uc7a5 \uc804\uccb4 \ud30c\uc545.", status: "LIVE" },
      { n: "03", tag: "INVEST", title: "\uc790\uc0b0 \uc2dc\uadf8\ub110 \ud2b8\ub798\ucee4", desc: "\uc8fc\uc2dd\u00b7\ucf54\uc778\u00b7\ubd80\ub3d9\uc0b0 \uc2e0\ud638\ub97c AI\uac00 \uba3c\uc800 \uac10\uc9c0.", status: "LIVE" },
      { n: "04", tag: "SCREENER", title: "KRX \ud329\ud130 \uc2a4\ud06c\ub9ac\ub108", desc: "KOSPI\u00b7KOSDAQ 2,700+ \uc885\ubaa9\uc758 PER, PBR, ROE, \ubc30\ub2f9\uc218\uc775\ub960\uc744 AI\uac00 \uc810\uc218\ud654.", status: "LIVE" },
    ],
  },
  newsletter: {
    frequency: "— \ub9e4\uc8fc \uc6d4\uc694\uc77c",
    heading: "\ub3c8\uc774\n\ub418\ub294\n\uc778\uc0ac\uc774\ud2b8",
    benefits: [
      "\uae00\ub85c\ubc8c \uacbd\uc81c \ud750\ub984 \ud575\uc2ec \uc694\uc57d",
      "\uc7ac\ud14c\ud06c\u00b7\ud22c\uc790 AI \uc2dc\uadf8\ub110 \ubd84\uc11d",
      "AI \uc790\ub3d9\ud654 \uc2e4\uc804 \ud301",
      "\ub3c5\uc810 \ud234 \ubca0\ud0c0 \uc6b0\uc120 \uacf5\uac1c",
    ],
    formNote: "\ubb34\ub8cc \uad6c\ub3c5 \u00b7 \uc2a4\ud338 \uc5c6\uc74c \u00b7 \uc5b8\uc81c\ub4e0 \ucde8\uc18c",
    namePlaceholder: "\uc774\ub984",
    emailPlaceholder: "\uc774\uba54\uc77c \uc8fc\uc18c",
    submitBtn: "\ubb34\ub8cc \uad6c\ub3c5 \uc2dc\uc791\ud558\uae30 \u2192",
    successTitle: "\uad6c\ub3c5 \uc644\ub8cc.",
    successDesc: "\ub2e4\uc74c \uc6d4\uc694\uc77c\uc5d0 \uccab \uc778\uc0ac\uc774\ud2b8\ub97c \ubcf4\ub0b4\ub4dc\ub9bd\ub2c8\ub2e4.",
  },
  agency: {
    label: "— Agency",
    heading: "AI\n\ud30c\uc774\ud504\n\ub77c\uc778",
    desc: "\ud06c\ub864\ub9c1 \uc790\ub3d9\ud654\ubd80\ud130 AI \uc5d0\uc774\uc804\ud2b8\uae4c\uc9c0. \ube44\uc988\ub2c8\uc2a4\uc5d0 \ud544\uc694\ud55c \ub370\uc774\ud130 \uc2dc\uc2a4\ud15c\uc744 \ube60\ub974\uac8c \ub0a9\ud488\ud569\ub2c8\ub2e4.",
    services: ["\ud06c\ub864\ub9c1 \u00b7 \uc2a4\ud06c\ub798\ud551", "AI \uc5d0\uc774\uc804\ud2b8", "\ub370\uc774\ud130 \ud30c\uc774\ud504\ub77c\uc778", "SEO \uc790\ub3d9\ud654", "\ucc57\ubd07 \uac1c\ubc1c", "\ubd84\uc11d \ub300\uc2dc\ubcf4\ub4dc"],
    formLabel: "\ud504\ub85c\uc81d\ud2b8 \ubb38\uc758",
    namePlaceholder: "\uc774\ub984 / \ud68c\uc0ac\uba85",
    emailPlaceholder: "\uc774\uba54\uc77c",
    msgPlaceholder: "\uc5b4\ub5a4 \ud504\ub85c\uc81d\ud2b8\uc778\uc9c0 \uc124\uba85\ud574 \uc8fc\uc138\uc694",
    submitBtn: "\ubb38\uc758 \ubcf4\ub0b4\uae30 \u2192",
    successTitle: "\ubb38\uc758 \uc811\uc218 \uc644\ub8cc.",
    successDesc: "\ube60\ub974\uac8c \ub2f5\ubcc0 \ub4dc\ub9ac\uaca0\uc2b5\ub2c8\ub2e4.",
  },
  footer: {
    copyright: "\u00a9 2026 WEALTHPIPE",
    langSwitchLabel: "English",
    langSwitchHref: "/",
  },
  auth: {
    loginTitle: "WealthPipe 로그인",
    loginDesc: "이메일을 입력하면 로그인 링크를 보내드립니다.",
    emailPlaceholder: "이메일 주소",
    sendMagicLink: "매직 링크 전송",
    sending: "전송 중...",
    checkEmail: "이메일을 확인해주세요",
    checkEmailDesc: "입력하신 이메일로 매직 링크를 보냈습니다. 링크를 클릭해 로그인하세요.",
    loginBtn: "로그인",
    logoutBtn: "로그아웃",
    backLink: "\u2190 WealthPipe로 돌아가기",
  },
  keyword: {
    title: "무료 키워드 분석기 - WealthPipe",
    description: "네이버 검색량, 경쟁도, 수익성을 한눈에 분석하세요. 블로그 수익화를 위한 무료 키워드 분석 도구.",
    backLink: "← WealthPipe",
    heading: "키워드 분석기",
    subheading: "네이버 검색량, 경쟁도, 수익성을 한눈에 분석하세요.",
    placeholder: "분석할 키워드 입력 (예: 주식 투자)",
    analyzeBtn: "분석",
    analyzingBtn: "분석 중...",
    remainingLabel: "회 남음",
    totalVolume: "월간 검색량",
    pcLabel: "PC",
    mobileLabel: "모바일",
    competition: "경쟁도",
    profitability: "수익성",
    gradeLabel: "등급",
    detailTitle: "상세 데이터",
    blogDocs: "블로그 발행량",
    newsDocs: "뉴스 문서수",
    cafeDocs: "카페 글수",
    webDocs: "웹 문서수",
    totalCompetition: "총 경쟁 문서",
    ratio: "검색량/발행량 비율",
    avgClicks: "평균 클릭수",
    avgCtr: "평균 클릭률",
    adCompIdx: "광고 경쟁지수",
    successRate: "성공률",
    relatedTitle: "연관 키워드",
    shareBonusText: "공유하면 보너스 분석 +3회 (하루 3번까지)",
    copyLink: "링크 복사",
    twitterShare: "트위터 공유",
    nlCtaTitle: "매주 핫 키워드 분석을 이메일로 받아보세요",
    nlCtaDesc: "WealthPipe 뉴스레터 - 매일 아침 발행",
    nlCtaBtn: "뉴스레터 구독하기",
    networkError: "네트워크 오류가 발생했습니다.",
    ogTitle: "네이버 키워드 분석 무료 | 검색량 경쟁도 분석 - WealthPipe",
    ogDesc: "네이버 키워드 검색량, 경쟁도, 수익성을 무료로 분석하세요. 블로그 키워드 도구로 최적의 키워드를 찾아보세요.",
    ogTitleWithKeyword: "키워드 분석 결과",
    ogDescWithKeyword: "네이버 검색량, 경쟁도, 수익성 분석 결과",
    langSwitchHref: "/tools/keyword",
    langSwitchLabel: "English",
    revenueTitle: "월 예상 수익",
    pcCpc: "PC CPC",
    mobileCpc: "모바일 CPC",
    avgCpc: "평균 CPC",
    shareRate: "예상 점유율",
    estimatedMonthlyRevenue: "월 예상 수익",
    revenueDisclaimer: "네이버 광고 CPC 기준 추정치입니다. 실제 수익은 광고 플랫폼과 주제에 따라 달라집니다.",
    titleAnalysisTitle: "상위 포스트 제목 분석",
    avgTitleLength: "평균 제목 길이",
    charUnit: "자",
    topTitleType: "주요 제목 유형",
    topWords: "자주 쓰는 단어",
    titleTypeDistribution: "제목 유형 분포",
    topPostTitles: "상위 블로그 포스트 제목",
    opportunityScore: "기회 점수",
    verdictGo: "지금 공략하세요",
    verdictNiche: "틈새 공략 가능",
    verdictDiff: "차별화 필요",
    verdictLong: "장기 전략 필요",
    revenueConservative: "보수적 (1%)",
    revenueRealistic: "현실적 (5%)",
    revenueOptimistic: "낙관적 (15%)",
    aiStructureTitle: "AI 글 구조 추천",
    aiStructureBtn: "AI 글 구조 추천받기",
    aiStructureLoading: "AI가 분석 중...",
    aiStructureH1: "추천 제목",
    aiStructureH2: "소제목 구성",
    aiStructureLsi: "LSI 키워드",
    aiStructureLength: "추천 글자수",
    aiStructureTip: "작성 팁",
    aiStructureLimit: "AI 글 구조 추천은 하루 3회 무료",
    limitTitle: "오늘 무료 분석을 모두 사용했어요",
    limitDesc: "Pro 플랜에서 무제한 키워드 분석, AI 글 구조 추천, 키워드 히스토리를 이용하세요.",
    limitProCta: "Pro 출시 알림 받기",
    limitShareCta: "공유하고 +3회 더 분석하기",
    limitEmailPlaceholder: "이메일을 입력하세요",
    limitEmailBtn: "알림 받기",
    limitEmailSuccess: "Pro 출시 시 알려드리겠습니다!",
    shareNative: "공유하기",
  },
  news: {
    title: "경제 뉴스 다이제스트 - WealthPipe",
    description: "AI가 매일 경제 핵심 뉴스를 요약합니다. 주식, 부동산, 환율, 금리, 암호화폐 — 10분 안에 시장 전체 파악.",
    backLink: "\u2190 WealthPipe",
    heading: "경제 뉴스 다이제스트",
    subheading: "AI가 매일 글로벌 경제 핵심을 요약합니다. 10분 안에 시장 전체를 파악하세요.",
    todayLabel: "오늘의 다이제스트",
    archiveLabel: "지난 7일 아카이브",
    aiInsightLabel: "AI 시장 인사이트",
    categories: {
      stock: "주식시장",
      realestate: "부동산",
      exchange: "환율",
      rate: "금리",
      crypto: "암호화폐",
    },
    readMore: "원문 보기 \u2192",
    loadingText: "뉴스 다이제스트 불러오는 중...",
    errorText: "뉴스를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.",
    noDataText: "오늘 다이제스트가 아직 준비되지 않았습니다. KST 08:00 이후 다시 확인해주세요.",
    nlCtaTitle: "매일 경제 인사이트를 이메일로 받아보세요",
    nlCtaDesc: "WealthPipe 뉴스레터 \u2014 매일 아침 발행",
    nlCtaBtn: "뉴스레터 구독하기",
    ogTitle: "오늘의 경제 뉴스 요약 | AI 경제 뉴스 - WealthPipe",
    ogDesc: "AI가 매일 경제 핵심 뉴스를 요약합니다. 주식, 부동산, 환율, 금리, 암호화폐 뉴스를 한곳에서 무료로 확인하세요.",
    langSwitchHref: "/tools/news",
    langSwitchLabel: "English",
  },
  signals: {
    title: "자산 시그널 트래커 - WealthPipe",
    description: "코스피, S&P 500, 나스닥, 비트코인, 금, 원달러 환율 — AI 시그널을 매일 분석합니다.",
    backLink: "\u2190 WealthPipe",
    heading: "자산 시그널 트래커",
    subheading: "주식, 코인, 원자재 시그널을 AI가 먼저 감지합니다.",
    todayLabel: "오늘의 시그널",
    archiveLabel: "지난 7일 아카이브",
    aiInsightLabel: "AI 시장 인사이트",
    signalLabels: {
      bullish: "상승",
      bearish: "하락",
      neutral: "중립",
    },
    loadingText: "시그널 불러오는 중...",
    errorText: "시그널을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.",
    noDataText: "오늘 시그널이 아직 준비되지 않았습니다. KST 18:00 이후 다시 확인해주세요.",
    nlCtaTitle: "매주 시장 시그널을 이메일로 받아보세요",
    nlCtaDesc: "WealthPipe 뉴스레터 \u2014 매일 아침 발행",
    nlCtaBtn: "뉴스레터 구독하기",
    ogTitle: "주식 매매 시그널 무료 | AI 투자 시그널 - WealthPipe",
    ogDesc: "코스피, S&P 500, 나스닥, 비트코인, 금, 유가, 환율 매매 시그널을 AI가 매일 무료로 분석합니다.",
    langSwitchHref: "/tools/signals",
    langSwitchLabel: "English",
  },
  ranking: {
    title: "이번 주 인기 키워드 TOP 20 - WealthPipe",
    description: "이번 주 가장 많이 분석된 키워드 TOP 20. WealthPipe에서 트렌드 SEO 기회를 찾아보세요.",
    heading: "주간 키워드 랭킹",
    subheading: "이번 주 가장 많이 분석된 키워드 TOP 20.",
    backLink: "\u2190 WealthPipe",
    rankLabel: "순위",
    keywordLabel: "키워드",
    volumeLabel: "월간 검색량",
    competitionLabel: "경쟁도",
    scoreLabel: "기회점수",
    sharesLabel: "공유수",
    shareThisPage: "이 랭킹 공유하기",
    kakaoShare: "카카오톡 공유",
    loadingText: "키워드 랭킹 불러오는 중...",
    errorText: "랭킹을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.",
    noDataText: "랭킹 데이터가 아직 없습니다.",
    nlCtaTitle: "매주 핫 키워드 분석을 이메일로 받아보세요",
    nlCtaBtn: "뉴스레터 구독하기",
    ogTitle: "이번 주 인기 키워드 TOP 20 - WealthPipe",
    ogDesc: "이번 주 가장 많이 분석된 키워드. 지금 SEO 기회를 확인하세요.",
    langSwitchHref: "/tools/ranking",
    langSwitchLabel: "English",
    referralTitle: "친구 초대하고 보너스 분석 받기",
    referralDesc: "친구가 내 링크로 가입하면 양쪽 모두 보너스 분석 +5회를 받습니다.",
    referralLink: "내 추천 링크",
    referralCopied: "복사됨!",
    referralStats: "추천 완료",
  },
  screener: {
    backLink: "← WealthPipe",
    heading: "KRX 팩터 스크리너",
    subheading: "KRX 상장 전 종목을 밸류에이션, 수익성, AI 점수로 스크리닝하세요. 저평가주, 고배당주, 퀄리티주를 즉시 찾아보세요.",
    stocksLabel: "종목 추적 중",
    updatedLabel: "업데이트",
    searchPlaceholder: "종목명 또는 티커 검색...",
    searchBtn: "검색",
    filterToggle: "상세 필터",
    maxLabel: "이하",
    minLabel: "이상",
    divLabel: "배당수익률 %",
    capLabel: "시가총액 (억원)",
    marketLabel: "시장",
    marketAll: "전체",
    applyBtn: "적용",
    colName: "종목",
    colScore: "AI 점수",
    colDiv: "배당 %",
    colCap: "시총",
    colPrice: "현재가",
    loadingText: "종목 스크리닝 중...",
    errorText: "데이터를 불러오지 못했습니다. 다시 시도해주세요.",
    resultsLabel: "개 종목",
    noResultText: "조건에 맞는 종목이 없습니다. 필터를 조정해보세요.",
    scoreGuideTitle: "AI 점수 안내",
    scoreGuideDesc: "AI 점수는 밸류에이션(PER, PBR), 수익성(ROE), 배당수익률, 실적 안정성을 종합한 팩터 점수(0~100)입니다. 높을수록 팩터 특성이 우수합니다.",
    nlCtaDesc: "매주 시장 인사이트 이메일",
    nlCtaTitle: "고점수 KRX 종목을 매주 이메일로 받아보세요",
    nlCtaBtn: "무료 구독",
    ogTitle: "주식 스크리너 무료 | 저평가 주식 찾기 - WealthPipe",
    ogDesc: "KOSPI·KOSDAQ 2,700+ 종목을 PER, PBR, ROE, 배당수익률로 무료 스크리닝. AI가 저평가 주식을 찾아드립니다.",
    langSwitchHref: "/tools/screener",
    langSwitchLabel: "English",
  },
};

export function getTexts(locale: Locale): I18nTexts {
  return locale === "ko" ? ko : en;
}

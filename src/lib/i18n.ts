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
    tagline: "— AI Monetization Tools",
    line1a: "YOUR DATA,",
    line1b: "YOUR REVENUE.",
    line2a: "AI DOES",
    line2b: "THE REST.",
    desc: "Keyword analysis, market signals, and content strategy — all the tools you need to turn data into income.",
    descHighlight: "100% free. Start earning smarter.",
    ctaPrimary: "Try Free Tools \u2192",
    ctaSecondary: "Subscribe",
  },
  stats: [
    ["24/7", "AI market monitoring"],
    ["100%", "Automated pipeline"],
    ["3+", "Free analysis tools"],
    ["Global", "Korea + Worldwide"],
  ],
  tools: {
    heading1: "FREE",
    heading2: "TOOLS",
    subtext: "No login. No credit card.\nUse right now.",
    items: [
      { n: "01", tag: "SEO", title: "Keyword Analyzer", desc: "Search volume, competition, and revenue potential in one shot. Essential for bloggers and marketers.", status: "LIVE" },
      { n: "02", tag: "MARKET", title: "Economic News Digest", desc: "AI distills global economic headlines daily. Get the full picture in under 10 minutes.", status: "SOON" },
      { n: "03", tag: "INVEST", title: "Asset Signal Tracker", desc: "AI detects signals across stocks, crypto, and real estate before the crowd moves.", status: "SOON" },
    ],
  },
  newsletter: {
    frequency: "— Every Monday",
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
    successDesc: "First issue lands next Monday.",
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
  keyword: {
    title: "Free Keyword Analyzer - WealthPipe",
    description: "Analyze Naver search volume, competition, and profitability at a glance. Free keyword analysis tool for blog monetization.",
    backLink: "\u2190 WealthPipe",
    heading: "Keyword Analyzer",
    subheading: "Analyze Naver search volume, competition, and profitability at a glance.",
    placeholder: "Enter a keyword (e.g. stock investment)",
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
    nlCtaDesc: "WealthPipe Newsletter - Every Monday",
    nlCtaBtn: "Subscribe Newsletter",
    networkError: "A network error occurred.",
    ogTitle: "Free Keyword Analyzer - WealthPipe",
    ogDesc: "Analyze Naver search volume, competition, and profitability at a glance.",
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
    ["3+", "\ubb34\ub8cc \ubd84\uc11d \ud234"],
    ["Global", "\ud55c\uad6d + \uc804 \uc138\uacc4"],
  ],
  tools: {
    heading1: "FREE",
    heading2: "TOOLS",
    subtext: "\ub85c\uadf8\uc778 \uc5c6\uc74c. \uce74\ub4dc \uc5c6\uc74c.\n\uc9c0\uae08 \ubc14\ub85c \uc0ac\uc6a9.",
    items: [
      { n: "01", tag: "SEO", title: "\ud0a4\uc6cc\ub4dc \ubd84\uc11d\uae30", desc: "\uac80\uc0c9\ub7c9\u00b7\uacbd\uc7c1\ub3c4\u00b7\uc218\uc775\uc131 \ubd84\uc11d. \ube14\ub85c\uac70\uc640 \ub9c8\ucf00\ud130\uc758 \ud544\uc218 \ud234.", status: "LIVE" },
      { n: "02", tag: "MARKET", title: "\uacbd\uc81c \ub274\uc2a4 \ub2e4\uc774\uc81c\uc2a4\ud2b8", desc: "\uae00\ub85c\ubc8c \uacbd\uc81c \ud575\uc2ec\uc744 \ub9e4\uc77c AI\uac00 \uc694\uc57d. 10\ubd84 \uc548\uc5d0 \uc2dc\uc7a5 \uc804\uccb4 \ud30c\uc545.", status: "SOON" },
      { n: "03", tag: "INVEST", title: "\uc790\uc0b0 \uc2dc\uadf8\ub110 \ud2b8\ub798\ucee4", desc: "\uc8fc\uc2dd\u00b7\ucf54\uc778\u00b7\ubd80\ub3d9\uc0b0 \uc2e0\ud638\ub97c AI\uac00 \uba3c\uc800 \uac10\uc9c0.", status: "SOON" },
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
    nlCtaDesc: "WealthPipe 뉴스레터 - 매주 월요일 발행",
    nlCtaBtn: "뉴스레터 구독하기",
    networkError: "네트워크 오류가 발생했습니다.",
    ogTitle: "무료 키워드 분석기 - WealthPipe",
    ogDesc: "네이버 검색량, 경쟁도, 수익성을 한눈에 분석하세요.",
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
  },
};

export function getTexts(locale: Locale): I18nTexts {
  return locale === "ko" ? ko : en;
}

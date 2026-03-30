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
}

const en: I18nTexts = {
  nav: {
    tools: "Tools",
    newsletter: "Newsletter",
    agency: "Agency",
    subscribeCta: "Subscribe Free",
  },
  hero: {
    tagline: "— AI Pipeline Platform",
    line1a: "DATA",
    line1b: "FLOWS.",
    line2a: "WEALTH",
    line2b: "FOLLOWS.",
    desc: "AI automatically collects and analyzes critical data across finance, investment, and marketing.",
    descHighlight: "You just make the call.",
    ctaPrimary: "Start Free Tools \u2192",
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
};

const ko: I18nTexts = {
  nav: {
    tools: "Tools",
    newsletter: "Newsletter",
    agency: "Agency",
    subscribeCta: "\ubb34\ub8cc \uad6c\ub3c5",
  },
  hero: {
    tagline: "— AI Pipeline Platform",
    line1a: "DATA",
    line1b: "FLOWS.",
    line2a: "WEALTH",
    line2b: "FOLLOWS.",
    desc: "\uc7ac\ud14c\ud06c, \ud22c\uc790, \ub9c8\ucf00\ud305\uc758 \ud575\uc2ec \ub370\uc774\ud130\ub97c AI\uac00 \uc790\ub3d9\uc73c\ub85c \uc218\uc9d1\ud558\uace0 \ubd84\uc11d\ud569\ub2c8\ub2e4.",
    descHighlight: "\ub2f9\uc2e0\uc740 \uacb0\uc815\ub9cc \ud558\uba74 \ub429\ub2c8\ub2e4.",
    ctaPrimary: "\ubb34\ub8cc \ud234 \uc2dc\uc791\ud558\uae30 \u2192",
    ctaSecondary: "\ub274\uc2a4\ub808\ud130 \uad6c\ub3c5",
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
};

export function getTexts(locale: Locale): I18nTexts {
  return locale === "ko" ? ko : en;
}

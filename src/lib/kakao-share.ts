declare global {
  interface Window {
    Kakao: {
      init: (key: string) => void
      isInitialized: () => boolean
      Share: {
        sendDefault: (options: object) => void
      }
    }
  }
}

export function initKakao() {
  if (typeof window === "undefined") return
  if (window.Kakao && !window.Kakao.isInitialized()) {
    window.Kakao.init(process.env.NEXT_PUBLIC_KAKAO_JS_KEY!)
  }
}

export function shareKeyword(keyword: string, score: number) {
  if (!window.Kakao?.isInitialized()) return
  window.Kakao.Share.sendDefault({
    objectType: "feed",
    content: {
      title: `"${keyword}" 키워드 분석 결과`,
      description: `기회점수 ${score}/100 — WealthPipe 무료 키워드 분석기`,
      imageUrl: `https://wealthpipe.net/api/og?keyword=${encodeURIComponent(keyword)}`,
      link: {
        webUrl: `https://wealthpipe.net/tools/keyword/${encodeURIComponent(keyword)}`,
        mobileWebUrl: `https://wealthpipe.net/tools/keyword/${encodeURIComponent(keyword)}`,
      },
    },
    buttons: [
      {
        title: "무료 분석하기",
        link: {
          webUrl: "https://wealthpipe.net/tools/keyword",
          mobileWebUrl: "https://wealthpipe.net/tools/keyword",
        },
      },
    ],
  })
}

export function shareRanking() {
  if (!window.Kakao?.isInitialized()) return
  window.Kakao.Share.sendDefault({
    objectType: "feed",
    content: {
      title: "이번 주 인기 키워드 TOP 20",
      description: "WealthPipe 주간 인기 키워드 랭킹",
      imageUrl: "https://wealthpipe.net/api/og",
      link: {
        webUrl: "https://wealthpipe.net/tools/ranking",
        mobileWebUrl: "https://wealthpipe.net/tools/ranking",
      },
    },
  })
}

export function shareSignals() {
  if (!window.Kakao?.isInitialized()) return
  window.Kakao.Share.sendDefault({
    objectType: "feed",
    content: {
      title: "오늘의 자산 시그널",
      description: "코스피, S&P500, 나스닥, 비트코인, 금, 환율 — AI 시그널 분석",
      imageUrl: "https://wealthpipe.net/api/og",
      link: {
        webUrl: "https://wealthpipe.net/ko/tools/signals",
        mobileWebUrl: "https://wealthpipe.net/ko/tools/signals",
      },
    },
    buttons: [
      {
        title: "시그널 확인하기",
        link: {
          webUrl: "https://wealthpipe.net/ko/tools/signals",
          mobileWebUrl: "https://wealthpipe.net/ko/tools/signals",
        },
      },
    ],
  })
}

export function shareNews() {
  if (!window.Kakao?.isInitialized()) return
  window.Kakao.Share.sendDefault({
    objectType: "feed",
    content: {
      title: "오늘의 경제 뉴스 다이제스트",
      description: "AI가 요약한 글로벌 경제 핵심 뉴스 — WealthPipe",
      imageUrl: "https://wealthpipe.net/api/og",
      link: {
        webUrl: "https://wealthpipe.net/ko/tools/news",
        mobileWebUrl: "https://wealthpipe.net/ko/tools/news",
      },
    },
    buttons: [
      {
        title: "뉴스 읽기",
        link: {
          webUrl: "https://wealthpipe.net/ko/tools/news",
          mobileWebUrl: "https://wealthpipe.net/ko/tools/news",
        },
      },
    ],
  })
}

export function shareScreener() {
  if (!window.Kakao?.isInitialized()) return
  window.Kakao.Share.sendDefault({
    objectType: "feed",
    content: {
      title: "KRX 팩터 스크리너",
      description: "KOSPI·KOSDAQ 2,700+ 종목 AI 점수 분석 — WealthPipe",
      imageUrl: "https://wealthpipe.net/api/og",
      link: {
        webUrl: "https://wealthpipe.net/ko/tools/screener",
        mobileWebUrl: "https://wealthpipe.net/ko/tools/screener",
      },
    },
    buttons: [
      {
        title: "스크리너 사용하기",
        link: {
          webUrl: "https://wealthpipe.net/ko/tools/screener",
          mobileWebUrl: "https://wealthpipe.net/ko/tools/screener",
        },
      },
    ],
  })
}

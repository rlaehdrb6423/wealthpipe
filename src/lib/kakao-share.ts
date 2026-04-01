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

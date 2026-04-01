import { NextRequest } from 'next/server'
import { getServiceClient } from '@/lib/supabase'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    const { email, name } = await request.json()

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return Response.json({ error: '유효한 이메일을 입력해주세요.' }, { status: 400 })
    }

    const supabase = getServiceClient()

    // 중복 체크
    const { data: existing } = await supabase
      .from('newsletter_subscribers')
      .select('id, status')
      .eq('email', email)
      .single()

    if (existing) {
      if (existing.status === 'unsubscribed') {
        await supabase
          .from('newsletter_subscribers')
          .update({ status: 'active', name: name || null })
          .eq('id', existing.id)
      } else {
        return Response.json({ error: '이미 구독 중인 이메일입니다.' }, { status: 409 })
      }
    } else {
      await supabase.from('newsletter_subscribers').insert({
        email,
        name: name || null,
        source: 'website',
      })
    }

    // 환영 이메일 발송
    await resend.emails.send({
      from: 'WealthPipe <noreply@wealthpipe.net>',
      to: email,
      subject: 'WealthPipe 뉴스레터 구독을 환영합니다!',
      html: `
        <div style="max-width:480px;margin:0 auto;font-family:-apple-system,sans-serif;color:#e0e0e0;background:#0a0a0a;padding:32px;border-radius:12px;">
          <h1 style="font-size:20px;color:#fff;margin-bottom:16px;">WealthPipe에 오신 것을 환영합니다${name ? `, ${name.replace(/[<>"'&]/g, '')}` : ''}!</h1>
          <p style="font-size:14px;line-height:1.7;color:#b0b0b0;">
            매주 월요일, 블로그 수익화에 필요한 키워드 트렌드와 경제 인사이트를 보내드립니다.
          </p>
          <p style="font-size:14px;line-height:1.7;color:#b0b0b0;">
            곧 키워드 분석기도 오픈 예정이니 기대해주세요!
          </p>
          <hr style="border:none;border-top:1px solid #222;margin:24px 0;" />
          <p style="font-size:12px;color:#666;">wealthpipe.net</p>
        </div>
      `,
    })

    return Response.json({ success: true })
  } catch {
    return Response.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}

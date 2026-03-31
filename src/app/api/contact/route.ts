import { NextRequest } from 'next/server'
import { getServiceClient } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { name, email, message } = await request.json()

    if (!name || !email || !message) {
      return Response.json({ error: '모든 필드를 입력해주세요.' }, { status: 400 })
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return Response.json({ error: '유효한 이메일을 입력해주세요.' }, { status: 400 })
    }

    const supabase = getServiceClient()

    await supabase.from('contact_inquiries').insert({
      name,
      email,
      message,
    })

    return Response.json({ success: true })
  } catch {
    return Response.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}

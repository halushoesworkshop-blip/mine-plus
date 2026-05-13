import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/src/utils/supabase/server'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  
  // ★追加：Cookieから記憶を引き出す！
  const cookieStore = await cookies()
  const nextUrlCookie = cookieStore.get('next_url')?.value
  const next = nextUrlCookie || requestUrl.searchParams.get('next') || '/'

  if (code) {
    const supabase = await createSupabaseServerClient()
    await supabase.auth.exchangeCodeForSession(code)
  }

  // 行き先へリダイレクト
  const redirectUrl = new URL(next, requestUrl.origin)
  redirectUrl.searchParams.set('login', 'success')

  return NextResponse.redirect(redirectUrl, { status: 303 })
}
import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/src/utils/supabase/server'

// ▼ 絶対に追加：このファイルは毎回必ず最新の処理を行うよう強制する（キャッシュ無効化）
export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  
  // バトン（行き先）を受け取る。無ければホームへ。
  const next = requestUrl.searchParams.get('next') || '/'

  if (code) {
    const supabase = await createSupabaseServerClient()
    await supabase.auth.exchangeCodeForSession(code)
  }

  // 行き先へリダイレクト
  const redirectUrl = new URL(next, requestUrl.origin)
  redirectUrl.searchParams.set('login', 'success')

  return NextResponse.redirect(redirectUrl, { status: 303 })
}
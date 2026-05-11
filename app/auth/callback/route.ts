import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/src/utils/supabase/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    // ここが最重要！Googleから受け取ったcodeをSupabaseのログイン情報に変換します
    const supabase = await createSupabaseServerClient()
    await supabase.auth.exchangeCodeForSession(code)
  }

  // 認証が終わったらトップページへ戻す
  return NextResponse.redirect(requestUrl.origin)
}
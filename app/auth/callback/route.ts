import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/src/utils/supabase/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const supabase = await createSupabaseServerClient()
    await supabase.auth.exchangeCodeForSession(code)
  }

  // ▼ ここからが特効薬（キャッシュ無効化の仕組み）です ▼

  // 1. トップページに戻す際、URLの末尾に「?login=success」というおまけをつけます。
  // これによりスマホが「さっきと違う新しいページだ！」と勘違いし、古い記憶を使わなくなります。
  const redirectUrl = new URL('/', requestUrl.origin)
  redirectUrl.searchParams.set('login', 'success')

  // 2. 「303（See Other）」という特別なステータスを使ってリダイレクトします。
  // これはブラウザに「この移動は絶対にキャッシュ（記憶）しないでね！」と命令する効果があります。
  return NextResponse.redirect(redirectUrl, { status: 303 })
}
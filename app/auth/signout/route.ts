import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/src/utils/supabase/server'

export async function POST(request: Request) {
  // Supabaseの受付係を呼び出す
  const supabase = await createSupabaseServerClient()
  
  // ログアウト（セッションの破棄）を実行する
  await supabase.auth.signOut()

  // 処理が終わったら、トップページ（/）へ強制的に戻す
  return NextResponse.redirect(new URL('/', request.url), {
    status: 302,
  })
}
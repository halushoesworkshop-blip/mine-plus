import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/src/utils/supabase/server'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const cookieStore = await cookies()
  const next = cookieStore.get('next_url')?.value || '/'

  if (code) {
    const supabase = await createSupabaseServerClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (error) return NextResponse.redirect(`${requestUrl.origin}/login?error=${error.message}`)
  }

  const response = NextResponse.redirect(new URL(next, requestUrl.origin))
  response.cookies.delete('next_url')
  return response
}
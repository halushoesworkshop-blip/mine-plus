"use client";

import { useState, useMemo, useEffect } from "react";
import { createSupabaseBrowserClient } from "@/src/utils/supabase/client";
import Link from "next/link";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // ★ LINEアプリ内ブラウザからのアクセスかを判定する状態
  const [isLineBrowser, setIsLineBrowser] = useState(false);

  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  useEffect(() => {
    // 画面が開かれたときに、LINEからアクセスされているかチェックする
    const ua = navigator.userAgent || navigator.vendor || (window as any).opera;
    if (ua.indexOf("Line") > -1) {
      setIsLineBrowser(true);
    }
  }, []);

  async function signInWithGoogle() {
    setErrorMessage(null);
    setLoading(true);
    try {
      const searchParams = new URLSearchParams(window.location.search);
      const next = searchParams.get("next") || "/";
      document.cookie = `next_url=${next}; path=/; max-age=3600; SameSite=Lax; Secure`;

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) throw error;
    } catch (err: any) {
      setErrorMessage(err.message);
      setLoading(false);
    }
  }

  // ★ 外部ブラウザ（SafariやChrome）へ強制的にジャンプさせる魔法の処理
  function openExternalBrowser() {
    const url = new URL(window.location.href);
    url.searchParams.set('openExternalBrowser', '1');
    window.location.href = url.toString();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-sm rounded-[32px] bg-white p-8 shadow-xl shadow-slate-200/50 border border-slate-100">
        <div className="text-center">
          <div className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-lime-600 text-white font-black text-xl">
            +
          </div>
          <h1 className="text-2xl font-black tracking-tighter text-slate-900 uppercase mb-2">Login</h1>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-8">Welcome back to mine.</p>
        </div>

        {errorMessage && (
          <div className="mb-6 rounded-2xl bg-rose-50 p-4 text-xs font-bold text-rose-600 border border-rose-100">
            {errorMessage}
          </div>
        )}

        {/* ★ LINEブラウザの時だけ表示される警告＆脱出ボタン */}
        {isLineBrowser && (
          <div className="mb-6 rounded-2xl bg-amber-50 p-4 border border-amber-200">
            <p className="text-sm font-black text-amber-800 mb-2 text-center">⚠️ LINEからはログインできません</p>
            <p className="text-[10px] font-bold text-amber-700 mb-4 text-center leading-relaxed">
              Googleのセキュリティ制限のため、<br />標準ブラウザで開き直す必要があります。
            </p>
            <button
              onClick={openExternalBrowser}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-amber-500 py-3 text-xs font-black text-white shadow-md hover:bg-amber-600 transition-colors active:scale-95"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              標準ブラウザで開き直す
            </button>
          </div>
        )}

        <div className="space-y-4">
          {/* Googleログインボタン */}
          <button
            onClick={signInWithGoogle}
            disabled={loading}
            className="flex w-full items-center justify-center gap-3 rounded-full bg-slate-900 py-4 text-sm font-black text-white transition-all hover:bg-slate-800 active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? (
              <span className="animate-pulse">Loading...</span>
            ) : (
              <>
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Googleでログイン
              </>
            )}
          </button>
        </div>

        <div className="mt-8 text-center">
          <Link href="/" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300 hover:text-lime-600 transition-colors">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { createSupabaseBrowserClient } from "@/src/utils/supabase/client";

function messageForErrorParam(raw: string): string {
  switch (raw) {
    case "auth":
      return "ログインに失敗しました。";
    case "missing_code":
      return "認証情報が不足しています。もう一度お試しください。";
    case "server_config":
      return "サーバー設定が不完全です。環境変数を確認してください。";
    default:
      return decodeURIComponent(raw);
  }
}

export default function LoginPage() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const error = params.get("error");
    if (error) {
      setErrorMessage(messageForErrorParam(error));
    }
  }, []);

  async function signInWithGoogle() {
    setErrorMessage(null);
    setLoading(true);
    try {
      const redirectTo = `${window.location.origin}/auth/callback`;
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo },
      });

      if (error) {
        setErrorMessage(error.message);
        setLoading(false);
        return;
      }

      if (data.url) {
        window.location.assign(data.url);
        return;
      }

      setErrorMessage("ログイン画面のURLを取得できませんでした。");
    } catch {
      setErrorMessage("ログイン開始に失敗しました。時間をおいて再度お試しください。");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <main className="mx-auto flex w-full max-w-md flex-col gap-8 px-6 py-12 md:py-16">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium tracking-wide text-emerald-700">
              LOGIN
            </p>
            <h1 className="mt-2 text-2xl font-bold">ログイン</h1>
            <p className="mt-2 text-sm text-slate-600">
              Google アカウントでサインインしてイベントを投稿できます。
            </p>
          </div>
          <Link
            href="/"
            className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200 hover:bg-slate-50"
          >
            トップへ
          </Link>
        </div>

        <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
          {errorMessage ? (
            <div
              className="mb-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900"
              role="alert"
            >
              {errorMessage}
            </div>
          ) : null}

          <button
            type="button"
            onClick={signInWithGoogle}
            disabled={loading}
            className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <GoogleGlyph className="h-5 w-5 shrink-0" aria-hidden />
            {loading ? "リダイレクト中..." : "Google で続ける"}
          </button>

          <p className="mt-6 text-center text-xs leading-relaxed text-slate-500">
            Supabase の Google 認証を利用します。
            <br />
            ダッシュボードでリダイレクト URL に{" "}
            <code className="rounded bg-slate-100 px-1.5 py-0.5 text-[0.65rem] text-slate-700">
              …/auth/callback
            </code>{" "}
            を登録してください。
          </p>
        </div>
      </main>
    </div>
  );
}

function GoogleGlyph({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

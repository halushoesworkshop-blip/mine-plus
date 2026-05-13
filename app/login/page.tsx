"use client";

import { useState, useMemo } from "react";
import { createSupabaseBrowserClient } from "@/src/utils/supabase/client";
import Link from "next/link";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

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
        },
      });
      if (error) throw error;
    } catch (err: any) {
      setErrorMessage(err.message);
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-sm rounded-[32px] bg-white p-8 shadow-xl border border-slate-100">
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-lime-600 text-white font-black text-xl">+</div>
          <h1 className="text-2xl font-black text-slate-900 uppercase">Login</h1>
        </div>
        {errorMessage && <div className="mb-6 rounded-xl bg-rose-50 p-4 text-xs font-bold text-rose-600">{errorMessage}</div>}
        <button onClick={signInWithGoogle} disabled={loading} className="w-full rounded-full bg-slate-900 py-4 font-black text-white hover:bg-slate-800 disabled:opacity-50">
          Googleでログイン
        </button>
        <div className="mt-8 text-center">
          <Link href="/" className="text-[10px] font-black uppercase text-slate-300 hover:text-lime-600">← Back to Home</Link>
        </div>
      </div>
    </div>
  );
}
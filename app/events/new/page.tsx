"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { createSupabaseBrowserClient } from "@/src/utils/supabase/client";

type EventCategory =
  | "music"
  | "sports"
  | "food"
  | "art"
  | "festival"
  | "workshop"
  | "market"
  | "other";

type FormState = {
  title: string;
  description: string;
  location: string;
  address: string;
  startAtLocal: string;
  endAtLocal: string;
  category: EventCategory;
  isFree: boolean;
  feeText: string;
  capacity: string;
  contactInfo: string;
  externalUrl: string;
};

const categoryLabels: Record<EventCategory, string> = {
  music: "Music",
  sports: "Sports",
  food: "Food",
  art: "Art",
  festival: "Festival",
  workshop: "Workshop",
  market: "Market",
  other: "Other",
};

function toTimestamptzFromLocalInput(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString();
}

export default function NewEventPage() {
  const router = useRouter();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>({
    title: "",
    description: "",
    location: "",
    address: "",
    startAtLocal: "",
    endAtLocal: "",
    category: "festival",
    isFree: true,
    feeText: "",
    capacity: "",
    contactInfo: "",
    externalUrl: "",
  });

  useEffect(() => {
    supabase.auth.getUser().then(({ data, error: authError }) => {
      if (authError) {
        console.error("Auth error:", authError);
        return;
      }
      setUserId(data.user?.id ?? null);
    });
  }, [supabase]);

  // 送信ボタンが押せるかどうかの判定
  const canSubmit =
    !!userId &&
    form.title.trim().length > 0 &&
    form.location.trim().length > 0 &&
    form.startAtLocal.trim().length > 0;

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    console.log("Submit start..."); // デバッグ用
    
    if (loading) return;
    setError(null);

    if (!userId) {
      setError("ログインユーザーの情報が取得できていません。");
      return;
    }

    const start_at = toTimestamptzFromLocalInput(form.startAtLocal);
    const end_at = form.endAtLocal ? toTimestamptzFromLocalInput(form.endAtLocal) : null;
    const capacity = form.capacity.trim().length > 0 ? Number(form.capacity) : null;

    setLoading(true);

    try {
      const payload = {
        user_id: userId,
        title: form.title.trim(),
        description: form.description.trim() || null,
        location: form.location.trim(),
        address: form.address.trim() || null,
        start_at,
        end_at,
        category: form.category,
        is_free: form.isFree,
        fee_text: form.isFree ? null : form.feeText.trim() || null,
        capacity,
        contact_info: form.contactInfo.trim() || null,
        external_url: form.externalUrl.trim() || null,
        status: "published",
      };

      console.log("Sending payload:", payload); // デバッグ用

      const { data, error: insertError } = await supabase
        .from("events")
        .insert(payload)
        .select();

      if (insertError) {
        console.error("Supabase insert error:", insertError);
        setError(`保存エラー: ${insertError.message}`);
        return;
      }

      console.log("Insert success:", data);
      router.push("/");
      router.refresh();
    } catch (err: any) {
      console.error("Unexpected error:", err);
      setError(`予期せぬエラーが発生しました: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <main className="mx-auto w-full max-w-2xl px-6 py-10 md:px-10 md:py-14">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium tracking-wide text-emerald-700">NEW EVENT</p>
            <h1 className="mt-2 text-2xl font-bold md:text-3xl">新しいイベントを投稿</h1>
          </div>
          <Link href="/" className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200 hover:bg-slate-50">
            戻る
          </Link>
        </div>

        {!userId ? (
          <div className="rounded-2xl bg-white p-10 shadow-sm ring-1 ring-slate-200 text-center">
            <p className="text-slate-700 mb-4">投稿するにはログインが必要です。</p>
            <Link href="/login" className="rounded-full bg-emerald-600 px-8 py-3 font-bold text-white">ログイン画面へ</Link>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <div className="grid gap-5">
              {/* タイトル */}
              <div>
                <label className="text-sm font-semibold text-slate-800">タイトル *</label>
                <input value={form.title} onChange={(e) => setForm(p => ({ ...p, title: e.target.value }))} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm" placeholder="例）駅前マルシェ" required />
              </div>

              {/* カテゴリ */}
              <div>
                <label className="text-sm font-semibold text-slate-800">カテゴリ *</label>
                <select value={form.category} onChange={(e) => setForm(p => ({ ...p, category: e.target.value as EventCategory }))} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm">
                  {(Object.keys(categoryLabels) as EventCategory[]).map(key => (
                    <option key={key} value={key}>{categoryLabels[key]}</option>
                  ))}
                </select>
              </div>

              {/* 日時 */}
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-semibold text-slate-800">開始日時 *</label>
                  <input type="datetime-local" value={form.startAtLocal} onChange={(e) => setForm(p => ({ ...p, startAtLocal: e.target.value }))} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm" required />
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-800">終了日時（任意）</label>
                  <input type="datetime-local" value={form.endAtLocal} onChange={(e) => setForm(p => ({ ...p, endAtLocal: e.target.value }))} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm" />
                </div>
              </div>

              {/* 場所 */}
              <div>
                <label className="text-sm font-semibold text-slate-800">場所 *</label>
                <input value={form.location} onChange={(e) => setForm(p => ({ ...p, location: e.target.value }))} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm" placeholder="例）中央広場" required />
              </div>

              {/* その他項目（住所・説明など）は簡略化せず維持 */}
              <div>
                <label className="text-sm font-semibold text-slate-800">説明</label>
                <textarea value={form.description} onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))} className="mt-2 w-full min-h-[100px] rounded-xl border border-slate-200 px-4 py-3 text-sm" placeholder="イベントの詳細" />
              </div>

              {/* 参加費設定 */}
              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
                 <input type="checkbox" id="isFree" checked={form.isFree} onChange={(e) => setForm(p => ({ ...p, isFree: e.target.checked }))} className="w-5 h-5" />
                 <label htmlFor="isFree" className="text-sm font-bold">参加費無料</label>
                 {!form.isFree && (
                   <input value={form.feeText} onChange={(e) => setForm(p => ({ ...p, feeText: e.target.value }))} className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm" placeholder="料金（例：500円）" />
                 )}
              </div>

              {error && (
                <div className="rounded-xl bg-rose-50 p-4 text-sm text-rose-600 font-bold border border-rose-100">
                  {error}
                </div>
              )}

              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  disabled={!canSubmit || loading}
                  className="rounded-full bg-emerald-600 px-10 py-4 font-bold text-white shadow-lg hover:bg-emerald-700 disabled:bg-slate-300 transition-all active:scale-95"
                >
                  {loading ? "送信中..." : "イベントを投稿する"}
                </button>
              </div>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}
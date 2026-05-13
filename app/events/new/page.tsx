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
  area: string; // ★追加：地区
  location: string;
  address: string;
  startAtLocal: string;
  endAtLocal: string;
  category: EventCategory;
  isFree: boolean;
  feeText: string;
  capacity: string;
  contactInfo: string;
  externalUrl: string; // URL用
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
    area: "", // 初期値は空
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

  // ★修正：送信ボタンが押せる条件に「地区（area）」の入力も含める
  const canSubmit =
    !!userId &&
    form.title.trim().length > 0 &&
    form.area.trim().length > 0 &&
    form.location.trim().length > 0 &&
    form.startAtLocal.trim().length > 0;

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
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
        area: form.area, // ★追加：地区を保存
        location: form.location.trim(),
        address: form.address.trim() || null,
        start_at,
        end_at,
        category: form.category,
        is_free: form.isFree,
        fee_text: form.isFree ? null : form.feeText.trim() || null,
        price: form.isFree ? "無料" : form.feeText.trim(), // ★追加：価格（無料/金額）を保存
        capacity,
        contact_info: form.contactInfo.trim() || null,
        external_url: form.externalUrl.trim() || null,
        url: form.externalUrl.trim() || null, // ★追加：URLを保存
        status: "published",
      };

      const { data, error: insertError } = await supabase
        .from("events")
        .insert(payload)
        .select();

      if (insertError) {
        setError(`保存エラー: ${insertError.message}`);
        return;
      }

      router.push("/");
      router.refresh();
    } catch (err: any) {
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
            <Link href="/login?next=/events/new" className="rounded-full bg-emerald-600 px-8 py-3 font-bold text-white">ログイン画面へ</Link>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <div className="grid gap-6">
              
              {/* タイトル */}
              <div>
                <label className="text-sm font-semibold text-slate-800">タイトル *</label>
                <input value={form.title} onChange={(e) => setForm(p => ({ ...p, title: e.target.value }))} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-emerald-500 focus:ring-emerald-500" placeholder="例）駅前マルシェ" required />
              </div>

              {/* 地区とカテゴリを横並びに */}
              <div className="grid gap-4 md:grid-cols-2">
                {/* ★新規追加：地区 */}
                <div>
                  <label className="text-sm font-semibold text-slate-800">地区 *</label>
                  <select value={form.area} onChange={(e) => setForm(p => ({ ...p, area: e.target.value }))} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-emerald-500 focus:ring-emerald-500" required>
                    <option value="" disabled>地区を選択してください</option>
                    <option value="美祢地区">美祢地区</option>
                    <option value="秋芳地区">秋芳地区</option>
                    <option value="美東地区">美東地区</option>
                  </select>
                </div>
                
                {/* カテゴリ */}
                <div>
                  <label className="text-sm font-semibold text-slate-800">カテゴリ *</label>
                  <select value={form.category} onChange={(e) => setForm(p => ({ ...p, category: e.target.value as EventCategory }))} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-emerald-500 focus:ring-emerald-500">
                    {(Object.keys(categoryLabels) as EventCategory[]).map(key => (
                      <option key={key} value={key}>{categoryLabels[key]}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 日時 */}
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-semibold text-slate-800">開始日時 *</label>
                  <input type="datetime-local" value={form.startAtLocal} onChange={(e) => setForm(p => ({ ...p, startAtLocal: e.target.value }))} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-emerald-500 focus:ring-emerald-500" required />
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-800">終了日時（任意）</label>
                  <input type="datetime-local" value={form.endAtLocal} onChange={(e) => setForm(p => ({ ...p, endAtLocal: e.target.value }))} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-emerald-500 focus:ring-emerald-500" />
                </div>
              </div>

              {/* 場所 */}
              <div>
                <label className="text-sm font-semibold text-slate-800">開催場所の名前 *</label>
                <input value={form.location} onChange={(e) => setForm(p => ({ ...p, location: e.target.value }))} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-emerald-500 focus:ring-emerald-500" placeholder="例）美祢市中央広場" required />
              </div>

              {/* ★新規追加：URL */}
              <div>
                <label className="text-sm font-semibold text-slate-800">関連URL（任意）</label>
                <input type="url" value={form.externalUrl} onChange={(e) => setForm(p => ({ ...p, externalUrl: e.target.value }))} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-emerald-500 focus:ring-emerald-500" placeholder="例）https://..." />
              </div>

              {/* 説明 */}
              <div>
                <label className="text-sm font-semibold text-slate-800">イベントの詳細</label>
                <textarea value={form.description} onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))} className="mt-2 w-full min-h-[120px] rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-emerald-500 focus:ring-emerald-500" placeholder="イベントの見どころや注意事項など" />
              </div>

              {/* ★UI改善：参加費設定（見やすくしました） */}
              <div className="flex flex-col gap-2 p-4 bg-slate-50 rounded-xl border border-slate-100">
                 <label className="text-sm font-semibold text-slate-800">参加費・料金</label>
                 <div className="flex items-center gap-4 mt-1">
                   <label className="flex items-center gap-2 cursor-pointer">
                     <input type="checkbox" checked={form.isFree} onChange={(e) => setForm(p => ({ ...p, isFree: e.target.checked, feeText: e.target.checked ? "" : p.feeText }))} className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500" />
                     <span className="text-sm font-bold text-slate-700">無料</span>
                   </label>
                   {!form.isFree && (
                     <input value={form.feeText} onChange={(e) => setForm(p => ({ ...p, feeText: e.target.value }))} className="flex-1 rounded-lg border border-slate-200 px-4 py-2 text-sm focus:border-emerald-500 focus:ring-emerald-500" placeholder="例：大人 500円、高校生以下 無料" required />
                   )}
                 </div>
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
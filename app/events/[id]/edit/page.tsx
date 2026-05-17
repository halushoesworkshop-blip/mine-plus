"use client";

import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { createSupabaseBrowserClient } from "@/src/utils/supabase/client";

type EventCategory = "music" | "sports" | "food" | "art" | "festival" | "workshop" | "market" | "other";

const categoryLabels: Record<EventCategory, string> = {
  music: "Music", sports: "Sports", food: "Food", art: "Art", festival: "Festival", workshop: "Workshop", market: "Market", other: "Other",
};

// DBのタイムスタンプから「日付(YYYY-MM-DD)」と「時間(HH:MM)」を切り分ける関数
function parseTimestamp(ts: string | null) {
  if (!ts) return { date: "", time: "" };
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return { date: "", time: "" };
  return {
    date: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`,
    time: `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`
  };
}

export default function EditEventPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: "", description: "", area: "", location: "", address: "", startDate: "", startTime: "", endDate: "", endTime: "", category: "festival" as EventCategory, isFree: true, feeText: "", capacity: "", contactInfo: "", externalUrl: "",
  });

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));
  }, [supabase]);

  useEffect(() => {
    async function loadEvent() {
      if (!id) return;
      const { data, error } = await supabase.from("events").select("*").eq("id", id).single();
      if (error || !data) {
        setError("イベント情報の取得に失敗しました。");
        setInitialLoading(false);
        return;
      }
      const start = parseTimestamp(data.start_at);
      const end = parseTimestamp(data.end_at);
      
      setForm({
        title: data.title,
        description: data.description || "",
        area: data.area,
        location: data.location,
        address: data.address || "",
        startDate: start.date,
        startTime: start.time,
        endDate: end.date,
        endTime: end.time,
        category: data.category as EventCategory,
        isFree: data.is_free,
        feeText: data.is_free ? "" : (data.price || data.fee_text || ""),
        capacity: data.capacity ? String(data.capacity) : "",
        contactInfo: data.contact_info || "",
        externalUrl: data.external_url || data.url || "",
      });
      setExistingImageUrl(data.image_url);
      setInitialLoading(false);
    }
    loadEvent();
  }, [id, supabase]);

  const canSubmit = form.title.trim().length > 0 && form.area.trim().length > 0 && form.location.trim().length > 0;

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (loading) return;
    setError(null);
    setLoading(true);

    try {
      let imageUrl = existingImageUrl;
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('event-images').upload(fileName, imageFile, { cacheControl: '3600', upsert: false });
        if (uploadError) throw new Error(`画像のアップロードに失敗: ${uploadError.message}`);
        const { data: publicUrlData } = supabase.storage.from('event-images').getPublicUrl(fileName);
        imageUrl = publicUrlData.publicUrl;
      }

      const start_at = form.startDate ? new Date(`${form.startDate}T${form.startTime || "00:00"}:00`).toISOString() : null;
      const end_at = form.endDate ? new Date(`${form.endDate}T${form.endTime || "00:00"}:00`).toISOString() : null;

      const payload = {
        title: form.title.trim(),
        description: form.description.trim() || null,
        area: form.area,
        location: form.location.trim(),
        address: form.address.trim() || null,
        start_at,
        end_at,
        category: form.category,
        is_free: form.isFree,
        fee_text: form.isFree ? null : form.feeText.trim() || null,
        price: form.isFree ? "無料" : form.feeText.trim() || null,
        capacity: form.capacity.trim().length > 0 ? Number(form.capacity) : null,
        contact_info: form.contactInfo.trim() || null,
        external_url: form.externalUrl.trim() || null,
        image_url: imageUrl,
      };

      const { error: updateError } = await supabase.from("events").update(payload).eq("id", id);
      if (updateError) throw new Error(`保存エラー: ${updateError.message}`);

      router.push(`/events/${id}`);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "予期せぬエラーが発生しました");
      setLoading(false);
    }
  }

  if (initialLoading) return <div className="p-10 text-center text-sm text-slate-500">読み込み中...</div>;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <main className="mx-auto w-full max-w-2xl px-6 py-10 md:px-10 md:py-14">
        <div className="mb-8 flex items-center justify-between">
          <div><p className="text-sm font-medium tracking-wide text-emerald-700">EDIT EVENT</p><h1 className="mt-2 text-2xl font-bold">イベントを編集</h1></div>
          <Link href={`/events/${id}`} className="rounded-full bg-white px-4 py-2 text-sm font-semibold shadow-sm border hover:bg-slate-50">キャンセル</Link>
        </div>

        <form onSubmit={onSubmit} className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <div className="grid gap-6">
              <div>
                <label className="text-sm font-semibold text-slate-800">タイトル *</label>
                <input value={form.title} onChange={(e) => setForm(p => ({ ...p, title: e.target.value }))} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm" required />
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-800">チラシ・画像（変更する場合のみ）</label>
                {existingImageUrl && !imageFile && <div className="mt-2 mb-2"><img src={existingImageUrl} alt="Current" className="h-20 w-auto rounded border" /></div>}
                <input type="file" accept="image/jpeg, image/png, image/webp" onChange={(e) => setImageFile(e.target.files?.[0] || null)} className="mt-2 w-full text-sm border p-2 rounded-xl" />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-semibold text-slate-800">地区 *</label>
                  <select value={form.area} onChange={(e) => setForm(p => ({ ...p, area: e.target.value }))} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm" required>
                    <option value="美祢地区">美祢地区</option><option value="秋芳地区">秋芳地区</option><option value="美東地区">美東地区</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-800">カテゴリ *</label>
                  <select value={form.category} onChange={(e) => setForm(p => ({ ...p, category: e.target.value as EventCategory }))} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm">
                    {(Object.keys(categoryLabels) as EventCategory[]).map(key => <option key={key} value={key}>{categoryLabels[key]}</option>)}
                  </select>
                </div>
              </div>

              {/* 日時と時間の分離（編集画面） */}
              <div className="grid gap-4 md:grid-cols-2 p-4 bg-slate-50 rounded-xl border">
                <div>
                  <label className="text-sm font-semibold text-slate-800">開始日（任意）</label>
                  <input type="date" value={form.startDate} onChange={(e) => setForm(p => ({ ...p, startDate: e.target.value }))} className="mt-2 w-full rounded-xl border px-4 py-3 text-sm" />
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-800">開始時間（任意）</label>
                  <input type="time" value={form.startTime} onChange={(e) => setForm(p => ({ ...p, startTime: e.target.value }))} className="mt-2 w-full rounded-xl border px-4 py-3 text-sm" />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2 p-4 bg-slate-50 rounded-xl border">
                <div>
                  <label className="text-sm font-semibold text-slate-800">終了日（任意）</label>
                  <input type="date" value={form.endDate} onChange={(e) => setForm(p => ({ ...p, endDate: e.target.value }))} className="mt-2 w-full rounded-xl border px-4 py-3 text-sm" />
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-800">終了時間（任意）</label>
                  <input type="time" value={form.endTime} onChange={(e) => setForm(p => ({ ...p, endTime: e.target.value }))} className="mt-2 w-full rounded-xl border px-4 py-3 text-sm" />
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-800">開催場所の名前 *</label>
                <input value={form.location} onChange={(e) => setForm(p => ({ ...p, location: e.target.value }))} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm" required />
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-800">関連URL（任意）</label>
                <input type="url" value={form.externalUrl} onChange={(e) => setForm(p => ({ ...p, externalUrl: e.target.value }))} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm" />
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-800">イベントの詳細</label>
                <textarea value={form.description} onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))} className="mt-2 w-full min-h-[120px] rounded-xl border border-slate-200 px-4 py-3 text-sm" />
              </div>

              <div className="flex flex-col gap-2 p-4 bg-slate-50 rounded-xl border border-slate-100">
                 <label className="text-sm font-semibold text-slate-800">参加費・料金</label>
                 <div className="flex items-center gap-4 mt-1">
                   <label className="flex items-center gap-2 cursor-pointer">
                     <input type="checkbox" checked={form.isFree} onChange={(e) => setForm(p => ({ ...p, isFree: e.target.checked, feeText: e.target.checked ? "" : p.feeText }))} className="w-5 h-5 text-emerald-600 rounded" />
                     <span className="text-sm font-bold text-slate-700">無料</span>
                   </label>
                   {!form.isFree && <input value={form.feeText} onChange={(e) => setForm(p => ({ ...p, feeText: e.target.value }))} className="flex-1 rounded-lg border border-slate-200 px-4 py-2 text-sm" placeholder="例：大人 500円" />}
                 </div>
              </div>

              {error && <div className="rounded-xl bg-rose-50 p-4 text-sm text-rose-600 font-bold border border-rose-100">{error}</div>}

              <div className="flex justify-end pt-4">
                <button type="submit" disabled={!canSubmit || loading} className="rounded-full bg-emerald-600 px-10 py-4 font-bold text-white shadow-lg hover:bg-emerald-700 disabled:bg-slate-300">
                  {loading ? "更新中..." : "イベントを更新する"}
                </button>
              </div>
            </div>
          </form>
      </main>
    </div>
  );
}
"use client";

import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { createSupabaseBrowserClient } from "@/src/utils/supabase/client";

// カテゴリ定義
type EventCategory = "music" | "sports" | "food" | "art" | "festival" | "workshop" | "market" | "other";

const categoryLabels: Record<EventCategory, string> = {
  music: "Music", sports: "Sports", food: "Food", art: "Art", 
  festival: "Festival", workshop: "Workshop", market: "Market", other: "Other",
};

export default function EditEventPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params.id as string;
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ★修正：area（地区）をフォームの初期状態に追加
  const [form, setForm] = useState({
    title: "",
    description: "",
    area: "", // ★追加
    location: "",
    address: "",
    category: "festival" as EventCategory,
    startAtLocal: "",
    endAtLocal: "",
    isFree: true,
    feeText: "",
    capacity: "",
    contactInfo: "",
    externalUrl: "",
  });

  useEffect(() => {
    async function loadEvent() {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: event, error: fetchError } = await supabase
        .from("events")
        .select("*")
        .eq("id", eventId)
        .single();

      if (fetchError || !event) {
        setError("イベントが見つかりませんでした。");
        setLoading(false);
        return;
      }

      if (user && event.user_id !== user.id) {
        setError("あなたにはこのイベントを編集する権限がありません。");
        setLoading(false);
        return;
      }

      // 日時を input[type="datetime-local"] で扱える形式に変換
      const formatLocal = (dateStr: string | null) => {
        if (!dateStr) return "";
        const d = new Date(dateStr);
        const pad = (n: number) => n.toString().padStart(2, '0');
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
      };

      // ★修正：DBから読み込んだ「地区（area）」をセットする
      setForm({
        title: event.title || "",
        description: event.description || "",
        area: event.area || "", // ★追加
        location: event.location || "",
        address: event.address || "",
        category: (event.category as EventCategory) || "festival",
        startAtLocal: formatLocal(event.start_at),
        endAtLocal: formatLocal(event.end_at),
        isFree: event.is_free ?? true,
        feeText: event.fee_text || "",
        capacity: event.capacity?.toString() || "",
        contactInfo: event.contact_info || "",
        externalUrl: event.external_url || event.url || "", // 念のためurlカラムも考慮
      });
      setLoading(false);
    }
    loadEvent();
  }, [eventId, supabase]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    setError(null);
    
    try {
      // ★修正：更新時に、area、price、url の3つも保存するように追加
      const { error: updateError } = await supabase
        .from("events")
        .update({
          title: form.title.trim(),
          description: form.description.trim() || null,
          area: form.area, // ★追加
          location: form.location.trim(),
          address: form.address.trim() || null,
          start_at: new Date(form.startAtLocal).toISOString(),
          end_at: form.endAtLocal ? new Date(form.endAtLocal).toISOString() : null,
          category: form.category,
          is_free: form.isFree,
          fee_text: form.isFree ? null : form.feeText.trim() || null,
          price: form.isFree ? "無料" : form.feeText.trim(), // ★追加：料金
          capacity: form.capacity.trim() ? Number(form.capacity) : null,
          contact_info: form.contactInfo.trim() || null,
          external_url: form.externalUrl.trim() || null,
          url: form.externalUrl.trim() || null, // ★追加：URL
        })
        .eq("id", eventId);

      if (updateError) throw updateError;

      // 【反映を確実にする】キャッシュを無視してトップ画面を強制リロードで開く
      window.location.replace("/"); 

    } catch (err: any) {
      setError("保存に失敗しました: " + err.message);
      setSaving(false);
    }
  }

  if (loading) return <div className="p-20 text-center font-black text-slate-400">LOADING...</div>;
  if (error) return <div className="p-20 text-center text-rose-500 font-black">{error}</div>;

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-14 text-slate-900 selection:bg-yellow-200">
      <main className="mx-auto max-w-2xl bg-white p-8 rounded-[40px] shadow-sm border border-slate-200">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-700">Edit Event</p>
            <h1 className="mt-1 text-2xl font-black tracking-tighter">イベントを編集</h1>
          </div>
          <Link href="/" className="text-[10px] font-black text-slate-400 hover:text-slate-900 transition uppercase tracking-widest">Cancel</Link>
        </div>

        <form onSubmit={onSubmit} className="grid gap-6">
          {/* タイトル */}
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Title *</label>
            <input value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="w-full border-slate-200 border-2 rounded-2xl p-4 font-bold outline-none focus:border-yellow-400 transition" required />
          </div>

          {/* ★修正：地区 と カテゴリ を横並びに */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Area *</label>
              <select value={form.area} onChange={e => setForm({...form, area: e.target.value})} className="w-full border-slate-200 border-2 rounded-2xl p-4 font-bold outline-none focus:border-yellow-400 appearance-none bg-white" required>
                <option value="" disabled>地区を選択</option>
                <option value="美祢地区">美祢地区</option>
                <option value="秋芳地区">秋芳地区</option>
                <option value="美東地区">美東地区</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Category *</label>
              <select value={form.category} onChange={e => setForm({...form, category: e.target.value as EventCategory})} className="w-full border-slate-200 border-2 rounded-2xl p-4 font-bold outline-none focus:border-yellow-400 appearance-none bg-white">
                {Object.keys(categoryLabels).map(key => (
                  <option key={key} value={key}>{(categoryLabels as any)[key]}</option>
                ))}
              </select>
            </div>
          </div>

          {/* 日時 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Start Date *</label>
              <input type="datetime-local" value={form.startAtLocal} onChange={e => setForm({...form, startAtLocal: e.target.value})} className="w-full border-slate-200 border-2 rounded-2xl p-4 font-bold" required />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">End Date</label>
              <input type="datetime-local" value={form.endAtLocal} onChange={e => setForm({...form, endAtLocal: e.target.value})} className="w-full border-slate-200 border-2 rounded-2xl p-4 font-bold" />
            </div>
          </div>

          {/* 場所・住所 */}
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Location *</label>
            <input value={form.location} onChange={e => setForm({...form, location: e.target.value})} className="w-full border-slate-200 border-2 rounded-2xl p-4 font-bold" required />
          </div>
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Address</label>
            <input value={form.address} onChange={e => setForm({...form, address: e.target.value})} className="w-full border-slate-200 border-2 rounded-2xl p-4 font-bold" placeholder="美祢市..." />
          </div>

          {/* 説明 */}
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Description</label>
            <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full border-slate-200 border-2 rounded-2xl p-4 font-bold min-h-[120px]" placeholder="内容、持ち物、注意事項など" />
          </div>

          {/* 参加費設定 【Newと完全一致】 */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-center justify-between rounded-2xl border-2 border-slate-200 bg-slate-50 px-5 py-4">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Free Event</span>
              <input type="checkbox" checked={form.isFree} onChange={(e) => setForm({...form, isFree: e.target.checked})} className="h-6 w-6 rounded-lg border-slate-300 text-yellow-400 focus:ring-yellow-400" />
            </div>
            <div>
              <label className="text-[8px] font-black uppercase text-slate-300 mb-1 block">Fee info</label>
              <input value={form.feeText} onChange={(e) => setForm({...form, feeText: e.target.value})} disabled={form.isFree} className="w-full rounded-2xl border-2 border-slate-200 px-5 py-4 font-bold disabled:bg-slate-50 disabled:text-slate-300" placeholder="例）500円" />
            </div>
          </div>

          {/* 定員・連絡先 【Newと完全一致】 */}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Capacity</label>
              <input value={form.capacity} onChange={e => setForm({...form, capacity: e.target.value})} className="w-full rounded-2xl border-2 border-slate-200 px-5 py-4 font-bold" placeholder="例）30" />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Contact Info</label>
              <input value={form.contactInfo} onChange={e => setForm({...form, contactInfo: e.target.value})} className="w-full rounded-2xl border-2 border-slate-200 px-5 py-4 font-bold" placeholder="連絡先" />
            </div>
          </div>

          {/* URL 【Newと完全一致】 */}
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">External URL</label>
            <input value={form.externalUrl} onChange={e => setForm({...form, externalUrl: e.target.value})} className="w-full border-slate-200 border-2 rounded-2xl p-4 font-bold" placeholder="https://..." />
          </div>

          {error && <p className="text-rose-500 text-xs font-black text-center">{error}</p>}

          <button 
            type="submit" 
            disabled={saving} 
            className="w-full bg-black text-white p-5 rounded-full font-black uppercase tracking-widest hover:bg-yellow-400 hover:text-black transition-all shadow-xl disabled:bg-slate-200"
          >
            {saving ? "Updating..." : "変更を保存する"}
          </button>
        </form>
      </main>
    </div>
  );
}
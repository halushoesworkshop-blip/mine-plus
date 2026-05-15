import { createSupabaseServerClient } from "@/src/utils/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();

  const { data: event, error } = await supabase
    .from("events")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !event) {
    notFound();
  }

  const startDate = new Date(event.start_at);
  const endDate = event.end_at ? new Date(event.end_at) : null;

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-white pb-20 text-slate-900">
      {/* ヘッダーナビゲーション（Backボタンのみに整理） */}
      <nav className="sticky top-0 z-10 flex items-center bg-white/80 px-6 py-4 backdrop-blur-md">
        <Link href="/" className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-900">
          ← Back
        </Link>
      </nav>

      <main className="mx-auto max-w-2xl px-6">
        <div className="mt-8">
          {/* カテゴリと地区をタイトルの上に配置 */}
          <div className="flex items-center gap-2 mb-4">
            <span className="rounded-md bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-600 border border-emerald-100">
              {event.area}
            </span>
            <span className="rounded-md bg-slate-100 px-2 py-1 text-[10px] font-black uppercase tracking-tighter text-slate-500">
              {event.category}
            </span>
          </div>
          
          <h1 className="text-3xl font-black leading-tight tracking-tighter text-slate-900 md:text-4xl">
            {event.title}
          </h1>

          {/* 基本情報エリア */}
          <div className="mt-8 space-y-6">
            {/* 開催日時 */}
            <div className="flex gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-400">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Date & Time</p>
                <p className="mt-1 text-sm font-bold">
                  {formatDate(startDate)}
                  {endDate && ` 〜 `}
                  {endDate && formatDate(endDate)}
                </p>
              </div>
            </div>

            {/* 開催場所 */}
            <div className="flex gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-400">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Location</p>
                <p className="mt-1 text-sm font-bold">{event.location}</p>
                {event.address && <p className="text-xs font-medium text-slate-500 mt-0.5">{event.address}</p>}
              </div>
            </div>

            {/* 料金 */}
            <div className="flex gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-400">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Fee</p>
                <p className="mt-1 text-sm font-bold">{event.is_free ? "無料" : event.price || event.fee_text}</p>
              </div>
            </div>
          </div>

          {/* イベント詳細文 */}
          {event.description && (
            <div className="mt-12">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Description</p>
              <div className="whitespace-pre-wrap text-sm font-medium leading-relaxed text-slate-600">
                {event.description}
              </div>
            </div>
          )}

          {/* チラシ・画像エリア（一番下に配置） */}
          {event.image_url && (
            <div className="mt-12">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Flyer / Image</p>
              <div className="max-w-sm mx-auto relative overflow-hidden rounded-2xl bg-slate-50 border border-slate-100 shadow-lg shadow-slate-100/50">
                <img
                  src={event.image_url}
                  alt={event.title}
                  className="h-auto w-full object-cover"
                />
              </div>
            </div>
          )}

          {/* 外部リンクボタン（url または external_url のどちらかがあれば表示） */}
          {(event.url || event.external_url) && (
            <div className="mt-12">
              <a
                href={event.url || event.external_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-full items-center justify-center rounded-full bg-slate-900 px-8 py-4 text-sm font-black text-white transition-all hover:bg-slate-800 active:scale-95 shadow-xl shadow-slate-200"
              >
                公式サイトを見る
                <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
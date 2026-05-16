import { createSupabaseServerClient } from "@/src/utils/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import DeleteButton from "@/components/DeleteButton";

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();

  const { data: { user } } = await supabase.auth.getUser();

  const { data: event, error } = await supabase
    .from("events")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !event) {
    notFound();
  }

  const isOwner = user && user.id === event.user_id;

  // ★修正：start_at が無い（null）場合は null のまま扱う
  const startDate = event.start_at ? new Date(event.start_at) : null;
  const endDate = event.end_at ? new Date(event.end_at) : null;

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("ja-JP", {
      year: "numeric", month: "long", day: "numeric", weekday: "short", hour: "2-digit", minute: "2-digit",
    });
  };

  const flyerImage = event.image_url;
  const officialLink = event.external_url || event.url;

  return (
    <div className="min-h-screen bg-white pb-20 text-slate-900">
      <nav className="sticky top-0 z-10 flex items-center justify-between bg-white/80 px-6 py-4 backdrop-blur-md">
        <Link href="/" className="text-xs font-black tracking-widest text-slate-400 hover:text-slate-900">← 戻る</Link>
        {isOwner && (
          <div className="flex items-center gap-4">
            <Link href={`/events/${id}/edit`} className="text-[10px] font-black tracking-widest text-slate-400 hover:text-emerald-600 transition-colors">編集</Link>
            <DeleteButton eventId={id} />
          </div>
        )}
      </nav>

      <main className="mx-auto max-w-2xl px-6">
        <div className="mt-8">
          <div className="flex items-center gap-2 mb-4">
            <span className="rounded-md bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-600 border border-emerald-100">{event.area}</span>
            <span className="rounded-md bg-slate-100 px-2 py-1 text-[10px] font-black uppercase tracking-tighter text-slate-500">{event.category}</span>
          </div>
          
          <h1 className="text-3xl font-black leading-tight tracking-tighter text-slate-900 md:text-4xl">{event.title}</h1>

          <div className="mt-8 space-y-6">
            <div className="flex gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-400">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="text-[10px] font-black tracking-widest text-slate-400">開催日時</p>
                <p className="mt-1 text-sm font-bold">
                  {/* ★修正：開始日時も終了日時もない場合は「未定」と表示 */}
                  {!startDate && !endDate ? (
                    "未定"
                  ) : (
                    <>
                      {startDate ? formatDate(startDate) : "未定"}
                      {endDate && ` 〜 `}
                      {endDate && formatDate(endDate)}
                    </>
                  )}
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-400">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <p className="text-[10px] font-black tracking-widest text-slate-400">場所</p>
                <p className="mt-1 text-sm font-bold">{event.location}</p>
                {event.address && <p className="text-xs font-medium text-slate-500 mt-0.5">{event.address}</p>}
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-400">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2z" />
                </svg>
              </div>
              <div>
                <p className="text-[10px] font-black tracking-widest text-slate-400">料金</p>
                <p className="mt-1 text-sm font-bold">{event.is_free ? "無料" : event.price || event.fee_text}</p>
              </div>
            </div>
          </div>

          {event.description && (
            <div className="mt-12">
              <p className="text-[10px] font-black tracking-widest text-slate-400 mb-4">イベント詳細</p>
              <div className="whitespace-pre-wrap text-sm font-medium leading-relaxed text-slate-600">{event.description}</div>
            </div>
          )}

          {flyerImage && (
            <div className="mt-12">
              <p className="text-[10px] font-black tracking-widest text-slate-400 mb-4">チラシ・画像</p>
              <div className="max-w-sm mx-auto relative overflow-hidden rounded-2xl bg-slate-50 border border-slate-100 shadow-lg shadow-slate-100/50">
                <img src={flyerImage} alt={event.title} className="h-auto w-full object-cover" />
              </div>
            </div>
          )}

          {officialLink && officialLink.trim() !== "" && (
            <div className="mt-12">
              <a href={officialLink.startsWith('http') ? officialLink : `https://${officialLink}`} target="_blank" rel="noopener noreferrer" className="inline-flex w-full items-center justify-center rounded-full bg-slate-900 px-8 py-4 text-sm font-black text-white transition-all hover:bg-slate-800 active:scale-95 shadow-xl shadow-slate-200">
                公式サイトを見る
              </a>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
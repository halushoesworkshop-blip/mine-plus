import Link from "next/link";
import { createSupabaseServerClient } from "@/src/utils/supabase/server";
import { notFound } from "next/navigation";
import DeleteButton from "@/components/DeleteButton";

function formatEventDate(dateString: string) {
  const isUTC = dateString.includes('Z') || dateString.includes('+');
  const safeDateString = isUTC ? dateString : dateString + '+09:00';
  const date = new Date(safeDateString);
  return new Intl.DateTimeFormat("ja-JP", {
    timeZone: "Asia/Tokyo", month: "short", day: "numeric", weekday: "short", hour: "2-digit", minute: "2-digit",
  }).format(date);
}

export default async function EventDetail(props: { params: Promise<{ id: string }> }) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  const params = await props.params;
  const eventId = params.id;

  const { data: event } = await supabase.from("events").select("*").eq("id", eventId).single();

  if (!event) notFound();

  // 自分が投稿したものなら編集・削除ボタンを出す
  const isOwner = user && user.id === event.user_id;

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-slate-900 font-sans selection:bg-lime-300">
      <main className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-10 md:py-16">
        <Link href="/" className="text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors w-fit">
          ← Back to Home
        </Link>

        <article className="rounded-[40px] bg-white p-8 md:p-12 shadow-sm border border-slate-100">
          <div className="flex justify-between items-start mb-8">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-lime-700 bg-lime-100 px-4 py-2 rounded-md">{event.category}</span>
            {isOwner && (
              <div className="flex gap-4 items-center">
                <Link href={`/events/${event.id}/edit`} className="text-[10px] font-black text-slate-400 hover:text-slate-900 uppercase tracking-widest underline decoration-2 underline-offset-4">Edit</Link>
                <DeleteButton eventId={event.id} />
              </div>
            )}
          </div>

          <h1 className="text-3xl md:text-4xl font-black leading-tight text-slate-900 mb-8 tracking-tighter">{event.title}</h1>

          <div className="flex flex-col gap-5 border-t border-b border-slate-50 py-8 mb-8">
            <div className="flex flex-col gap-1.5">
              <span className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-300">Date & Time</span>
              <p className="text-sm font-black text-slate-900 tracking-widest">{formatEventDate(event.start_at)}</p>
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-300">Location</span>
              <p className="text-sm font-black text-slate-900 tracking-widest">{event.location}</p>
            </div>
          </div>

          {/* 今後「イベントの詳細説明」の入力欄を増やしたときのための場所 */}
          {event.description && (
            <div className="whitespace-pre-wrap text-sm font-bold leading-relaxed text-slate-600">
              {event.description}
            </div>
          )}
        </article>
      </main>
    </div>
  );
}
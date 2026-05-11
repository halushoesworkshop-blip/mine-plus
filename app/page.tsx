import Link from "next/link";
import { createSupabaseServerClient } from "@/src/utils/supabase/server";
import EventCalendar from "@/components/EventCalendar";
import DeleteButton from "@/components/DeleteButton";

export const revalidate = 0;
export const dynamic = "force-dynamic";

function formatEventDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString("ja-JP", {
    month: "short", day: "numeric", weekday: "short", hour: "2-digit", minute: "2-digit",
  });
}

export default async function Home(props: { searchParams: Promise<{ category?: string }> }) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  const searchParams = await props.searchParams;
  const selectedCategory = searchParams.category;

  let query = supabase.from("events").select("*").order("start_at", { ascending: true });
  if (selectedCategory) {
    query = query.eq("category", selectedCategory);
  }
  const { data: events } = await query;
  const upcomingEvents = events || [];
  const { count: totalUserCount } = await supabase.from("profiles").select("*", { count: "exact", head: true });

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-slate-900 font-sans selection:bg-yellow-300">
      <main className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 md:px-10 md:py-12">
        
        {/* ナビゲーション */}
        <nav className="flex justify-between items-center px-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-lime-600 rounded-lg flex items-center justify-center shadow-lg shadow-lime-600/20">
              <span className="text-white font-black text-xl leading-none">+</span>
            </div>
            <p className="text-2xl font-black tracking-tighter text-slate-900 uppercase">mine<span className="text-lime-600">.</span></p>
          </div>
          {user ? (
            <div className="flex items-center gap-3 bg-white p-1.5 pr-4 rounded-full border border-slate-200 shadow-sm transition hover:shadow-md">
              <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center text-[10px] font-black text-white uppercase">
                {user.email?.charAt(0)}
              </div>
              <form action="/auth/signout" method="post">
                <button className="text-[10px] font-black text-rose-500 hover:text-rose-600 uppercase tracking-widest">Logout</button>
              </form>
            </div>
          ) : (
            <Link href="/login" className="text-[10px] font-black bg-slate-900 text-white px-6 py-3 rounded-full hover:bg-lime-600 transition-all uppercase tracking-widest shadow-lg shadow-slate-900/10">Login</Link>
          )}
        </nav>

        {/* ヒーローセクション（宿泊の文言を削除） */}
        <section className="relative overflow-hidden rounded-[48px] bg-yellow-400 p-12 md:p-24 flex flex-col items-center text-center shadow-2xl shadow-yellow-400/20">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.4)_0%,transparent_60%)] pointer-events-none" />
          <h1 className="text-6xl font-black md:text-[110px] tracking-tighter text-slate-900 leading-[0.8] mb-8 uppercase">MINE<span className="opacity-20">+</span></h1>
          <p className="max-w-md text-sm md:text-base font-bold text-slate-800 leading-relaxed mb-12 tracking-tight">
            美祢市の現在をナビゲートするプラットフォーム。<br className="hidden md:block" />最新のイベント情報をリアルタイムに共有。
          </p>
          <Link href="/events/new" className="group relative rounded-full bg-slate-900 px-12 py-5 font-black text-white transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-slate-900/40 uppercase tracking-widest text-xs">
            <span className="relative z-10 flex items-center gap-3">Create New Event <span className="group-hover:translate-x-1 transition-transform">→</span></span>
          </Link>
        </section>

        {/* メイングリッド */}
        <div className="grid gap-8 lg:grid-cols-[1fr_1.5fr_1fr]">
          
          <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
              <div className="rounded-[32px] bg-white p-8 shadow-sm border border-slate-100 group transition-all hover:border-lime-500">
                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-300 mb-3">Upcoming</p>
                <p className="text-5xl font-black text-slate-900 tracking-tighter">{upcomingEvents.length}<span className="text-[10px] font-black text-lime-600 ml-2 uppercase tracking-widest">Events</span></p>
              </div>
              <div className="rounded-[32px] bg-white p-8 shadow-sm border border-slate-100">
                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-300 mb-3">Community</p>
                <p className="text-5xl font-black text-slate-900 tracking-tighter">{totalUserCount || 0}<span className="text-[10px] font-black text-lime-600 ml-2 uppercase tracking-widest">Users</span></p>
              </div>
            </div>

            {/* カテゴリーフィルター（全カテゴリーを復活） */}
            <div className="rounded-[32px] bg-white p-8 shadow-sm border border-slate-100">
              <h2 className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-300 mb-6">Category Filter</h2>
              <div className="flex flex-wrap gap-2">
                <Link href="/" className={`rounded-full px-4 py-2 text-[8px] font-black tracking-widest transition-all ${!selectedCategory ? "bg-lime-600 text-white shadow-lg shadow-lime-600/30" : "bg-slate-50 text-slate-400 hover:bg-slate-100"}`}>ALL</Link>
                {["festival", "food", "music", "sports", "art", "workshop", "market", "other"].map(id => (
                  <Link key={id} href={`/?category=${id}`} className={`rounded-full px-4 py-2 text-[8px] font-black tracking-widest transition-all uppercase ${selectedCategory === id ? "bg-lime-600 text-white shadow-lg shadow-lime-600/30" : "bg-slate-50 text-slate-400 hover:bg-slate-100"}`}>{id}</Link>
                ))}
              </div>
            </div>
          </div>

          {/* 中央：カレンダー */}
          <div className="w-full">
            <EventCalendar events={upcomingEvents} />
          </div>

          {/* 右：イベントリスト */}
          <div className="rounded-[32px] bg-white p-8 shadow-sm border border-slate-100 flex flex-col max-h-[600px] lg:max-h-none overflow-hidden">
            <h2 className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-300 mb-6 flex justify-between items-center">
              <span>Event Timeline</span>
              {selectedCategory && <span className="text-lime-600 tracking-tighter">/ {selectedCategory.toUpperCase()}</span>}
            </h2>
            <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
              {upcomingEvents.length > 0 ? upcomingEvents.map(event => (
                <article key={event.id} className="relative rounded-2xl bg-slate-50 p-6 transition-all hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 group border border-transparent hover:border-slate-100">
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-[8px] font-black uppercase tracking-[0.2em] text-lime-700 bg-lime-100 px-3 py-1.5 rounded-md">{event.category}</span>
                    {user && user.id === event.user_id && (
                      <div className="flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link href={`/events/${event.id}/edit`} className="text-[8px] font-black text-slate-400 hover:text-slate-900 uppercase tracking-widest underline decoration-2 underline-offset-4">Edit</Link>
                        <DeleteButton eventId={event.id} />
                      </div>
                    )}
                  </div>
                  <h3 className="text-sm font-black leading-tight text-slate-900 mb-4 tracking-tight">{event.title}</h3>
                  <div className="flex flex-col gap-1.5 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                    <span className="flex items-center gap-2 italic">Date : {formatEventDate(event.start_at)}</span>
                    <span className="flex items-center gap-2 italic max-w-full truncate">Loc : {event.location}</span>
                  </div>
                </article>
              )) : (
                <div className="text-center py-20 border-2 border-dashed border-slate-100 rounded-2xl">
                  <p className="text-[9px] font-black text-slate-200 uppercase tracking-[0.4em]">Empty</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
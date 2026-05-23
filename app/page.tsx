import Link from "next/link";
import { createSupabaseServerClient } from "@/src/utils/supabase/server";
import EventCalendar from "@/components/EventCalendar";
import SiteHeader from "@/components/SiteHeader";

export const revalidate = 0;
export const dynamic = "force-dynamic";

function formatEventDate(dateString: string | null) {
  if (!dateString) return "未定";

  const isUTC = dateString.includes('Z') || dateString.includes('+');
  const safeDateString = isUTC ? dateString : dateString + '+09:00';
  const date = new Date(safeDateString);

  if (Number.isNaN(date.getTime())) return "未定";

  const dateStr = new Intl.DateTimeFormat("ja-JP", {
    timeZone: "Asia/Tokyo", month: "short", day: "numeric", weekday: "short",
  }).format(date);

  const timeStr = new Intl.DateTimeFormat("ja-JP", {
    timeZone: "Asia/Tokyo", hour: "2-digit", minute: "2-digit",
  }).format(date);

  if (timeStr === "00:00" || timeStr === "0:00") {
    return dateStr;
  }
  
  return `${dateStr} ${timeStr}`;
}

// ★追加：時差ズレを防ぎつつ「YYYY-MM-DD」の形式を取得する関数
function getJSTDateString(date: Date) {
  return new Intl.DateTimeFormat("ja-JP", {
    timeZone: "Asia/Tokyo", year: "numeric", month: "2-digit", day: "2-digit",
  }).format(date).replace(/\//g, "-");
}

export default async function Home(props: { searchParams: Promise<{ category?: string; area?: string }> }) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  const searchParams = await props.searchParams;
  const selectedCategory = searchParams.category;
  const selectedArea = searchParams.area; 

  const { data: allEventsData } = await supabase.from("events").select("*").order("start_at", { ascending: true });
  const allEvents = allEventsData || [];
  
  // 1. カレンダー用の絞り込み（地区とカテゴリのみ。過去のイベントも含む）
  const filteredEvents = allEvents.filter(event => {
    const matchCategory = selectedCategory ? event.category === selectedCategory : true;
    const matchArea = selectedArea ? event.area === selectedArea : true;
    return matchCategory && matchArea;
  });

  // 2. タイムライン用の絞り込み（過去のイベントを除外する）
  const todayStr = getJSTDateString(new Date()); // 今日の日付（例：2026-05-23）

  const timelineEvents = filteredEvents.filter(event => {
    // 終了日があれば終了日、なければ開始日を基準にする
    const targetDateStr = event.end_at || event.start_at;
    
    // 日時未定のイベントはずっと表示する
    if (!targetDateStr) return true;

    const isUTC = targetDateStr.includes('Z') || targetDateStr.includes('+');
    const safeDateStr = isUTC ? targetDateStr : targetDateStr + '+09:00';
    const eventDate = new Date(safeDateStr);
    
    if (Number.isNaN(eventDate.getTime())) return true;

    const eventDateStr = getJSTDateString(eventDate);
    
    // イベントの日付が「今日」と同じか、それより未来なら true（表示）
    return eventDateStr >= todayStr;
  });

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-slate-900 font-sans selection:bg-lime-300">
      <SiteHeader user={user} selectedCategory={selectedCategory} selectedArea={selectedArea} />

      <main className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-8 md:px-8 md:py-12">
        <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
          
          <div className="w-full">
            {/* カレンダーには過去のイベントも渡す */}
            <EventCalendar events={filteredEvents} />
          </div>

          <div className="rounded-[32px] bg-white p-6 md:p-8 shadow-sm border border-slate-100 flex flex-col max-h-[700px] overflow-hidden">
            <h2 className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-300 mb-6 flex justify-between items-center">
              <span>Event Timeline</span>
              <div className="text-right">
                {selectedArea && <span className="text-emerald-600 tracking-tighter mr-2">/ {selectedArea}</span>}
                {selectedCategory && <span className="text-lime-600 tracking-tighter">/ {selectedCategory.toUpperCase()}</span>}
              </div>
            </h2>
            <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
              {/* タイムラインには「未来＋今日」のイベントだけを回す */}
              {timelineEvents.length > 0 ? timelineEvents.map(event => (
                <Link href={`/events/${event.id}`} key={event.id} className="block relative rounded-2xl bg-slate-50 p-5 transition-all hover:bg-white hover:shadow-lg hover:shadow-slate-200/50 group border border-transparent hover:border-slate-100 hover:scale-[1.02]">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex gap-2 flex-wrap">
                      {event.area && (
                        <span className="text-[8px] font-black uppercase tracking-[0.2em] text-emerald-800 bg-emerald-100 px-3 py-1.5 rounded-md">
                          {event.area}
                        </span>
                      )}
                      <span className="text-[8px] font-black uppercase tracking-[0.2em] text-lime-700 bg-lime-100 px-3 py-1.5 rounded-md">
                        {event.category}
                      </span>
                    </div>
                  </div>
                  <h3 className="text-sm font-black leading-tight text-slate-900 mb-3 tracking-tight group-hover:text-lime-600 transition-colors">{event.title}</h3>
                  <div className="flex flex-col gap-1 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                    <span className="flex items-center gap-2 italic">Date : {formatEventDate(event.start_at)}</span>
                    <span className="flex items-center gap-2 italic max-w-full truncate">Loc : {event.location}</span>
                  </div>
                </Link>
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
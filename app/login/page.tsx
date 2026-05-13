import Link from "next/link";
import { createSupabaseServerClient } from "@/src/utils/supabase/server";
import EventCalendar from "@/components/EventCalendar";
import SiteHeader from "@/components/SiteHeader";

export const revalidate = 0;
export const dynamic = "force-dynamic";

function formatEventDate(dateString: string) {
  const isUTC = dateString.includes('Z') || dateString.includes('+');
  const safeDateString = isUTC ? dateString : dateString + '+09:00';
  const date = new Date(safeDateString);
  return new Intl.DateTimeFormat("ja-JP", {
    timeZone: "Asia/Tokyo", month: "short", day: "numeric", weekday: "short", hour: "2-digit", minute: "2-digit",
  }).format(date);
}

// searchParamsの型を正確に定義します
type SearchParams = {
  category?: string;
  area?: string;
};

export default async function Home({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  // ★修正ポイント：awaitを使って確実にsearchParamsの箱を開ける！
  const resolvedParams = await searchParams;
  const selectedCategory = resolvedParams.category;
  const selectedArea = resolvedParams.area;

  const { data: allEventsData } = await supabase.from("events").select("*").order("start_at", { ascending: true });
  const allEvents = allEventsData || [];
  
  // カテゴリーと地区、両方の条件で絞り込む
  const filteredEvents = allEvents.filter(event => {
    const matchCategory = selectedCategory ? event.category === selectedCategory : true;
    const matchArea = selectedArea ? event.area === selectedArea : true;
    return matchCategory && matchArea;
  });

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-slate-900 font-sans selection:bg-lime-300">
      {/* SiteHeaderに選択中の情報を渡す */}
      <SiteHeader user={user} selectedCategory={selectedCategory} selectedArea={selectedArea} />

      <main className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-8 md:px-8 md:py-12">
        <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
          
          <div className="w-full">
            <EventCalendar events={filteredEvents} />
          </div>

          <div className="rounded-[32px] bg-white p-6 md:p-8 shadow-sm border border-slate-100 flex flex-col max-h-[700px] overflow-hidden">
            <h2 className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-300 mb-6 flex justify-between items-center">
              <span>Event Timeline</span>
              {/* 絞り込み状態を見出しに表示 */}
              <div className="text-right flex items-center gap-2">
                {selectedArea && <span className="text-emerald-600 tracking-tighter">/ {selectedArea}</span>}
                {selectedCategory && <span className="text-lime-600 tracking-tighter">/ {selectedCategory.toUpperCase()}</span>}
              </div>
            </h2>
            <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
              {filteredEvents.length > 0 ? filteredEvents.map(event => (
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
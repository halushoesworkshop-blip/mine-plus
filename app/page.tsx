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

export default async function Home(props: { searchParams: Promise<{ category?: string }> }) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  const searchParams = await props.searchParams;
  const selectedCategory = searchParams.category;

  const { data: allEventsData } = await supabase.from("events").select("*").order("start_at", { ascending: true });
  const allEvents = allEventsData || [];
  
  const filteredEvents = selectedCategory 
    ? allEvents.filter(event => event.category === selectedCategory)
    : allEvents;

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-slate-900 font-sans selection:bg-lime-300">
      {/* 新しいメニューヘッダー */}
      <SiteHeader user={user} selectedCategory={selectedCategory} />

      <main className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-8 md:px-8 md:py-12">
        <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
          
          <div className="w-full">
            <EventCalendar events={filteredEvents} />
          </div>

          <div className="rounded-[32px] bg-white p-6 md:p-8 shadow-sm border border-slate-100 flex flex-col max-h-[700px] overflow-hidden">
            <h2 className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-300 mb-6 flex justify-between items-center">
              <span>Event Timeline</span>
              {selectedCategory && <span className="text-lime-600 tracking-tighter">/ {selectedCategory.toUpperCase()}</span>}
            </h2>
            <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
              {filteredEvents.length > 0 ? filteredEvents.map(event => (
                // タップすると詳細画面へ飛ぶように変更
                <Link href={`/events/${event.id}`} key={event.id} className="block relative rounded-2xl bg-slate-50 p-5 transition-all hover:bg-white hover:shadow-lg hover:shadow-slate-200/50 group border border-transparent hover:border-slate-100 hover:scale-[1.02]">
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-[8px] font-black uppercase tracking-[0.2em] text-lime-700 bg-lime-100 px-3 py-1.5 rounded-md">{event.category}</span>
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
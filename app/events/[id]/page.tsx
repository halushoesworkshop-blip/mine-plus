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

  // 1. ログインユーザーを取得
  const { data: { user } } = await supabase.auth.getUser();

  // 2. イベント情報を取得
  const { data: event, error } = await supabase
    .from("events")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !event) {
    notFound();
  }

  // ★ 判定：ユーザーIDと投稿者IDを比較
  const isOwner = user && user.id === event.user_id;

  const startDate = new Date(event.start_at);
  const endDate = event.end_at ? new Date(event.end_at) : null;

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("ja-JP", {
      year: "numeric", month: "long", day: "numeric", weekday: "short", hour: "2-digit", minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-white pb-20 text-slate-900">
      <nav className="sticky top-0 z-10 flex items-center justify-between bg-white/80 px-6 py-4 backdrop-blur-md">
        <Link href="/" className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-900">
          ← Back
        </Link>

        <div className="flex items-center gap-4">
          {/* ★ デバッグ用：本人判定が成功しているか、ボタンが出るはずの場所に文字を出してみる */}
          {isOwner ? (
            <div className="flex items-center gap-4">
              <Link href={`/events/${id}/edit`} className="text-[10px] font-black uppercase text-emerald-600">
                Edit
              </Link>
              <DeleteButton eventId={id} />
            </div>
          ) : (
            <span className="text-[8px] text-slate-300 uppercase font-bold">
              {user ? "Not your event" : "Not logged in"}
            </span>
          )}
        </div>
      </nav>

      {/* ★ デバッグ情報を画面最上部に出す（確認したら消します） */}
      <div className="bg-slate-100 p-2 text-[8px] font-mono text-slate-500 overflow-x-auto">
        <p>Your ID: {user?.id || "None"}</p>
        <p>Owner ID: {event.user_id || "None"}</p>
      </div>

      <main className="mx-auto max-w-2xl px-6">
        {/* 以下、タイトルや画像などの表示部分はそのまま ... */}
        <div className="mt-8">
          <div className="flex items-center gap-2 mb-4">
            <span className="rounded-md bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-600 border border-emerald-100">{event.area}</span>
            <span className="rounded-md bg-slate-100 px-2 py-1 text-[10px] font-black uppercase text-slate-500">{event.category}</span>
          </div>
          <h1 className="text-3xl font-black tracking-tighter text-slate-900">{event.title}</h1>
          
          <div className="mt-8 space-y-6 text-sm font-bold">
            <p>開始: {formatDate(startDate)}</p>
            <p>場所: {event.location}</p>
          </div>

          {event.description && (
            <div className="mt-12 whitespace-pre-wrap text-sm text-slate-600">{event.description}</div>
          )}

          {event.image_url && (
            <div className="mt-12 max-w-sm mx-auto">
              <img src={event.image_url} alt="" className="rounded-2xl shadow-lg w-full" />
            </div>
          )}

          {(event.url || event.external_url) && (
            <div className="mt-12">
              <a href={event.url || event.external_url} target="_blank" className="block w-full py-4 bg-black text-white text-center rounded-full font-black text-sm">公式サイトを見る</a>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
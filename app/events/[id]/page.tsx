import Link from "next/link";
import { createSupabaseServerClient } from "@/src/utils/supabase/server";
import { notFound } from "next/navigation";
import DeleteButton from "@/components/DeleteButton";

// 日本時間フォーマット
function formatEventDate(dateString: string) {
  const isUTC = dateString.includes('Z') || dateString.includes('+');
  const safeDateString = isUTC ? dateString : dateString + '+09:00';
  const date = new Date(safeDateString);
  return new Intl.DateTimeFormat("ja-JP", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

// 説明文の中にあるURLを自動でクリック可能にする関数
function linkify(text: string | null) {
  if (!text) return null;
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return text.split(urlRegex).map((part, i) => {
    if (part.match(urlRegex)) {
      return (
        <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline break-all hover:text-blue-800">
          {part}
        </a>
      );
    }
    return part;
  });
}

export default async function EventDetail(props: { params: Promise<{ id: string }> }) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  const params = await props.params;
  const eventId = params.id;

  // 全ての項目を取得
  const { data: event, error } = await supabase.from("events").select("*").eq("id", eventId).single();

  if (!event || error) notFound();

  const isOwner = user && user.id === event.user_id;

  // 過去のデータ用：priceが空の場合は、is_freeカラムなどから推測する安全策
  const displayPrice = event.price ? event.price : (event.is_free ? "無料" : (event.fee_text || "未設定"));

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 font-sans">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        
        {/* 上部ナビゲーション */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <Link href="/" className="text-sm font-bold text-gray-400 hover:text-gray-900 transition-colors flex items-center gap-1">
            <span>←</span> ホームへ戻る
          </Link>
          {isOwner && (
            <div className="flex gap-4 items-center">
              <Link href={`/events/${event.id}/edit`} className="text-xs font-bold text-blue-600 hover:underline">
                編集する
              </Link>
              <DeleteButton eventId={event.id} />
            </div>
          )}
        </div>

        {/* コンテンツ：投稿画面のようなラベル形式のレイアウト */}
        <div className="p-8 space-y-10">
          
          {/* 1. タイトル */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">イベント名</label>
            <h1 className="text-2xl font-black text-gray-900 leading-tight">{event.title}</h1>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* 2. 地区 ＆ カテゴリ */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">地区 / カテゴリー</label>
              <div className="mt-1 flex flex-wrap gap-2">
                {/* 地区の表示（追加） */}
                {event.area ? (
                  <span className="inline-block px-3 py-1.5 bg-emerald-100 text-emerald-800 text-[10px] font-black rounded-md tracking-wider">
                    {event.area}
                  </span>
                ) : (
                  <span className="inline-block px-3 py-1.5 bg-gray-100 text-gray-500 text-[10px] font-black rounded-md tracking-wider">
                    地区未設定
                  </span>
                )}
                {/* カテゴリの表示 */}
                <span className="inline-block px-3 py-1.5 bg-lime-100 text-lime-800 text-[10px] font-black rounded-md uppercase tracking-wider">
                  {event.category}
                </span>
              </div>
            </div>

            {/* 3. 開催日時 */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">開催日時</label>
              <p className="text-gray-900 font-bold text-sm">{formatEventDate(event.start_at)}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* 4. 開催場所 */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">開催場所</label>
              <p className="text-gray-900 font-bold text-sm">{event.location}</p>
            </div>

            {/* ★ 参加費・料金（追加） */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">参加費・料金</label>
              <p className="text-gray-900 font-bold text-sm">{displayPrice}</p>
            </div>
          </div>

          {/* 5. 関連URL（もしあれば表示） */}
          <div className="space-y-2 border-t border-gray-50 pt-8">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">関連URL / 公式サイト</label>
            <div className="text-sm font-bold">
              {event.url ? (
                <a href={event.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline break-all">
                  {event.url}
                </a>
              ) : (
                <span className="text-gray-300 italic font-normal">URLは設定されていません</span>
              )}
            </div>
          </div>

          {/* 6. 詳細説明 */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">イベントの詳細</label>
            <div className="mt-2 text-gray-700 leading-relaxed whitespace-pre-wrap font-medium text-sm bg-gray-50 p-6 rounded-xl">
              {linkify(event.description) || <span className="text-gray-300 italic font-normal">説明はありません</span>}
            </div>
          </div>

        </div>

        {/* フッター装飾 */}
        <div className="h-2 bg-lime-600 w-full" />
      </div>
    </div>
  );
}
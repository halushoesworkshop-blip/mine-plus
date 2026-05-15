"use client";

import { useState } from "react";
import { useRouter } from "next/navigation"; // 移動のために追加
import { createSupabaseBrowserClient } from "@/src/utils/supabase/client";

export default function DeleteButton({ eventId }: { eventId: string }) {
  const router = useRouter(); // ルーターを初期化
  const [loading, setLoading] = useState(false);
  const supabase = createSupabaseBrowserClient();

  async function handleDelete() {
    // ユーザーに最終確認
    if (!confirm("このイベントを削除してもよろしいですか？")) {
      return;
    }

    setLoading(true);

    try {
      // データベースから削除を実行
      const { error } = await supabase
        .from("events")
        .delete()
        .eq("id", eventId);

      if (error) throw error;

      // ★ 削除成功後、ホーム画面（/）へ移動する
      router.push("/");
      // 画面の情報を最新にする（削除されたイベントが消えるようにする）
      router.refresh();

    } catch (err: any) {
      alert("削除に失敗しました: " + err.message);
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="text-[10px] font-black uppercase tracking-widest text-rose-400 hover:text-rose-600 transition-colors disabled:opacity-50"
    >
      {loading ? "削除中..." : "削除"}
    </button>
  );
}
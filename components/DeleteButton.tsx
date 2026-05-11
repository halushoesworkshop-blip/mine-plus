"use client";
import { createSupabaseBrowserClient } from "@/src/utils/supabase/client";
import { useRouter } from "next/navigation";

export default function DeleteButton({ eventId }: { eventId: string }) {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  const handleDelete = async () => {
    if (!confirm("このイベントを削除してもよろしいですか？")) return;
    const { error } = await supabase.from("events").delete().eq("id", eventId);
    if (!error) router.refresh();
  };

  return (
    <button onClick={handleDelete} className="text-[9px] font-black text-rose-300 hover:text-rose-500 uppercase transition-colors">
      Delete
    </button>
  );
}
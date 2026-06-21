import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { title, category, location } = await request.json();
    const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

    if (!webhookUrl) {
      console.error("❌ DISCORD_WEBHOOK_URL が設定されていません。Vercelの環境変数を確認してください。");
      return NextResponse.json({ error: "Configuration error" }, { status: 500 });
    }

    const message = {
      content: `**【🤖 新着イベントのお知らせ】**\n📌 タイトル：${title}\n🏷 カテゴリ：${category}\n📍 場所：${location}\n\n✅ 新しいイベントが投稿されました！アプリを開いて確認してください。`
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);

    fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(message),
      signal: controller.signal
    })
      .catch((err) => console.error("❌ Discordへのバックグラウンド送信エラー:", err))
      .finally(() => clearTimeout(timeoutId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("❌ API Routeの処理エラー:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
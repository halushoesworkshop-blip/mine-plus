import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { title, category, location } = await request.json();
    const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

    if (!webhookUrl) {
      console.error("❌ DISCORD_WEBHOOK_URL が設定されていません。");
      return NextResponse.json({ error: "Configuration error" }, { status: 500 });
    }

    const message = {
      content: `**【🤖 新着イベントのお知らせ】**\n📌 タイトル：${title}\n🏷 カテゴリ：${category}\n📍 場所：${location}\n\n✅ 新しいイベントが投稿されました！アプリを開いて確認してください。`
    };

    const controller = new AbortController();
    // Discordへの送信完了を最大2秒だけ待つように制限
    const timeoutId = setTimeout(() => controller.abort(), 2000);

    try {
      // 🌟 await することで、Vercelが送信途中でコンテナを強制終了させるのを防ぎます
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(message),
        signal: controller.signal
      });
      
      console.log("=== Discord通知送信結果ステータス:", response.status);
    } catch (fetchErr: any) {
      if (fetchErr.name === 'AbortError') {
        console.warn("⚠️ Discord通知：2秒以内に応答がなかったためタイムアウトしました");
      } else {
        console.error("❌ Discordへの送信エラー:", fetchErr);
      }
    } finally {
      clearTimeout(timeoutId);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("❌ API Routeの処理エラー:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
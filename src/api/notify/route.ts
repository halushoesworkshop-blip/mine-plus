import { NextResponse } from "next/server";

export async function POST(request: Request) {
  console.log("=== [APIログ] 通知を受け取りました ===");
  try {
    const { title, category, location } = await request.json();
    const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

    // 🔍 鍵が正しく読み込めているかVercelのログに出力させる
    if (!webhookUrl) {
      console.error("❌ [APIログエラー] DISCORD_WEBHOOK_URL が空っぽです！Vercelに設定されていません。");
      return NextResponse.json({ error: "Configuration error" }, { status: 500 });
    } else {
      console.log("💡 [APIログ] Webhook URLの取得に成功しました。文字数:", webhookUrl.length);
    }

    const message = {
      content: `**【🤖 新着イベントのお知らせ】**\n📌 タイトル：${title}\n🏷 カテゴリ：${category}\n📍 場所：${location}\n\n✅ 新しいイベントが投稿されました！アプリを開いて確認してください。`
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000); // 猶予を3秒に少し延長

    try {
      console.log("=== [APIログ] Discordへリクエストを送信します ===");
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(message),
        signal: controller.signal
      });
      
      console.log("=== [APIログ] Discord送信結果ステータス:", response.status);
    } catch (fetchErr: any) {
      if (fetchErr.name === 'AbortError') {
        console.error("❌ [APIログエラー] Discordへの送信がタイムアウト（3秒）しました");
      } else {
        console.error("❌ [APIログエラー] Discordへの送信中に通信障害が発生しました:", fetchErr);
      }
    } finally {
      clearTimeout(timeoutId);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("❌ [APIログエラー] 致命的な処理例外が発生しました:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
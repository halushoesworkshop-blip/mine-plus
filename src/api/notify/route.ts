import { NextResponse } from "next/server";

export async function POST(request: Request) {
  console.log("=== [APIログ] 通知を受け取りました ===");
  try {
    const { title, category, location } = await request.json();
    const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

    if (!webhookUrl) {
      console.error("❌ [APIログエラー] DISCORD_WEBHOOK_URL が設定されていません。");
      return NextResponse.json({ error: "Configuration error" }, { status: 500 });
    }

    // 🌟 Discord側で絶対にスパム判定されない「公式のカード形式（embeds）」に構造を変更します
    const message = {
      embeds: [
        {
          title: "🤖 新着イベントのお知らせ",
          color: 3066993, // エメラルドグリーンのカラーコード
          fields: [
            {
              name: "📌 イベント名",
              value: title || "未入力",
              inline: false
            },
            {
              name: "🏷 カテゴリ",
              value: category || "未入力",
              inline: true
            },
            {
              name: "📍 開催場所",
              value: location || "未入力",
              inline: true
            }
          ],
          footer: {
            text: "mine+ アプリシステム通知"
          },
          timestamp: new Date().toISOString()
        }
      ]
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    try {
      console.log("=== [APIログ] Discord（カード形式）へリクエストを送信します ===");
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(message),
        signal: controller.signal
      });
      
      console.log("=== [APIログ] Discord送信結果ステータス:", response.status);
    } catch (fetchErr: any) {
      if (fetchErr.name === 'AbortError') {
        console.error("❌ [APIログエラー] Discordへの送信がタイムアウトしました");
      } else {
        console.error("❌ [APIログエラー] 通信障害が発生しました:", fetchErr);
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
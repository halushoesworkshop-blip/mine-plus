"use server";

export async function sendDiscordNotification(title: string, category: string, location: string) {
  console.log("=== [ログ①] Discord通知関数が呼び出されました ===");
  console.log(`パラメータ: タイトル=${title}, カテゴリ=${category}, 場所=${location}`);
  
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  
  if (!webhookUrl) {
    console.error("❌ [エラー] DISCORD_WEBHOOK_URL が設定されていません。Vercelの環境変数を確認してください。");
    return;
  }

  const message = {
    content: `**【🤖 新着イベントのお知らせ】**\n📌 タイトル：${title}\n🏷 カテゴリ：${category}\n📍 場所：${location}\n\n✅ 新しいイベントが投稿されました！アプリを開いて確認してください。`
  };

  try {
    console.log("=== [ログ②] Discordへリクエストを送信します ===");
    
    // Discordの応答が遅い場合に5秒で通信を強制切断するバリア
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(message),
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    console.log("=== [ログ③] Discord送信完了！ステータスコード:", response.status);
  } catch (error: any) {
    if (error.name === 'AbortError') {
      console.error("❌ [エラー] Discordへの送信が5秒以内に終わらずタイムアウトしました");
    } else {
      console.error("❌ [エラー] Discord通知エラーの詳細:", error);
    }
  }
}
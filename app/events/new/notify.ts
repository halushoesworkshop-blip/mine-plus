"use server";

export async function sendDiscordNotification(title: string, category: string, location: string) {
  // 環境変数からDiscordのURLをこっそり呼び出す
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  
  if (!webhookUrl) {
    console.error("DiscordのURLが設定されていません");
    return;
  }

  // Discordに送る綺麗なメッセージのデザイン
  const message = {
    content: `**【🤖 新着イベントのお知らせ】**\n📌 タイトル：${title}\n🏷 カテゴリ：${category}\n📍 場所：${location}\n\n✅ 新しいイベントが投稿されました！アプリを開いて確認してください。`
  };

  try {
    // Discordへデータをシュート！
    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(message),
    });
  } catch (error) {
    console.error("Discord通知エラー:", error);
  }
}
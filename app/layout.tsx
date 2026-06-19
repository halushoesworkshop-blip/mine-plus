import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
// Vercel Analyticsの部品をインポート
import { Analytics } from "@vercel/analytics/react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "mine+ | 美祢市のイベントプラットフォーム",
  description: "美祢市の現在をナビゲートするプラットフォーム。最新のイベント情報をリアルタイムに共有。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={inter.className}>
        {children}
        {/* アクセス数を計測するためのタグを配置（bodyの閉じタグの直前） */}
        <Analytics />
      </body>
    </html>
  );
}
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "mine+ | 美祢市のイベント情報プラットフォーム",
  description: "美祢市の現在をナビゲートするプラットフォーム。最新のイベント情報をリアルタイムに共有・発見できます。",
  verification: {
    // ここにいただいた確認コードをセットしました！
    google: "QvHm5JWxLULRnRpU5CjHtaFiw0I__YUWklSsI5L50eU",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ja"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
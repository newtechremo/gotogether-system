import type React from "react";
import type { Metadata } from "next";
import { Noto_Sans_KR } from "next/font/google";
import { Toaster } from "sonner";
import { QueryProvider } from "@/lib/providers/query-provider";
import "./globals.css";

const notoSansKR = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-noto-sans",
});

export const metadata: Metadata = {
  title: "가치봄 플러스 시설관리자 시스템",
  description: "AR 글라스, 골전도 이어폰, 스마트폰 대여 관리",
  generator: "v0.app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={notoSansKR.variable} suppressHydrationWarning>
      <body className={`min-h-screen bg-white text-black ${notoSansKR.className}`} style={{ fontSize: '150%' }}>
        <QueryProvider>
          {children}
          <Toaster position="top-right" richColors />
        </QueryProvider>
      </body>
    </html>
  );
}

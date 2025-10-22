import type React from "react";
import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Toaster } from "sonner";
import { QueryProvider } from "@/lib/providers/query-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "시설관리자시스템 - 가치봄플러스",
  description: "AR 글라스, 골전도 이어폰, 스마트폰 대여 관리",
  generator: "v0.app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`${GeistSans.variable} ${GeistMono.variable}`} suppressHydrationWarning>
      <body className="min-h-screen bg-white text-black" style={{ fontSize: '150%' }}>
        <QueryProvider>
          {children}
          <Toaster position="top-right" richColors />
        </QueryProvider>
      </body>
    </html>
  );
}

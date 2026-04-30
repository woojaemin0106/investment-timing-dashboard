import type { Metadata } from "next";
import { Suspense } from "react";
import Sidebar from "@/components/Sidebar/Sidebar";
import { Providers } from "@/components/Providers";
import "./globals.scss";

export const metadata: Metadata = {
  title: "InvestPulse",
  description: "투자 타이밍 분석 대시보드",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>
        <Providers>
          <div className="app-layout">
            <Suspense fallback={<div style={{ width: "16rem", flexShrink: 0 }} />}>
              <Sidebar />
            </Suspense>
            <main className="app-main">{children}</main>
          </div>
        </Providers>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Noto_Sans_JP } from "next/font/google";
import { SessionProvider } from "@/components/SessionProvider";
import { KanbanProvider } from "@/contexts/KanbanContext";
import { AppModeProvider } from "@/contexts/AppModeContext";
import { Navigation } from "@/components/Navigation";
import "./globals.css";

const notoSansJP = Noto_Sans_JP({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-noto-sans-jp",
});

export const metadata: Metadata = {
  title: "Regional Commons | プロジェクト管理システム",
  description:
    "一般社団法人Regional Commons 教育支援・採用支援・派生プロジェクトの管理ダッシュボード",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={`${notoSansJP.variable} font-sans antialiased`}>
        <SessionProvider>
          <AppModeProvider>
            <KanbanProvider>
              <Navigation />
              {children}
            </KanbanProvider>
          </AppModeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}

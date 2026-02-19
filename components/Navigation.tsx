"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  MessageSquare,
  GraduationCap,
  Building2,
  Cpu,
  Handshake,
  FolderKanban,
  List,
  LogOut,
  Settings,
} from "lucide-react";
import { useAppMode } from "@/contexts/AppModeContext";
import { ModeSwitcher } from "@/components/ModeSwitcher";
import type { AppMode } from "@/types";

/** モード別のメニュー項目（メインコンテンツへのリンクなど） */
const MODE_NAV_ITEMS: Record<
  AppMode,
  { href: string; label: string; icon: React.ElementType }[]
> = {
  education: [
    { href: "/", label: "学校一覧", icon: List },
    { href: "/slack-analyzer", label: "連絡・ファイル解析", icon: MessageSquare },
  ],
  recruitment: [
    { href: "/", label: "企業一覧", icon: List },
    { href: "/slack-analyzer", label: "連絡・ファイル解析", icon: MessageSquare },
  ],
  ai_support: [
    { href: "/", label: "導入先一覧", icon: List },
    { href: "/slack-analyzer", label: "連絡・ファイル解析", icon: MessageSquare },
  ],
  sales: [
    { href: "/", label: "商談先一覧", icon: List },
    { href: "/slack-analyzer", label: "連絡・ファイル解析", icon: MessageSquare },
  ],
  projects: [
    { href: "/", label: "プロジェクト一覧", icon: List },
    { href: "/slack-analyzer", label: "連絡・ファイル解析", icon: MessageSquare },
  ],
};

const MODE_ICONS: Record<AppMode, React.ElementType> = {
  education: GraduationCap,
  recruitment: Building2,
  ai_support: Cpu,
  sales: Handshake,
  projects: FolderKanban,
};

export function Navigation() {
  const pathname = usePathname();
  const { mode } = useAppMode();
  const navItems = MODE_NAV_ITEMS[mode];
  const ModeIcon = MODE_ICONS[mode];
  const isLoginPage = pathname === "/login";

  if (isLoginPage) {
    return (
      <header className="border-b border-border/50 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <GraduationCap className="h-6 w-6" />
            </div>
            <h1 className="text-xl font-bold text-foreground whitespace-nowrap">
              Regional Commons - ログイン
            </h1>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="border-b border-border/50 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <ModeIcon className="h-6 w-6" />
            </div>
            <h1 className="text-xl font-bold text-foreground whitespace-nowrap">
              Regional Commons - プロジェクト管理
            </h1>
          </div>
          <nav className="flex items-center gap-1">
            {navItems.map(({ href, label, icon: Icon }) => {
              const isActive = pathname === href;
              return (
                <Link
                  key={`${mode}-${href}`}
                  href={href}
                  className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              );
            })}
            <Link
              href="/settings"
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                pathname === "/settings"
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Settings className="h-4 w-4" />
              設定
            </Link>
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              title="ログアウト"
            >
              <LogOut className="h-4 w-4" />
              ログアウト
            </button>
          </nav>
        </div>
        {/* モード切り替え（ヘッダー直下） */}
        <div className="mt-3 flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">
            事業モード:
          </span>
          <ModeSwitcher />
        </div>
      </div>
    </header>
  );
}

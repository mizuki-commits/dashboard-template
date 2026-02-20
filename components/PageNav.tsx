"use client";

import { ListTodo, BarChart3, Target, Calendar, Share2, FolderOpen } from "lucide-react";

const SECTIONS = [
  { id: "progress", label: "進捗", icon: BarChart3 },
  { id: "kpi", label: "KPI", icon: BarChart3 },
  { id: "roadmap", label: "ロードマップ", icon: Target },
  { id: "schedule", label: "スケジュール", icon: Calendar },
  { id: "taskboard", label: "タスクボード", icon: ListTodo, highlight: true },
  { id: "checklist", label: "チェックリスト", icon: Share2 },
  { id: "resources", label: "リソース", icon: FolderOpen },
] as const;

function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

export function PageNav() {
  return (
    <nav
      className="sticky top-0 z-20 -mx-4 px-4 py-2 mb-6 rounded-xl bg-card/95 backdrop-blur-sm border border-border shadow-sm"
      aria-label="ページ内ナビゲーション"
    >
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-xs font-medium text-muted-foreground mr-1 sr-only sm:not-sr-only">
          ジャンプ:
        </span>
        {SECTIONS.map((section) => (
          <button
            key={section.id}
            type="button"
            onClick={() => scrollToId(section.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              "highlight" in section && section.highlight
                ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <section.icon className="h-3.5 w-3.5 shrink-0" />
            {section.label}
          </button>
        ))}
      </div>
    </nav>
  );
}

interface ChecklistQuickAccessProps {
  checklist: { id: string; title: string }[];
  entityLabel: string;
}

export function ChecklistQuickAccess({ checklist, entityLabel }: ChecklistQuickAccessProps) {
  if (checklist.length === 0) return null;

  return (
    <div className="mb-6">
      <p className="text-xs font-medium text-muted-foreground mb-2">
        {entityLabel}へジャンプ
      </p>
      <div className="flex flex-wrap gap-2">
        {checklist.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => {
              const el = document.getElementById(`checklist-cat-${cat.id}`);
              if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
            className="px-3 py-1.5 rounded-lg text-sm font-medium border border-border bg-background text-foreground hover:bg-muted hover:border-primary/30 transition-colors"
          >
            {cat.title}
          </button>
        ))}
      </div>
    </div>
  );
}

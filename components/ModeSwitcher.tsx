"use client";

import { GraduationCap, Building2, Cpu, Handshake, FolderKanban } from "lucide-react";
import { useAppMode } from "@/contexts/AppModeContext";
import type { AppMode } from "@/types";

const MODES: { value: AppMode; label: string; icon: React.ElementType }[] = [
  { value: "education", label: "教育支援", icon: GraduationCap },
  { value: "recruitment", label: "採用支援", icon: Building2 },
  { value: "ai_support", label: "AI導入支援", icon: Cpu },
  { value: "sales", label: "営業開拓", icon: Handshake },
  { value: "projects", label: "プロジェクト", icon: FolderKanban },
];

export function ModeSwitcher() {
  const { mode, setMode } = useAppMode();

  return (
    <div
      className="inline-flex rounded-lg border border-border bg-muted/50 p-1"
      role="tablist"
      aria-label="事業モードの切り替え"
    >
      {MODES.map(({ value, label, icon: Icon }) => {
        const isActive = mode === value;
        return (
          <button
            key={value}
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-controls={`panel-${value}`}
            id={`tab-${value}`}
            onClick={() => setMode(value)}
            className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              isActive
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        );
      })}
    </div>
  );
}

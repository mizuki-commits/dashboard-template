"use client";

import { useState } from "react";
import { Users, Target, TrendingUp, Calendar } from "lucide-react";

export type KpiPeriod = "week" | "month" | "quarter" | "year";

export interface KpiValues {
  /** 接触数（今期） */
  contact: number;
  /** 契約数（今期） */
  contract: number;
  /** 目標数（今期） */
  target: number;
}

const PERIODS: { value: KpiPeriod; label: string }[] = [
  { value: "week", label: "1週間" },
  { value: "month", label: "月" },
  { value: "quarter", label: "3ヶ月" },
  { value: "year", label: "1年" },
];

/** 教育支援用ラベル */
const EDUCATION_LABELS = {
  contact: "接触校数",
  contract: "契約校数",
  target: "目標校数",
  contactDesc: "接触した学校数",
  contractDesc: "契約済みの学校数",
  targetDesc: "目標とする学校数",
};

/** 採用支援用ラベル */
const RECRUITMENT_LABELS = {
  contact: "接触企業数",
  contract: "契約企業数",
  target: "目標企業数",
  contactDesc: "接触した企業数",
  contractDesc: "契約済みの企業数",
  targetDesc: "目標とする企業数",
};

/** 営業開拓用ラベル */
const SALES_LABELS = {
  contact: "接触商談先数",
  contract: "契約数",
  target: "目標数",
  contactDesc: "接触した商談先数",
  contractDesc: "契約済みの商談先数",
  targetDesc: "目標とする商談先数",
};

/** プロジェクト用ラベル（進行中・完了・目標） */
const PROJECTS_LABELS = {
  contact: "進行中数",
  contract: "完了数",
  target: "目標数",
  contactDesc: "進行中のプロジェクト数",
  contractDesc: "完了したプロジェクト数",
  targetDesc: "目標とするプロジェクト数",
};

/** AI導入支援用ラベル */
const AI_SUPPORT_LABELS = {
  contact: "接触数",
  contract: "導入契約数",
  target: "目標数",
  contactDesc: "接触した企業・組織数",
  contractDesc: "AI導入契約済み数",
  targetDesc: "目標とする導入数",
};

interface KPISectionProps {
  mode: "education" | "recruitment" | "ai_support" | "sales" | "projects";
  /** 月・3ヶ月・1年ごとのKPI値 */
  values: Record<KpiPeriod, KpiValues>;
  onUpdate: (period: KpiPeriod, values: Partial<KpiValues>) => void;
}

const MODE_LABELS = {
  education: EDUCATION_LABELS,
  recruitment: RECRUITMENT_LABELS,
  ai_support: AI_SUPPORT_LABELS,
  sales: SALES_LABELS,
  projects: PROJECTS_LABELS,
} as const;

export function KPISection({ mode, values, onUpdate }: KPISectionProps) {
  const [period, setPeriod] = useState<KpiPeriod>("month");
  const labels = MODE_LABELS[mode];
  const v = values[period];

  return (
    <section className="mb-8">
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <TrendingUp className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold text-foreground">KPI</h2>
        <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">編集可能</span>
        <div className="ml-4 inline-flex rounded-lg border border-border bg-muted/50 p-1">
          {PERIODS.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => setPeriod(value)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                period === value
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {/* 接触数 */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Users className="h-4 w-4" />
            <span className="text-sm font-medium">{labels.contact}</span>
          </div>
          <div className="flex items-baseline gap-2">
            <input
              type="number"
              value={v.contact}
              onChange={(e) =>
                onUpdate(period, {
                  contact: Math.max(0, parseInt(e.target.value, 10) || 0),
                })
              }
              className="w-20 text-3xl font-bold text-primary border border-input rounded-lg px-2 py-1 bg-background focus:outline-none focus:ring-2 focus:ring-ring [-moz-appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              min={0}
              aria-label={labels.contact}
            />
          </div>
          <p className="mt-1 text-xs text-muted-foreground">{labels.contactDesc}</p>
        </div>

        {/* 契約数 */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Target className="h-4 w-4" />
            <span className="text-sm font-medium">{labels.contract}</span>
          </div>
          <div className="flex items-baseline gap-2">
            <input
              type="number"
              value={v.contract}
              onChange={(e) =>
                onUpdate(period, {
                  contract: Math.max(0, parseInt(e.target.value, 10) || 0),
                })
              }
              className="w-20 text-3xl font-bold text-foreground border border-input rounded-lg px-2 py-1 bg-background focus:outline-none focus:ring-2 focus:ring-ring [-moz-appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              min={0}
              aria-label={labels.contract}
            />
          </div>
          <p className="mt-1 text-xs text-muted-foreground">{labels.contractDesc}</p>
        </div>

        {/* 目標数 + 達成率 */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Calendar className="h-4 w-4" />
            <span className="text-sm font-medium">{labels.target}</span>
          </div>
          <div className="flex items-baseline gap-2">
            <input
              type="number"
              value={v.target}
              onChange={(e) =>
                onUpdate(period, {
                  target: Math.max(0, parseInt(e.target.value, 10) || 0),
                })
              }
              className="w-20 text-3xl font-bold text-foreground border border-input rounded-lg px-2 py-1 bg-background focus:outline-none focus:ring-2 focus:ring-ring [-moz-appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              min={0}
              aria-label={labels.target}
            />
          </div>
          <div className="mt-2 h-2 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{
                width: `${v.target > 0 ? Math.min(100, (v.contract / v.target) * 100) : 0}%`,
              }}
            />
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {labels.targetDesc} · 達成率{" "}
            {v.target > 0 ? Math.round((v.contract / v.target) * 100) : 0}%
          </p>
        </div>
      </div>
    </section>
  );
}

"use client";

import { DataTable, type ColumnDef } from "@/components/DataTable";
import type { Project } from "@/types";
import { mockProjects } from "@/data/mock";

const sourceLabel: Record<Project["source"], string> = {
  education: "教育支援",
  recruitment: "採用支援",
  other: "その他",
};

const columns: ColumnDef<Project>[] = [
  { key: "name", header: "プロジェクト名", className: "min-w-[200px]" },
  {
    key: "status",
    header: "ステータス",
    className: "min-w-[80px]",
    cell: (row) => (
      <span className="inline-flex rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
        {row.status}
      </span>
    ),
  },
  {
    key: "source",
    header: "派生元",
    className: "min-w-[90px]",
    cell: (row) => sourceLabel[row.source],
  },
  { key: "assignee", header: "担当者", className: "min-w-[80px]" },
  { key: "startDate", header: "開始日", className: "min-w-[100px]" },
  { key: "dueDate", header: "期限", className: "min-w-[100px]" },
];

export function ProjectList() {
  return (
    <DataTable<Project>
      columns={columns}
      data={mockProjects}
      rowKey="id"
      emptyMessage="登録されているプロジェクトはありません"
    />
  );
}

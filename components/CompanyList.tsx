"use client";

import { DataTable, type ColumnDef } from "@/components/DataTable";
import type { Company } from "@/types";
import { mockCompanies } from "@/data/mock";

const columns: ColumnDef<Company>[] = [
  { key: "name", header: "企業名", className: "min-w-[180px]" },
  { key: "industry", header: "業種", className: "min-w-[100px]" },
  {
    key: "recruitmentStatus",
    header: "採用ステータス",
    className: "min-w-[100px]",
    cell: (row) => (
      <span className="inline-flex rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
        {row.recruitmentStatus}
      </span>
    ),
  },
  { key: "contactPerson", header: "担当者", className: "min-w-[100px]" },
  { key: "jobSummary", header: "求人概要", className: "min-w-[160px]" },
  { key: "openPositions", header: "募集人数", className: "min-w-[80px]" },
];

export function CompanyList() {
  return (
    <DataTable<Company>
      columns={columns}
      data={mockCompanies}
      rowKey="id"
      emptyMessage="登録されている企業はありません"
    />
  );
}

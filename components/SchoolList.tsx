"use client";

import { DataTable, type ColumnDef } from "@/components/DataTable";
import type { School } from "@/types";
import { mockSchools } from "@/data/mock";

const columns: ColumnDef<School>[] = [
  { key: "name", header: "学校名", className: "min-w-[180px]" },
  { key: "schoolType", header: "種別", className: "min-w-[80px]" },
  {
    key: "progressStatus",
    header: "進捗",
    className: "min-w-[100px]",
    cell: (row) => (
      <span className="inline-flex rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
        {row.progressStatus}
      </span>
    ),
  },
  { key: "contactPerson", header: "担当者（当方）", className: "min-w-[100px]" },
  { key: "schoolContact", header: "担当者（学校）", className: "min-w-[100px]" },
  { key: "nextActionDate", header: "次回アクション", className: "min-w-[110px]" },
];

export function SchoolList() {
  return (
    <DataTable<School>
      columns={columns}
      data={mockSchools}
      rowKey="id"
      emptyMessage="登録されている学校はありません"
    />
  );
}

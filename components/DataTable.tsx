"use client";

import React from "react";

export interface ColumnDef<T> {
  key: keyof T | string;
  header: string;
  /** カスタム表示（省略時は data[key] をそのまま表示） */
  cell?: (row: T) => React.ReactNode;
  /** 列幅のヒント（例: "min-w-[120px]"） */
  className?: string;
}

interface DataTableProps<T extends object> {
  columns: ColumnDef<T>[];
  data: T[];
  /** 行の key に使うフィールド名 */
  rowKey: keyof T;
  /** 空データ時のメッセージ */
  emptyMessage?: string;
}

export function DataTable<T extends object>({
  columns,
  data,
  rowKey,
  emptyMessage = "データがありません",
}: DataTableProps<T>) {
  const getCellValue = (row: T, key: keyof T | string): unknown => {
    const k = key as keyof T;
    return (row as Record<string, unknown>)[String(k)];
  };

  if (data.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              {columns.map((col) => (
                <th
                  key={String(col.key)}
                  className={`px-4 py-3 text-left font-semibold text-foreground ${col.className ?? ""}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr
                key={String(row[rowKey])}
                className="border-b border-border/50 transition-colors hover:bg-muted/30"
              >
                {columns.map((col) => (
                  <td
                    key={String(col.key)}
                    className={`px-4 py-3 text-foreground ${col.className ?? ""}`}
                  >
                    {col.cell
                      ? col.cell(row)
                      : String(getCellValue(row, col.key) ?? "")}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/**
 * Todoist がインポート可能なCSV形式に変換する。
 * カラム: TYPE, CONTENT, DESCRIPTION, PRIORITY, INDENT, AUTHOR, RESPONSIBLE, DATE
 */

function escapeCsvField(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export interface TodoistCsvRow {
  content: string;
  description?: string;
  priority?: number; // 1-4
  indent?: number; // 1 = トップレベル, 2 = サブタスク
  author?: string;
  responsible?: string;
  date?: string; // YYYY-MM-DD
}

/**
 * タスク一覧を Todoist インポート用 CSV 文字列に変換する。
 */
export function toTodoistCsv(rows: TodoistCsvRow[]): string {
  const header = "TYPE,CONTENT,DESCRIPTION,PRIORITY,INDENT,AUTHOR,RESPONSIBLE,DATE";
  const lines = rows.map((row) => {
    const type = "task";
    const content = escapeCsvField(row.content || "");
    const description = escapeCsvField(row.description || "");
    const priority = Math.min(4, Math.max(1, row.priority ?? 1));
    const indent = row.indent ?? 1;
    const author = escapeCsvField(row.author || "");
    const responsible = escapeCsvField(row.responsible || "");
    const date = row.date || "";
    return [type, content, description, priority, indent, author, responsible, date].join(",");
  });
  return [header, ...lines].join("\n");
}

/**
 * ブラウザで todoist_import.csv をダウンロードする。
 */
export function downloadTodoistCsv(csvContent: string, filename = "todoist_import.csv"): void {
  const bom = "\uFEFF";
  const blob = new Blob([bom + csvContent], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/** チェックリスト用の型（循環参照避けのため any で受け取り） */
export type ChecklistCategoryForCsv = {
  id: string;
  title: string;
  items: {
    id: string;
    label: string;
    deadline: string;
    subItems: { id: string; label: string; deadline: string; assignee?: string }[];
  }[];
};

/**
 * チェックリスト（カテゴリ・アイテム・サブアイテム）を Todoist CSV 用の行に変換する。
 */
export function checklistToTodoistRows(checklist: ChecklistCategoryForCsv[]): TodoistCsvRow[] {
  const rows: TodoistCsvRow[] = [];
  for (const category of checklist) {
    for (const item of category.items) {
      rows.push({
        content: item.label,
        description: `${category.title}`,
        priority: 1,
        indent: 1,
        date: item.deadline ? item.deadline.slice(0, 10) : undefined,
      });
      for (const sub of item.subItems) {
        rows.push({
          content: sub.label,
          description: `${category.title} - ${item.label}`,
          priority: 1,
          indent: 2,
          responsible: sub.assignee || "",
          date: sub.deadline ? sub.deadline.slice(0, 10) : undefined,
        });
      }
    }
  }
  return rows;
}

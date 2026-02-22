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

/** AUTHOR / RESPONSIBLE は括弧を含むため常にクォートし、Todoist が確実に1セルとして解釈するようにする */
function quoteCsvField(value: string): string {
  if (!value) return "";
  return `"${String(value).replace(/"/g, '""')}"`;
}

export interface TodoistCsvRow {
  content: string;
  description?: string;
  priority?: number; // 1-4
  indent?: number; // 1 = トップレベル, 2 = サブタスク
  author?: string;
  responsible?: string;
  date?: string; // YYYY-MM-DD
  /** ラベル（複数はカンマ区切り。Todoist の LABELS 列に出力） */
  labels?: string;
}

/**
 * タスク一覧を Todoist インポート用 CSV 文字列に変換する。
 * 列順は公式テンプレートに合わせる（担当者引き継ぎのため AUTHOR, RESPONSIBLE, DATE, DATE_LANG）。
 * labels がある場合は末尾に LABELS を付与。
 */
export function toTodoistCsv(rows: TodoistCsvRow[]): string {
  const hasLabels = rows.some((r) => r.labels != null && r.labels !== "");
  const baseHeader = "TYPE,CONTENT,DESCRIPTION,PRIORITY,INDENT,AUTHOR,RESPONSIBLE,DATE,DATE_LANG";
  const header = hasLabels ? `${baseHeader},LABELS` : baseHeader;
  const lines = rows.map((row) => {
    const type = "task";
    const content = escapeCsvField(row.content || "");
    const description = escapeCsvField(row.description || "");
    const priority = Math.min(4, Math.max(1, row.priority ?? 1));
    const indent = row.indent ?? 1;
    const author = quoteCsvField(row.author || "");
    const responsible = quoteCsvField(row.responsible || "");
    const date = row.date || "";
    const dateLang = "";
    const labels = escapeCsvField(row.labels ?? "");
    return hasLabels
      ? [type, content, description, priority, indent, author, responsible, date, dateLang, labels].join(",")
      : [type, content, description, priority, indent, author, responsible, date, dateLang].join(",");
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

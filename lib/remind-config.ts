/**
 * リスク・リマインドタスクの自動提案設定。
 * タスク内容に特定キーワードが含まれる場合、返信確認用リマインドを提案する。
 */

/** リマインドを提案するトリガーキーワード（設定で変更可能） */
export const REMIND_KEYWORDS = ["連絡", "送信", "提出", "依頼"] as const;

/** リマインドのデフォルト間隔（日数） */
export const DEFAULT_REMIND_DAYS = 3;

/** リマインド日数の選択肢 */
export const REMIND_DAYS_OPTIONS = [1, 2, 3, 5, 7] as const;

export interface RemindSuggestion {
  /** 提案するリマインドタスクのラベル */
  remindLabel: string;
  /** 元タスク期限から何日後にリマインドするか */
  daysAfter: number;
}

/**
 * タスク内容にキーワードが含まれる場合、ペアとなるリマインド提案を返す。
 */
export function getRemindSuggestion(content: string): RemindSuggestion | null {
  const trimmed = (content || "").trim();
  if (!trimmed) return null;
  const hasKeyword = REMIND_KEYWORDS.some((kw) => trimmed.includes(kw));
  if (!hasKeyword) return null;
  return {
    remindLabel: `（${trimmed}）の返信確認・リマインド`,
    daysAfter: DEFAULT_REMIND_DAYS,
  };
}

/**
 * 指定日付に days を加算して YYYY-MM-DD を返す。
 * 無効な日付の場合は今日を基準にする。
 */
export function addDaysToDate(dateStr: string, days: number): string {
  const d = dateStr ? new Date(dateStr) : new Date();
  if (Number.isNaN(d.getTime())) {
    d.setTime(Date.now());
  }
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

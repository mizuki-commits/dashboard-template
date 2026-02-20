"use client";

import { useState } from "react";
import { useKanban } from "@/contexts/KanbanContext";
import type { ChecklistCategory } from "@/components/ChecklistSection";
import { BarChart3, CheckSquare, ListTodo, ArrowRight, RefreshCw } from "lucide-react";

function computeChecklistProgress(checklist: ChecklistCategory[]): number {
  let completed = 0;
  let total = 0;
  for (const cat of checklist) {
    for (const item of cat.items) {
      total += 1;
      if (item.completed) completed += 1;
      for (const sub of item.subItems) {
        total += 1;
        if (sub.completed) completed += 1;
      }
    }
  }
  return total === 0 ? 0 : Math.round((completed / total) * 100);
}

function computeTaskProgress(tasks: { column: string }[]): number {
  if (tasks.length === 0) return 0;
  const done = tasks.filter((t) => t.column === "done").length;
  return Math.round((done / tasks.length) * 100);
}

interface ProgressOverviewProps {
  checklist: ChecklistCategory[];
  onChecklistUpdate?: (updated: ChecklistCategory[]) => void;
}

export function ProgressOverview({ checklist, onChecklistUpdate }: ProgressOverviewProps) {
  const { tasks } = useKanban();
  const [syncing, setSyncing] = useState(false);
  const checklistPct = computeChecklistProgress(checklist);
  const taskPct = computeTaskProgress(tasks);
  const overallPct = checklist.length > 0 && tasks.length > 0
    ? Math.round((checklistPct + taskPct) / 2)
    : checklist.length > 0
      ? checklistPct
      : tasks.length > 0
        ? taskPct
        : 0;

  // Todoistの完了状態を同期する
  const syncProgress = async () => {
    const defaultProjectId = typeof window !== "undefined" ? localStorage.getItem("todoist_default_project_id") : null;
    if (!defaultProjectId) {
      alert("設定ページでデフォルトプロジェクトを選択してください。");
      return;
    }
    const userToken = typeof window !== "undefined" ? localStorage.getItem("todoist_user_token") : null;

    setSyncing(true);
    try {
      // チェックリストからtodoistIdを収集
      const todoistIds: string[] = [];
      checklist.forEach((cat) => {
        cat.items.forEach((item) => {
          if (item.todoistId) todoistIds.push(item.todoistId);
          item.subItems.forEach((sub) => {
            if (sub.todoistId) todoistIds.push(sub.todoistId);
          });
        });
      });

      if (todoistIds.length === 0) {
        // プロジェクト全体を同期
        const res = await fetch("/api/todoist/sync-status", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ projectId: defaultProjectId, userToken: userToken || undefined }),
        });
        if (!res.ok) {
          throw new Error("同期に失敗しました");
        }
        const data = (await res.json()) as { tasks?: Array<{ id: string; is_completed: boolean }> };
        const completedIds = new Set(
          (data.tasks || []).filter((t) => t.is_completed).map((t) => t.id)
        );

        // チェックリストの完了状態を更新
        const updated = checklist.map((cat) => ({
          ...cat,
          items: cat.items.map((item) => {
            const itemCompleted = item.todoistId ? completedIds.has(item.todoistId) : item.completed;
            return {
              ...item,
              completed: itemCompleted,
              subItems: item.subItems.map((sub) => ({
                ...sub,
                completed: sub.todoistId ? completedIds.has(sub.todoistId) : sub.completed,
              })),
            };
          }),
        }));
        if (onChecklistUpdate) {
          onChecklistUpdate(updated);
        }
      } else {
        // 特定のタスクIDを同期
        const res = await fetch("/api/todoist/sync-status", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ taskIds: todoistIds, userToken: userToken || undefined }),
        });
        if (!res.ok) {
          throw new Error("同期に失敗しました");
        }
        const data = (await res.json()) as { tasks?: Array<{ id: string; is_completed: boolean }> };
        const completedMap = new Map(
          (data.tasks || []).map((t) => [t.id, t.is_completed])
        );

        // チェックリストの完了状態を更新
        const updated = checklist.map((cat) => ({
          ...cat,
          items: cat.items.map((item) => {
            const itemCompleted = item.todoistId
              ? completedMap.get(item.todoistId) ?? item.completed
              : item.completed;
            return {
              ...item,
              completed: itemCompleted,
              subItems: item.subItems.map((sub) => ({
                ...sub,
                completed: sub.todoistId
                  ? completedMap.get(sub.todoistId) ?? sub.completed
                  : sub.completed,
              })),
            };
          }),
        }));
        if (onChecklistUpdate) {
          onChecklistUpdate(updated);
        }
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : "同期に失敗しました");
    } finally {
      setSyncing(false);
    }
  };

  return (
    <section className="mb-8">
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="border-b border-border bg-muted/30 px-4 py-3 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">全体の進捗</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => void syncProgress()}
              disabled={syncing}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-background text-sm font-medium hover:bg-muted/50 disabled:opacity-50 transition-colors"
              title="Todoistの完了状態を反映して進捗を更新"
            >
              <RefreshCw className={`h-4 w-4 ${syncing ? "animate-spin" : ""}`} />
              {syncing ? "同期中..." : "進捗を同期"}
            </button>
            <button
              type="button"
              onClick={() => {
                document.getElementById("taskboard")?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              タスクボードへ
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div className="p-4 grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg border border-border bg-muted/10 p-3">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
              <CheckSquare className="h-4 w-4" />
              チェックリスト
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-foreground">{checklistPct}</span>
              <span className="text-sm text-muted-foreground">%</span>
            </div>
            <div className="mt-2 h-2 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-all duration-300"
                style={{ width: `${checklistPct}%` }}
              />
            </div>
          </div>
          <div className="rounded-lg border border-border bg-muted/10 p-3">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
              <ListTodo className="h-4 w-4" />
              タスクボード
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-foreground">{taskPct}</span>
              <span className="text-sm text-muted-foreground">%</span>
            </div>
            <div className="mt-2 h-2 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-all duration-300"
                style={{ width: `${taskPct}%` }}
              />
            </div>
          </div>
          <div className="rounded-lg border border-primary/30 bg-primary/5 p-3">
            <div className="flex items-center gap-2 text-sm font-medium text-primary mb-2">
              <BarChart3 className="h-4 w-4" />
              総合進捗
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-primary">{overallPct}</span>
              <span className="text-sm text-muted-foreground">%</span>
            </div>
            <div className="mt-2 h-2 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-all duration-300"
                style={{ width: `${overallPct}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

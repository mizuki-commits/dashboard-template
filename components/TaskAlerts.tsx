"use client";

import { useMemo } from "react";
import { AlertTriangle, Clock, CheckCircle2 } from "lucide-react";
import type { ChecklistCategory } from "./ChecklistSection";
import { useKanban } from "@/contexts/KanbanContext";

interface TaskAlertsProps {
  checklist: ChecklistCategory[];
}

/**
 * 期限が近いタスクや完了していないタスクのアラートを表示
 */
export function TaskAlerts({ checklist }: TaskAlertsProps) {
  const { tasks } = useKanban();

  const alerts = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const threeDaysLater = new Date(today);
    threeDaysLater.setDate(threeDaysLater.getDate() + 3);

    const overdue: Array<{ type: "checklist" | "kanban"; label: string; deadline: string }> = [];
    const dueSoon: Array<{ type: "checklist" | "kanban"; label: string; deadline: string }> = [];

    // チェックリストから期限切れ・期限間近のタスクを収集
    checklist.forEach((cat) => {
      cat.items.forEach((item) => {
        if (!item.completed && item.deadline) {
          const deadline = new Date(item.deadline);
          if (deadline < today) {
            overdue.push({
              type: "checklist",
              label: `${cat.title} - ${item.label}`,
              deadline: item.deadline,
            });
          } else if (deadline <= threeDaysLater) {
            dueSoon.push({
              type: "checklist",
              label: `${cat.title} - ${item.label}`,
              deadline: item.deadline,
            });
          }
        }
        item.subItems.forEach((sub) => {
          if (!sub.completed && sub.deadline) {
            const deadline = new Date(sub.deadline);
            if (deadline < today) {
              overdue.push({
                type: "checklist",
                label: `${cat.title} - ${item.label} - ${sub.label}`,
                deadline: sub.deadline,
              });
            } else if (deadline <= threeDaysLater) {
              dueSoon.push({
                type: "checklist",
                label: `${cat.title} - ${item.label} - ${sub.label}`,
                deadline: sub.deadline,
              });
            }
          }
        });
      });
    });

    // タスクボードから期限切れ・期限間近のタスクを収集
    tasks.forEach((task) => {
      if (task.column !== "done" && task.deadline) {
        const deadline = new Date(task.deadline);
        if (deadline < today) {
          overdue.push({
            type: "kanban",
            label: task.title,
            deadline: task.deadline,
          });
        } else if (deadline <= threeDaysLater) {
          dueSoon.push({
            type: "kanban",
            label: task.title,
            deadline: task.deadline,
          });
        }
      }
    });

    return { overdue, dueSoon };
  }, [checklist, tasks]);

  if (alerts.overdue.length === 0 && alerts.dueSoon.length === 0) {
    return null;
  }

  return (
    <section className="mb-6">
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="border-b border-border bg-muted/30 px-4 py-3">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            タスクアラート
          </h2>
        </div>
        <div className="p-4 space-y-4">
          {alerts.overdue.length > 0 && (
            <div>
              <div className="flex items-center gap-2 text-sm font-medium text-destructive mb-2">
                <AlertTriangle className="h-4 w-4" />
                期限切れ ({alerts.overdue.length}件)
              </div>
              <ul className="space-y-1 ml-6">
                {alerts.overdue.slice(0, 5).map((alert, idx) => (
                  <li key={idx} className="text-sm text-muted-foreground">
                    <span className="font-medium">{alert.label}</span>
                    <span className="ml-2 text-xs">
                      (期限: {new Date(alert.deadline).toLocaleDateString("ja-JP")})
                    </span>
                  </li>
                ))}
                {alerts.overdue.length > 5 && (
                  <li className="text-xs text-muted-foreground">
                    他 {alerts.overdue.length - 5} 件...
                  </li>
                )}
              </ul>
            </div>
          )}

          {alerts.dueSoon.length > 0 && (
            <div>
              <div className="flex items-center gap-2 text-sm font-medium text-orange-600 mb-2">
                <Clock className="h-4 w-4" />
                期限間近 ({alerts.dueSoon.length}件)
              </div>
              <ul className="space-y-1 ml-6">
                {alerts.dueSoon.slice(0, 5).map((alert, idx) => (
                  <li key={idx} className="text-sm text-muted-foreground">
                    <span className="font-medium">{alert.label}</span>
                    <span className="ml-2 text-xs">
                      (期限: {new Date(alert.deadline).toLocaleDateString("ja-JP")})
                    </span>
                  </li>
                ))}
                {alerts.dueSoon.length > 5 && (
                  <li className="text-xs text-muted-foreground">
                    他 {alerts.dueSoon.length - 5} 件...
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

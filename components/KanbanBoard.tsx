"use client";

import { useState, useCallback } from "react";
import {
  useKanban,
  type KanbanTask,
  type KanbanLinkedEntity,
  type KanbanAssignee,
} from "@/contexts/KanbanContext";
import { Check, Circle, Loader2, Plus, X, Pencil, Trash2 } from "lucide-react";

const columnConfig = {
  todo: { label: "To Do", icon: Circle },
  in_progress: { label: "進行中", icon: Loader2 },
  done: { label: "完了", icon: Check },
} as const;

const ASSIGNEE_LABELS: Record<KanbanAssignee, string> = {
  MIZUKI: "水城",
  NISHIKATA: "西方",
};

const LINKED_TYPE_LABELS: Record<KanbanLinkedEntity["type"], string> = {
  school: "学校",
  company: "会社",
  sales: "商談先",
  project: "プロジェクト",
  ai_client: "AI導入先",
};

const ASSIGNEE_OPTIONS: { value: "" | KanbanAssignee; label: string }[] = [
  { value: "", label: "未設定" },
  { value: "MIZUKI", label: "水城" },
  { value: "NISHIKATA", label: "西方" },
];

export type KanbanBoardEntity = { type: KanbanLinkedEntity["type"]; name: string };

interface KanbanBoardProps {
  /** 紐づけ先候補（ブロジェクト・学校・企業・商談先）。現在のチェックリストから渡す */
  entities?: KanbanBoardEntity[];
}

export function KanbanBoard({ entities = [] }: KanbanBoardProps) {
  const { tasks, moveTask, addTask, updateTask, removeTask } = useKanban();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDeadline, setNewTaskDeadline] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [newTaskLinked, setNewTaskLinked] = useState<KanbanLinkedEntity | undefined>();
  const [newTaskAssignee, setNewTaskAssignee] = useState<KanbanAssignee | undefined>();

  const getTasksByColumn = (column: KanbanTask["column"]) =>
    tasks.filter((t) => t.column === column);

  const handleAddTask = () => {
    if (!newTaskTitle.trim()) return;
    const title = newTaskTitle.trim();
    const deadline = newTaskDeadline || undefined;
    const description = newTaskDescription.trim() || undefined;
    addTask({
      title,
      column: "todo",
      deadline,
      description: description || undefined,
      linkedEntity: newTaskLinked,
      assignee: newTaskAssignee,
      source: "manual",
    });
    setNewTaskTitle("");
    setNewTaskDeadline("");
    setNewTaskDescription("");
    setNewTaskLinked(undefined);
    setNewTaskAssignee(undefined);
    setShowAddForm(false);
  };

  const handleMove = useCallback(
    (taskId: string, newCol: KanbanTask["column"]) => {
      moveTask(taskId, newCol);
    },
    [moveTask]
  );

  const handleRemove = useCallback(
    (taskId: string) => {
      removeTask(taskId);
    },
    [removeTask]
  );

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
      <div className="border-b border-border bg-muted/30 px-4 py-3 flex items-center justify-between flex-wrap gap-2">
        <div>
          <h3 className="font-semibold text-foreground">タスクボード</h3>
          <p className="text-xs text-muted-foreground mt-1">
            連絡・テキスト・ファイル解析で抽出したタスクや手動追加のタスクを管理
          </p>
        </div>
        <div className="flex items-center gap-2">
          {!showAddForm && (
            <button
              type="button"
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-sm hover:bg-primary/90 transition-colors"
            >
              <Plus className="h-4 w-4" />
              タスクを追加
            </button>
          )}
        </div>
      </div>
      {showAddForm && (
        <div className="border-b border-border bg-muted/20 px-4 py-3">
          <div className="flex flex-col gap-2">
            <div className="flex items-start gap-2">
              <div className="flex-1 space-y-2">
                <input
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="タスク名を入力"
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") void handleAddTask();
                    if (e.key === "Escape") {
                      setShowAddForm(false);
                      setNewTaskTitle("");
                      setNewTaskDeadline("");
                    }
                  }}
                  autoFocus
                />
                <textarea
                  value={newTaskDescription}
                  onChange={(e) => setNewTaskDescription(e.target.value)}
                  placeholder="説明（任意）"
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                />
                <input
                  type="date"
                  value={newTaskDeadline}
                  onChange={(e) => setNewTaskDeadline(e.target.value)}
                  placeholder="期限（任意）"
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <div className="flex flex-wrap gap-2">
                  <select
                    value={
                      newTaskLinked
                        ? `${newTaskLinked.type}:${newTaskLinked.name}`
                        : ""
                    }
                    onChange={(e) => {
                      const v = e.target.value;
                      if (!v) {
                        setNewTaskLinked(undefined);
                        return;
                      }
                      const [type, ...rest] = v.split(":");
                      const name = rest.join(":");
                      if (type && name)
                        setNewTaskLinked({
                          type: type as KanbanLinkedEntity["type"],
                          name,
                        });
                    }}
                    className="px-3 py-1.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="">紐づけ先を選択（任意）</option>
                    {entities.map((e) => (
                      <option
                        key={`${e.type}-${e.name}`}
                        value={`${e.type}:${e.name}`}
                      >
                        {LINKED_TYPE_LABELS[e.type]}: {e.name}
                      </option>
                    ))}
                  </select>
                  <select
                    value={newTaskAssignee ?? ""}
                    onChange={(e) =>
                      setNewTaskAssignee(
                        (e.target.value || undefined) as KanbanAssignee | undefined
                      )
                    }
                    className="px-3 py-1.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    {ASSIGNEE_OPTIONS.map((o) => (
                      <option key={o.value || "none"} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => void handleAddTask()}
                  disabled={!newTaskTitle.trim()}
                  className="px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  追加
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setNewTaskTitle("");
                    setNewTaskDeadline("");
                    setNewTaskDescription("");
                    setNewTaskLinked(undefined);
                    setNewTaskAssignee(undefined);
                  }}
                  className="p-2 rounded-lg hover:bg-muted text-muted-foreground transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="grid grid-cols-3 gap-4 p-4">
        {(Object.keys(columnConfig) as KanbanTask["column"][]).map((col) => {
          const { label, icon: Icon } = columnConfig[col];
          const columnTasks = getTasksByColumn(col);
          return (
            <div
              key={col}
              className="rounded-lg border border-border bg-muted/20 min-h-[120px]"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const taskId = e.dataTransfer.getData("taskId");
                if (taskId) moveTask(taskId, col);
              }}
            >
              <div className="flex items-center gap-2 px-3 py-2 border-b border-border bg-muted/30">
                <Icon className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">{label}</span>
                <span className="ml-auto text-xs text-muted-foreground">
                  {columnTasks.length}
                </span>
              </div>
              <div className="p-2 min-h-[60px] max-h-[280px] overflow-y-auto overscroll-contain">
                {columnTasks.length === 0 && col === "todo" && tasks.length === 0 ? (
                  <p className="text-xs text-muted-foreground py-4 text-center">
                    連絡・ファイル解析からタスクを追加
                  </p>
                ) : null}
                {columnTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    entities={entities}
                    onMove={(newCol) => handleMove(task.id, newCol)}
                    onUpdate={(updates) => updateTask(task.id, updates)}
                    onRemove={() => handleRemove(task.id)}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TaskCard({
  task,
  entities,
  onMove,
  onUpdate,
  onRemove,
}: {
  task: KanbanTask;
  entities: KanbanBoardEntity[];
  onMove: (col: KanbanTask["column"]) => void;
  onUpdate: (updates: Partial<Omit<KanbanTask, "id" | "createdAt">>) => void;
  onRemove: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDescription, setEditDescription] = useState(task.description ?? "");
  const [editDeadline, setEditDeadline] = useState(task.deadline ?? "");
  const [editLinked, setEditLinked] = useState<KanbanLinkedEntity | undefined>(
    task.linkedEntity
  );
  const [editAssignee, setEditAssignee] = useState<KanbanAssignee | undefined>(
    task.assignee
  );

  const canMoveLeft = task.column !== "todo";
  const canMoveRight = task.column !== "done";

  const handleSaveEdit = () => {
    onUpdate({
      title: editTitle.trim() || task.title,
      description: editDescription.trim() || undefined,
      deadline: editDeadline || undefined,
      linkedEntity: editLinked,
      assignee: editAssignee,
    });
    setEditing(false);
  };

  const openEdit = () => {
    setEditTitle(task.title);
    setEditDescription(task.description ?? "");
    setEditDeadline(task.deadline ?? "");
    setEditLinked(task.linkedEntity);
    setEditAssignee(task.assignee);
    setEditing(true);
  };

  return (
    <>
      <div
        className="rounded-lg border border-border bg-card p-2.5 shadow-sm text-sm group mb-2 last:mb-0"
        draggable
        onDragStart={(e) => {
          e.dataTransfer.setData("taskId", task.id);
        }}
      >
        <div className="flex items-start justify-between gap-1">
          <p className="font-medium text-foreground text-xs line-clamp-2 flex-1 min-w-0">
            {task.title}
          </p>
          <div className="flex items-center gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                openEdit();
              }}
              className="p-1 rounded hover:bg-muted text-muted-foreground"
              title="編集"
            >
              <Pencil className="h-3 w-3" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }}
              className="p-1 rounded hover:bg-destructive/20 text-muted-foreground hover:text-destructive"
              title="削除"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
        </div>
        {task.description && (
          <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-2">
            {task.description}
          </p>
        )}
        {task.deadline && (
          <p className="text-[10px] text-muted-foreground mt-0.5">
            期限: {task.deadline}
          </p>
        )}
        <div className="flex flex-wrap gap-1 mt-1.5">
          {task.linkedEntity && (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] bg-muted text-muted-foreground">
              {LINKED_TYPE_LABELS[task.linkedEntity.type]}: {task.linkedEntity.name}
            </span>
          )}
          {task.assignee && (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] bg-primary/15 text-primary font-medium">
              担当: {ASSIGNEE_LABELS[task.assignee]}
            </span>
          )}
        </div>
        <div className="flex gap-1 mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
          {canMoveLeft && (
            <button
              onClick={() =>
                onMove(task.column === "in_progress" ? "todo" : "in_progress")
              }
              className="text-xs px-2 py-1 rounded bg-muted hover:bg-muted/80"
            >
              ←
            </button>
          )}
          {canMoveRight && (
            <button
              onClick={() =>
                onMove(task.column === "todo" ? "in_progress" : "done")
              }
              className="text-xs px-2 py-1 rounded bg-muted hover:bg-muted/80"
            >
              →
            </button>
          )}
        </div>
      </div>

      {editing && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={() => setEditing(false)}
        >
          <div
            className="bg-card rounded-xl border border-border shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h4 className="font-medium text-foreground mb-3">タスクを編集</h4>
            <div className="space-y-2">
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="タスク名"
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="説明（任意）"
                rows={2}
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              />
              <input
                type="date"
                value={editDeadline}
                onChange={(e) => setEditDeadline(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <select
                value={
                  editLinked
                    ? `${editLinked.type}:${editLinked.name}`
                    : ""
                }
                onChange={(e) => {
                  const v = e.target.value;
                  if (!v) {
                    setEditLinked(undefined);
                    return;
                  }
                  const [type, ...rest] = v.split(":");
                  const name = rest.join(":");
                  if (type && name)
                    setEditLinked({
                      type: type as KanbanLinkedEntity["type"],
                      name,
                    });
                }}
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">紐づけ先を選択（任意）</option>
                {entities.map((e) => (
                  <option key={`${e.type}-${e.name}`} value={`${e.type}:${e.name}`}>
                    {LINKED_TYPE_LABELS[e.type]}: {e.name}
                  </option>
                ))}
              </select>
              <select
                value={editAssignee ?? ""}
                onChange={(e) =>
                  setEditAssignee(
                    (e.target.value || undefined) as KanbanAssignee | undefined
                  )
                }
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {ASSIGNEE_OPTIONS.map((o) => (
                  <option key={o.value || "none"} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-2 mt-4">
              <button
                type="button"
                onClick={handleSaveEdit}
                className="px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm hover:bg-primary/90"
              >
                保存
              </button>
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="px-3 py-2 rounded-lg border border-border bg-muted/50 text-sm hover:bg-muted"
              >
                キャンセル
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

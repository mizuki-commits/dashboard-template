"use client";

import { useState } from "react";
import {
  Check,
  ChevronDown,
  ChevronRight,
  Plus,
  GripVertical,
  LayoutGrid,
  Globe,
  FileText,
  Megaphone,
  MapPin,
  Camera,
  GraduationCap,
  Building2,
  Handshake,
  FolderKanban,
  Cpu,
  Trash2,
  X,
  ListTodo,
} from "lucide-react";
import { useKanban, type KanbanLinkedEntity } from "@/contexts/KanbanContext";

export type CategoryIconId =
  | "globe"
  | "file"
  | "megaphone"
  | "map"
  | "camera"
  | "graduation"
  | "layout"
  | "building"
  | "handshake"
  | "folder"
  | "cpu";

/** サブタスク担当者（選択式） */
export type SubTaskAssignee = "MIZUKI" | "NISHIKATA";

export const SUBTASK_ASSIGNEE_OPTIONS: { value: "" | SubTaskAssignee; label: string }[] = [
  { value: "", label: "未設定" },
  { value: "MIZUKI", label: "MIZUKI" },
  { value: "NISHIKATA", label: "NISHIKATA" },
];

export interface ChecklistSubItem {
  id: string;
  label: string;
  completed: boolean;
  deadline: string;
  startDate?: string;
  /** 担当者（MIZUKI / NISHIKATA） */
  assignee?: SubTaskAssignee;
  /** Todoist 連携用。作成時に Todoist のタスク ID を保持する */
  todoistId?: string;
}

export interface ChecklistItem {
  id: string;
  label: string;
  completed: boolean;
  deadline: string;
  startDate?: string;
  subItems: ChecklistSubItem[];
  /** Todoist 連携用。作成時に Todoist のタスク ID を保持する */
  todoistId?: string;
}

export interface ChecklistCategory {
  id: string;
  title: string;
  icon: React.ReactNode;
  iconId?: CategoryIconId;
  items: ChecklistItem[];
}

const CATEGORY_ICONS: Record<CategoryIconId, React.ReactNode> = {
  globe: <Globe className="h-5 w-5" />,
  file: <FileText className="h-5 w-5" />,
  megaphone: <Megaphone className="h-5 w-5" />,
  map: <MapPin className="h-5 w-5" />,
  camera: <Camera className="h-5 w-5" />,
  graduation: <GraduationCap className="h-5 w-5" />,
  layout: <LayoutGrid className="h-5 w-5" />,
  building: <Building2 className="h-5 w-5" />,
  handshake: <Handshake className="h-5 w-5" />,
  folder: <FolderKanban className="h-5 w-5" />,
  cpu: <Cpu className="h-5 w-5" />,
};

function generateId() {
  return `id-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function formatDateForInput(dateStr: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

function getDefaultDeadline(): string {
  const d = new Date();
  d.setMonth(d.getMonth() + 1);
  return d.toISOString().slice(0, 10);
}

/** 施策の代わりに表示する単位（学校 / 会社 / 商談先 / プロジェクト / AI導入先） */
export type ChecklistEntityLabel = "施策" | "学校" | "会社" | "商談先" | "プロジェクト" | "導入先";

const ENTITY_LABELS: Record<
  ChecklistEntityLabel,
  { sectionTitle: string; addCategory: string; categoryPlaceholder: string; addItem: string; itemPlaceholder: string; removeItem: string; removeCategory: string }
> = {
  施策: {
    sectionTitle: "施策チェックリスト（WBS）",
    addCategory: "施策カテゴリを追加",
    categoryPlaceholder: "カテゴリ名を入力（例：体験型イベント）",
    addItem: "施策追加",
    itemPlaceholder: "施策名を入力",
    removeItem: "施策を削除",
    removeCategory: "カテゴリを削除",
  },
  学校: {
    sectionTitle: "学校別チェックリスト（WBS）",
    addCategory: "学校を追加",
    categoryPlaceholder: "学校名を入力",
    addItem: "タスク追加",
    itemPlaceholder: "タスク名を入力",
    removeItem: "タスクを削除",
    removeCategory: "学校を削除",
  },
  会社: {
    sectionTitle: "企業別チェックリスト（WBS）",
    addCategory: "会社を追加",
    categoryPlaceholder: "会社名を入力",
    addItem: "タスク追加",
    itemPlaceholder: "タスク名を入力",
    removeItem: "タスクを削除",
    removeCategory: "会社を削除",
  },
  商談先: {
    sectionTitle: "商談先別チェックリスト（WBS）",
    addCategory: "商談先を追加",
    categoryPlaceholder: "商談先名・企業名を入力",
    addItem: "タスク追加",
    itemPlaceholder: "タスク名を入力",
    removeItem: "タスクを削除",
    removeCategory: "商談先を削除",
  },
  プロジェクト: {
    sectionTitle: "プロジェクト別チェックリスト（WBS）",
    addCategory: "プロジェクトを追加",
    categoryPlaceholder: "プロジェクト名を入力",
    addItem: "タスク追加",
    itemPlaceholder: "タスク名を入力",
    removeItem: "タスクを削除",
    removeCategory: "プロジェクトを削除",
  },
  導入先: {
    sectionTitle: "AI導入先別チェックリスト（WBS）",
    addCategory: "導入先を追加",
    categoryPlaceholder: "企業名・組織名を入力",
    addItem: "タスク追加",
    itemPlaceholder: "タスク名を入力",
    removeItem: "タスクを削除",
    removeCategory: "導入先を削除",
  },
};

export function ChecklistSection({
  checklist,
  onUpdate,
  defaultDeadline,
  entityLabel = "施策",
  defaultIconId,
}: {
  checklist: ChecklistCategory[];
  onUpdate: (updated: ChecklistCategory[]) => void;
  defaultDeadline?: string;
  /** 施策の代わりに「学校」「会社」で表示する場合に指定 */
  entityLabel?: ChecklistEntityLabel;
  /** 新規追加時のデフォルトアイコン（学校: graduation, 会社: building） */
  defaultIconId?: CategoryIconId;
}) {
  const labels = ENTITY_LABELS[entityLabel];
  const defaultIcon = defaultIconId ?? "layout";
  const { addTask, addTasks } = useKanban();
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [selectedForKanban, setSelectedForKanban] = useState<Set<string>>(new Set());
  const [newCategoryTitle, setNewCategoryTitle] = useState("");
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [addingItemTo, setAddingItemTo] = useState<string | null>(null);
  const [newItemLabel, setNewItemLabel] = useState("");

  const entityLabelToKanbanType = (): KanbanLinkedEntity["type"] | undefined => {
    if (entityLabel === "学校") return "school";
    if (entityLabel === "会社") return "company";
    if (entityLabel === "商談先") return "sales";
    if (entityLabel === "プロジェクト") return "project";
    if (entityLabel === "導入先") return "ai_client";
    return undefined;
  };

  const deadline = defaultDeadline ?? getDefaultDeadline();

  const addToKanban = (label: string, deadline?: string, linkedEntity?: KanbanLinkedEntity, assignee?: SubTaskAssignee) => {
    addTask({
      title: label,
      column: "todo",
      deadline: deadline || undefined,
      linkedEntity,
      assignee,
      source: "checklist",
    });
  };

  const kanbanKey = (categoryId: string, itemId: string, subId?: string) =>
    subId ? `${categoryId}:${itemId}:${subId}` : `${categoryId}:${itemId}:main`;

  const toggleKanbanSelection = (key: string) => {
    setSelectedForKanban((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const addSelectedToKanban = () => {
    const type = entityLabelToKanbanType();
    const tasksToAdd: Parameters<typeof addTasks>[0] = [];
    checklist.forEach((category) => {
      const linkedEntity: KanbanLinkedEntity | undefined =
        type ? { type, name: category.title } : undefined;
      category.items.forEach((item) => {
        const mainKey = kanbanKey(category.id, item.id);
        if (selectedForKanban.has(mainKey)) {
          tasksToAdd.push({
            title: item.label,
            column: "todo",
            deadline: item.deadline || undefined,
            linkedEntity,
            source: "checklist",
          });
        }
        item.subItems.forEach((sub) => {
          const subKey = kanbanKey(category.id, item.id, sub.id);
          if (selectedForKanban.has(subKey)) {
            tasksToAdd.push({
              title: sub.label,
              column: "todo",
              deadline: sub.deadline || undefined,
              linkedEntity,
              assignee: sub.assignee,
              source: "checklist",
            });
          }
        });
      });
    });
    if (tasksToAdd.length > 0) {
      addTasks(tasksToAdd);
      setSelectedForKanban(new Set());
    }
  };

  const toggleExpand = (itemId: string) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) next.delete(itemId);
      else next.add(itemId);
      return next;
    });
  };

  const updateCategory = (categoryId: string, updater: (cat: ChecklistCategory) => ChecklistCategory) => {
    onUpdate(
      checklist.map((cat) => (cat.id === categoryId ? updater(cat) : cat))
    );
  };

  const toggleMainItem = (categoryId: string, itemId: string) => {
    updateCategory(categoryId, (cat) => ({
      ...cat,
      items: cat.items.map((item) =>
        item.id === itemId ? { ...item, completed: !item.completed } : item
      ),
    }));
  };

  const toggleSubItem = (categoryId: string, itemId: string, subId: string) => {
    updateCategory(categoryId, (cat) => ({
      ...cat,
      items: cat.items.map((item) =>
        item.id === itemId
          ? {
              ...item,
              subItems: item.subItems.map((sub) =>
                sub.id === subId ? { ...sub, completed: !sub.completed } : sub
              ),
            }
          : item
      ),
    }));
  };

  const updateDeadline = (categoryId: string, itemId: string, deadline: string, subId?: string) => {
    updateCategory(categoryId, (cat) => ({
      ...cat,
      items: cat.items.map((item) => {
        if (item.id !== itemId) return item;
        if (subId) {
          return {
            ...item,
            subItems: item.subItems.map((sub) =>
              sub.id === subId ? { ...sub, deadline } : sub
            ),
          };
        }
        return { ...item, deadline };
      }),
    }));
  };

  const updateStartDate = (categoryId: string, itemId: string, startDate: string, subId?: string) => {
    updateCategory(categoryId, (cat) => ({
      ...cat,
      items: cat.items.map((item) => {
        if (item.id !== itemId) return item;
        if (subId) {
          return {
            ...item,
            subItems: item.subItems.map((sub) =>
              sub.id === subId ? { ...sub, startDate } : sub
            ),
          };
        }
        return { ...item, startDate };
      }),
    }));
  };

  const addSubItem = async (categoryId: string, itemId: string) => {
    const today = new Date();
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 7);
    const category = checklist.find((c) => c.id === categoryId);
    const item = category?.items.find((i) => i.id === itemId);
    const newSub: ChecklistSubItem = {
      id: generateId(),
      label: newItemLabel.trim() || "新しいサブタスク",
      completed: false,
      deadline: deadline || targetDate.toISOString().slice(0, 10),
      startDate: today.toISOString().slice(0, 10),
    };

    // Todoist連携: デフォルトプロジェクトが設定されている場合、タスクを作成
    const defaultProjectId = typeof window !== "undefined" ? localStorage.getItem("todoist_default_project_id") : null;
    const userToken = typeof window !== "undefined" ? localStorage.getItem("todoist_user_token") : null;
    if (defaultProjectId) {
      try {
        const dueString = newSub.deadline ? new Date(newSub.deadline).toISOString().slice(0, 10) : undefined;
        const parentContent = item ? item.label : category?.title || "";
        const res = await fetch("/api/todoist/create-task", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content: newSub.label,
            projectId: defaultProjectId,
            description: category && item ? `${category.title} - ${parentContent} - ${newSub.label}` : newSub.label,
            dueString: dueString,
            userToken: userToken || undefined,
          }),
        });
        if (res.ok) {
          const data = (await res.json()) as { taskId?: string };
          if (data.taskId) {
            newSub.todoistId = data.taskId;
          }
        }
      } catch (e) {
        console.error("Todoistタスク作成エラー:", e);
        // エラーが発生してもチェックリストの作成は続行
      }
    }

    updateCategory(categoryId, (cat) => ({
      ...cat,
      items: cat.items.map((item) =>
        item.id === itemId
          ? { ...item, subItems: [...item.subItems, newSub] }
          : item
      ),
    }));
    setExpandedItems((prev) => new Set(prev).add(itemId));
    setNewItemLabel("");
  };

  const updateSubItemLabel = (categoryId: string, itemId: string, subId: string, label: string) => {
    updateCategory(categoryId, (cat) => ({
      ...cat,
      items: cat.items.map((item) =>
        item.id === itemId
          ? {
              ...item,
              subItems: item.subItems.map((sub) =>
                sub.id === subId ? { ...sub, label } : sub
              ),
            }
          : item
      ),
    }));
  };

  const updateSubItemAssignee = (
    categoryId: string,
    itemId: string,
    subId: string,
    assignee: "" | SubTaskAssignee
  ) => {
    const value = assignee === "" ? undefined : assignee;
    updateCategory(categoryId, (cat) => ({
      ...cat,
      items: cat.items.map((item) =>
        item.id === itemId
          ? {
              ...item,
              subItems: item.subItems.map((sub) =>
                sub.id === subId ? { ...sub, assignee: value } : sub
              ),
            }
          : item
      ),
    }));
  };

  const updateItemLabel = (categoryId: string, itemId: string, label: string) => {
    updateCategory(categoryId, (cat) => ({
      ...cat,
      items: cat.items.map((item) =>
        item.id === itemId ? { ...item, label } : item
      ),
    }));
  };

  const addCategory = async () => {
    const title = newCategoryTitle.trim() || "新しいカテゴリ";
    const newCat: ChecklistCategory = {
      id: generateId(),
      title,
      icon: CATEGORY_ICONS[defaultIcon],
      iconId: defaultIcon,
      items: [],
    };

    // Todoist連携: デフォルトプロジェクトが設定されている場合、タスクを作成
    const defaultProjectId = typeof window !== "undefined" ? localStorage.getItem("todoist_default_project_id") : null;
    const userToken = typeof window !== "undefined" ? localStorage.getItem("todoist_user_token") : null;
    if (defaultProjectId) {
      try {
        const res = await fetch("/api/todoist/create-task", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content: title,
            projectId: defaultProjectId,
            description: `${entityLabel}プロジェクト: ${title}`,
            userToken: userToken || undefined,
          }),
        });
        if (res.ok) {
          const data = (await res.json()) as { taskId?: string };
          if (data.taskId) {
            // カテゴリにtodoistIdを保存（将来的に使用）
            // 現在のChecklistCategoryにはtodoistIdフィールドがないため、スキップ
          }
        }
      } catch (e) {
        console.error("Todoistタスク作成エラー:", e);
        // エラーが発生してもチェックリストの作成は続行
      }
    }

    onUpdate([...checklist, newCat]);
    setNewCategoryTitle("");
    setShowAddCategory(false);
  };

  const addItem = async (categoryId: string) => {
    const label = newItemLabel.trim() || (entityLabel === "施策" ? "新しい施策" : "新しいタスク");
    const today = new Date().toISOString().slice(0, 10);
    const category = checklist.find((c) => c.id === categoryId);
    const newItem: ChecklistItem = {
      id: generateId(),
      label,
      completed: false,
      deadline: deadline,
      startDate: today,
      subItems: [],
    };

    // Todoist連携: デフォルトプロジェクトが設定されている場合、タスクを作成
    const defaultProjectId = typeof window !== "undefined" ? localStorage.getItem("todoist_default_project_id") : null;
    const userToken = typeof window !== "undefined" ? localStorage.getItem("todoist_user_token") : null;
    if (defaultProjectId) {
      try {
        const dueString = deadline ? new Date(deadline).toISOString().slice(0, 10) : undefined;
        const res = await fetch("/api/todoist/create-task", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content: label,
            projectId: defaultProjectId,
            description: category ? `${category.title} - ${label}` : label,
            dueString: dueString,
            userToken: userToken || undefined,
          }),
        });
        if (res.ok) {
          const data = (await res.json()) as { taskId?: string };
          if (data.taskId) {
            newItem.todoistId = data.taskId;
          }
        }
      } catch (e) {
        console.error("Todoistタスク作成エラー:", e);
        // エラーが発生してもチェックリストの作成は続行
      }
    }

    onUpdate(
      checklist.map((cat) =>
        cat.id === categoryId
          ? { ...cat, items: [...cat.items, newItem] }
          : cat
      )
    );
    setNewItemLabel("");
    setAddingItemTo(null);
  };

  const removeItem = (categoryId: string, itemId: string) => {
    onUpdate(
      checklist.map((cat) =>
        cat.id === categoryId
          ? { ...cat, items: cat.items.filter((i) => i.id !== itemId) }
          : cat
      )
    );
  };

  const removeCategory = (categoryId: string) => {
    onUpdate(checklist.filter((cat) => cat.id !== categoryId));
  };

  const totalCount = checklist.reduce(
    (sum, cat) =>
      sum +
      cat.items.reduce((s, item) => s + 1 + item.subItems.length, 0),
    0
  );
  const completedCount = checklist.reduce(
    (sum, cat) =>
      sum +
      cat.items.reduce((s, item) => {
        const main = item.completed ? 1 : 0;
        const sub = item.subItems.filter((s) => s.completed).length;
        return s + main + sub;
      }, 0),
    0
  );
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <section>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          {labels.sectionTitle}
        </h2>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5">
            <span className="text-sm font-medium text-primary">
              {completedCount}/{totalCount}
            </span>
            <span className="text-sm text-muted-foreground">完了</span>
          </div>
          {selectedForKanban.size > 0 && (
            <button
              type="button"
              onClick={addSelectedToKanban}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-sm hover:bg-primary/90 transition-colors"
            >
              <ListTodo className="h-4 w-4" />
              選択したタスクをタスクボードに追加（{selectedForKanban.size}件）
            </button>
          )}
        </div>
      </div>
      <div className="mb-4 h-2 rounded-full bg-muted overflow-hidden">
        <div
          className="h-full rounded-full bg-primary transition-all duration-500"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* カテゴリ追加フォーム */}
      {showAddCategory ? (
        <div className="rounded-xl border border-dashed border-primary/50 bg-primary/5 p-4 mb-4">
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={newCategoryTitle}
              onChange={(e) => setNewCategoryTitle(e.target.value)}
              placeholder={labels.categoryPlaceholder}
              className="flex-1 border border-input rounded-lg px-4 py-2 bg-background"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") addCategory();
                if (e.key === "Escape") setShowAddCategory(false);
              }}
            />
            <button
              type="button"
              onClick={addCategory}
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 font-medium"
            >
              追加
            </button>
            <button
              type="button"
              onClick={() => { setShowAddCategory(false); setNewCategoryTitle(""); }}
              className="p-2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setShowAddCategory(true)}
          className="w-full mb-4 flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-muted-foreground/30 text-muted-foreground hover:border-primary/50 hover:text-primary hover:bg-primary/5 transition-colors"
        >
          <Plus className="h-5 w-5" />
          {labels.addCategory}
        </button>
      )}

      <div className="space-y-4">
        {checklist.map((category) => (
          <div
            key={category.id}
            id={`checklist-cat-${category.id}`}
            className="rounded-xl border border-border bg-card shadow-sm overflow-hidden scroll-mt-24"
          >
            <div className="flex items-center gap-3 border-b border-border bg-muted/30 px-4 py-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                {category.icon}
              </div>
              <h3 className="font-semibold text-foreground flex-1 min-w-0">{category.title}</h3>
              <div className="flex items-center gap-1 shrink-0">
                {addingItemTo === category.id ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={newItemLabel}
                      onChange={(e) => setNewItemLabel(e.target.value)}
                      placeholder={labels.itemPlaceholder}
                      className="w-40 text-sm border border-input rounded px-2 py-1 bg-background"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === "Enter") addItem(category.id);
                        if (e.key === "Escape") setAddingItemTo(null);
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => addItem(category.id)}
                      className="text-xs px-2 py-1 rounded bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      追加
                    </button>
                    <button
                      type="button"
                      onClick={() => { setAddingItemTo(null); setNewItemLabel(""); }}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => setAddingItemTo(category.id)}
                      className="text-xs flex items-center gap-1 px-2 py-1 rounded bg-primary/10 text-primary hover:bg-primary/20"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      {labels.addItem}
                    </button>
                    <button
                      type="button"
                      onClick={() => removeCategory(category.id)}
                      className="p-1 text-muted-foreground hover:text-destructive"
                      title={labels.removeCategory}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </>
                )}
              </div>
            </div>
            <div className="divide-y divide-border">
              {category.items.map((item) => {
                const hasSub = item.subItems.length > 0;
                const isExpanded = expandedItems.has(item.id);

                return (
                  <div key={item.id}>
                    {/* メイン項目 */}
                    <div className="group/item flex items-center gap-2 px-4 py-2.5 hover:bg-muted/20">
                      <button
                        type="button"
                        onClick={() => hasSub && toggleExpand(item.id)}
                        className="shrink-0 text-muted-foreground"
                      >
                        {hasSub ? (
                          isExpanded ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )
                        ) : (
                          <span className="w-4 inline-block" />
                        )}
                      </button>
                      <label className="flex flex-1 cursor-pointer items-center gap-3 min-w-0">
                        <div
                          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-colors ${
                            item.completed
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-input hover:border-primary/50"
                          }`}
                        >
                          {item.completed ? (
                            <Check className="h-3 w-3" strokeWidth={3} />
                          ) : null}
                        </div>
                        <input
                          type="checkbox"
                          checked={item.completed}
                          onChange={() => toggleMainItem(category.id, item.id)}
                          className="sr-only"
                        />
                        <input
                          type="text"
                          value={item.label}
                          onChange={(e) =>
                            updateItemLabel(category.id, item.id, e.target.value)
                          }
                          onClick={(e) => e.stopPropagation()}
                          className={`flex-1 min-w-0 bg-transparent border-none text-sm focus:outline-none focus:ring-0 py-0 ${
                            item.completed
                              ? "text-muted-foreground line-through"
                              : "text-foreground"
                          }`}
                          placeholder={labels.itemPlaceholder}
                        />
                      </label>
                      <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] text-muted-foreground">着手:</span>
                          <input
                            type="date"
                            value={formatDateForInput(item.startDate ?? "")}
                            onChange={(e) =>
                              updateStartDate(category.id, item.id, e.target.value)
                            }
                            className="w-28 text-xs border border-input rounded px-1.5 py-1 bg-background"
                          />
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] text-muted-foreground">締切:</span>
                          <input
                            type="date"
                            value={formatDateForInput(item.deadline)}
                            onChange={(e) =>
                              updateDeadline(category.id, item.id, e.target.value)
                            }
                            className="w-28 text-xs border border-input rounded px-1.5 py-1 bg-background"
                          />
                        </div>
                        <label
                          className="flex items-center gap-1 text-muted-foreground opacity-0 group-hover/item:opacity-100 cursor-pointer shrink-0"
                          title="タスクボードに掲載する"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <input
                            type="checkbox"
                            checked={selectedForKanban.has(kanbanKey(category.id, item.id))}
                            onChange={() =>
                              toggleKanbanSelection(kanbanKey(category.id, item.id))
                            }
                            className="rounded border-input"
                          />
                          <span className="text-[10px]">掲載</span>
                        </label>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            const type = entityLabelToKanbanType();
                            addToKanban(
                              item.label,
                              item.deadline,
                              type ? { type, name: category.title } : undefined
                            );
                          }}
                          className="p-1 text-muted-foreground opacity-0 group-hover/item:opacity-100 hover:text-primary transition-opacity"
                          title="タスクボードに追加"
                        >
                          <ListTodo className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeItem(category.id, item.id)}
                          className="p-1 text-muted-foreground opacity-0 group-hover/item:opacity-100 hover:text-destructive transition-opacity"
                          title={labels.removeItem}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* サブ項目（構造分解） */}
                    {hasSub && isExpanded && (
                      <div className="bg-muted/10 border-t border-border">
                        {item.subItems.map((sub) => (
                          <div
                            key={sub.id}
                            className="flex items-center gap-2 pl-12 pr-4 py-2 border-t border-border/50"
                          >
                            <GripVertical className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                            <label className="flex flex-1 cursor-pointer items-center gap-2 min-w-0">
                              <div
                                className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border-2 transition-colors ${
                                  sub.completed
                                    ? "border-primary bg-primary text-primary-foreground"
                                    : "border-input hover:border-primary/50"
                                }`}
                              >
                                {sub.completed ? (
                                  <Check className="h-2.5 w-2.5" strokeWidth={3} />
                                ) : null}
                              </div>
                              <input
                                type="checkbox"
                                checked={sub.completed}
                                onChange={() =>
                                  toggleSubItem(category.id, item.id, sub.id)
                                }
                                className="sr-only"
                              />
                              <input
                                type="text"
                                value={sub.label}
                                onChange={(e) =>
                                  updateSubItemLabel(
                                    category.id,
                                    item.id,
                                    sub.id,
                                    e.target.value
                                  )
                                }
                                className={`flex-1 min-w-0 bg-transparent border-none text-sm focus:outline-none focus:ring-0 ${
                                  sub.completed
                                    ? "text-muted-foreground line-through"
                                    : "text-foreground"
                                }`}
                              />
                            </label>
                            <div className="flex items-center gap-2 shrink-0">
                              <div className="flex items-center gap-1">
                                <span className="text-[10px] text-muted-foreground">着手</span>
                                <input
                                  type="date"
                                  value={formatDateForInput(sub.startDate ?? "")}
                                  onChange={(e) =>
                                    updateStartDate(
                                      category.id,
                                      item.id,
                                      e.target.value,
                                      sub.id
                                    )
                                  }
                                  className="w-24 text-xs border border-input rounded px-1 py-0.5 bg-background"
                                />
                              </div>
                              <div className="flex items-center gap-1">
                                <span className="text-[10px] text-muted-foreground">締切</span>
                                <input
                                  type="date"
                                  value={formatDateForInput(sub.deadline)}
                                  onChange={(e) =>
                                    updateDeadline(
                                      category.id,
                                      item.id,
                                      e.target.value,
                                      sub.id
                                    )
                                  }
                                  className="w-24 text-xs border border-input rounded px-1 py-0.5 bg-background"
                                />
                              </div>
                              <div className="flex items-center gap-1">
                                <span className="text-[10px] text-muted-foreground">担当</span>
                                <select
                                  value={sub.assignee ?? ""}
                                  onChange={(e) =>
                                    updateSubItemAssignee(
                                      category.id,
                                      item.id,
                                      sub.id,
                                      e.target.value as "" | SubTaskAssignee
                                    )
                                  }
                                  className="min-w-[100px] text-xs border border-input rounded px-1.5 py-0.5 bg-background"
                                >
                                  {SUBTASK_ASSIGNEE_OPTIONS.map((opt) => (
                                    <option key={opt.value || "none"} value={opt.value}>
                                      {opt.label}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              <label
                                className="flex items-center gap-1 text-muted-foreground cursor-pointer shrink-0"
                                title="タスクボードに掲載する"
                              >
                                <input
                                  type="checkbox"
                                  checked={selectedForKanban.has(
                                    kanbanKey(category.id, item.id, sub.id)
                                  )}
                                  onChange={() =>
                                    toggleKanbanSelection(
                                      kanbanKey(category.id, item.id, sub.id)
                                    )
                                  }
                                  className="rounded border-input"
                                />
                                <span className="text-[10px]">掲載</span>
                              </label>
                              <button
                                type="button"
                                onClick={() => {
                                  const type = entityLabelToKanbanType();
                                  addToKanban(
                                    sub.label,
                                    sub.deadline,
                                    type ? { type, name: category.title } : undefined,
                                    sub.assignee
                                  );
                                }}
                                className="p-1 text-muted-foreground hover:text-primary transition-colors"
                                title="タスクボードに追加"
                              >
                                <ListTodo className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                        <div className="pl-12 pr-4 py-2">
                          <button
                            type="button"
                            onClick={() => addSubItem(category.id, item.id)}
                            className="flex items-center gap-1 text-xs text-primary hover:underline"
                          >
                            <Plus className="h-3.5 w-3.5" />
                            サブタスクを追加
                          </button>
                        </div>
                      </div>
                    )}

                    {/* サブ項目がない場合の追加ボタン */}
                    {!hasSub && (
                      <div className="pl-12 pr-4 py-1">
                        <button
                          type="button"
                          onClick={() => addSubItem(category.id, item.id)}
                          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          構造分解を追加
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

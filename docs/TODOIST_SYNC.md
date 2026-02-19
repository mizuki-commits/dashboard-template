# 前提

- 現在、http://localhost:3000 で動作するタスク管理アプリを開発しています。
- 技術スタック: **Next.js 14 (App Router) / React / TypeScript / Node.js**

# ゴール

このアプリでタスクを**作成・更新**した際に、Todoist の API を通じて Todoist 側のタスクも自動で同期されるようにする。

# 現在のデータ構造（型定義）

アプリのタスクは `contexts/KanbanContext.tsx` で次のように定義されています。

```typescript
export type KanbanAssignee = "MIZUKI" | "NISHIKATA";

export interface KanbanLinkedEntity {
  type: "school" | "company" | "sales" | "project";
  name: string;
}

export interface KanbanTask {
  id: string;
  title: string;
  column: "todo" | "in_progress" | "done";
  deadline?: string;
  description?: string;
  linkedEntity?: KanbanLinkedEntity;
  assignee?: KanbanAssignee;
  source?: string; // "slack" | "manual" | "checklist"
  createdAt: string;
  /** Todoist 連携用。作成時に API で取得したタスク ID */
  todoistId?: string;
}
```

- **作成・更新・削除**は `KanbanContext` の `addTask` / `updateTask` / `removeTask` で行います。
- Todoist と対応づけるために `todoistId` を保持しています。

# 現在の Todoist 同期の実装

| 操作       | アプリ側               | Todoist 同期 |
|------------|------------------------|---------------|
| タスク作成 | `addTask(...)`         | `POST /api/todoist/tasks` で Todoist に作成 → 返却された `id` を `todoistId` に保存 |
| タスク完了 | `moveTask(id, "done")` | `todoistId` がある場合 `POST /api/todoist/tasks/:id/close` で完了 |
| タスク削除 | `removeTask(id)`       | `todoistId` がある場合 `DELETE /api/todoist/tasks/:id` で削除 |
| タスク更新 | `updateTask(id, ...)`  | `todoistId` がある場合 `POST /api/todoist/tasks/:id` でタイトル・説明・期限を Todoist に反映 |

環境変数 `.env.local` に `TODOIST_API_TOKEN` を設定すると上記が有効になります。

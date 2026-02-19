"use client";

import { useState, useEffect, useCallback } from "react";
import { useKanban } from "@/contexts/KanbanContext";
import { RefreshCw, Settings2, AlertCircle, Key, Eye, EyeOff } from "lucide-react";

interface TodoistProject {
  id: string;
  name: string;
  order?: number;
  is_inbox_project?: boolean;
}

interface SyncTask {
  id: string;
  content: string;
  description: string;
  due?: string;
}

export default function SettingsPage() {
  const { tasks, addTask, updateTask } = useKanban();
  const [projects, setProjects] = useState<TodoistProject[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [syncResult, setSyncResult] = useState<{ added: number; updated: number } | null>(null);
  
  // ユーザーごとのTodoist APIトークン管理
  const [userToken, setUserToken] = useState("");
  const [showToken, setShowToken] = useState(false);
  const [savingToken, setSavingToken] = useState(false);

  const fetchProjects = useCallback(async () => {
    setError(null);
    setLoadingProjects(true);
    try {
      // ユーザートークンがある場合はそれを使用
      const userToken = typeof window !== "undefined" ? localStorage.getItem("todoist_user_token") : null;
      const url = userToken ? `/api/todoist/projects?userToken=${encodeURIComponent(userToken)}` : "/api/todoist/projects";
      const res = await fetch(url);
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string; detail?: string };
        setError(data.error || data.detail || `HTTP ${res.status}`);
        setProjects([]);
        return;
      }
      const data = (await res.json()) as TodoistProject[];
      setProjects(data);
      if (data.length > 0) {
        setSelectedProjectId((prev) => prev || data[0].id);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "プロジェクト一覧の取得に失敗しました");
      setProjects([]);
    } finally {
      setLoadingProjects(false);
    }
  }, []);

  useEffect(() => {
    void fetchProjects();
    // ローカルストレージからユーザートークンを読み込み
    const storedToken = typeof window !== "undefined" ? localStorage.getItem("todoist_user_token") : null;
    if (storedToken) {
      setUserToken(storedToken);
    }
  }, []);

  const handleSync = async () => {
    if (!selectedProjectId.trim()) {
      setError("同期するプロジェクトを選択してください。");
      return;
    }
    setError(null);
    setSyncResult(null);
    setSyncing(true);
    try {
      const res = await fetch("/api/todoist/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId: selectedProjectId }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        detail?: string;
        tasks?: SyncTask[];
      };
      if (!res.ok) {
        setError(data.error || data.detail || `HTTP ${res.status}`);
        return;
      }
      const todoistTasks = data.tasks ?? [];
      let added = 0;
      let updated = 0;
      for (const t of todoistTasks) {
        const existing = tasks.find((x) => x.todoistId === t.id);
        if (existing) {
          updateTask(existing.id, {
            title: t.content,
            description: t.description || undefined,
            deadline: t.due || undefined,
          });
          updated += 1;
        } else {
          addTask({
            title: t.content,
            column: "todo",
            description: t.description || undefined,
            deadline: t.due || undefined,
            source: "todoist",
            todoistId: t.id,
          });
          added += 1;
        }
      }
      setSyncResult({ added, updated });
    } catch (e) {
      setError(e instanceof Error ? e.message : "同期に失敗しました");
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="border-b border-border bg-muted/30 px-4 py-3 flex items-center gap-2">
          <Settings2 className="h-5 w-5 text-muted-foreground" />
          <h1 className="text-lg font-semibold text-foreground">設定</h1>
        </div>

        <div className="p-4 space-y-6">
          <section>
            <h2 className="text-sm font-medium text-foreground mb-2">
              Todoist チームプロジェクトの取り込み
            </h2>
            <p className="text-xs text-muted-foreground mb-4">
              同期したいチームのプロジェクトを選び、「同期する」でタスクボードに取り込みます。既に同じ Todoist タスクがある場合は更新、ない場合は新規追加されます。
            </p>

            {error && (
              <div className="flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive mb-4">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
                <button
                  type="button"
                  onClick={() => setError(null)}
                  className="ml-auto text-destructive/80 hover:text-destructive"
                  aria-label="閉じる"
                >
                  ×
                </button>
              </div>
            )}

            {syncResult && (
              <div className="rounded-lg border border-border bg-muted/20 px-3 py-2 text-sm text-muted-foreground mb-4">
                新規: {syncResult.added} 件 / 更新: {syncResult.updated} 件
              </div>
            )}

            <div className="flex flex-wrap items-end gap-3">
              <div className="flex-1 min-w-[200px]">
                <label htmlFor="todoist-project" className="block text-xs font-medium text-muted-foreground mb-1">
                  プロジェクト
                </label>
                <select
                  id="todoist-project"
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  disabled={loadingProjects}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
                >
                  <option value="">
                    {loadingProjects ? "取得中…" : "プロジェクトを選択"}
                  </option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.is_inbox_project ? `${p.name} (Inbox)` : p.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => void fetchProjects()}
                  disabled={loadingProjects}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border bg-muted/30 text-sm hover:bg-muted/50 disabled:opacity-50 transition-colors"
                  title="プロジェクト一覧を再取得"
                >
                  <RefreshCw className={`h-4 w-4 ${loadingProjects ? "animate-spin" : ""}`} />
                  更新
                </button>
                <button
                  type="button"
                  onClick={() => void handleSync()}
                  disabled={syncing || !selectedProjectId}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {syncing ? "同期中…" : "同期する"}
                </button>
              </div>
            </div>

            {!loadingProjects && projects.length === 0 && (
              <p className="text-xs text-muted-foreground mt-2">
                .env.local に TODOIST_API_TOKEN を設定し、サーバーを再起動してください。
              </p>
            )}
          </section>

          <section>
            <h2 className="text-sm font-medium text-foreground mb-2">
              自動連携設定
            </h2>
            <p className="text-xs text-muted-foreground mb-4">
              チェックリストのプロジェクトやタスクを作成した際に、自動的にTodoistにタスクを作成するプロジェクトを選択できます。
            </p>
            <div className="flex flex-wrap items-end gap-3">
              <div className="flex-1 min-w-[200px]">
                <label htmlFor="default-todoist-project" className="block text-xs font-medium text-muted-foreground mb-1">
                  デフォルトプロジェクト
                </label>
                <select
                  id="default-todoist-project"
                  value={typeof window !== "undefined" ? localStorage.getItem("todoist_default_project_id") || "" : ""}
                  onChange={(e) => {
                    if (e.target.value) {
                      localStorage.setItem("todoist_default_project_id", e.target.value);
                    } else {
                      localStorage.removeItem("todoist_default_project_id");
                    }
                  }}
                  disabled={loadingProjects}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
                >
                  <option value="">自動連携を無効化</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.is_inbox_project ? `${p.name} (Inbox)` : p.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              選択したプロジェクトに、チェックリストのカテゴリ（プロジェクト）やアイテム（Epic）が自動的にタスクとして作成されます。
            </p>
          </section>

          <section>
            <h2 className="text-sm font-medium text-foreground mb-2">
              Todoist API トークン設定
            </h2>
            <p className="text-xs text-muted-foreground mb-4">
              個人のTodoistアカウントと連携するには、APIトークンを設定してください。
              <a
                href="https://app.todoist.com/app/settings/integrations"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline ml-1"
              >
                Todoistの設定ページ
              </a>
              からトークンを取得できます。
            </p>
            <div className="space-y-3">
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <input
                    type={showToken ? "text" : "password"}
                    value={userToken}
                    onChange={(e) => setUserToken(e.target.value)}
                    placeholder="Todoist API トークンを入力"
                    className="w-full px-3 py-2 pr-10 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                  <button
                    type="button"
                    onClick={() => setShowToken(!showToken)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label={showToken ? "トークンを隠す" : "トークンを表示"}
                  >
                    {showToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    setSavingToken(true);
                    setError(null);
                    try {
                      if (userToken.trim()) {
                        localStorage.setItem("todoist_user_token", userToken.trim());
                        // プロジェクト一覧を再取得（新しいトークンで）
                        await fetchProjects();
                      } else {
                        localStorage.removeItem("todoist_user_token");
                      }
                    } catch (e) {
                      setError(e instanceof Error ? e.message : "トークン保存に失敗しました");
                    } finally {
                      setSavingToken(false);
                    }
                  }}
                  disabled={savingToken}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm hover:bg-primary/90 disabled:opacity-50 transition-colors"
                >
                  <Key className="h-4 w-4" />
                  {savingToken ? "保存中..." : "保存"}
                </button>
              </div>
              {userToken && (
                <p className="text-xs text-muted-foreground">
                  トークンはブラウザのローカルストレージに保存されます。他のデバイスでは再度設定が必要です。
                </p>
              )}
            </div>
          </section>

          <section>
            <h2 className="text-sm font-medium text-foreground mb-2">
              Webhook設定
            </h2>
            <p className="text-xs text-muted-foreground mb-4">
              Todoistでタスクを完了すると、自動的に管理ツールの進捗が更新されます。
            </p>
            <div className="rounded-lg border border-border bg-muted/10 p-3">
              <p className="text-xs text-muted-foreground mb-2">
                <strong>Webhook URL:</strong>
              </p>
              <code className="block text-xs bg-background p-2 rounded border border-border break-all">
                {typeof window !== "undefined" ? `${window.location.origin}/api/todoist/webhook` : "/api/todoist/webhook"}
              </code>
              <p className="text-xs text-muted-foreground mt-2">
                Todoistの設定ページでこのURLをWebhookエンドポイントとして登録してください。
                環境変数 <code className="bg-background px-1 rounded">TODOIST_WEBHOOK_SECRET</code> も設定が必要です。
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

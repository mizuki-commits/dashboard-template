/**
 * Todoist REST API v2 用のサービスクラス。
 * 環境変数 TODOIST_API_TOKEN またはユーザーごとのトークンを使用する。
 */

const REST_API = "https://api.todoist.com/rest/v2";

/**
 * トークンを取得（環境変数またはユーザートークン）
 * @param userToken ユーザーごとのトークン（オプション）
 */
function getToken(userToken?: string): string | undefined {
  if (userToken) {
    return userToken.trim();
  }
  return process.env.TODOIST_API_TOKEN?.trim();
}

/**
 * ヘッダーを取得
 * @param userToken ユーザーごとのトークン（オプション）
 */
function getHeaders(userToken?: string): Record<string, string> {
  const token = getToken(userToken);
  if (!token) {
    throw new Error("TODOIST_API_TOKEN が設定されていません。");
  }
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    "User-Agent": "Dashboard-App/1.0",
  };
}

/** Todoist プロジェクト（REST v2 のレスポンス形式） */
export interface TodoistProject {
  id: string;
  name: string;
  order: number;
  color?: string;
  parent_id?: string | null;
  is_favorite?: boolean;
  is_inbox_project?: boolean;
  is_team_inbox?: boolean;
  view_style?: string;
  url?: string;
}

/** Todoist タスク（REST v2 の due 含む） */
export interface TodoistTask {
  id: string;
  content: string;
  description: string;
  is_completed: boolean;
  project_id: string;
  due?: {
    date?: string;
    string?: string;
    is_recurring?: boolean;
    lang?: string;
  } | null;
  priority?: number;
  parent_id?: string | null;
  order?: number;
  created_at?: string;
  url?: string;
}

/**
 * Todoist から全プロジェクトを取得する（GET /rest/v2/projects）。
 * @param userToken ユーザーごとのトークン（オプション）
 */
export async function getProjects(userToken?: string): Promise<TodoistProject[]> {
  const res = await fetch(`${REST_API}/projects`, {
    method: "GET",
    headers: getHeaders(userToken),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Todoist API エラー (${res.status}): ${text}`);
  }
  return res.json() as Promise<TodoistProject[]>;
}

/**
 * 指定プロジェクトのタスクのみを取得する（GET /rest/v2/tasks?project_id=...）。
 */
export async function getTasksByProject(projectId: string, userToken?: string): Promise<TodoistTask[]> {
  const url = new URL(`${REST_API}/tasks`);
  url.searchParams.set("project_id", projectId);
  const res = await fetch(url.toString(), {
    method: "GET",
    headers: getHeaders(userToken),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Todoist API エラー (${res.status}): ${text}`);
  }
  return res.json() as Promise<TodoistTask[]>;
}

/**
 * Todoist にタスクを作成する（POST /rest/v2/tasks）。
 * @param content タスクの内容
 * @param projectId プロジェクトID（任意）
 * @param description 説明（任意）
 * @param dueString 期限（任意、例: "tomorrow", "2024-12-31"）
 * @param priority 優先度（1-4、4が最高優先度）
 * @param assigneeId 担当者のID（任意、コラボレーターID）
 * @param userToken ユーザーごとのトークン（オプション）
 * @returns 作成されたタスクのID
 */
export async function createTask(params: {
  content: string;
  projectId?: string;
  description?: string;
  dueString?: string;
  priority?: number;
  assigneeId?: string;
  userToken?: string;
}): Promise<string> {
  const payload: Record<string, unknown> = {
    content: params.content,
  };
  if (params.projectId) payload.project_id = params.projectId;
  if (params.description) payload.description = params.description;
  if (params.dueString) payload.due_string = params.dueString;
  if (params.priority !== undefined) payload.priority = params.priority;
  if (params.assigneeId) payload.assignee_id = params.assigneeId;

  const res = await fetch(`${REST_API}/tasks`, {
    method: "POST",
    headers: {
      ...getHeaders(params.userToken),
      "X-Request-Id": crypto.randomUUID?.() ?? `req-${Date.now()}`,
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Todoist API エラー (${res.status}): ${text}`);
  }
  const data = (await res.json()) as { id: string };
  return data.id;
}

/**
 * Todoist のタスクを更新する（POST /rest/v2/tasks/:id）。
 */
export async function updateTask(taskId: string, params: {
  content?: string;
  description?: string;
  dueString?: string;
}): Promise<void> {
  const payload: Record<string, unknown> = {};
  if (params.content !== undefined) payload.content = params.content;
  if (params.description !== undefined) payload.description = params.description;
  if (params.dueString !== undefined) payload.due_string = params.dueString;

  const res = await fetch(`${REST_API}/tasks/${encodeURIComponent(taskId)}`, {
    method: "POST",
    headers: {
      ...getHeaders(),
      "X-Request-Id": crypto.randomUUID?.() ?? `req-${Date.now()}`,
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Todoist API エラー (${res.status}): ${text}`);
  }
}

/**
 * Todoist のタスクを完了にする（POST /rest/v2/tasks/:id/close）。
 */
export async function closeTask(taskId: string): Promise<void> {
  const res = await fetch(`${REST_API}/tasks/${encodeURIComponent(taskId)}/close`, {
    method: "POST",
    headers: {
      ...getHeaders(),
      "X-Request-Id": crypto.randomUUID?.() ?? `req-${Date.now()}`,
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Todoist API エラー (${res.status}): ${text}`);
  }
}

/**
 * Todoist のタスクを取得する（GET /rest/v2/tasks/:id）。
 */
export async function getTask(taskId: string, userToken?: string): Promise<TodoistTask> {
  const res = await fetch(`${REST_API}/tasks/${encodeURIComponent(taskId)}`, {
    method: "GET",
    headers: getHeaders(userToken),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Todoist API エラー (${res.status}): ${text}`);
  }
  return res.json() as Promise<TodoistTask>;
}

/** API トークンが設定されているか */
export function hasToken(): boolean {
  return !!getToken();
}

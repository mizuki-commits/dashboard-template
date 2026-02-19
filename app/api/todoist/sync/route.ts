import { NextRequest, NextResponse } from "next/server";
import { getTasksByProject, hasToken } from "@/lib/todoist";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * 指定プロジェクトのタスクを Todoist から取得して返す。
 * フロントで既存タスク（todoistId 一致）は更新、なければ新規として Kanban にマージする。
 * Body: { projectId: string }
 * Response: { tasks: Array<{ id, content, description, due }> }
 */
export async function POST(request: NextRequest) {
  if (!hasToken()) {
    return NextResponse.json(
      {
        error: "TODOIST_API_TOKEN が設定されていません。.env.local に追加し、サーバーを再起動してください。",
      },
      { status: 503 }
    );
  }

  let body: { projectId?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const projectId = typeof body.projectId === "string" ? body.projectId.trim() : "";
  if (!projectId) {
    return NextResponse.json(
      { error: "projectId は必須です。" },
      { status: 400 }
    );
  }

  try {
    const tasks = await getTasksByProject(projectId);
    const normalized = tasks
      .filter((t) => !t.is_completed)
      .map((t) => ({
        id: t.id,
        content: t.content,
        description: t.description || "",
        due: t.due?.date ?? t.due?.string ?? undefined,
      }));
    return NextResponse.json({ tasks: normalized });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const status = message.includes("401") ? 401 : 502;
    return NextResponse.json(
      { error: "Todoist からタスクを取得できませんでした。", detail: message },
      { status }
    );
  }
}

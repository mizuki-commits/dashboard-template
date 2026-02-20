import { NextRequest, NextResponse } from "next/server";
import { getTasksByProject, getTask } from "@/lib/todoist";

/**
 * POST /api/todoist/sync-status
 * Todoistのタスク完了状態を取得し、管理ツール側の進捗を更新するための情報を返す。
 */
export async function POST(request: NextRequest) {
  let body: { projectId?: string; taskIds?: string[]; userToken?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "リクエストボディが不正です。" }, { status: 400 });
  }

  const token = body.userToken?.trim() || process.env.TODOIST_API_TOKEN?.trim();
  if (!token) {
    return NextResponse.json(
      { error: "TODOIST_API_TOKEN が設定されていません。リクエストに userToken を含めるか、サーバーの環境変数を設定してください。" },
      { status: 401 }
    );
  }

  try {
    // projectId が指定されている場合は、そのプロジェクトの全タスクを取得
    if (body.projectId) {
      const tasks = await getTasksByProject(body.projectId, body.userToken?.trim());
      return NextResponse.json({
        tasks: tasks.map((t) => ({
          id: t.id,
          is_completed: t.is_completed,
        })),
      });
    }

    // taskIds が指定されている場合は、個別にタスクを取得
    if (body.taskIds && body.taskIds.length > 0) {
      const userToken = body.userToken?.trim();
      const results = await Promise.allSettled(
        body.taskIds.map((id) => getTask(id, userToken))
      );
      const tasks = results
        .filter((r) => r.status === "fulfilled")
        .map((r) => (r as PromiseFulfilledResult<typeof r.value>).value);
      return NextResponse.json({
        tasks: tasks.map((t) => ({
          id: t.id,
          is_completed: t.is_completed,
        })),
      });
    }

    return NextResponse.json(
      { error: "projectId または taskIds を指定してください。" },
      { status: 400 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "同期に失敗しました";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { getTasksByProject, hasToken, getTask } from "@/lib/todoist";

/**
 * POST /api/todoist/sync-status
 * Todoistのタスク完了状態を取得し、管理ツール側の進捗を更新するための情報を返す。
 */
export async function POST(request: NextRequest) {
  if (!hasToken()) {
    return NextResponse.json(
      { error: "TODOIST_API_TOKEN が設定されていません。" },
      { status: 401 }
    );
  }

  try {
    const body = (await request.json()) as {
      projectId?: string;
      taskIds?: string[];
    };

    // projectId が指定されている場合は、そのプロジェクトの全タスクを取得
    if (body.projectId) {
      const tasks = await getTasksByProject(body.projectId);
      return NextResponse.json({
        tasks: tasks.map((t) => ({
          id: t.id,
          is_completed: t.is_completed,
        })),
      });
    }

    // taskIds が指定されている場合は、個別にタスクを取得
    if (body.taskIds && body.taskIds.length > 0) {
      const results = await Promise.allSettled(
        body.taskIds.map((id) => getTask(id))
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

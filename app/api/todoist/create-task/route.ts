import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createTask, hasToken } from "@/lib/todoist";

/**
 * POST /api/todoist/create-task
 * チェックリストのカテゴリやアイテム作成時に、Todoistにタスクを作成する。
 */
export async function POST(request: NextRequest) {
  const body = (await request.json()) as {
    content: string;
    projectId?: string;
    description?: string;
    dueString?: string;
    priority?: number;
    assigneeId?: string;
    userToken?: string;
  };

  // 認証: ログイン済み、またはリクエストに userToken が含まれる（ログイン解除時用）
  const session = await getServerSession(authOptions);
  const hasAuth = !!session?.user || !!(body.userToken?.trim());
  if (!hasAuth) {
    return NextResponse.json(
      { error: "認証が必要です。ログインするか、設定でTodoistトークンを保存してください。" },
      { status: 401 }
    );
  }

  if (!body.userToken?.trim() && !hasToken()) {
    return NextResponse.json(
      { error: "TODOIST_API_TOKEN が設定されていません。設定でTodoistトークンを保存するか、サーバーに環境変数を設定してください。" },
      { status: 401 }
    );
  }

  try {
    if (!body.content) {
      return NextResponse.json(
        { error: "content は必須です。" },
        { status: 400 }
      );
    }

    const taskId = await createTask({
      content: body.content,
      projectId: body.projectId,
      description: body.description,
      dueString: body.dueString,
      priority: body.priority,
      assigneeId: body.assigneeId,
      userToken: body.userToken?.trim() || undefined,
    });

    return NextResponse.json({ taskId });
  } catch (error) {
    const message = error instanceof Error ? error.message : "タスク作成に失敗しました";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

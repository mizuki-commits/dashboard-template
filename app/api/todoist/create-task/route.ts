import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { createTask, hasToken } from "@/lib/todoist";

/**
 * POST /api/todoist/create-task
 * チェックリストのカテゴリやアイテム作成時に、Todoistにタスクを作成する。
 */
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json(
      { error: "認証が必要です" },
      { status: 401 }
    );
  }

  if (!hasToken()) {
    return NextResponse.json(
      { error: "TODOIST_API_TOKEN が設定されていません。" },
      { status: 401 }
    );
  }

  try {
    const body = (await request.json()) as {
      content: string;
      projectId?: string;
      description?: string;
      dueString?: string;
      priority?: number;
      assigneeId?: string;
      userToken?: string; // クライアント側から送信されるユーザートークン
    };

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
      userToken: body.userToken,
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

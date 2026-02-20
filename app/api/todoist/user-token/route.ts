import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/**
 * GET /api/todoist/user-token
 * 現在のユーザーのTodoist APIトークンを取得（マスク済み）
 */
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json(
      { error: "認証が必要です" },
      { status: 401 }
    );
  }

  // ユーザーIDに基づいてトークンを取得（現時点ではlocalStorageを使用）
  // 将来的にはデータベースに保存
  return NextResponse.json({
    hasToken: true,
    // セキュリティのため、トークンは返さない（マスクのみ）
    masked: "***",
  });
}

/**
 * POST /api/todoist/user-token
 * 現在のユーザーのTodoist APIトークンを保存
 */
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json(
      { error: "認証が必要です" },
      { status: 401 }
    );
  }

  try {
    const body = (await request.json()) as { token?: string };
    if (!body.token || !body.token.trim()) {
      return NextResponse.json(
        { error: "トークンが指定されていません" },
        { status: 400 }
      );
    }

    // 現時点では、クライアント側のlocalStorageに保存する方式
    // 将来的にはデータベースに保存する実装に変更
    // 例: await saveUserTodoistToken(session.user.id, body.token);

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "トークン保存に失敗しました";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

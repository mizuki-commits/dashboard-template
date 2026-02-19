import { NextRequest, NextResponse } from "next/server";
import { getProjects, hasToken } from "@/lib/todoist";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Todoist のプロジェクト一覧を返す（GET /rest/v2/projects）。
 * クエリパラメータで userToken を受け取ることができます。
 */
export async function GET(request: NextRequest) {
  // クエリパラメータからユーザートークンを取得
  const searchParams = request.nextUrl.searchParams;
  const userToken = searchParams.get("userToken") || undefined;

  if (!hasToken() && !userToken) {
    return NextResponse.json(
      {
        error: "TODOIST_API_TOKEN が設定されていません。.env.local に追加するか、ユーザートークンを設定してください。",
      },
      { status: 503 }
    );
  }

  try {
    const projects = await getProjects(userToken);
    return NextResponse.json(projects);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const status = message.includes("401") ? 401 : 502;
    return NextResponse.json(
      { error: "Todoist からプロジェクトを取得できませんでした。", detail: message },
      { status }
    );
  }
}

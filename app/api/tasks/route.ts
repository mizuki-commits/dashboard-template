import { NextRequest, NextResponse } from "next/server";

export interface TaskPayload {
  content: string;
  description?: string;
  priority?: number;
  indent?: number;
  author?: string;
  responsible?: string;
  date?: string;
  parent_id?: string | null;
  is_remind?: boolean;
}

/**
 * POST /api/tasks
 * タスク（およびリマインドサブタスク）を Vercel Postgres の tasks テーブルに保存する。
 * Body: { tasks: TaskPayload[] }
 */
export async function POST(request: NextRequest) {
  let body: { tasks?: TaskPayload[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "リクエストボディが不正です。" }, { status: 400 });
  }
  const tasks = body.tasks;
  if (!Array.isArray(tasks) || tasks.length === 0) {
    return NextResponse.json({ error: "tasks 配列が必要です。" }, { status: 400 });
  }

  try {
    const { sql } = await import("@vercel/postgres");
    const ids: string[] = [];
    for (let i = 0; i < tasks.length; i++) {
      const t = tasks[i];
      const content = (t.content ?? "").trim();
      if (!content) continue;
      const description = t.description ?? null;
      const priority = Math.min(4, Math.max(1, t.priority ?? 1));
      const indent = t.indent ?? 1;
      const author = t.author ?? null;
      const responsible = t.responsible ?? null;
      const date = t.date ?? null;
      const parent_id = t.parent_id ?? null;
      const is_remind = !!t.is_remind;
      const { rows } = await sql`
        INSERT INTO tasks (content, description, priority, indent, author, responsible, date, parent_id, is_remind)
        VALUES (${content}, ${description}, ${priority}, ${indent}, ${author}, ${responsible}, ${date}, ${parent_id}, ${is_remind})
        RETURNING id
      `;
      const id = rows[0]?.id;
      if (id) ids.push(id);
    }
    return NextResponse.json({ ok: true, ids });
  } catch (e) {
    console.error("POST /api/tasks error:", e);
    return NextResponse.json(
      { error: "タスクの保存に失敗しました。DBが未初期化の場合は GET /api/setup-db を実行してください。" },
      { status: 503 }
    );
  }
}

/**
 * GET /api/tasks
 * tasks テーブルからタスク一覧を取得する。
 */
export async function GET() {
  try {
    const { sql } = await import("@vercel/postgres");
    const { rows } = await sql`
      SELECT id, content, description, priority, indent, author, responsible, date, parent_id, is_remind, created_at
      FROM tasks
      ORDER BY created_at DESC
    `;
    return NextResponse.json({ tasks: rows });
  } catch (e) {
    console.error("GET /api/tasks error:", e);
    return NextResponse.json(
      { error: "タスクの取得に失敗しました。" },
      { status: 503 }
    );
  }
}

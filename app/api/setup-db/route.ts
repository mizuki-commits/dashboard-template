import { NextResponse } from "next/server";

/**
 * GET /api/setup-db
 * tasks テーブルが存在しない場合に作成する。Vercel Postgres の環境変数が必要。
 */
export async function GET() {
  try {
    const { sql } = await import("@vercel/postgres");
    await sql`
      CREATE TABLE IF NOT EXISTS tasks (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        content text NOT NULL,
        description text,
        priority int DEFAULT 1,
        indent int DEFAULT 1,
        author text,
        responsible text,
        date date,
        parent_id uuid REFERENCES tasks(id),
        is_remind boolean DEFAULT false,
        created_at timestamptz DEFAULT now()
      )
    `;
    return NextResponse.json({ ok: true, message: "tasks テーブルを用意しました。" });
  } catch (e) {
    console.error("setup-db error:", e);
    return NextResponse.json(
      { error: "DBの初期化に失敗しました。POSTGRES_URL 等の環境変数を確認してください。" },
      { status: 503 }
    );
  }
}

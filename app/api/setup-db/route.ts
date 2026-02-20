import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS tasks (
        id SERIAL PRIMARY KEY,
        todoist_task_id VARCHAR(255) UNIQUE NOT NULL,
        content TEXT NOT NULL,
        is_completed BOOLEAN DEFAULT FALSE,
        assignee_id VARCHAR(255),
        priority INTEGER DEFAULT 1,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;
    return NextResponse.json({ message: "テーブルの作成に大成功しました！🎉" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "エラーが発生しました", details: error }, { status: 500 });
  }
}

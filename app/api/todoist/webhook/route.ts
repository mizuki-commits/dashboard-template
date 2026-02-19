import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

/**
 * Todoist Webhook 受信エンドポイント
 * POST /api/todoist/webhook
 * 
 * Todoist Sync API v9 の Webhook イベントを受信し、管理ツール側の進捗を更新します。
 * 
 * セキュリティ: x-todoist-hmac-sha256 ヘッダーで署名検証を行います。
 */

interface TodoistWebhookEvent {
  event_name: string;
  event_data: {
    id?: string;
    content?: string;
    is_completed?: boolean;
    project_id?: string;
    due?: {
      date?: string;
      string?: string;
    } | null;
    priority?: number;
    assignee_id?: string;
    [key: string]: unknown;
  };
  initiator?: {
    email?: string;
    full_name?: string;
  };
}

// Webhook署名検証用のシークレット（環境変数から取得）
function getWebhookSecret(): string {
  const secret = process.env.TODOIST_WEBHOOK_SECRET?.trim();
  if (!secret) {
    throw new Error("TODOIST_WEBHOOK_SECRET が設定されていません");
  }
  return secret;
}

// HMAC-SHA256署名を検証
function verifyWebhookSignature(
  body: string,
  signature: string | null
): boolean {
  if (!signature) {
    return false;
  }
  const secret = getWebhookSecret();
  const hmac = crypto.createHmac("sha256", secret);
  hmac.update(body);
  const expectedSignature = hmac.digest("hex");
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

/**
 * Webhookイベントを処理
 */
async function handleWebhookEvent(event: TodoistWebhookEvent): Promise<void> {
  const { event_name, event_data } = event;

  switch (event_name) {
    case "item:completed":
      // タスク完了イベント
      if (event_data.id && event_data.is_completed) {
        await handleTaskCompleted(event_data.id);
      }
      break;

    case "item:updated":
      // タスク更新イベント（期限変更など）
      if (event_data.id) {
        await handleTaskUpdated(event_data.id, event_data);
      }
      break;

    case "item:deleted":
      // タスク削除イベント
      if (event_data.id) {
        await handleTaskDeleted(event_data.id);
      }
      break;

    default:
      console.log(`未処理のイベント: ${event_name}`);
  }
}

/**
 * タスク完了時の処理
 * チェックリストやタスクボードの進捗を更新
 */
async function handleTaskCompleted(taskId: string): Promise<void> {
  // TODO: データベースまたはインメモリストアから該当タスクを検索して完了状態を更新
  // 現時点では、フロントエンド側で同期する方式を想定
  console.log(`[Webhook] タスク完了: ${taskId}`);
  
  // 将来的には、ここでデータベースを更新する処理を実装
  // 例: await updateChecklistItemByTodoistId(taskId, { completed: true });
}

/**
 * タスク更新時の処理
 */
async function handleTaskUpdated(
  taskId: string,
  eventData: TodoistWebhookEvent["event_data"]
): Promise<void> {
  console.log(`[Webhook] タスク更新: ${taskId}`, eventData);
  
  // 期限変更などの処理
  if (eventData.due) {
    // TODO: データベースの期限を更新
  }
}

/**
 * タスク削除時の処理
 */
async function handleTaskDeleted(taskId: string): Promise<void> {
  console.log(`[Webhook] タスク削除: ${taskId}`);
  
  // TODO: データベースから該当タスクを削除または無効化
}

export async function POST(request: NextRequest) {
  try {
    // リクエストボディを取得（署名検証のため文字列として保持）
    const bodyText = await request.text();
    const signature = request.headers.get("x-todoist-hmac-sha256");

    // 署名検証
    if (!verifyWebhookSignature(bodyText, signature)) {
      console.error("[Webhook] 署名検証失敗");
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 401 }
      );
    }

    // JSONパース
    const event = JSON.parse(bodyText) as TodoistWebhookEvent;

    // イベント処理
    await handleWebhookEvent(event);

    // 200 OK を返す（Todoist側に受信を通知）
    return NextResponse.json({ status: "ok" });
  } catch (error) {
    console.error("[Webhook] エラー:", error);
    const message = error instanceof Error ? error.message : "Webhook処理に失敗しました";
    
    // エラーでも200を返す（Todoist側に再送を防ぐため）
    // ただし、ログには記録
    return NextResponse.json(
      { error: message },
      { status: 200 }
    );
  }
}

// GET リクエストでWebhook登録確認用のエンドポイント
export async function GET() {
  return NextResponse.json({
    message: "Todoist Webhook endpoint is active",
    endpoint: "/api/todoist/webhook",
    events: ["item:completed", "item:updated", "item:deleted"],
  });
}

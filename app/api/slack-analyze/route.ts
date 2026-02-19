import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import OpenAI from "openai";
import { PDFParse } from "pdf-parse";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** クローズドモード: true のとき外部API（OpenAI）を一切呼ばず、テキスト/PDF抽出のみ行う。画像のAI解析は行わない。 */
const CLOSED_AI_MODE = process.env.CLOSED_AI_MODE === "true";
/** 自社サーバー等の OpenAI 互換 API（例: Ollama, LocalAI）のベースURL。設定時はここにのみ送信し、OpenAI には送らない。 */
const LOCAL_AI_BASE_URL = process.env.LOCAL_AI_BASE_URL?.trim() || undefined;
/** ローカルAIで使うモデル名（Ollama の場合は ollama list で表示される名前。例: llama3.2, llava） */
const LOCAL_AI_MODEL = process.env.LOCAL_AI_MODEL?.trim() || "llama3.2";
/** ホスト型 Ollama / 互換 API 用の API キー（未設定なら OPENAI_API_KEY または "dummy" を使用） */
const LOCAL_AI_API_KEY = process.env.LOCAL_AI_API_KEY?.trim() || undefined;

const SYSTEM_PROMPT = `あなたはプロジェクトの優秀なプロジェクトマネージャーです。
貼り付けられたテキスト（チャットログ・企画書・メモなど）や画像から、ユーザーが次に行うべき具体的なアクションアイテムを抽出し、ToDoリスト形式で提案してください。

また、以下の点も分析してください：
- 具体的なタスク、期限、重要な決定事項を抽出する
- 目標に対してポジティブな要素かネガティブな要素（遅延リスクなど）かを判定する
- 個人の行動指針となるアドバイスを提示する

必ず以下のJSON形式で回答してください。それ以外のテキストは含めないでください。

{
  "tasks": [
    {
      "title": "タスクの内容",
      "deadline": "期限（分かれば）",
      "sentiment": "positive" または "negative" または "neutral"
    }
  ],
  "advice": [
    "アドバイス1",
    "アドバイス2"
  ]
}`;

const IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"];
const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

type TaskItem = { title: string; deadline?: string; sentiment?: string };

function getModel(): string {
  return LOCAL_AI_BASE_URL ? LOCAL_AI_MODEL : "gpt-4o-mini";
}

async function analyzeText(openai: OpenAI, text: string): Promise<{ tasks: TaskItem[]; advice: string[] }> {
  const completion = await openai.chat.completions.create({
    model: getModel(),
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: `以下のテキストを分析してください：\n\n${text}` },
    ],
    response_format: { type: "json_object" },
    temperature: 0.3,
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) return { tasks: [], advice: [] };

  const parsed = JSON.parse(content) as { tasks?: TaskItem[]; advice?: string[] };
  return {
    tasks: parsed.tasks ?? [],
    advice: parsed.advice ?? [],
  };
}

async function analyzeImage(
  openai: OpenAI,
  base64: string,
  mimeType: string
): Promise<{ tasks: TaskItem[]; advice: string[] }> {
  const url = `data:${mimeType};base64,${base64}`;
  const completion = await openai.chat.completions.create({
    model: getModel(),
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: [
          { type: "text", text: "この画像（スクリーンショット・資料・企画書の写真など）に写っている内容を分析し、タスクとアドバイスを抽出してください。" },
          { type: "image_url", image_url: { url } },
        ],
      },
    ],
    response_format: { type: "json_object" },
    temperature: 0.3,
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) return { tasks: [], advice: [] };

  const parsed = JSON.parse(content) as { tasks?: TaskItem[]; advice?: string[] };
  return {
    tasks: parsed.tasks ?? [],
    advice: parsed.advice ?? [],
  };
}

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(request: NextRequest) {
  try {
    let token: unknown = null;
    try {
      token = await getToken({
        req: request,
        secret: process.env.NEXTAUTH_SECRET,
      });
    } catch (e) {
      console.error("getToken error:", e);
      return jsonError("認証の確認に失敗しました。", 500);
    }
    if (!token) {
      return jsonError("ログインが必要です。", 401);
    }

    const apiKey = process.env.OPENAI_API_KEY;
    const useLocalAi = !!LOCAL_AI_BASE_URL && !CLOSED_AI_MODE;
    const localAiKey = useLocalAi ? (LOCAL_AI_API_KEY ?? apiKey ?? "dummy") : undefined;
    if (!CLOSED_AI_MODE && !useLocalAi && !apiKey) {
      return NextResponse.json(
        {
          error:
            "OPENAI_API_KEYが設定されていません。.env.localにOPENAI_API_KEYを追加するか、CLOSED_AI_MODE=true でクローズド運用にしてください。",
        },
        { status: 500 }
      );
    }

    const contentType = request.headers.get("content-type") ?? "";
    let textInput = "";
    const imagePayloads: { base64: string; mimeType: string }[] = [];

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const textField = formData.get("text");
      if (typeof textField === "string") textInput = textField.trim();

      const files = formData.getAll("files") as File[];
      for (const file of files) {
        if (!file?.size) continue;
        if (file.size > MAX_FILE_BYTES) {
          return NextResponse.json(
            { error: `ファイルサイズは${MAX_FILE_SIZE_MB}MB以下にしてください: ${file.name}` },
            { status: 400 }
          );
        }
        const type = file.type;

        if (type === "application/pdf") {
          const buffer = Buffer.from(await file.arrayBuffer());
          try {
            const parser = new PDFParse({ data: new Uint8Array(buffer) });
            const result = await parser.getText();
            const extracted = (result?.text ?? "").trim();
            await parser.destroy();
            if (extracted) textInput += (textInput ? "\n\n" : "") + `[PDF: ${file.name}]\n${extracted}`;
          } catch (e) {
            console.warn("PDF parse error:", e);
            return NextResponse.json(
              { error: `PDFの読み取りに失敗しました: ${file.name}` },
              { status: 400 }
            );
          }
        } else if (IMAGE_TYPES.includes(type)) {
          const buffer = Buffer.from(await file.arrayBuffer());
          const base64 = buffer.toString("base64");
          imagePayloads.push({ base64, mimeType: type });
        } else {
          return NextResponse.json(
            { error: `未対応のファイル形式です: ${file.name}（PDFまたは画像をアップロードしてください）` },
            { status: 400 }
          );
        }
      }

      if (!textInput && imagePayloads.length === 0) {
        return NextResponse.json(
          { error: "テキストを入力するか、PDF・画像ファイルをアップロードしてください。" },
          { status: 400 }
        );
      }
    } else {
      let body: { text?: unknown };
      try {
        body = await request.json();
      } catch {
        return jsonError("リクエストのJSONが不正です。", 400);
      }
      const text = body?.text;
      if (!text || typeof text !== "string") {
        return jsonError("解析するテキストを入力してください。", 400);
      }
      textInput = text.trim();
    }

    if (CLOSED_AI_MODE) {
      return NextResponse.json({
        tasks: [],
        advice: [],
        closedMode: true,
        extractedText: textInput || undefined,
        message:
          "クローズドモードのため外部AIは使用していません。テキスト・PDFの抽出結果のみ返しています。画像のAI解析は行っていません。",
      });
    }

    if (useLocalAi && LOCAL_AI_BASE_URL) {
      const isLocalOllama = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?\/?/i.test(LOCAL_AI_BASE_URL);
      if (isLocalOllama) {
        try {
          const base = LOCAL_AI_BASE_URL.replace(/\/v1\/?$/, "");
          const res = await fetch(`${base}/api/tags`, { cache: "no-store" });
          if (!res.ok) throw new Error("Ollama not ok");
        } catch {
          return NextResponse.json(
            {
              error:
                "ローカルAI（Ollama）に接続できません。ターミナルで「ollama serve」を起動してから再度お試しください。",
            },
            { status: 502 }
          );
        }
      }
    }

    const openai = new OpenAI({
      apiKey: useLocalAi ? localAiKey : apiKey!,
      ...(useLocalAi && LOCAL_AI_BASE_URL ? { baseURL: LOCAL_AI_BASE_URL } : {}),
    });
    const allTasks: TaskItem[] = [];
    const allAdvice: string[] = [];

    try {
      if (textInput) {
        const { tasks, advice } = await analyzeText(openai, textInput);
        allTasks.push(...tasks);
        allAdvice.push(...advice);
      }

      for (const { base64, mimeType } of imagePayloads) {
        const { tasks, advice } = await analyzeImage(openai, base64, mimeType);
        allTasks.push(...tasks);
        allAdvice.push(...advice);
      }
    } catch (localError) {
      const msg = useLocalAi
        ? "ローカルAI（Ollama）に接続できません。ターミナルで「ollama serve」を起動してから再度お試しください。"
        : localError instanceof Error
          ? localError.message
          : "AIの呼び出しに失敗しました。";
      return NextResponse.json({ error: msg }, { status: 502 });
    }

    const seenTitles = new Set<string>();
    const dedupedTasks = allTasks.filter((t) => {
      const key = t.title.trim();
      if (seenTitles.has(key)) return false;
      seenTitles.add(key);
      return true;
    });
    const dedupedAdvice = Array.from(new Set(allAdvice));

    return NextResponse.json({
      tasks: dedupedTasks,
      advice: dedupedAdvice,
    });
  } catch (error) {
    console.error("解析エラー:", error);
    if (error instanceof SyntaxError) {
      return jsonError("AIの応答の解析に失敗しました。", 500);
    }
    if (error && typeof error === "object" && "status" in error) {
      const apiError = error as { message?: string };
      return jsonError(apiError.message || "OpenAI APIエラーが発生しました。", 500);
    }
    const msg = error instanceof Error ? error.message : "予期しないエラーが発生しました。";
    return jsonError(msg, 500);
  }
}

export async function GET() {
  return NextResponse.json(
    { error: "このAPIはPOSTのみ対応しています。" },
    { status: 405 }
  );
}

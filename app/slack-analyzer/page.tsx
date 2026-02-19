"use client";

import { useState, useRef } from "react";
import {
  MessageSquare,
  Loader2,
  CheckSquare,
  Check,
  Lightbulb,
  Send,
  Plus,
  ThumbsUp,
  ThumbsDown,
  Minus,
  FileText,
  Image,
  Upload,
  X,
} from "lucide-react";
import { useKanban } from "@/contexts/KanbanContext";
import Link from "next/link";

interface ExtractedTask {
  title: string;
  deadline?: string;
  sentiment?: "positive" | "negative" | "neutral";
}

interface AnalysisResult {
  tasks: ExtractedTask[];
  advice: string[];
  closedMode?: boolean;
  extractedText?: string;
  message?: string;
}

const ACCEPT_FILES = ".pdf,image/png,image/jpeg,image/webp,image/gif";
const MAX_FILE_SIZE_MB = 10;

export default function SlackAnalyzerPage() {
  const [inputText, setInputText] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedTaskIds, setSelectedTaskIds] = useState<Set<number>>(new Set());
  const [addedMessage, setAddedMessage] = useState(false);
  const { addTasks } = useKanban();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files ?? []);
    const valid: File[] = [];
    for (const f of selected) {
      if (f.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        setError(`ファイルサイズは${MAX_FILE_SIZE_MB}MB以下にしてください: ${f.name}`);
        continue;
      }
      valid.push(f);
    }
    setFiles((prev) => [...prev, ...valid]);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAnalyze = async () => {
    const hasText = inputText.trim().length > 0;
    const hasFiles = files.length > 0;
    if (!hasText && !hasFiles) {
      setError("テキストを入力するか、ファイルをアップロードしてください。");
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setResult(null);
    setSelectedTaskIds(new Set());
    setAddedMessage(false);

    try {
      const parseResponse = async (res: Response) => {
        const text = await res.text();
        const trimmed = text.trim();
        if (!trimmed) {
          throw new Error(
            "サーバーが空の応答を返しました。Redeploy が完了しているか、OPENAI_API_KEY が Vercel に設定されているか確認してください。"
          );
        }
        if (trimmed.startsWith("<")) {
          throw new Error(
            "サーバーがHTMLを返しました。しばらく待って再試行するか、Vercel の環境変数を確認してください。"
          );
        }
        try {
          return JSON.parse(text) as { tasks?: ExtractedTask[]; advice?: string[]; error?: string; closedMode?: boolean; extractedText?: string; message?: string };
        } catch {
          throw new Error("サーバー応答の解析に失敗しました。応答が途中で切れている可能性があります。");
        }
      };

      if (hasFiles) {
        const formData = new FormData();
        if (hasText) formData.append("text", inputText.trim());
        files.forEach((f) => formData.append("files", f));

        const res = await fetch("/api/slack-analyze", {
          method: "POST",
          body: formData,
        });
        const data = await parseResponse(res);
        if (!res.ok) throw new Error(data.error || "解析に失敗しました。");
        setResult({
          tasks: data.tasks ?? [],
          advice: data.advice ?? [],
          closedMode: data.closedMode,
          extractedText: data.extractedText,
          message: data.message,
        });
      } else {
        const res = await fetch("/api/slack-analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: inputText.trim() }),
        });
        const data = await parseResponse(res);
        if (!res.ok) throw new Error(data.error || "解析に失敗しました。");
        setResult({
          tasks: data.tasks ?? [],
          advice: data.advice ?? [],
          closedMode: data.closedMode,
          extractedText: data.extractedText,
          message: data.message,
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "解析に失敗しました。");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const toggleTaskSelection = (index: number) => {
    setSelectedTaskIds((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const handleAddToBoard = () => {
    if (!result || result.tasks.length === 0) return;
    const tasksToAdd = result.tasks
      .filter((_, i) => selectedTaskIds.has(i))
      .map((t) => ({
        title: t.title,
        column: "todo" as const,
        deadline: t.deadline,
        source: "slack" as const,
      }));
    if (tasksToAdd.length === 0) {
      setError("ボードに追加するタスクを選択してください。");
      return;
    }
    addTasks(tasksToAdd);
    setAddedMessage(true);
    setSelectedTaskIds(new Set());
    setTimeout(() => setAddedMessage(false), 3000);
  };

  const selectAllTasks = () => {
    if (!result?.tasks.length) return;
    setSelectedTaskIds(new Set(result.tasks.map((_, i) => i)));
  };

  const SentimentIcon = ({ sentiment }: { sentiment?: string }) => {
    if (sentiment === "positive") return <ThumbsUp className="h-3.5 w-3.5 text-green-600" />;
    if (sentiment === "negative") return <ThumbsDown className="h-3.5 w-3.5 text-amber-600" />;
    return <Minus className="h-3.5 w-3.5 text-muted-foreground" />;
  };

  const isPdf = (f: File) => f.type === "application/pdf";
  const isImage = (f: File) => f.type.startsWith("image/");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50/30 to-amber-50/20">
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <MessageSquare className="h-7 w-7 text-primary" />
            連絡・テキスト・ファイル解析
          </h1>
          <p className="text-muted-foreground mt-1">
            連絡ツール（Slack・Teams・Chatwork等）のログ、企画書などのテキスト、スクショ・PDFをインポートしてタスクとアドバイスを抽出します
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
              <div className="border-b border-border bg-muted/30 px-4 py-3">
                <h2 className="font-semibold text-foreground">
                  テキストを貼り付け
                </h2>
                <p className="text-xs text-muted-foreground mt-1">
                  Slack・Teams・企画書・メモなど、任意のテキストを貼り付けてOK
                </p>
              </div>
              <div className="p-4">
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={`例：チャットログ、企画書の抜粋、メモなど
[2025-01-15 10:30] 田中: チラシのデザイン、来週までに仕上げます
[2025-01-15 10:35] 佐藤: 見学会の日程、2月第2週でいかがですか？`}
                  className="w-full h-48 rounded-lg border border-input bg-background px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 resize-none"
                  disabled={isAnalyzing}
                />

                <div className="mt-4">
                  <h3 className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                    <Upload className="h-4 w-4" />
                    ファイルを追加（PDF・スクショ・画像）
                  </h3>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept={ACCEPT_FILES}
                    multiple
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isAnalyzing}
                    className="w-full flex items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border bg-muted/20 py-3 text-sm text-muted-foreground hover:border-primary/50 hover:text-primary hover:bg-primary/5 transition-colors disabled:opacity-50"
                  >
                    <FileText className="h-4 w-4" />
                    PDF・画像を選択（複数可・{MAX_FILE_SIZE_MB}MB以下）
                  </button>
                  {files.length > 0 && (
                    <ul className="mt-2 space-y-1">
                      {files.map((f, i) => (
                        <li
                          key={`${f.name}-${i}`}
                          className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm"
                        >
                          {isPdf(f) ? (
                            <FileText className="h-4 w-4 text-red-600 shrink-0" />
                          ) : (
                            <Image className="h-4 w-4 text-primary shrink-0" />
                          )}
                          <span className="flex-1 min-w-0 truncate">{f.name}</span>
                          <button
                            type="button"
                            onClick={() => removeFile(i)}
                            className="p-1 text-muted-foreground hover:text-destructive"
                            aria-label="削除"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing}
                  className="mt-4 w-full flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      解析中...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      解析する
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {error && (
              <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            )}

            {addedMessage && (
              <div className="rounded-lg border border-primary/50 bg-primary/10 px-4 py-3 text-sm text-primary flex items-center gap-2">
                <CheckSquare className="h-4 w-4" />
                タスクをボードに追加しました！
                <Link href="/" className="ml-auto underline hover:no-underline font-medium">
                  ダッシュボードへ
                </Link>
              </div>
            )}

            {result && (
              <>
                {result.closedMode && result.message && (
                  <div className="rounded-lg border border-amber-500/50 bg-amber-50 dark:bg-amber-950/20 px-4 py-3 text-sm text-amber-800 dark:text-amber-200">
                    {result.message}
                  </div>
                )}
                {result.closedMode && result.extractedText && (
                  <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
                    <div className="border-b border-border bg-muted/30 px-4 py-3">
                      <h2 className="font-semibold text-foreground flex items-center gap-2">
                        <FileText className="h-4 w-4 text-primary" />
                        抽出テキスト（クローズドモード）
                      </h2>
                    </div>
                    <pre className="p-4 text-sm text-foreground whitespace-pre-wrap break-words max-h-64 overflow-y-auto font-sans">
                      {result.extractedText}
                    </pre>
                  </div>
                )}
                <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
                  <div className="flex items-center justify-between border-b border-border bg-muted/30 px-4 py-3">
                    <h2 className="font-semibold text-foreground flex items-center gap-2">
                      <CheckSquare className="h-4 w-4 text-primary" />
                      抽出されたタスク候補
                    </h2>
                    <div className="flex gap-2">
                      <button
                        onClick={selectAllTasks}
                        className="text-xs px-2 py-1 rounded bg-muted hover:bg-muted/80 text-muted-foreground"
                      >
                        すべて選択
                      </button>
                      <button
                        onClick={handleAddToBoard}
                        disabled={selectedTaskIds.size === 0}
                        className="text-xs px-3 py-1 rounded bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                      >
                        <Plus className="h-3 w-3" />
                        ボードに追加 ({selectedTaskIds.size})
                      </button>
                    </div>
                  </div>
                  <ul className="divide-y divide-border max-h-64 overflow-y-auto">
                    {result.tasks.length === 0 ? (
                      <li className="px-4 py-6 text-center text-sm text-muted-foreground">
                        タスクは見つかりませんでした
                      </li>
                    ) : (
                      result.tasks.map((task, i) => (
                        <li key={i} className="group">
                          <label className="flex cursor-pointer items-start gap-3 px-4 py-3 hover:bg-muted/30 transition-colors">
                            <div
                              className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-colors ${
                                selectedTaskIds.has(i)
                                  ? "border-primary bg-primary text-primary-foreground"
                                  : "border-input group-hover:border-primary/50"
                              }`}
                            >
                              {selectedTaskIds.has(i) ? (
                                <Check className="h-3 w-3" strokeWidth={3} />
                              ) : null}
                            </div>
                            <input
                              type="checkbox"
                              checked={selectedTaskIds.has(i)}
                              onChange={() => toggleTaskSelection(i)}
                              className="sr-only"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-foreground">{task.title}</p>
                              <div className="flex items-center gap-2 mt-1">
                                {task.deadline && (
                                  <span className="text-xs text-muted-foreground">
                                    期限: {task.deadline}
                                  </span>
                                )}
                                <SentimentIcon sentiment={task.sentiment} />
                              </div>
                            </div>
                          </label>
                        </li>
                      ))
                    )}
                  </ul>
                </div>

                <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
                  <div className="border-b border-border bg-muted/30 px-4 py-3">
                    <h2 className="font-semibold text-foreground flex items-center gap-2">
                      <Lightbulb className="h-4 w-4 text-primary" />
                      アドバイス
                    </h2>
                  </div>
                  <ul className="divide-y divide-border p-4">
                    {result.advice.length === 0 ? (
                      <li className="py-2 text-sm text-muted-foreground">
                        アドバイスはありません
                      </li>
                    ) : (
                      result.advice.map((item, i) => (
                        <li key={i} className="flex gap-2 py-2 text-sm text-foreground">
                          <span className="text-primary">•</span>
                          {item}
                        </li>
                      ))
                    )}
                  </ul>
                </div>
              </>
            )}

            {!result && !isAnalyzing && !error && (
              <div className="rounded-xl border border-dashed border-border bg-muted/20 p-12 text-center">
                <MessageSquare className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                <p className="text-sm text-muted-foreground">
                  左側にテキストを貼り付けるか<br />
                  PDF・スクショ・画像をアップロードして<br />
                  「解析する」を押してください
                </p>
              </div>
            )}
          </div>
        </div>

        <footer className="mt-12 text-center text-sm text-muted-foreground">
          <p>
            ダッシュボードの
            <Link href="/" className="text-primary hover:underline">
              タスクボード
            </Link>
            で、追加したタスクを管理できます
          </p>
        </footer>
      </main>
    </div>
  );
}

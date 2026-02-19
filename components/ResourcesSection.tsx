"use client";

import { useState } from "react";
import { FolderOpen, FileText, Link2, Plus, Trash2, ExternalLink } from "lucide-react";

export interface ResourceItem {
  id: string;
  title: string;
  url: string;
  type: "document" | "link" | "file";
  description?: string;
}

const RESOURCE_TYPE_LABELS: Record<ResourceItem["type"], string> = {
  document: "ドキュメント",
  link: "リンク",
  file: "ファイル",
};

function generateId() {
  return `res-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

interface ResourcesSectionProps {
  resources: ResourceItem[];
  onResourcesChange: (resources: ResourceItem[]) => void;
}

export function ResourcesSection({ resources, onResourcesChange }: ResourcesSectionProps) {
  const [showForm, setShowForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [newType, setNewType] = useState<ResourceItem["type"]>("link");
  const [newDescription, setNewDescription] = useState("");

  const addResource = () => {
    if (!newTitle.trim() || !newUrl.trim()) return;
    onResourcesChange([
      ...resources,
      {
        id: generateId(),
        title: newTitle.trim(),
        url: newUrl.trim(),
        type: newType,
        description: newDescription.trim() || undefined,
      },
    ]);
    setNewTitle("");
    setNewUrl("");
    setNewType("link");
    setNewDescription("");
    setShowForm(false);
  };

  const removeResource = (id: string) => {
    onResourcesChange(resources.filter((r) => r.id !== id));
  };

  const updateResource = (id: string, updates: Partial<ResourceItem>) => {
    onResourcesChange(
      resources.map((r) => (r.id === id ? { ...r, ...updates } : r))
    );
  };

  const normalizeUrl = (url: string) => {
    const u = url.trim();
    if (!u) return "";
    if (!/^https?:\/\//i.test(u)) return `https://${u}`;
    return u;
  };

  return (
    <section className="mb-8">
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="border-b border-border bg-muted/30 px-4 py-3 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">
              リソース・ドキュメント
            </h2>
          </div>
          {!showForm && (
            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-sm hover:bg-primary/90"
            >
              <Plus className="h-4 w-4" />
              追加
            </button>
          )}
        </div>
        <div className="p-4 space-y-3">
          <p className="text-sm text-muted-foreground">
            チームで共有するドキュメントやリンクを集約します。Notion・Google Drive・共有フォルダなどのURLを登録できます。
          </p>

          {showForm && (
            <div className="rounded-lg border border-border bg-muted/10 p-3 space-y-2">
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="タイトル（例: 企画書 v1）"
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm"
              />
              <input
                type="url"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                placeholder="URL（https://...）"
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm"
              />
              <select
                value={newType}
                onChange={(e) => setNewType(e.target.value as ResourceItem["type"])}
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm"
              >
                {(Object.keys(RESOURCE_TYPE_LABELS) as ResourceItem["type"][]).map((t) => (
                  <option key={t} value={t}>
                    {RESOURCE_TYPE_LABELS[t]}
                  </option>
                ))}
              </select>
              <input
                type="text"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="説明（任意）"
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={addResource}
                  disabled={!newTitle.trim() || !newUrl.trim()}
                  className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-sm hover:bg-primary/90 disabled:opacity-50"
                >
                  登録
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setNewTitle("");
                    setNewUrl("");
                    setNewDescription("");
                  }}
                  className="px-3 py-1.5 rounded-lg border border-border text-sm hover:bg-muted"
                >
                  キャンセル
                </button>
              </div>
            </div>
          )}

          {resources.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              登録されたリソースはありません。「追加」からドキュメントやリンクを登録してください。
            </p>
          ) : (
            <ul className="space-y-2">
              {resources.map((r) => (
                <li
                  key={r.id}
                  className="flex items-center gap-3 rounded-lg border border-border bg-background p-3 group"
                >
                  {r.type === "document" && <FileText className="h-4 w-4 text-muted-foreground shrink-0" />}
                  {r.type === "link" && <Link2 className="h-4 w-4 text-muted-foreground shrink-0" />}
                  {r.type === "file" && <FileText className="h-4 w-4 text-muted-foreground shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <a
                      href={normalizeUrl(r.url)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-primary hover:underline truncate block"
                    >
                      {r.title}
                    </a>
                    {r.description && (
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {r.description}
                      </p>
                    )}
                    <span className="text-[10px] text-muted-foreground">
                      {RESOURCE_TYPE_LABELS[r.type]}
                    </span>
                  </div>
                  <a
                    href={normalizeUrl(r.url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded hover:bg-muted text-muted-foreground"
                    title="開く"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                  <button
                    type="button"
                    onClick={() => removeResource(r.id)}
                    className="p-1.5 rounded hover:bg-destructive/20 text-muted-foreground hover:text-destructive"
                    title="削除"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}

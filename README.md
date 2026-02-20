# ダッシュボード テンプレート

保育園プロジェクト用ダッシュボードをベースにしたテンプレートです。
別目的のプロジェクトにカスタマイズしてご利用ください。

## 含まれる機能

- **KPIダッシュボード**: 目標・達成状況の表示
- **タスクボード（Kanban）**: To Do / 進行中 / 完了
- **施策チェックリスト（WBS）**: 構造分解・着手時期・締切
- **スケジュールカレンダー**: 着手・締切の一覧表示
- **Slack解析**: テキスト貼り付けによるAI解析

## セットアップ

```bash
npm install
npm run dev
```

## カスタマイズ手順

1. **タイトル・文言の変更**: `components/Navigation.tsx`、`app/page.tsx`
2. **施策データの変更**: `app/page.tsx` の `checklist` 初期値
3. **KPIの変更**: `app/page.tsx` の目標値・表示項目
4. **Slack解析のプロンプト**: `app/api/slack-analyze/route.ts` の `SYSTEM_PROMPT`

## Todoist 連携（実用化の前提）

本番・ローカルともに **ログインは不要** です。Todoist 連携を使う場合:

1. **設定**（`/settings`）を開く。
2. **Todoist API トークン設定** にトークンを入力し **保存**（[Todoist の設定](https://app.todoist.com/app/settings/integrations)で取得）。
3. **Todoist チームプロジェクトの取り込み** でプロジェクトを選び、必要なら **同期する** でタスクボードに取り込む。
4. **自動連携設定** で **デフォルトプロジェクト** を選ぶと、チェックリストでプロジェクト・タスクを作成したときに Todoist に自動作成される。
5. **進捗を同期**（ダッシュボード上部）で、Todoist の完了状態を管理ツールに反映できる。

サーバーに `TODOIST_API_TOKEN` を設定しても同じ動作になります。Webhook を使う場合は `TODOIST_WEBHOOK_SECRET` の設定が必要です。

## OpenAI API（Slack解析を使う場合）

`.env.local` を作成し、`OPENAI_API_KEY` を設定してください。

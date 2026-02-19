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

## OpenAI API（Slack解析を使う場合）

`.env.local` を作成し、`OPENAI_API_KEY` を設定してください。

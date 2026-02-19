# Vercel デプロイ手順（詳細版）

## 前提条件

- [Vercel](https://vercel.com) アカウント（無料で作成可能）
- GitHub アカウント（推奨）または Vercel CLI

---

## 方法1: GitHub 連携でデプロイ（推奨）

### ステップ1: GitHub リポジトリの準備

```bash
cd dashboard-template
git init
git add .
git commit -m "Initial commit: Dashboard with Todoist integration"
git branch -M main
git remote add origin https://github.com/あなたのユーザー名/リポジトリ名.git
git push -u origin main
```

### ステップ2: Vercel でプロジェクトをインポート

1. https://vercel.com/new にアクセス
2. **Import Git Repository** をクリック
3. GitHub アカウントを連携（初回のみ）
4. 作成したリポジトリを選択
5. **Import** をクリック

### ステップ3: 環境変数の設定

**Settings** → **Environment Variables** で以下を追加：

#### 必須の環境変数

| 変数名 | 値 | 説明 |
|--------|-----|------|
| `NEXTAUTH_SECRET` | ランダムな文字列（32文字以上） | 認証用シークレット<br>生成コマンド: `openssl rand -base64 32` |
| `NEXTAUTH_URL` | `https://your-project.vercel.app` | **デプロイ後に自動生成されるURL**<br>初回デプロイ後、この値を設定して再デプロイ |
| `AUTH_USERNAME` | ログイン用ユーザー名 | 例: `admin@example.com` |
| `AUTH_PASSWORD` | ログイン用パスワード | 推測されにくいパスワードを設定 |

#### Todoist連携用（オプション）

| 変数名 | 値 | 説明 |
|--------|-----|------|
| `TODOIST_API_TOKEN` | `4d814db2bc0244bccbec0987e3bc2f7e0bf13d50` | Todoist API トークン<br>https://app.todoist.com/app/settings/integrations で取得 |
| `TODOIST_WEBHOOK_SECRET` | ランダムな文字列（32文字以上） | Webhook署名検証用<br>生成コマンド: `openssl rand -base64 32` |

#### OpenAI連携用（オプション）

| 変数名 | 値 | 説明 |
|--------|-----|------|
| `OPENAI_API_KEY` | `sk-...` | OpenAI API キー<br>連絡・ファイル解析機能を使う場合のみ |

### ステップ4: デプロイ実行

1. **Deploy** ボタンをクリック
2. デプロイが完了するまで待機（約2-3分）
3. デプロイ完了後、**Settings** → **Domains** で本番URLを確認
4. そのURLを `NEXTAUTH_URL` に設定し、**Deployments** → **Redeploy** で再デプロイ

---

## 方法2: Vercel CLI でデプロイ

### ステップ1: Vercel CLI のインストールとログイン

```bash
cd dashboard-template
npm install -g vercel
vercel login
```

ブラウザが開くので、Vercel アカウントでログインしてください。

### ステップ2: 初回デプロイ

```bash
vercel
```

以下の質問に答えます：
- **Set up and deploy?** → `Y`
- **Which scope?** → アカウントを選択
- **Link to existing project?** → `N`（新規プロジェクトの場合）
- **What's your project's name?** → プロジェクト名を入力（例: `dashboard-template`）
- **In which directory is your code located?** → `./`（そのままEnter）

### ステップ3: 環境変数の設定

```bash
vercel env add NEXTAUTH_SECRET
vercel env add NEXTAUTH_URL
vercel env add AUTH_USERNAME
vercel env add AUTH_PASSWORD
vercel env add TODOIST_API_TOKEN
vercel env add TODOIST_WEBHOOK_SECRET
```

各コマンド実行時に値を入力します。

### ステップ4: 本番環境にデプロイ

```bash
vercel --prod
```

---

## デプロイ後の確認事項

### 1. Webhook URL の確認

デプロイ完了後、以下のURLがWebhookエンドポイントになります：

```
https://your-project.vercel.app/api/todoist/webhook
```

このURLをTodoistの設定ページでWebhookとして登録してください。

### 2. 環境変数の確認

Vercelダッシュボードの **Settings** → **Environment Variables** で以下が設定されているか確認：

- ✅ `NEXTAUTH_SECRET`
- ✅ `NEXTAUTH_URL`（本番URL）
- ✅ `AUTH_USERNAME`
- ✅ `AUTH_PASSWORD`
- ✅ `TODOIST_API_TOKEN`（Todoist連携を使う場合）
- ✅ `TODOIST_WEBHOOK_SECRET`（Webhookを使う場合）

### 3. 動作確認

1. 本番URLにアクセス
2. ログイン画面が表示されることを確認
3. `AUTH_USERNAME` と `AUTH_PASSWORD` でログインできることを確認
4. ダッシュボードが表示されることを確認

---

## トラブルシューティング

### デプロイが失敗する場合

1. **ビルドログを確認**: Vercelダッシュボードの **Deployments** → 失敗したデプロイ → **Build Logs** を確認
2. **環境変数の確認**: 必須の環境変数がすべて設定されているか確認
3. **Node.js バージョン**: `package.json` に `engines` フィールドを追加：
   ```json
   {
     "engines": {
       "node": ">=18.0.0"
     }
   }
   ```

### ログインできない場合

1. `NEXTAUTH_URL` が正しい本番URLに設定されているか確認
2. `NEXTAUTH_SECRET` が設定されているか確認
3. 環境変数を変更した場合は、**Redeploy** が必要

### Todoist連携が動作しない場合

1. `TODOIST_API_TOKEN` が正しく設定されているか確認
2. Webhookを使う場合、`TODOIST_WEBHOOK_SECRET` が設定されているか確認
3. Webhook URLが正しく登録されているか確認

---

## 自動デプロイの設定

GitHub連携の場合、`main` ブランチに push するたびに自動でデプロイされます。

プレビューデプロイも自動で作成されるため、PRを作成するとプレビューURLが生成されます。

---

## 参考リンク

- [Vercel ドキュメント](https://vercel.com/docs)
- [Next.js デプロイガイド](https://nextjs.org/docs/deployment)
- [Todoist API ドキュメント](https://developer.todoist.com/)

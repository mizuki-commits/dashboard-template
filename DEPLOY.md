# デプロイ手順（Vercel）— 社内共有用

## 前提条件

- [Vercel](https://vercel.com) アカウント（無料）
- Node.js 18+
- （連絡・ファイル解析を使う場合）OpenAI API キー

---

## 方法1: Vercel CLI でデプロイ（最速）

### 1. Vercel にログイン

```bash
cd dashboard-template
npx vercel login
```

ブラウザが開くので、Vercel アカウントでログインしてください。

### 2. デプロイ実行

```bash
npx vercel --prod
```

初回はプロジェクト名や設定の質問が出ます。そのまま Enter で進めて問題ありません。

### 3. 環境変数を設定（必須）

1. https://vercel.com にログイン
2. 対象プロジェクトを選択
3. **Settings** → **Environment Variables**
4. 以下を追加：

| 名前 | 値 | 備考 |
|------|-----|------|
| `NEXTAUTH_SECRET` | ランダムな文字列（32文字以上） | 認証用。生成例: `openssl rand -base64 32` |
| `NEXTAUTH_URL` | 本番URL（例: `https://xxx.vercel.app`） | デプロイ先のURL |
| `AUTH_USERNAME` | ログイン用ユーザー名 | 社内で共有するアカウント |
| `AUTH_PASSWORD` | ログイン用パスワード | 推測されにくいパスワードを設定 |
| `OPENAI_API_KEY` | あなたの OpenAI API キー | 連絡・テキスト・ファイル解析を使う場合のみ |
| `TODOIST_API_TOKEN` | Todoist API トークン | Todoist連携を使う場合。https://app.todoist.com/app/settings/integrations で取得 |
| `TODOIST_WEBHOOK_SECRET` | Webhook署名検証用のシークレット | Todoist Webhookを使う場合。ランダムな文字列（32文字以上推奨） |

5. **Deployments** から **Redeploy** で再デプロイ

---

## 方法2: GitHub 連携でデプロイ

### 1. GitHub にプッシュ

```bash
cd dashboard-template
git init
git add .
git commit -m "Initial commit: Regional Commons プロジェクト管理"
git branch -M main
git remote add origin https://github.com/あなたのユーザー名/リポジトリ名.git
git push -u origin main
```

### 2. Vercel でインポート

1. https://vercel.com/new にアクセス
2. **Import Git Repository** でリポジトリを選択
3. **Environment Variables** で認証用（`NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `AUTH_USERNAME`, `AUTH_PASSWORD`）と、必要なら `OPENAI_API_KEY`、`TODOIST_API_TOKEN`、`TODOIST_WEBHOOK_SECRET` を追加
4. **Deploy** をクリック

以降、`main` に push するたびに自動でデプロイされます。

---

## 社内共有用 URL

デプロイ完了後、次のような URL が発行されます：

- **本番（例）**: `https://dashboard-template-xi-lemon.vercel.app`
- **プレビュー**: 各ブランチや PR 用の URL も自動生成されます

この URL を社内で共有すれば、ブラウザからアクセスできます。**ログイン必須**のため、管理者が発行したユーザー名・パスワードでログインしてください。

プロジェクト設定・ドメイン変更: https://vercel.com/mizuki-2573s-projects/dashboard-template/settings

---

## 注意事項

- **API キー**: `.env.local` は Git に含めません。Vercel の環境変数で設定してください。
- **無料枠**: Vercel の無料プランで利用可能です。OpenAI API の利用料は別途発生します。
- **認証**: ログイン（ユーザー名・パスワード）が必須です。`AUTH_USERNAME` と `AUTH_PASSWORD` を Vercel の環境変数で設定し、社内で共有してください。`NEXTAUTH_SECRET` は漏らさないよう厳重に管理してください。

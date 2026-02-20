# GitHubへのプッシュ手順

## 現在の状態

✅ Gitリポジトリは初期化済み
✅ ファイルはコミット済み
✅ リモートは設定済み: `https://github.com/mizuki-commits/dashboard-template.git`

## プッシュ方法

### 方法1: Personal Access Tokenを使う（推奨）

1. **Personal Access Tokenを作成**
   - https://github.com/settings/tokens にアクセス
   - **Generate new token** → **Generate new token (classic)** をクリック
   - **Note**: `dashboard-template-push` など任意の名前
   - **Expiration**: 適切な期間を選択（例: 90日）
   - **Select scopes**: `repo` にチェック（すべてのリポジトリへのアクセス）
   - **Generate token** をクリック
   - **トークンをコピー**（一度しか表示されません）

2. **プッシュを実行**

```bash
cd /Users/hidenobumizuki/Downloads/sample_downloads/dashboard-template
git push -u origin main
```

ユーザー名を求められたら: `mizuki-commits`
パスワードを求められたら: **Personal Access Tokenを貼り付け**

### 方法2: GitHub CLIを使う

```bash
# GitHub CLIをインストール（まだの場合）
# macOS: brew install gh
# または https://cli.github.com/ からダウンロード

# ログイン
gh auth login

# プッシュ
cd /Users/hidenobumizuki/Downloads/sample_downloads/dashboard-template
git push -u origin main
```

### 方法3: 認証情報を保存する（一度だけ設定）

```bash
cd /Users/hidenobumizuki/Downloads/sample_downloads/dashboard-template

# 認証情報ヘルパーを設定
git config --global credential.helper osxkeychain

# プッシュ（初回のみ認証情報を入力）
git push -u origin main
```

---

## トラブルシューティング

### 認証エラーが発生する場合

1. Personal Access Tokenが正しく設定されているか確認
2. トークンの有効期限が切れていないか確認
3. `repo` スコープが付与されているか確認

### リポジトリが見つからない場合

1. GitHubでリポジトリが作成されているか確認: https://github.com/mizuki-commits/dashboard-template
2. リモートURLを確認: `git remote -v`
3. 必要に応じて再設定: `git remote set-url origin https://github.com/mizuki-commits/dashboard-template.git`

---

## 次のステップ

プッシュが成功したら、Vercelでデプロイできます：

1. https://vercel.com/new にアクセス
2. **Import Git Repository** で `mizuki-commits/dashboard-template` を選択
3. 環境変数を設定（`DEPLOY.md` を参照）
4. **Deploy** をクリック

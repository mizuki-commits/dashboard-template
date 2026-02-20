# GitHubリポジトリ作成とプッシュ手順

## 方法1: GitHub Webでリポジトリを作成（推奨）

### ステップ1: GitHubでリポジトリを作成

1. https://github.com/new にアクセス
2. **Repository name** を入力（例: `dashboard-template`）
3. **Description**（オプション）: "Dashboard with Todoist integration"
4. **Public** または **Private** を選択
5. **Initialize this repository with** のチェックは**すべて外す**（既にローカルでコミット済みのため）
6. **Create repository** をクリック

### ステップ2: リモートを追加してプッシュ

GitHubでリポジトリを作成すると、以下のようなコマンドが表示されます。
それを実行してください：

```bash
cd /Users/hidenobumizuki/Downloads/sample_downloads/dashboard-template
git remote add origin https://github.com/あなたのユーザー名/リポジトリ名.git
git push -u origin main
```

**注意**: `あなたのユーザー名` と `リポジトリ名` を実際の値に置き換えてください。

---

## 方法2: GitHub CLIを使う（より簡単）

### ステップ1: GitHub CLIをインストール

```bash
brew install gh
```

または、https://cli.github.com/ からダウンロード

### ステップ2: GitHub CLIでログイン

```bash
gh auth login
```

### ステップ3: リポジトリを作成してプッシュ

```bash
cd /Users/hidenobumizuki/Downloads/sample_downloads/dashboard-template
gh repo create dashboard-template --public --source=. --remote=origin --push
```

**オプション**:
- `--public`: 公開リポジトリ（`--private` で非公開）
- `--source=.`: 現在のディレクトリをソースとして使用
- `--remote=origin`: リモート名を `origin` に設定
- `--push`: 自動でプッシュ

---

## 現在の状態

✅ Gitリポジトリは初期化済み
✅ ファイルはコミット済み（57ファイル、9984行）
✅ ブランチは `main` に設定済み

次のステップ: GitHubリポジトリを作成してプッシュするだけです。

---

## トラブルシューティング

### 認証エラーが発生する場合

```bash
# GitHub CLIで認証
gh auth login

# または、HTTPSの代わりにSSHを使う
git remote set-url origin git@github.com:あなたのユーザー名/リポジトリ名.git
```

### プッシュが拒否される場合

```bash
# リモートのURLを確認
git remote -v

# リモートを削除して再追加
git remote remove origin
git remote add origin https://github.com/あなたのユーザー名/リポジトリ名.git
git push -u origin main
```

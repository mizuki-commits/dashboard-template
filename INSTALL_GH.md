# GitHub CLI インストール手順

## macOSでのインストール方法

### 方法1: 公式インストーラーを使う（推奨）

1. https://cli.github.com/ にアクセス
2. **Download for macOS** をクリック
3. ダウンロードした `.pkg` ファイルを実行
4. インストールウィザードに従ってインストール
5. ターミナルを再起動

### 方法2: Homebrewを使う（Homebrewがインストールされている場合）

```bash
brew install gh
```

### 方法3: 手動でダウンロード

```bash
# 最新バージョンをダウンロード
curl -L https://github.com/cli/cli/releases/latest/download/gh_$(curl -s https://api.github.com/repos/cli/cli/releases/latest | grep tag_name | cut -d '"' -f 4 | cut -d 'v' -f 2)_macOS_amd64.tar.gz -o gh.tar.gz

# 解凍
tar -xzf gh.tar.gz

# インストール（PATHに追加）
sudo mv gh_*/bin/gh /usr/local/bin/
```

## インストール後の確認

```bash
gh --version
```

## ログイン

```bash
gh auth login
```

以下の選択肢が表示されます：
1. **GitHub.com** を選択
2. **HTTPS** または **SSH** を選択（HTTPS推奨）
3. **Login with a web browser** を選択
4. ブラウザが開くので、認証コードをコピーして貼り付け
5. GitHubで認証を承認

## プッシュ

ログイン後、以下でプッシュできます：

```bash
cd /Users/hidenobumizuki/Downloads/sample_downloads/dashboard-template
git push -u origin main
```

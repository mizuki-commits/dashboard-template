# Ollama でローカル解析する手順

連絡・テキスト・ファイル解析を **外部（OpenAI）に送らず**、自 PC 上の Ollama で動かす手順です。

---

## 1. Ollama のインストール

### 方法 A: Homebrew（推奨）

```bash
brew install ollama
```

### 方法 B: 公式サイト

1. [https://ollama.com/download](https://ollama.com/download) を開く  
2. macOS 用をダウンロードしてインストール  
3. アプリケーションから「Ollama」を起動（メニューバーにアイコンが出れば OK）

---

## 2. Ollama サーバーを起動

**ターミナルで:**

```bash
ollama serve
```

このままターミナルを開いた状態にしておくか、バックグラウンドで動かす場合は別ターミナルで次へ。

（公式アプリでインストールした場合は、アプリ起動だけでサーバーも起動します。）

---

## 3. モデルの取得

テキスト・PDF の解析用に **llama3.2** を取得（初回は数分かかります）:

```bash
ollama pull llama3.2
```

**画像の解析**もローカルで行う場合は **llava** を追加:

```bash
ollama pull llava
```

取得後、`.env` の `LOCAL_AI_MODEL` を `llava` にすると画像解析も Ollama で行われます。

---

## 4. このプロジェクトの設定

`.env` に以下が設定されていることを確認してください（既に設定済みの場合はそのままで OK）:

```env
LOCAL_AI_BASE_URL=http://localhost:11434/v1
LOCAL_AI_MODEL=llama3.2
```

画像までローカルで解析する場合は:

```env
LOCAL_AI_MODEL=llava
```

---

## 5. ダッシュボードの起動

```bash
cd /Users/hidenobumizuki/Downloads/sample_downloads/dashboard-template
npm run dev
```

ブラウザで http://localhost:3000 を開き、ログイン → 「連絡・ファイル解析」でテキストや PDF を送って解析できることを確認してください。

---

## 一括セットアップ（スクリプト）

上記をまとめて実行する場合:

```bash
chmod +x scripts/setup-ollama.sh
./scripts/setup-ollama.sh
```

---

## トラブルシューティング

| 現象 | 対処 |
|------|------|
| 「接続できません」など | `ollama serve` が動いているか確認。別ターミナルで `curl http://localhost:11434/api/tags` が JSON を返すか確認。 |
| 解析が遅い | モデル（llama3.2 など）は初回推論が特に遅いことがあります。2 回目以降はキャッシュで速くなります。 |
| JSON のパースエラー | モデルが JSON を崩して返す場合があります。`LOCAL_AI_MODEL=llama3.2`（または llava）で再試行。 |

#!/bin/bash
# Ollama をインストールし、解析用モデルを取得して起動するスクリプト
# 使い方: chmod +x scripts/setup-ollama.sh && ./scripts/setup-ollama.sh

set -e

echo "=== Ollama セットアップ ==="

# 1. Ollama のインストール（Homebrew がある場合）
if command -v brew &>/dev/null; then
  echo "[1/4] Homebrew で Ollama をインストール..."
  brew install ollama
elif command -v ollama &>/dev/null; then
  echo "[1/4] Ollama は既にインストールされています"
else
  echo "[1/4] Homebrew がありません。手動でインストールしてください:"
  echo "  https://ollama.com/download から macOS 用をダウンロード"
  echo "  または Homebrew を入れたうえで: brew install ollama"
  exit 1
fi

# 2. Ollama サーバーをバックグラウンドで起動（既に起動していればスキップ）
echo "[2/4] Ollama サーバーを起動..."
if curl -s http://localhost:11434/api/tags &>/dev/null; then
  echo "  → 既に起動しています"
else
  ollama serve &
  OLLAMA_PID=$!
  echo "  → 起動中 (PID: $OLLAMA_PID)、接続を待機..."
  for i in {1..30}; do
    if curl -s http://localhost:11434/api/tags &>/dev/null; then
      echo "  → 起動しました"
      break
    fi
    sleep 1
  done
fi

# 3. テキスト解析用モデルを取得（llama3.2 は JSON 出力に適している）
echo "[3/4] モデル llama3.2 を取得（初回は数分かかります）..."
ollama pull llama3.2

# 4. 画像解析も使う場合は llava を取得（任意）
echo "[4/4] 画像解析用モデル llava を取得しますか？ (y/N)"
read -r ans
if [[ "$ans" =~ ^[yY] ]]; then
  ollama pull llava
  echo "  → .env の LOCAL_AI_MODEL=llava にすると画像解析もローカルで動きます"
fi

echo ""
echo "=== セットアップ完了 ==="
echo "  - 解析はローカル（Ollama）で行われ、外部には送信されません"
echo "  - ダッシュボードの .env に以下が設定されていることを確認してください:"
echo "    LOCAL_AI_BASE_URL=http://localhost:11434/v1"
echo "    LOCAL_AI_MODEL=llama3.2"
echo "  - 次回以降、Ollama を使う前にターミナルで以下を実行してください:"
echo "    ollama serve"
echo "    (または Ollama アプリを起動)"

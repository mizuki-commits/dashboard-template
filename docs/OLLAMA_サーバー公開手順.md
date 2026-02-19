# インターネットからアクセスできる Ollama サーバーの立て方

本番（Vercel）の解析ツールから、自前の Ollama を使うために「インターネットからアクセスできるサーバー」に Ollama を立てる手順です。

---

## 前提と注意

- **セキュリティ**: Ollama をそのままインターネットに公開すると、第三者が利用できる可能性があります。**本番では認証やIP制限を必ず検討**してください（後述）。
- **コスト**: VPS やクラウド VM は有料です（月数百円〜数千円程度から）。
- **スペック**: 推論用に **メモリ 4GB 以上**（llama3.2 なら 8GB 推奨）、**GPU があると速い**です。

---

## 1. サーバー（VPS）を用意する

次のいずれかで「Ubuntu 22.04 など Linux のサーバー」を 1 台用意します。

| サービス | 例 | 料金目安 |
|----------|-----|----------|
| [DigitalOcean](https://www.digitalocean.com/) | Droplet | 月 $4〜 |
| [AWS EC2](https://aws.amazon.com/ec2/) | t3.small など | 従量 |
| [Google Cloud](https://cloud.google.com/compute) | e2-small など | 従量 |
| [ConoHa](https://www.conoha.jp/) / [さくら](https://www.sakura.ad.jp/) | VPS | 月 500円〜 |

- **推奨**: メモリ **4GB 以上**（8GB あると llama3.2 が快適）
- **OS**: Ubuntu 22.04 LTS が扱いやすいです

---

## 2. サーバーに SSH で入り、Ollama をインストール

### 2.1 SSH 接続

```bash
ssh root@あなたのサーバーのIP
# または
ssh ubuntu@あなたのサーバーのIP
```

### 2.2 Ollama をインストール（Ubuntu / Debian）

```bash
curl -fsSL https://ollama.com/install.sh | sh
```

### 2.3 Ollama を起動（バックグラウンド）

```bash
# サービスとして有効化・起動
sudo systemctl enable ollama
sudo systemctl start ollama
sudo systemctl status ollama   # 起動確認
```

### 2.4 モデルを取得

```bash
ollama pull llama3.2
# 画像解析もする場合
ollama pull llava
```

---

## 3. インターネットからアクセスできるようにする

Ollama は標準で **11434** 番ポートで待ち受けます。このポートを外から叩けるようにします。

### 3.1 ファイアウォールで 11434 を開ける（Ubuntu: ufw）

```bash
sudo ufw allow 22        # SSH は必ず残す
sudo ufw allow 11434/tcp # Ollama
sudo ufw enable
sudo ufw status
```

### 3.2 動作確認（手元のPCから）

```bash
curl http://あなたのサーバーのIP:11434/api/tags
```

`{"models":[...]}` のような JSON が返れば OK です。

---

## 4. 本番アプリ（Vercel）から使う

1. **Vercel** の **Environment Variables** で次を設定する：
   - **`LOCAL_AI_BASE_URL`** = `http://あなたのサーバーのIP:11434/v1`
   - ドメインを使う場合（後述）は `https://ollama.あなたのドメイン/v1` など
2. **`LOCAL_AI_MODEL`** = `llama3.2`（または `llava`）
3. **Redeploy** する。

これで、本番の解析ツールが「インターネット上の Ollama」にリクエストを送るようになります。

---

## 5. セキュリティを強くする（推奨）

Ollama をそのまま **IP:11434** で公開すると、誰でもアクセスできてしまいます。本番では次のいずれか（または組み合わせ）を検討してください。

### A. 逆プロキシ + ベーシック認証（Nginx）

- Nginx を入れ、**HTTPS** と **Basic 認証** をかける。
- 本番アプリからは `https://ollama.あなたのドメイン/v1` にアクセスし、環境変数で **ユーザー名・パスワード** を渡す必要があります（現在のアプリは Basic 認証未対応のため、対応するか、下記 B を検討）。

### B. ファイアウォールで IP 制限（Vercel の IP のみ許可）

- Vercel の送信元 IP は [Vercel のドキュメント](https://vercel.com/docs/security/ip-addresses) で確認できます（固定でない場合もあるため、完全な制限は難しいです）。
- 自社のオフィス IP が固定なら、**ufw でその IP のみ 11434 を許可**する方法もあります。

### C. VPN やプライベートネットワーク

- サーバーを VPC 内に置き、Vercel からは VPN や専用線でしか届かないようにする（構成が複雑になります）。

**まずは「開発・社内検証用」に IP 公開で試し、本番で使う場合は Nginx + HTTPS + 認証 を検討する**のがおすすめです。

---

## 6. HTTPS とドメインを使う場合（任意）

- **ドメイン**を取得し、サーバーの IP に A レコードで向ける。
- **Nginx** で 443 をリッスンし、**Let's Encrypt** で SSL を入れ、**proxy_pass** で `http://127.0.0.1:11434` に転送する。
- 本番の **LOCAL_AI_BASE_URL** を `https://ollama.あなたのドメイン/v1` にすると、通信が暗号化されます。

---

## まとめ

| ステップ | 内容 |
|----------|------|
| 1 | VPS などを 1 台用意（Ubuntu 推奨、メモリ 4GB 以上） |
| 2 | `install.sh` で Ollama を入れ、サービス起動・モデル取得 |
| 3 | ファイアウォールで 11434 を開け、手元から `curl` で確認 |
| 4 | Vercel の `LOCAL_AI_BASE_URL` に `http://サーバーIP:11434/v1` を設定して Redeploy |
| 5 | 本番運用時は Nginx + HTTPS + 認証 などでセキュリティを強化 |

この手順で、インターネットからアクセスできる Ollama サーバーを立て、本番の解析ツールから利用できます。

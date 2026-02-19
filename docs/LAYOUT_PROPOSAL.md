# レイアウト変更方針（Regional Commons プロジェクト管理システム）

## 1. 現在のプロジェクト構造の分析

### 1.1 ディレクトリ構成（改修前）

```
dashboard-template/
├── app/
│   ├── layout.tsx      # ルートレイアウト（KanbanProvider + Navigation + children）
│   ├── page.tsx        # トップページ（保育園向け KPI / カレンダー / カンバン / チェックリスト）
│   ├── globals.css
│   ├── api/slack-analyze/route.ts
│   └── slack-analyzer/page.tsx
├── components/
│   ├── Navigation.tsx  # ヘッダーナビ（ダッシュボード / Slack解析の2リンク）
│   ├── KanbanBoard.tsx
│   ├── ChecklistSection.tsx
│   └── CalendarSection.tsx
├── contexts/
│   └── KanbanContext.tsx
└── package.json
```

### 1.2 特徴

- **レイアウト**: ヘッダー（Navigation）＋ メインコンテンツ（children）の1カラム構成。サイドバーはなし。
- **状態**: KanbanContext のみ。アプリ全体の「モード」は未実装。
- **データ**: 保育園向けチェックリストのローカル state。リスト/テーブル用の共通コンポーネントや型はなし。
- **ナビ**: パスベース（`/`, `/slack-analyzer`）の2リンクのみ。

---

## 2. レイアウト変更方針

### 2.1 設計の考え方

- **3モードを1アプリ内で切り替え**: 教育支援 / 採用支援 / プロジェクト を URL ではなく「モード」で切り替え、同じトップページ（`/`）で表示内容を変える。
- **グローバル状態**: モードを `AppModeContext` で保持し、ヘッダー直下の UI で切り替え。localStorage で永続化し、リロード後も同じモードを維持。
- **ナビの動的切り替え**: モードに応じてヘッダーのラベルとアイコンを変更（「学校一覧」「企業一覧」「プロジェクト一覧」＋ 共通の「Slack解析」）。
- **メインコンテンツ**: モードに応じて「学校リスト」「企業リスト」「プロジェクトリスト」のいずれかを表示。共通の DataTable コンポーネントでリスト表示を統一。

### 2.2 レイアウト構成（改修後）

```
[Layout]
  AppModeProvider（最外層）
    KanbanProvider
      Navigation
        - ロゴ・タイトル（モードに応じてアイコン変更）
        - ナビリンク（モード別: 学校一覧 / 企業一覧 / プロジェクト一覧 + Slack解析）
        - モード切り替えUI（Segmented Control）※ヘッダー直下
      {children}  ← メインコンテンツ（page.tsx）
        - mode === "education"  → SchoolList（DataTable）
        - mode === "recruitment" → CompanyList（DataTable）
        - mode === "projects"    → ProjectList（DataTable）
```

### 2.3 コンポーネント・ファイル追加

| 役割 | ファイル | 説明 |
|------|----------|------|
| 型定義 | `types/index.ts` | Organization, School, Company, Project, AppMode |
| モックデータ | `data/mock.ts` | 学校・企業・プロジェクトのサンプル配列 |
| モード状態 | `contexts/AppModeContext.tsx` | mode / setMode、localStorage 永続化 |
| モード切り替えUI | `components/ModeSwitcher.tsx` | 教育支援 / 採用支援 / プロジェクトの Segmented Control |
| 共通テーブル | `components/DataTable.tsx` | 汎用リスト表示（columns + data + rowKey） |
| 学校一覧 | `components/SchoolList.tsx` | DataTable + mockSchools |
| 企業一覧 | `components/CompanyList.tsx` | DataTable + mockCompanies |
| プロジェクト一覧 | `components/ProjectList.tsx` | DataTable + mockProjects |

### 2.4 Navigation の変更点

- タイトルを「Regional Commons - プロジェクト管理」に変更。
- モードに応じてヘッダーアイコンを変更（GraduationCap / Building2 / FolderKanban）。
- ナビ項目をモード別に変更（「学校一覧」「企業一覧」「プロジェクト一覧」のいずれか ＋ Slack解析）。
- ヘッダー直下に `ModeSwitcher` を配置。

### 2.5 メインページ（page.tsx）の変更点

- 保育園向け KPI/カレンダー/カンバン/チェックリストを削除。
- `useAppMode()` でモードを取得し、対応するリストコンポーネントを表示。
- モードに応じたタイトル・説明文を表示。

---

## 3. データ構造（型）の対応

- **Organization**: 学校・企業の共通ベース（id, name, contactPerson, email, phone, address, notes, createdAt, updatedAt）。
- **School**: Organization を拡張。schoolType, progressStatus, schoolContact, nextActionDate など。
- **Company**: Organization を拡張。industry, recruitmentStatus, jobSummary, openPositions など。
- **Project**: 派生プロジェクト用。id, name, description, status, source, relatedSchoolId/relatedCompanyId, startDate, dueDate, assignee など。

詳細は `types/index.ts` を参照。

---

## 4. 今後の拡張案

- モードごとにルートを分ける場合: `/education`, `/recruitment`, `/projects` を追加し、モードと URL を同期。
- サイドバーを追加する場合: モード別メニューを左サイドに配置し、メインエリアを 2 カラムに変更。
- 学校・企業・プロジェクトの詳細ページ: `/education/[id]`, `/recruitment/[id]`, `/projects/[id]` などを追加。
- API 連携: モックの代わりに API からデータ取得するように `SchoolList` / `CompanyList` / `ProjectList` を変更。

---

## 5. 実装済み内容のまとめ

- 上記方針に基づき、以下を実装済みです。
  - 型定義（`types/index.ts`）とモックデータ（`data/mock.ts`）
  - `AppModeContext` と `ModeSwitcher`
  - `DataTable` および `SchoolList` / `CompanyList` / `ProjectList`
  - `Navigation` のモード対応とヘッダー直下のモード切り替え
  - `layout.tsx` への `AppModeProvider` の組み込み
  - `page.tsx` のモード別リスト表示

動作確認: `npm run build` 成功。`npm run dev` で起動し、画面上部の「教育支援」「採用支援」「プロジェクト」で表示が切り替わることを確認できます。

/**
 * Regional Commons プロジェクト管理システム用の型定義
 * 3つの事業・プロジェクト領域: 教育支援 / 採用支援 / 派生プロジェクト
 */

// ========== 共通 ==========

/** 組織の共通ベース（学校・企業の親型） */
export interface Organization {
  id: string;
  name: string;
  /** 担当者名 */
  contactPerson?: string;
  /** メールアドレス */
  email?: string;
  /** 電話番号 */
  phone?: string;
  /** 住所・所在地 */
  address?: string;
  /** 備考 */
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// ========== 教育支援事業 (Education Support) ==========

/** 進捗ステータス（教育支援用） */
export type EducationProgressStatus =
  | "未接触"
  | "接触中"
  | "提案中"
  | "契約済"
  | "実施中"
  | "完了"
  | "保留";

/** 学校（高校・高専など） */
export interface School extends Organization {
  /** 学校種別 */
  schoolType: "高校" | "高専" | "大学" | "その他";
  /** 進捗ステータス */
  progressStatus: EducationProgressStatus;
  /** 担当者（学校側） */
  schoolContact?: string;
  /** 次回アクション予定日 */
  nextActionDate?: string;
}

// ========== 採用支援事業 (Recruitment Support) ==========

/** 採用ステータス（採用支援用） */
export type RecruitmentStatus =
  | "問い合わせ"
  | "面談中"
  | "求人掲載中"
  | "選考中"
  | "内定"
  | "入社"
  | "クローズ";

/** 企業（クライアント） */
export interface Company extends Organization {
  /** 業種 */
  industry?: string;
  /** 採用ステータス */
  recruitmentStatus: RecruitmentStatus;
  /** 求人情報の概要 */
  jobSummary?: string;
  /** 募集人数 */
  openPositions?: number;
}

// ========== 派生プロジェクト (Derived Projects) ==========

/** プロジェクトのステータス */
export type ProjectStatus =
  | "企画中"
  | "進行中"
  | "保留"
  | "完了"
  | "中止";

/** 派生元の種類 */
export type ProjectSource = "education" | "recruitment" | "other";

/** 派生プロジェクト */
export interface Project {
  id: string;
  name: string;
  /** 概要・説明 */
  description?: string;
  /** ステータス */
  status: ProjectStatus;
  /** 派生元（教育支援 / 採用支援 / その他） */
  source: ProjectSource;
  /** 紐づく学校ID or 企業ID（任意） */
  relatedSchoolId?: string;
  relatedCompanyId?: string;
  /** 開始日 */
  startDate?: string;
  /** 期限・終了予定日 */
  dueDate?: string;
  /** 担当者 */
  assignee?: string;
  createdAt: string;
  updatedAt: string;
}

// ========== アプリモード（UI切り替え用） ==========

export type AppMode = "education" | "recruitment" | "ai_support" | "sales" | "projects";

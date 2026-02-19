/**
 * 教育支援・採用支援・営業開拓・プロジェクト用の初期チェックリスト（学校/会社/商談先/プロジェクト名＋タスク＋サブタスク）
 * ChecklistSection と同じ型で、カレンダー・チェックリストで利用
 */

import { GraduationCap, Building2, Cpu, Handshake, FolderKanban } from "lucide-react";
import type { ChecklistCategory } from "@/components/ChecklistSection";

const nextMonth = () => {
  const d = new Date();
  d.setMonth(d.getMonth() + 1);
  return d.toISOString().slice(0, 10);
};
const nextWeek = () => {
  const d = new Date();
  d.setDate(d.getDate() + 7);
  return d.toISOString().slice(0, 10);
};

export function getInitialEducationChecklist(): ChecklistCategory[] {
  return [
    {
      id: "edu-school-1",
      title: "北九州工業高等専門学校",
      icon: <GraduationCap className="h-5 w-5" />,
      iconId: "graduation",
      items: [
        {
          id: "edu-item-1-1",
          label: "産学連携プログラム打合せ",
          completed: false,
          deadline: nextMonth(),
          startDate: new Date().toISOString().slice(0, 10),
          subItems: [
            { id: "edu-sub-1-1-1", label: "日程調整", completed: false, deadline: nextWeek(), startDate: new Date().toISOString().slice(0, 10) },
            { id: "edu-sub-1-1-2", label: "資料準備", completed: false, deadline: nextWeek(), startDate: new Date().toISOString().slice(0, 10) },
          ],
        },
        {
          id: "edu-item-1-2",
          label: "共同開発テーマの選定",
          completed: false,
          deadline: nextMonth(),
          startDate: new Date().toISOString().slice(0, 10),
          subItems: [],
        },
      ],
    },
    {
      id: "edu-school-2",
      title: "小倉商業高等学校",
      icon: <GraduationCap className="h-5 w-5" />,
      iconId: "graduation",
      items: [
        {
          id: "edu-item-2-1",
          label: "地域活性化企画の提案",
          completed: false,
          deadline: nextMonth(),
          startDate: new Date().toISOString().slice(0, 10),
          subItems: [
            { id: "edu-sub-2-1-1", label: "企画書作成", completed: false, deadline: nextWeek(), startDate: new Date().toISOString().slice(0, 10) },
          ],
        },
      ],
    },
  ];
}

export function getInitialRecruitmentChecklist(): ChecklistCategory[] {
  return [
    {
      id: "rec-company-1",
      title: "株式会社サンプルテック",
      icon: <Building2 className="h-5 w-5" />,
      iconId: "building",
      items: [
        {
          id: "rec-item-1-1",
          label: "求人票の作成支援",
          completed: false,
          deadline: nextMonth(),
          startDate: new Date().toISOString().slice(0, 10),
          subItems: [
            { id: "rec-sub-1-1-1", label: "ヒアリング", completed: false, deadline: nextWeek(), startDate: new Date().toISOString().slice(0, 10) },
            { id: "rec-sub-1-1-2", label: "原稿作成", completed: false, deadline: nextWeek(), startDate: new Date().toISOString().slice(0, 10) },
          ],
        },
        {
          id: "rec-item-1-2",
          label: "採用チャネル選定",
          completed: false,
          deadline: nextMonth(),
          startDate: new Date().toISOString().slice(0, 10),
          subItems: [],
        },
      ],
    },
    {
      id: "rec-company-2",
      title: "有限会社地域サービス",
      icon: <Building2 className="h-5 w-5" />,
      iconId: "building",
      items: [
        {
          id: "rec-item-2-1",
          label: "初回面談",
          completed: false,
          deadline: nextMonth(),
          startDate: new Date().toISOString().slice(0, 10),
          subItems: [
            { id: "rec-sub-2-1-1", label: "日程調整", completed: false, deadline: nextWeek(), startDate: new Date().toISOString().slice(0, 10) },
          ],
        },
      ],
    },
  ];
}

export function getInitialAISupportChecklist(): ChecklistCategory[] {
  return [
    {
      id: "ai-1",
      title: "株式会社サンプルテック（AI導入）",
      icon: <Cpu className="h-5 w-5" />,
      iconId: "cpu",
      items: [
        {
          id: "ai-item-1-1",
          label: "AI活用ニーズヒアリング",
          completed: false,
          deadline: nextMonth(),
          startDate: new Date().toISOString().slice(0, 10),
          subItems: [
            { id: "ai-sub-1-1-1", label: "キックオフ", completed: false, deadline: nextWeek(), startDate: new Date().toISOString().slice(0, 10) },
            { id: "ai-sub-1-1-2", label: "要件整理", completed: false, deadline: nextWeek(), startDate: new Date().toISOString().slice(0, 10) },
          ],
        },
        {
          id: "ai-item-1-2",
          label: "PoC（概念実証）実施",
          completed: false,
          deadline: nextMonth(),
          startDate: new Date().toISOString().slice(0, 10),
          subItems: [],
        },
      ],
    },
    {
      id: "ai-2",
      title: "有限会社地域サービス（AI導入）",
      icon: <Cpu className="h-5 w-5" />,
      iconId: "cpu",
      items: [
        {
          id: "ai-item-2-1",
          label: "業務効率化提案",
          completed: false,
          deadline: nextMonth(),
          startDate: new Date().toISOString().slice(0, 10),
          subItems: [
            { id: "ai-sub-2-1-1", label: "現状分析", completed: false, deadline: nextWeek(), startDate: new Date().toISOString().slice(0, 10) },
          ],
        },
      ],
    },
  ];
}

export function getInitialSalesChecklist(): ChecklistCategory[] {
  return [
    {
      id: "sales-1",
      title: "株式会社サンプルテック（営業）",
      icon: <Handshake className="h-5 w-5" />,
      iconId: "handshake",
      items: [
        {
          id: "sales-item-1-1",
          label: "初回商談",
          completed: false,
          deadline: nextMonth(),
          startDate: new Date().toISOString().slice(0, 10),
          subItems: [
            { id: "sales-sub-1-1-1", label: "アポ取得", completed: false, deadline: nextWeek(), startDate: new Date().toISOString().slice(0, 10) },
            { id: "sales-sub-1-1-2", label: "提案資料準備", completed: false, deadline: nextWeek(), startDate: new Date().toISOString().slice(0, 10) },
          ],
        },
        {
          id: "sales-item-1-2",
          label: "フォローアップ",
          completed: false,
          deadline: nextMonth(),
          startDate: new Date().toISOString().slice(0, 10),
          subItems: [],
        },
      ],
    },
    {
      id: "sales-2",
      title: "有限会社地域サービス（営業）",
      icon: <Handshake className="h-5 w-5" />,
      iconId: "handshake",
      items: [
        {
          id: "sales-item-2-1",
          label: "ニーズヒアリング",
          completed: false,
          deadline: nextMonth(),
          startDate: new Date().toISOString().slice(0, 10),
          subItems: [
            { id: "sales-sub-2-1-1", label: "日程調整", completed: false, deadline: nextWeek(), startDate: new Date().toISOString().slice(0, 10) },
          ],
        },
      ],
    },
  ];
}

export function getInitialProjectsChecklist(): ChecklistCategory[] {
  return [
    {
      id: "proj-1",
      title: "高専モノづくり共創プログラム",
      icon: <FolderKanban className="h-5 w-5" />,
      iconId: "folder",
      items: [
        {
          id: "proj-item-1-1",
          label: "北九州高専・ポリテクとの共同開発",
          completed: false,
          deadline: nextMonth(),
          startDate: new Date().toISOString().slice(0, 10),
          subItems: [
            { id: "proj-sub-1-1-1", label: "キックオフミーティング", completed: false, deadline: nextWeek(), startDate: new Date().toISOString().slice(0, 10) },
            { id: "proj-sub-1-1-2", label: "開発テーマ選定", completed: false, deadline: nextWeek(), startDate: new Date().toISOString().slice(0, 10) },
          ],
        },
        {
          id: "proj-item-1-2",
          label: "オリジナル教具・遊具の共同開発",
          completed: false,
          deadline: nextMonth(),
          startDate: new Date().toISOString().slice(0, 10),
          subItems: [],
        },
      ],
    },
    {
      id: "proj-2",
      title: "サンプルテック採用支援",
      icon: <FolderKanban className="h-5 w-5" />,
      iconId: "folder",
      items: [
        {
          id: "proj-item-2-1",
          label: "エンジニア採用の伴走支援",
          completed: false,
          deadline: nextMonth(),
          startDate: new Date().toISOString().slice(0, 10),
          subItems: [
            { id: "proj-sub-2-1-1", label: "求人票作成", completed: false, deadline: nextWeek(), startDate: new Date().toISOString().slice(0, 10) },
            { id: "proj-sub-2-1-2", label: "面接日程調整", completed: false, deadline: nextWeek(), startDate: new Date().toISOString().slice(0, 10) },
          ],
        },
      ],
    },
    {
      id: "proj-3",
      title: "地域活性化×高校連携",
      icon: <FolderKanban className="h-5 w-5" />,
      iconId: "folder",
      items: [
        {
          id: "proj-item-3-1",
          label: "小倉商業・西南女学院との広報連携",
          completed: false,
          deadline: nextMonth(),
          startDate: new Date().toISOString().slice(0, 10),
          subItems: [
            { id: "proj-sub-3-1-1", label: "企画書作成", completed: false, deadline: nextWeek(), startDate: new Date().toISOString().slice(0, 10) },
          ],
        },
      ],
    },
  ];
}

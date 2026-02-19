"use client";

import { useState, useMemo } from "react";
import { useAppMode } from "@/contexts/AppModeContext";
import { GraduationCap, Building2, Cpu, Handshake, FolderKanban, Share2 } from "lucide-react";
import { KPISection, type KpiPeriod, type KpiValues } from "@/components/KPISection";
import { CalendarSection } from "@/components/CalendarSection";
import { KanbanBoard, type KanbanBoardEntity } from "@/components/KanbanBoard";
import {
  ChecklistSection,
  type ChecklistCategory,
} from "@/components/ChecklistSection";
import { ProgressOverview } from "@/components/ProgressOverview";
import { TaskAlerts } from "@/components/TaskAlerts";
import {
  RoadmapSection,
  type RoadmapGoal,
  type RoadmapMilestone,
} from "@/components/RoadmapSection";
import {
  ResourcesSection,
  type ResourceItem,
} from "@/components/ResourcesSection";
import { PageNav, ChecklistQuickAccess } from "@/components/PageNav";
import {
  getInitialEducationChecklist,
  getInitialRecruitmentChecklist,
  getInitialAISupportChecklist,
  getInitialSalesChecklist,
  getInitialProjectsChecklist,
} from "@/data/checklistInitials";

const MODE_TITLES = {
  education: { title: "教育支援事業", icon: GraduationCap },
  recruitment: { title: "採用支援事業", icon: Building2 },
  ai_support: { title: "AI導入支援", icon: Cpu },
  sales: { title: "営業開拓", icon: Handshake },
  projects: { title: "派生プロジェクト", icon: FolderKanban },
} as const;

/** モード別の背景グラデーション（切り替えがわかりやすいように） */
const MODE_BG_CLASS = {
  education: "from-slate-50 via-teal-50/30 to-amber-50/20",
  recruitment: "from-slate-50 via-blue-50/40 to-indigo-50/30",
  ai_support: "from-slate-50 via-violet-50/40 to-purple-50/30",
  sales: "from-slate-50 via-emerald-50/30 to-teal-50/20",
  projects: "from-slate-50 via-amber-50/30 to-orange-50/20",
} as const;

const defaultKpiValues = (): Record<KpiPeriod, KpiValues> => ({
  week: { contact: 0, contract: 0, target: 3 },
  month: { contact: 0, contract: 0, target: 5 },
  quarter: { contact: 0, contract: 0, target: 15 },
  year: { contact: 0, contract: 0, target: 50 },
});

function getDefaultDeadline(): string {
  const d = new Date();
  d.setMonth(d.getMonth() + 1);
  return d.toISOString().slice(0, 10);
}

export default function DashboardPage() {
  const { mode } = useAppMode();
  const [educationKpi, setEducationKpi] = useState(defaultKpiValues);
  const [recruitmentKpi, setRecruitmentKpi] = useState(defaultKpiValues);
  const [educationChecklist, setEducationChecklist] = useState<ChecklistCategory[]>(
    () => getInitialEducationChecklist()
  );
  const [recruitmentChecklist, setRecruitmentChecklist] = useState<ChecklistCategory[]>(
    () => getInitialRecruitmentChecklist()
  );
  const [aiSupportKpi, setAISupportKpi] = useState(defaultKpiValues);
  const [aiSupportChecklist, setAISupportChecklist] = useState<ChecklistCategory[]>(
    () => getInitialAISupportChecklist()
  );
  const [salesKpi, setSalesKpi] = useState(defaultKpiValues);
  const [salesChecklist, setSalesChecklist] = useState<ChecklistCategory[]>(
    () => getInitialSalesChecklist()
  );
  const [projectsKpi, setProjectsKpi] = useState(defaultKpiValues);
  const [projectsChecklist, setProjectsChecklist] = useState<ChecklistCategory[]>(
    () => getInitialProjectsChecklist()
  );
  const [roadmapGoals, setRoadmapGoals] = useState<RoadmapGoal[]>([]);
  const [roadmapMilestones, setRoadmapMilestones] = useState<RoadmapMilestone[]>([]);
  const [resources, setResources] = useState<ResourceItem[]>([]);

  const defaultDeadline = useMemo(() => getDefaultDeadline(), []);

  const handleEducationKpiUpdate = (period: KpiPeriod, values: Partial<KpiValues>) => {
    setEducationKpi((prev) => ({
      ...prev,
      [period]: { ...prev[period], ...values },
    }));
  };

  const handleRecruitmentKpiUpdate = (period: KpiPeriod, values: Partial<KpiValues>) => {
    setRecruitmentKpi((prev) => ({
      ...prev,
      [period]: { ...prev[period], ...values },
    }));
  };

  const handleAISupportKpiUpdate = (period: KpiPeriod, values: Partial<KpiValues>) => {
    setAISupportKpi((prev) => ({
      ...prev,
      [period]: { ...prev[period], ...values },
    }));
  };

  const handleSalesKpiUpdate = (period: KpiPeriod, values: Partial<KpiValues>) => {
    setSalesKpi((prev) => ({
      ...prev,
      [period]: { ...prev[period], ...values },
    }));
  };

  const handleProjectsKpiUpdate = (period: KpiPeriod, values: Partial<KpiValues>) => {
    setProjectsKpi((prev) => ({
      ...prev,
      [period]: { ...prev[period], ...values },
    }));
  };

  // 全モード共通: KPI / スケジュール / タスクボード / チェックリスト（学校名→プロジェクト名など同一構成）
  const { title, icon: Icon } = MODE_TITLES[mode];
  const isEducation = mode === "education";
  const isRecruitment = mode === "recruitment";
  const isAISupport = mode === "ai_support";
  const isSales = mode === "sales";
  const isProjects = mode === "projects";
  const checklist =
    isEducation ? educationChecklist
    : isRecruitment ? recruitmentChecklist
    : isAISupport ? aiSupportChecklist
    : isSales ? salesChecklist
    : projectsChecklist;
  const setChecklist =
    isEducation ? setEducationChecklist
    : isRecruitment ? setRecruitmentChecklist
    : isAISupport ? setAISupportChecklist
    : isSales ? setSalesChecklist
    : setProjectsChecklist;

  // タスクボードの紐づけ先候補（現在モードのチェックリストのカテゴリ＝学校・企業・商談先・プロジェクト）
  const kanbanEntities: KanbanBoardEntity[] = useMemo(
    () =>
      checklist.map((cat) => ({
        type:
          mode === "education"
            ? "school"
            : mode === "recruitment"
              ? "company"
              : mode === "ai_support"
                ? "ai_client"
                : mode === "sales"
                  ? "sales"
                  : "project",
        name: cat.title,
      })),
    [checklist, mode]
  );

  const entityLabelForNav =
    isEducation ? "学校" : isRecruitment ? "企業" : isAISupport ? "導入先" : isSales ? "商談先" : "プロジェクト";
  const entityLabelForChecklist =
    isEducation ? "学校" : isRecruitment ? "会社" : isAISupport ? "導入先" : isSales ? "商談先" : "プロジェクト";
  const defaultIconIdForChecklist =
    isEducation ? "graduation" : isRecruitment ? "building" : isAISupport ? "cpu" : isSales ? "handshake" : "folder";

  return (
    <div className={`min-h-screen bg-gradient-to-br transition-colors duration-300 ${MODE_BG_CLASS[mode]}`}>
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <section className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Icon className="h-6 w-6 text-primary" />
            <h2 className="text-xl font-semibold text-foreground">{title}</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            {isEducation && "高校・高専など教育機関の進捗を管理します。"}
            {isRecruitment && "クライアント企業の採用支援状況を管理します。"}
            {isAISupport && "企業・組織へのAI導入支援の進捗を管理します。"}
            {isSales && "新規商談先の開拓・営業活動を管理します。"}
            {isProjects && "教育支援・採用支援から派生したプロジェクトを管理します。"}
          </p>
        </section>

        <PageNav />
        <ChecklistQuickAccess
          checklist={checklist}
          entityLabel={entityLabelForNav}
        />

        {/* 全体の進捗率 */}
        <section id="progress" className="scroll-mt-24">
          <ProgressOverview checklist={checklist} onChecklistUpdate={setChecklist} />
          <TaskAlerts checklist={checklist} />
        </section>

        <section id="kpi" className="scroll-mt-24">
        {isEducation && (
          <KPISection
            mode="education"
            values={educationKpi}
            onUpdate={handleEducationKpiUpdate}
          />
        )}
        {isRecruitment && (
          <KPISection
            mode="recruitment"
            values={recruitmentKpi}
            onUpdate={handleRecruitmentKpiUpdate}
          />
        )}
        {isAISupport && (
          <KPISection
            mode="ai_support"
            values={aiSupportKpi}
            onUpdate={handleAISupportKpiUpdate}
          />
        )}
        {isSales && (
          <KPISection
            mode="sales"
            values={salesKpi}
            onUpdate={handleSalesKpiUpdate}
          />
        )}
        {isProjects && (
          <KPISection
            mode="projects"
            values={projectsKpi}
            onUpdate={handleProjectsKpiUpdate}
          />
        )}
        </section>

        <section id="roadmap" className="scroll-mt-24">
        <RoadmapSection
          goals={roadmapGoals}
          milestones={roadmapMilestones}
          onGoalsChange={setRoadmapGoals}
          onMilestonesChange={setRoadmapMilestones}
        />
        </section>

        {/* スケジュール一覧 */}
        <section id="schedule" className="mb-8 scroll-mt-24">
          <CalendarSection checklist={checklist} />
        </section>

        {/* タスクボード */}
        <section id="taskboard" className="mb-8 scroll-mt-24">
          <KanbanBoard entities={kanbanEntities} />
        </section>

        {/* 学校別 / 企業別 / 商談先別 / プロジェクト別チェックリスト（WBS・サブタスク付き。プロジェクトはプロジェクト名＝学校名相当） */}
        <section id="checklist" className="scroll-mt-24">
          <div className="flex items-center gap-2 mb-4">
            <Share2 className="h-5 w-5 text-primary" />
          </div>
          <ChecklistSection
            checklist={checklist}
            onUpdate={setChecklist}
            defaultDeadline={defaultDeadline}
            entityLabel={entityLabelForChecklist}
            defaultIconId={defaultIconIdForChecklist}
          />
        </section>

        {/* リソース・ドキュメント集約 */}
        <section id="resources" className="scroll-mt-24">
          <ResourcesSection resources={resources} onResourcesChange={setResources} />
        </section>

        <footer className="mt-12 text-center text-sm text-muted-foreground">
          <p>一般社団法人 Regional Commons - プロジェクト管理システム</p>
        </footer>
      </main>
    </div>
  );
}

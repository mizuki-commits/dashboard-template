"use client";

import { useState } from "react";
import { Flag, Milestone, Target, Plus, Trash2, ChevronDown } from "lucide-react";

export interface RoadmapGoal {
  id: string;
  title: string;
  targetDate: string;
  status: "not_started" | "in_progress" | "achieved";
  note?: string;
}

export interface RoadmapMilestone {
  id: string;
  title: string;
  date: string;
  status: "pending" | "completed";
  note?: string;
}

const GOAL_STATUS_LABELS: Record<RoadmapGoal["status"], string> = {
  not_started: "未着手",
  in_progress: "進行中",
  achieved: "達成",
};

const MILESTONE_STATUS_LABELS: Record<RoadmapMilestone["status"], string> = {
  pending: "未完了",
  completed: "完了",
};

function generateId() {
  return `rm-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

interface RoadmapSectionProps {
  goals: RoadmapGoal[];
  milestones: RoadmapMilestone[];
  onGoalsChange: (goals: RoadmapGoal[]) => void;
  onMilestonesChange: (milestones: RoadmapMilestone[]) => void;
}

export function RoadmapSection({
  goals,
  milestones,
  onGoalsChange,
  onMilestonesChange,
}: RoadmapSectionProps) {
  const [goalOpen, setGoalOpen] = useState(true);
  const [milestoneOpen, setMilestoneOpen] = useState(true);

  const addGoal = () => {
    const d = new Date();
    d.setMonth(d.getMonth() + 3);
    onGoalsChange([
      ...goals,
      {
        id: generateId(),
        title: "新規目標",
        targetDate: d.toISOString().slice(0, 10),
        status: "not_started",
      },
    ]);
  };

  const updateGoal = (id: string, updates: Partial<RoadmapGoal>) => {
    onGoalsChange(
      goals.map((g) => (g.id === id ? { ...g, ...updates } : g))
    );
  };

  const removeGoal = (id: string) => {
    onGoalsChange(goals.filter((g) => g.id !== id));
  };

  const addMilestone = () => {
    const d = new Date();
    d.setMonth(d.getMonth() + 1);
    onMilestonesChange([
      ...milestones,
      {
        id: generateId(),
        title: "新規マイルストーン",
        date: d.toISOString().slice(0, 10),
        status: "pending",
      },
    ]);
  };

  const updateMilestone = (id: string, updates: Partial<RoadmapMilestone>) => {
    onMilestonesChange(
      milestones.map((m) => (m.id === id ? { ...m, ...updates } : m))
    );
  };

  const removeMilestone = (id: string) => {
    onMilestonesChange(milestones.filter((m) => m.id !== id));
  };

  return (
    <section className="mb-8">
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="border-b border-border bg-muted/30 px-4 py-3 flex items-center gap-2">
          <Flag className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">
            ロードマップ・マイルストーン・目標
          </h2>
        </div>
        <div className="p-4 space-y-4">
          {/* 目標 */}
          <div className="rounded-lg border border-border bg-muted/10 overflow-hidden">
            <button
              type="button"
              onClick={() => setGoalOpen(!goalOpen)}
              className="w-full flex items-center justify-between px-4 py-2 text-left text-sm font-medium text-foreground hover:bg-muted/30"
            >
              <span className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                目標（Goals）
              </span>
              <ChevronDown
                className={`h-4 w-4 transition-transform ${goalOpen ? "" : "-rotate-90"}`}
              />
            </button>
            {goalOpen && (
              <div className="border-t border-border p-3 space-y-2">
                {goals.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-2">
                    目標がありません。「目標を追加」から追加してください。
                  </p>
                ) : (
                  goals.map((g) => (
                    <div
                      key={g.id}
                      className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-background p-2 text-sm"
                    >
                      <input
                        type="text"
                        value={g.title}
                        onChange={(e) => updateGoal(g.id, { title: e.target.value })}
                        className="flex-1 min-w-[120px] px-2 py-1 rounded border border-input bg-background"
                        placeholder="目標名"
                      />
                      <input
                        type="date"
                        value={g.targetDate}
                        onChange={(e) => updateGoal(g.id, { targetDate: e.target.value })}
                        className="px-2 py-1 rounded border border-input bg-background"
                      />
                      <select
                        value={g.status}
                        onChange={(e) =>
                          updateGoal(g.id, { status: e.target.value as RoadmapGoal["status"] })
                        }
                        className="px-2 py-1 rounded border border-input bg-background"
                      >
                        {(Object.keys(GOAL_STATUS_LABELS) as RoadmapGoal["status"][]).map(
                          (s) => (
                            <option key={s} value={s}>
                              {GOAL_STATUS_LABELS[s]}
                            </option>
                          )
                        )}
                      </select>
                      <button
                        type="button"
                        onClick={() => removeGoal(g.id)}
                        className="p-1 rounded hover:bg-destructive/20 text-muted-foreground hover:text-destructive"
                        title="削除"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))
                )}
                <button
                  type="button"
                  onClick={addGoal}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-dashed border-border text-sm text-muted-foreground hover:bg-muted/30"
                >
                  <Plus className="h-4 w-4" />
                  目標を追加
                </button>
              </div>
            )}
          </div>

          {/* マイルストーン */}
          <div className="rounded-lg border border-border bg-muted/10 overflow-hidden">
            <button
              type="button"
              onClick={() => setMilestoneOpen(!milestoneOpen)}
              className="w-full flex items-center justify-between px-4 py-2 text-left text-sm font-medium text-foreground hover:bg-muted/30"
            >
              <span className="flex items-center gap-2">
                <Milestone className="h-4 w-4" />
                マイルストーン（Milestones）
              </span>
              <ChevronDown
                className={`h-4 w-4 transition-transform ${milestoneOpen ? "" : "-rotate-90"}`}
              />
            </button>
            {milestoneOpen && (
              <div className="border-t border-border p-3 space-y-2">
                {milestones.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-2">
                    マイルストーンがありません。「マイルストーンを追加」から追加してください。
                  </p>
                ) : (
                  milestones.map((m) => (
                    <div
                      key={m.id}
                      className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-background p-2 text-sm"
                    >
                      <input
                        type="text"
                        value={m.title}
                        onChange={(e) => updateMilestone(m.id, { title: e.target.value })}
                        className="flex-1 min-w-[120px] px-2 py-1 rounded border border-input bg-background"
                        placeholder="マイルストーン名"
                      />
                      <input
                        type="date"
                        value={m.date}
                        onChange={(e) => updateMilestone(m.id, { date: e.target.value })}
                        className="px-2 py-1 rounded border border-input bg-background"
                      />
                      <select
                        value={m.status}
                        onChange={(e) =>
                          updateMilestone(m.id, {
                            status: e.target.value as RoadmapMilestone["status"],
                          })
                        }
                        className="px-2 py-1 rounded border border-input bg-background"
                      >
                        {(Object.keys(MILESTONE_STATUS_LABELS) as RoadmapMilestone["status"][]).map(
                          (s) => (
                            <option key={s} value={s}>
                              {MILESTONE_STATUS_LABELS[s]}
                            </option>
                          )
                        )}
                      </select>
                      <button
                        type="button"
                        onClick={() => removeMilestone(m.id)}
                        className="p-1 rounded hover:bg-destructive/20 text-muted-foreground hover:text-destructive"
                        title="削除"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))
                )}
                <button
                  type="button"
                  onClick={addMilestone}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-dashed border-border text-sm text-muted-foreground hover:bg-muted/30"
                >
                  <Plus className="h-4 w-4" />
                  マイルストーンを追加
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

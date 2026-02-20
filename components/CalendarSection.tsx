"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Play, Flag } from "lucide-react";
import type { ChecklistCategory } from "./ChecklistSection";

export interface CalendarEvent {
  id: string;
  label: string;
  categoryTitle: string;
  date: string; // YYYY-MM-DD
  type: "start" | "deadline";
  isSubItem: boolean;
  completed: boolean;
}

function formatDateForInput(dateStr: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

function extractEvents(checklist: ChecklistCategory[]): CalendarEvent[] {
  const events: CalendarEvent[] = [];
  checklist.forEach((category) => {
    category.items.forEach((item) => {
      if (item.startDate) {
        events.push({
          id: `${item.id}-start`,
          label: item.label,
          categoryTitle: category.title,
          date: formatDateForInput(item.startDate) || item.startDate,
          type: "start",
          isSubItem: false,
          completed: item.completed,
        });
      }
      if (item.deadline) {
        events.push({
          id: `${item.id}-deadline`,
          label: item.label,
          categoryTitle: category.title,
          date: formatDateForInput(item.deadline) || item.deadline,
          type: "deadline",
          isSubItem: false,
          completed: item.completed,
        });
      }
      item.subItems.forEach((sub) => {
        if (sub.startDate) {
          events.push({
            id: `${sub.id}-start`,
            label: sub.label,
            categoryTitle: category.title,
            date: formatDateForInput(sub.startDate) || sub.startDate,
            type: "start",
            isSubItem: true,
            completed: sub.completed,
          });
        }
        if (sub.deadline) {
          events.push({
            id: `${sub.id}-deadline`,
            label: sub.label,
            categoryTitle: category.title,
            date: formatDateForInput(sub.deadline) || sub.deadline,
            type: "deadline",
            isSubItem: true,
            completed: sub.completed,
          });
        }
      });
    });
  });
  return events.filter((e) => e.date);
}

/** プロジェクト未設定のグループ名 */
const UNASSIGNED_PROJECT_NAME = "プロジェクト未設定";

/**
 * イベントをプロジェクト（categoryTitle）単位でグループ化し、
 * 各グループ内は日付昇順でソートする。
 */
function groupEventsByProject(events: CalendarEvent[]): { projectName: string; events: CalendarEvent[] }[] {
  const byProject = new Map<string, CalendarEvent[]>();
  for (const e of events) {
    const key = (e.categoryTitle || "").trim() || UNASSIGNED_PROJECT_NAME;
    if (!byProject.has(key)) byProject.set(key, []);
    byProject.get(key)!.push(e);
  }
  return Array.from(byProject.entries()).map(([projectName, list]) => ({
    projectName,
    events: [...list].sort((a, b) => a.date.localeCompare(b.date)),
  }));
}

function getMonthDays(year: number, month: number): (Date | null)[][] {
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const startPad = first.getDay();
  const totalDays = last.getDate();
  const weeks: (Date | null)[][] = [];
  let week: (Date | null)[] = [];
  for (let i = 0; i < startPad; i++) week.push(null);
  for (let d = 1; d <= totalDays; d++) {
    week.push(new Date(year, month, d));
    if (week.length === 7) {
      weeks.push(week);
      week = [];
    }
  }
  if (week.length > 0) {
    while (week.length < 7) week.push(null);
    weeks.push(week);
  }
  return weeks;
}

function dateKey(d: Date | null): string {
  if (!d) return "";
  return d.toISOString().slice(0, 10);
}

const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];

export function CalendarSection({ checklist }: { checklist: ChecklistCategory[] }) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const events = extractEvents(checklist);
  const eventsByDate = events.reduce<Record<string, CalendarEvent[]>>((acc, e) => {
    if (!acc[e.date]) acc[e.date] = [];
    acc[e.date].push(e);
    return acc;
  }, {});

  const eventsByProject = groupEventsByProject(events);
  const weeks = getMonthDays(viewYear, viewMonth);

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const selectedEvents = selectedDate ? eventsByDate[selectedDate] ?? [] : [];
  const isToday = (d: Date | null) =>
    d &&
    d.getFullYear() === today.getFullYear() &&
    d.getMonth() === today.getMonth() &&
    d.getDate() === today.getDate();

  return (
    <section className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
      <div className="border-b border-border bg-muted/30 px-4 py-3 flex items-center justify-between">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <CalendarIcon className="h-5 w-5 text-primary" />
          スケジュール一覧
        </h3>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={prevMonth}
            className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <span className="min-w-[140px] text-center font-medium">
            {viewYear}年{viewMonth + 1}月
          </span>
          <button
            type="button"
            onClick={nextMonth}
            className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="p-4">
        {/* 凡例 */}
        <div className="flex gap-4 mb-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Play className="h-3.5 w-3.5 text-blue-600" />
            着手
          </span>
          <span className="flex items-center gap-1">
            <Flag className="h-3.5 w-3.5 text-amber-600" />
            締切
          </span>
        </div>

        {/* カレンダーグリッド */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[320px] border-collapse">
            <thead>
              <tr>
                {WEEKDAYS.map((d) => (
                  <th
                    key={d}
                    className="text-center text-xs font-medium text-muted-foreground py-2 border-b border-border"
                  >
                    {d}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {weeks.map((week, wi) => (
                <tr key={wi}>
                  {week.map((d, di) => {
                    const key = dateKey(d);
                    const dayEvents = d ? eventsByDate[key] ?? [] : [];
                    const startCount = dayEvents.filter((e) => e.type === "start").length;
                    const deadlineCount = dayEvents.filter((e) => e.type === "deadline").length;
                    const isSelected = selectedDate === key;

                    return (
                      <td
                        key={di}
                        className={`align-top p-1 min-h-[72px] border-b border-border/50 ${
                          d ? "cursor-pointer" : "bg-muted/20"
                        } ${isSelected ? "ring-2 ring-primary bg-primary/5" : ""} ${
                          d && !isToday(d) ? "hover:bg-muted/30" : ""
                        } ${isToday(d) ? "bg-primary/5" : ""}`}
                        onClick={() => d && setSelectedDate(isSelected ? null : key)}
                      >
                        {d && (
                          <>
                            <span
                              className={`inline-block w-7 h-7 rounded-full text-sm flex items-center justify-center ${
                                isToday(d)
                                  ? "bg-primary text-primary-foreground font-bold"
                                  : "text-foreground"
                              }`}
                            >
                              {d.getDate()}
                            </span>
                            <div className="flex flex-col gap-0.5 mt-1">
                              {startCount > 0 && (
                                <div className="flex items-center gap-1 flex-wrap">
                                  <Play className="h-3 w-3 text-blue-600 shrink-0" />
                                  <span className="text-[10px] text-blue-600">
                                    {startCount}件
                                  </span>
                                </div>
                              )}
                              {deadlineCount > 0 && (
                                <div className="flex items-center gap-1 flex-wrap">
                                  <Flag className="h-3 w-3 text-amber-600 shrink-0" />
                                  <span className="text-[10px] text-amber-600">
                                    {deadlineCount}件
                                  </span>
                                </div>
                              )}
                            </div>
                          </>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 選択日の詳細 */}
        {selectedDate && (
          <div className="mt-4 pt-4 border-t border-border">
            <h4 className="text-sm font-medium text-foreground mb-3">
              {selectedDate}の予定
            </h4>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {selectedEvents.length === 0 ? (
                <p className="text-sm text-muted-foreground">予定はありません</p>
              ) : (
                selectedEvents.map((ev) => (
                  <div
                    key={ev.id}
                    className={`flex items-start gap-2 p-2 rounded-lg text-sm ${
                      ev.completed ? "bg-muted/30 opacity-70" : "bg-muted/20"
                    }`}
                  >
                    {ev.type === "start" ? (
                      <Play className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                    ) : (
                      <Flag className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <p
                        className={
                          ev.completed
                            ? "text-muted-foreground line-through"
                            : "text-foreground"
                        }
                      >
                        {ev.label}
                        {ev.isSubItem && (
                          <span className="text-xs text-muted-foreground ml-1">
                            (サブ)
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {ev.categoryTitle} · {ev.type === "start" ? "着手" : "締切"}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* プロジェクト単位でのグループ化表示 */}
        <div className="mt-6 pt-4 border-t border-border">
          <h4 className="text-sm font-semibold text-foreground mb-4">
            プロジェクト別スケジュール
          </h4>
          {eventsByProject.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">スケジュールはありません</p>
          ) : (
            <div className="space-y-6">
              {eventsByProject.map(({ projectName, events: projectEvents }) => (
                <div
                  key={projectName}
                  className="rounded-xl border border-border bg-gray-50 dark:bg-muted/20 overflow-hidden"
                >
                  <div className="px-4 py-3 border-b border-border bg-muted/30">
                    <h5 className="font-semibold text-foreground text-base">
                      {projectName}
                    </h5>
                  </div>
                  <ul className="divide-y divide-border/60">
                    {projectEvents.map((ev) => (
                      <li
                        key={ev.id}
                        className={`px-4 py-2.5 flex items-center gap-3 text-sm ${
                          ev.completed ? "opacity-70" : ""
                        }`}
                      >
                        <span className="shrink-0 w-24 text-muted-foreground tabular-nums">
                          {ev.date}
                        </span>
                        {ev.type === "start" ? (
                          <Play className="h-4 w-4 text-blue-600 shrink-0" />
                        ) : (
                          <Flag className="h-4 w-4 text-amber-600 shrink-0" />
                        )}
                        <span
                          className={
                            ev.completed
                              ? "text-muted-foreground line-through flex-1 min-w-0"
                              : "text-foreground flex-1 min-w-0"
                          }
                        >
                          {ev.label}
                          {ev.isSubItem && (
                            <span className="text-xs text-muted-foreground ml-1">(サブ)</span>
                          )}
                        </span>
                        <span className="shrink-0 text-xs text-muted-foreground">
                          {ev.type === "start" ? "着手" : "締切"}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

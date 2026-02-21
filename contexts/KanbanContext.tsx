"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";

export type KanbanAssignee = "MIZUKI" | "NISHIKATA";

export interface KanbanLinkedEntity {
  type: "school" | "company" | "sales" | "project" | "ai_client";
  name: string;
}

export interface KanbanTask {
  id: string;
  title: string;
  column: "todo" | "in_progress" | "done";
  deadline?: string;
  description?: string;
  linkedEntity?: KanbanLinkedEntity;
  assignee?: KanbanAssignee;
  source?: string; // "slack" | "manual" | "todoist"
  createdAt: string;
  /** Todoist 連携用。同期時に Todoist のタスク ID を保持する */
  todoistId?: string;
}

interface KanbanContextType {
  tasks: KanbanTask[];
  addTasks: (tasks: Omit<KanbanTask, "id" | "createdAt">[]) => void;
  addTask: (task: Omit<KanbanTask, "id" | "createdAt">) => void;
  updateTask: (taskId: string, updates: Partial<Omit<KanbanTask, "id" | "createdAt">>) => void;
  moveTask: (taskId: string, column: KanbanTask["column"]) => void;
  removeTask: (taskId: string) => void;
}

const KanbanContext = createContext<KanbanContextType | null>(null);

const STORAGE_KEY = "kanban_tasks";

function loadTasksFromStorage(): KanbanTask[] {
  if (typeof window === "undefined") return [];
  try {
    const s = localStorage.getItem(STORAGE_KEY);
    if (!s) return [];
    const parsed = JSON.parse(s) as KanbanTask[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function KanbanProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = useState<KanbanTask[]>(() => loadTasksFromStorage());

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch (e) {
      console.warn("Kanban tasks save failed:", e);
    }
  }, [tasks]);

  const addTasks = useCallback(
    (newTasks: Omit<KanbanTask, "id" | "createdAt">[]) => {
      const tasksToAdd: KanbanTask[] = newTasks.map((t) => ({
        ...t,
        id: `task-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        createdAt: new Date().toISOString(),
      }));
      setTasks((prev) => [...prev, ...tasksToAdd]);
    },
    []
  );

  const addTask = useCallback((newTask: Omit<KanbanTask, "id" | "createdAt">) => {
    const taskToAdd: KanbanTask = {
      ...newTask,
      id: `task-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      createdAt: new Date().toISOString(),
    };
    setTasks((prev) => [...prev, taskToAdd]);
  }, []);

  const updateTask = useCallback(
    (taskId: string, updates: Partial<Omit<KanbanTask, "id" | "createdAt">>) => {
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, ...updates } : t))
      );
    },
    []
  );

  const moveTask = useCallback((taskId: string, column: KanbanTask["column"]) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, column } : t))
    );
  }, []);

  const removeTask = useCallback((taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  }, []);

  return (
    <KanbanContext.Provider value={{ tasks, addTasks, addTask, updateTask, moveTask, removeTask }}>
      {children}
    </KanbanContext.Provider>
  );
}

export function useKanban() {
  const ctx = useContext(KanbanContext);
  if (!ctx) {
    throw new Error("useKanban must be used within KanbanProvider");
  }
  return ctx;
}

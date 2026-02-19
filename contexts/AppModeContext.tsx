"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import type { AppMode } from "@/types";

interface AppModeContextType {
  mode: AppMode;
  setMode: (mode: AppMode) => void;
}

const AppModeContext = createContext<AppModeContextType | null>(null);

const STORAGE_KEY = "rc-app-mode";

function getStoredMode(): AppMode {
  if (typeof window === "undefined") return "education";
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === "education" || stored === "recruitment" || stored === "ai_support" || stored === "sales" || stored === "projects") {
    return stored;
  }
  return "education";
}

export function AppModeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<AppMode>("education");

  const setMode = useCallback((newMode: AppMode) => {
    setModeState(newMode);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, newMode);
    }
  }, []);

  // クライアントでストレージから初期値を復元
  React.useEffect(() => {
    setModeState(getStoredMode());
  }, []);

  return (
    <AppModeContext.Provider value={{ mode, setMode }}>
      {children}
    </AppModeContext.Provider>
  );
}

export function useAppMode() {
  const ctx = useContext(AppModeContext);
  if (!ctx) {
    throw new Error("useAppMode must be used within AppModeProvider");
  }
  return ctx;
}

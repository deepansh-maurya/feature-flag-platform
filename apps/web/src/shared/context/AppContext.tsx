"use client";

import { PlanKey } from "@/src/features/billing/types";
import { createContext, useContext, useState, ReactNode } from "react";

export interface AppContextState {
  user?: {
    id: string;
    name: string;
    email: string;
  };
  workspace?: {
    id: string;
    name?: string;
    plan?: PlanKey
  };
  setUser: (user: AppContextState["user"]) => void;
  setWorkspace: (ws: AppContextState["workspace"]) => void;
}

// default (empty)
const AppContext = createContext<AppContextState | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppContextState["user"]>();
  const [workspace, setWorkspace] = useState<AppContextState["workspace"]>();

  return (
    <AppContext.Provider value={{ user, setUser, workspace, setWorkspace }}>
      {children}
    </AppContext.Provider>
  );
}

// convenience hook
export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error("useAppContext must be used inside <AppProvider>");
  }
  return ctx;
}

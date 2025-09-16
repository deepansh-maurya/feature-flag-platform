"use client";

import { useMe } from "@/src/features/auth/hooks";
import { PlanKey } from "@/src/features/billing/types";
import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect
} from "react";

export interface AppContextState {
  user?: {
    id: string;
    name: string;
    email: string;
  };
  workspace?: {
    id: string;
    name?: string;
    plan?: PlanKey;
  };
  setUser: (user: AppContextState["user"]) => void;
  setWorkspace: (ws: AppContextState["workspace"]) => void;
}

const AppContext = createContext<AppContextState | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppContextState["user"]>();
  const [workspace, setWorkspace] = useState<AppContextState["workspace"]>();
  const { data, isSuccess } = useMe();

  useEffect(() => {
    if (isSuccess && data) {
      //@ts-ignore
      setUser((prev) => prev ?? data.user);
      //@ts-ignore
      setWorkspace((prev) => prev ?? data.workspace);
    }
  }, [isSuccess, data, setUser, setWorkspace]);

  return (
    <AppContext.Provider value={{ user, setUser, workspace, setWorkspace }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error("useAppContext must be used inside <AppProvider>");
  }
  return ctx;
}

"use client";
import {
  installAuthStorageSync,
  loadAccessTokenFromStorage
} from "@/src/features/auth/api";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useEffect, useState } from "react";

export default function Providers({ children }: { children: ReactNode }) {
  const [qc] = useState(() => new QueryClient());
  useEffect(() => {
    const unsubscribe = installAuthStorageSync();
    loadAccessTokenFromStorage();
    return unsubscribe;
  }, []);

  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
}

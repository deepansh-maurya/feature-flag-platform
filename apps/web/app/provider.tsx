"use client";
import { loadAccessTokenFromStorage } from "@/src/features/auth/api";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useEffect, useState } from "react";

export default function Providers({ children }: { children: ReactNode }) {
  const [qc] = useState(() => new QueryClient());

  useEffect(() => {
    loadAccessTokenFromStorage(); 
  }, []);

  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
}

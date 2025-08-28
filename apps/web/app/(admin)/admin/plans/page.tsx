"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import PlansPage from "@/src/features/admin/components/plans/Plans";
import { useEnroll, useMe } from "@/src/features/admin/hooks";

export default function Plan() {
  const router = useRouter();
  const { data: me, isLoading, isError } = useMe();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const askedOnce = useRef(false);
  const enroll = useEnroll();

  useEffect(() => {
    if (isLoading) return;

    if (me) {
      setIsAdmin(true);
      return;
    }

    if (!askedOnce.current) {
      askedOnce.current = true;
      const passkey = window.prompt("Enter super-admin passkey");
      if (!passkey) {
        setIsAdmin(false);
        return;
      }
      enroll.mutate(
        { passKey: passkey },
        {
          onSuccess: async () => {
            setIsAdmin(true);
          },
          onError: async () => {
            setIsAdmin(false);
          }
        }
      );
    }
  }, [isLoading, me, router]);

  if (isLoading || isAdmin === null)
    return <div style={{ padding: 12 }}>Checking access…</div>;

  if (!isAdmin)
    return <div style={{ padding: 12 }}>Forbidden — super-admin only.</div>;

  return <PlansPage />;
}

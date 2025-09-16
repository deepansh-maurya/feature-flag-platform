"use client";

import React, { useState, useEffect } from "react";
import styles from "./EnvironmentsPage.module.css";
import { useFlags } from "@/src/features/flag/hooks";
import { AppConst } from "@/app/constants";

type Env = {
  name: string;
  key?: string;
  isDefault: boolean;
  isProd?: boolean;
  sdkKeys?: { server: string; client?: string };
  linkedFlags: string[];
};

export default function LinkFlagsModal({
  open,
  onClose,
  env,
  onSave,
}: {
  open: boolean;
  env: Env;
  onClose: () => void;
  onSave: (linked: string[]) => void;
}) {
  const projectIdFromStorage = typeof window !== "undefined" ? sessionStorage.getItem(AppConst.curPro) ?? undefined : undefined;
  const { data: allFlags } = useFlags(projectIdFromStorage);

  const [selected, setSelected] = useState<string[]>(env.linkedFlags || []);

  useEffect(() => {
    setSelected(env.linkedFlags || []);
  }, [env]);

  if (!open) return null;

  function toggleFlag(key: string) {
    setSelected((curr) => (curr.includes(key) ? curr.filter((k) => k !== key) : [...curr, key]));
  }

  return (
    <div className={styles.modalOverlay} role="dialog" aria-modal="true">
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <div className={styles.modalTitle}>Link flags for {env.name}</div>
          <button className={styles.modalClose} onClick={onClose} aria-label="Close">✕</button>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.flagsList}>
            {(allFlags ?? []).map((f) => (
              <label key={f.key} className={styles.flagRow}>
                <input
                  type="checkbox"
                  checked={selected.includes(f.key)}
                  onChange={() => toggleFlag(f.key)}
                />
                <div className={styles.flagMeta}>
                  <div className={styles.flagName}>{f.name ?? f.key}</div>
                  <div className={styles.flagDesc}>{f.description ?? ""}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        <div className={styles.modalFooter}>
          <button className={styles.ghostBtn} onClick={onClose}>Cancel</button>
          <button className={styles.primaryBtn} onClick={() => { onSave(selected); onClose(); }}>Save</button>
        </div>
      </div>
    </div>
  );
}

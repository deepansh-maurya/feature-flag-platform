"use client";

import React, { useEffect, useState } from "react";
import styles from "./TargetingRulesPage.module.css";
import FlagRulesBuilder from "./FlagRulesBuilder";
import { Flag } from "../../types";
import { useFlags } from "../../../flag/hooks";
import { AppConst } from "@/app/constants";

export default function TargetingRulesPage() {
  const [flags, setFlags] = useState<Flag[]>([]);
  const [openKeys, setOpenKeys] = useState<Record<string, boolean>>({});

  // Try to load real flags for the current project (if available).
  // We look for NEXT_PUBLIC_PROJECT_ID at runtime/build-time. If not set,
  // we keep the local static sample flags.
  const projectId = sessionStorage.getItem(AppConst.curPro)!;
  const flagsQuery = useFlags(projectId);

  useEffect(() => {
    const rows = flagsQuery.data;
    if (rows && rows.length > 0) {
      const mapped: Flag[] = rows.map((f) => ({
        key: f.key,
        envRules: {
          dev: [],
          stage: [],
          prod: []
        },
        updatedAt: f.updatedAt ? new Date(f.updatedAt).toLocaleString() : ""
      }));
      setFlags(mapped);
      setOpenKeys(() => ({ [mapped[0].key]: true }));
    }
    // keep fallback to initial flags when no projectId or empty response
  }, [flagsQuery.data]);

  function updateFlag(updated: Flag) {
    setFlags((prev) => prev.map((f) => (f.key === updated.key ? updated : f)));
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.headerRow}>
        <div className={styles.headerLeft}>
          <div className={styles.headerTitle}>Targeting Rules</div>
          <span className={styles.updatedAt}>
            Manage rules per flag & environment
          </span>
        </div>
      </div>

      <div className={styles.accordion}>
        {flags.length > 0 ? (
          flags.map((f) => {
            const isOpen = !!openKeys[f.key];
            return (
              <div key={f.key} className={styles.flagItem}>
                <button
                  className={styles.flagHeader}
                  onClick={() => setOpenKeys((o) => ({ [f.key]: !o[f.key] }))}
                  aria-expanded={isOpen}
                >
                  <span className={styles.caret}>{isOpen ? "▾" : "▸"}</span>
                  <span className={styles.flagKey}>{f.key}</span>
                  <span className={styles.flagMeta}>
                    Last updated {f.updatedAt}
                  </span>
                </button>

                {isOpen && (
                  <div className={styles.flagBody}>
                    <FlagRulesBuilder flag={f} onChange={updateFlag} />
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="text-center">No Rules</div>
        )}
      </div>
    </div>
  );
}

// TargetingRulesPage.tsx
"use client";

import React, { useState } from "react";
import styles from "./TargetingRulesPage.module.css";
import { rid } from "./utils";
import FlagRulesBuilder from "./FlagRulesBuilder";

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------
export type EnvKey = "dev" | "stage" | "prod";

export type Rule = {
  id: string;
  name: string;
  text?: string;
  conditions: string[];
  priority: number;
  enabled: boolean;
  source?:
    | { kind: "local" }
    | { kind: "segment"; key: string; linked: boolean };
};

export type Flag = {
  key: string;
  envRules: Record<EnvKey, Rule[]>;
  updatedAt: string;
};

export type Segment = {
  key: string;
  name: string;
  hint: string;
  tokens: string[];
};
export type Version = {
  id: string;
  ts: string;
  author: string;
  note?: string;
  snapshot: Flag;
};

// -----------------------------------------------------------------------------
// Demo data
// -----------------------------------------------------------------------------
export const SEGMENTS: Segment[] = [
  {
    key: "beta_testers",
    name: "Beta Testers",
    hint: "email endsWith @company.com",
    tokens: ["email*@company.com"]
  },
  {
    key: "in_india",
    name: "Users in India",
    hint: "region = IN",
    tokens: ["region=IN"]
  },
  {
    key: "pro_plan",
    name: "Pro plan",
    hint: "plan = pro",
    tokens: ["plan=pro"]
  }
];

const initialFlag1: Flag = {
  key: "dark_mode_v2",
  envRules: {
    dev: [
      {
        id: rid(),
        name: "Dev: everyone",
        text: "turn on for all in dev",
        conditions: ["*"],
        priority: 1,
        enabled: true,
        source: { kind: "local" }
      }
    ],
    stage: [
      {
        id: rid(),
        name: "Stage: pro users",
        text: "enable for pro users",
        conditions: ["plan=pro"],
        priority: 1,
        enabled: true,
        source: { kind: "local" }
      }
    ],
    prod: []
  },
  updatedAt: "2 min ago"
};

const initialFlag2: Flag = {
  key: "beta_feature_x",
  envRules: {
    dev: [
      {
        id: rid(),
        name: "Dev: India only",
        text: "enable for users in India",
        conditions: ["region=IN"],
        priority: 1,
        enabled: true,
        source: { kind: "local" }
      }
    ],
    stage: [
      {
        id: rid(),
        name: "Stage: free plan",
        text: "turn on for free plan users",
        conditions: ["plan=free"],
        priority: 1,
        enabled: true,
        source: { kind: "local" }
      }
    ],
    prod: []
  },
  updatedAt: "5 min ago"
};

const initialFlag3: Flag = {
  key: "new_dashboard_ui",
  envRules: {
    dev: [
      {
        id: rid(),
        name: "Dev: Android users",
        text: "enable for Android users only",
        conditions: ["platform=Android"],
        priority: 1,
        enabled: true,
        source: { kind: "local" }
      }
    ],
    stage: [
      {
        id: rid(),
        name: "Stage: US Pro users",
        text: "turn on for Pro users in US",
        conditions: ["plan=pro", "region=US"],
        priority: 1,
        enabled: true,
        source: { kind: "local" }
      }
    ],
    prod: []
  },
  updatedAt: "10 min ago"
};

const INITIAL_FLAGS: Flag[] = [initialFlag1, initialFlag2, initialFlag3];

// -----------------------------------------------------------------------------
// Page: renders ALL flags as an accordion
// -----------------------------------------------------------------------------
export default function TargetingRulesPage() {
  const [flags, setFlags] = useState<Flag[]>(INITIAL_FLAGS);
  const [openKeys, setOpenKeys] = useState<Record<string, boolean>>({
    [INITIAL_FLAGS[0].key]: true
  });

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
        {flags.map((f) => {
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
        })}
      </div>
    </div>
  );
}

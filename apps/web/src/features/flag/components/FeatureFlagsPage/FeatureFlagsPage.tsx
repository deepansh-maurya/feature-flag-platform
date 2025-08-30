// FeatureFlagsPage.tsx
"use client";

import React, { useMemo, useState } from "react";
import styles from "./FeatureFlagsPage.module.css";
import CreateFlagModal from "../createFlagModel/CreateFlagModal";

// ---------------- Types ----------------
export type EnvKey = "dev" | "stage" | "prod";
export type FlagType = "Boolean" | "% Rollout" | "String" | "Number" | "Multivariate";
export type FlagStatus = "on" | "off" | "gradual";

export type Flag = {
  name: string;               // key/slug style (e.g., dark_mode_v2)
  type: FlagType;
  status: FlagStatus;         // aggregate status (quick glance)
  targeting: string[];        // simple preview tokens
  lastModified: string;
  tags?: string[];
  envDefaults?: Partial<Record<EnvKey, FlagStatus>>; // optional per-env status
  description?: string;
};

const seedFlags: Flag[] = [
  {
    name: "dark_mode_v2",
    type: "Boolean",
    status: "on",
    targeting: ["plan=pro"],
    lastModified: "2 min ago",
    tags: ["UI"],
    envDefaults: { dev: "on", stage: "on", prod: "off" },
  },
  {
    name: "referral_program",
    type: "% Rollout",
    status: "gradual",
    targeting: ["region=IN", "plan=free"],
    lastModified: "5 min ago",
    tags: ["growth", "A/B"],
    envDefaults: { dev: "on", stage: "gradual", prod: "gradual" },
  },
  {
    name: "onboarding_ui",
    type: "String",
    status: "off",
    targeting: [],
    lastModified: "20 min ago",
    tags: ["UI"],
    envDefaults: { dev: "off", stage: "off", prod: "off" },
  },
];

const ENV_OPTIONS: ("All" | EnvKey)[] = ["All", "dev", "stage", "prod"];
const STATUS_OPTIONS: ("All" | FlagStatus)[] = ["All", "on", "off", "gradual"];
const TAGS_OPTIONS = ["A/B", "UI", "backend", "growth"];

export default function FeatureFlagsPage() {
  const [flags, setFlags] = useState<Flag[]>(seedFlags);
  const [env, setEnv] = useState<(typeof ENV_OPTIONS)[number]>("All");
  const [status, setStatus] = useState<(typeof STATUS_OPTIONS)[number]>("All");
  const [tag, setTag] = useState<string>("All");
  const [query, setQuery] = useState("");
  const [openCreate, setOpenCreate] = useState(false);

  // Derived list with basic filters
  const filtered = useMemo(() => {
    return flags.filter((f) => {
      const matchesQuery = query
        ? f.name.toLowerCase().includes(query.toLowerCase()) || (f.description || "").toLowerCase().includes(query.toLowerCase())
        : true;
      const matchesTag = tag === "All" ? true : (f.tags || []).includes(tag);
      const envStatus: FlagStatus | undefined = env === "All" ? f.status : f.envDefaults?.[env as EnvKey];
      const matchesStatus = status === "All" ? true : envStatus === status;
      return matchesQuery && matchesTag && matchesStatus;
    });
  }, [flags, env, status, tag, query]);

  function toggleFlag(i: number) {
    setFlags((prev) =>
      prev.map((f, idx) => {
        if (idx !== i) return f;
        const current = env === "All" ? f.status : f.envDefaults?.[env as EnvKey] || f.status;
        const next: FlagStatus = current === "on" ? "off" : "on";
        const envDefaults = { ...(f.envDefaults || {}) } as Partial<Record<EnvKey, FlagStatus>>;
        if (env !== "All") envDefaults[env as EnvKey] = next;
        const aggregate = env === "All" ? next : f.status; // keep aggregate simple for now
        return {
          ...f,
          status: aggregate,
          envDefaults,
          lastModified: "just now",
        };
      })
    );
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.headerRow}>
        <div className={styles.headerTitle}>All Feature Flags</div>
        <button className={styles.createBtn} onClick={() => setOpenCreate(true)}>+ Create Flag</button>
      </div>

      {/* Filters */}
      <div className={styles.filters}>
        <input className={styles.search} placeholder="Search flags…" value={query} onChange={(e) => setQuery(e.target.value)} />
        <select className={styles.filterSelect} value={env} onChange={(e) => setEnv(e.target.value as any)}>
          {ENV_OPTIONS.map((opt) => (
            <option key={opt}>{opt}</option>
          ))}
        </select>
        <select className={styles.filterSelect} value={status} onChange={(e) => setStatus(e.target.value as any)}>
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt}>{opt}</option>
          ))}
        </select>
        <select className={styles.filterSelect} value={tag} onChange={(e) => setTag(e.target.value)}>
          <option>All</option>
          {TAGS_OPTIONS.map((opt) => (
            <option key={opt}>{opt}</option>
          ))}
        </select>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead className="head">
            <tr>
              <th>Flag Name</th>
              <th>Type</th>
              <th>Status</th>
              <th>Targeting Rules</th>
              <th>Tags</th>
              <th>Last Modified</th>
              <th style={{ textAlign: "center" }}>Toggle</th>
            </tr>
          </thead>
          <tbody className="body">
            {filtered.map((f, i) => (
              <tr key={f.name}>
                <td className={styles.flagName}>{f.name}</td>
                <td>{f.type}</td>
                <td>
                  {renderStatusBadge(env === "All" ? f.status : f.envDefaults?.[env as EnvKey] || f.status)}
                </td>
                <td>
                  {f.targeting.length ? (
                    f.targeting.map((rule, idx) => (
                      <span key={idx} className={styles.ruleTag}>
                        {rule}
                      </span>
                    ))
                  ) : (
                    <button className={styles.createRulesBtn} title="No rules yet">+ Create rules</button>
                  )}
                </td>
                <td>
                  {(f.tags || []).length ? (
                    (f.tags || []).map((t) => (
                      <span key={t} className={styles.tagChip}>{t}</span>
                    ))
                  ) : (
                    <span className={styles.noRules}>—</span>
                  )}
                </td>
                <td>{f.lastModified}</td>
                <td className={styles.toggleCol}>
                  <label className={styles.switch}>
                    <input
                      type="checkbox"
                      checked={(env === "All" ? f.status : f.envDefaults?.[env as EnvKey] || f.status) === "on"}
                      onChange={() => toggleFlag(flags.indexOf(f))}
                    />
                    <span className={styles.slider}></span>
                  </label>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {openCreate && (
        <CreateFlagModal
          open={openCreate}
          onClose={() => setOpenCreate(false)}
          onCreate={(newFlag) => {
            setFlags((prev) => [newFlag, ...prev]);
            setOpenCreate(false);
          }}
        />
      )}
    </div>
  );
}

function renderStatusBadge(s?: FlagStatus) {
  if (s === "on") return <span className={styles.statusOn}>ON</span>;
  if (s === "off") return <span className={styles.statusOff}>OFF</span>;
  return <span className={styles.statusGradual}>GRADUAL</span>;
}

"use client";
import React, { useMemo, useState } from "react";
import styles from "./AnalyticsPage.module.css";

type EnvKey = "dev" | "stage" | "prod";
type VariantStat = { key: string; count: number };
type RuleHit = { id: string; count: number };

type FlagAnalytics = {
  name: string;
  env: EnvKey;
  evaluations: number;             // total evals in window
  enabled: number;                 // enabled evals
  disabled: number;                // disabled evals
  apiRequests: number;             // SDK/API calls attributed
  uniqueUsers: number;             // distinct users (estimated)
  variants?: VariantStat[];        // if multivariant
  topRules?: RuleHit[];            // matched rules by count
  trend: number[];                 // last 7 days counts (for sparkline)
};

// ---------------------------
// Mock data (replace from API)
// ---------------------------
const MOCK: FlagAnalytics[] = [
  {
    name: "dark_mode_v2",
    env: "prod",
    evaluations: 4200,
    enabled: 2600,
    disabled: 1600,
    apiRequests: 6200,
    uniqueUsers: 2100,
    variants: [
      { key: "control", count: 2100 },
      { key: "treatment", count: 2100 }
    ],
    topRules: [
      { id: "geo-IN", count: 1800 },
      { id: "plan-pro", count: 1500 },
      { id: "fallthrough", count: 900 }
    ],
    trend: [520, 590, 610, 595, 610, 640, 635]
  },
  {
    name: "referral_program",
    env: "prod",
    evaluations: 1700,
    enabled: 700,
    disabled: 1000,
    apiRequests: 2400,
    uniqueUsers: 980,
    variants: undefined,
    topRules: [
      { id: "country-US", count: 620 },
      { id: "fallthrough", count: 520 }
    ],
    trend: [210, 230, 240, 260, 250, 255, 255]
  },
  {
    name: "onboarding_ui",
    env: "stage",
    evaluations: 1000,
    enabled: 480,
    disabled: 520,
    apiRequests: 1300,
    uniqueUsers: 510,
    variants: [
      { key: "A", count: 520 },
      { key: "B", count: 480 }
    ],
    topRules: [{ id: "first-session", count: 560 }, { id: "fallthrough", count: 340 }],
    trend: [120, 135, 140, 130, 150, 165, 160]
  }
];

// small helper
function pct(num: number, den: number) {
  if (!den) return 0;
  return Math.round((num / den) * 1000) / 10; // 1 decimal
}

export default function AnalyticsPage() {
  const [env, setEnv] = useState<EnvKey | "all">("all");
  const [range, setRange] = useState<"24h" | "7d" | "30d">("7d");
  const [selected, setSelected] = useState<string | null>(null);

  const flags = useMemo(
    () => (env === "all" ? MOCK : MOCK.filter(f => f.env === env)),
    [env]
  );

  const overall = useMemo(() => {
    const totals = flags.reduce(
      (acc, f) => {
        acc.evaluations += f.evaluations;
        acc.enabled += f.enabled;
        acc.disabled += f.disabled;
        acc.api += f.apiRequests;
        acc.users += f.uniqueUsers;
        return acc;
      },
      { evaluations: 0, enabled: 0, disabled: 0, api: 0, users: 0 }
    );
    return totals;
  }, [flags]);

  const selectedFlag = useMemo(
    () => flags.find(f => f.name === selected) || null,
    [flags, selected]
  );

  function exportCsv() {
    // minimal CSV from overall + per-flag
    const header = ["flag", "env", "evaluations", "enabled", "disabled", "apiRequests", "uniqueUsers"];
    const rows = flags.map(f => [f.name, f.env, f.evaluations, f.enabled, f.disabled, f.apiRequests, f.uniqueUsers]);
    const csv = [header.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `flag-analytics-${env}-${range}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className={styles.wrapper}>
      {/* Header */}
      <div className={styles.headerRow}>
        <div className={styles.headerTitle}>Feature Flag Analytics</div>
        <div className={styles.headerControls}>
          <select className={styles.select} value={env} onChange={(e) => setEnv(e.target.value as any)}>
            <option value="all">All env</option>
            <option value="dev">dev</option>
            <option value="stage">stage</option>
            <option value="prod">prod</option>
          </select>
          <select className={styles.select} value={range} onChange={(e) => setRange(e.target.value as any)}>
            <option value="24h">Last 24h</option>
            <option value="7d">Last 7d</option>
            <option value="30d">Last 30d</option>
          </select>
          <button className={styles.csvBtn} onClick={exportCsv}>Export CSV</button>
        </div>
      </div>

      {/* Overall section (MUST-HAVE KPIs) */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>Overview</div>
        <div className={styles.kpiGrid}>
          <Kpi label="Total evaluations" value={overall.evaluations.toLocaleString()} />
          <Kpi label="Enabled %" value={`${pct(overall.enabled, overall.evaluations)}%`} />
          <Kpi label="API requests" value={overall.api.toLocaleString()} />
          <Kpi label="Unique users" value={overall.users.toLocaleString()} />
        </div>
      </div>

      {/* Flags grid */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>Per‑flag</div>
        <div className={styles.flagsGrid}>
          {flags.map((f) => (
            <div key={f.name} className={styles.flagCard}>
              <div className={styles.flagHeader}>
                <span className={styles.flagName}>{f.name}</span>
                <span className={styles.envTag}>{f.env}</span>
              </div>

              <div className={styles.miniStats}>
                <div className={styles.miniRow}>
                  <span className={styles.dim}>Evaluations</span>
                  <span className={styles.val}>{f.evaluations.toLocaleString()}</span>
                </div>
                <div className={styles.miniRow}>
                  <span className={styles.dim}>Enabled %</span>
                  <span className={styles.val}>{pct(f.enabled, f.evaluations)}%</span>
                </div>
                <div className={styles.miniRow}>
                  <span className={styles.dim}>API</span>
                  <span className={styles.val}>{f.apiRequests.toLocaleString()}</span>
                </div>
              </div>

              <Sparkline data={f.trend} />

              {f.variants && f.variants.length > 0 && (
                <div className={styles.variantRow}>
                  {f.variants.map(v => (
                    <span key={v.key} className={styles.variantPill}>
                      {v.key}: {pct(v.count, f.variants!.reduce((a,b)=>a+b.count,0))}%
                    </span>
                  ))}
                </div>
              )}

              <button className={styles.detailBtn} onClick={() => setSelected(f.name)}>
                View details
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Selected flag detail (drawer style, no horizontal scroll) */}
      {selectedFlag && (
        <div className={styles.detailDrawer}>
          <div className={styles.detailHeader}>
            <div>
              <div className={styles.detailTitle}>{selectedFlag.name}</div>
              <div className={styles.detailSub}>Environment: <span className={styles.envTag}>{selectedFlag.env}</span></div>
            </div>
            <button className={styles.closeBtn} onClick={() => setSelected(null)}>✕</button>
          </div>

          <div className={styles.detailGrid}>
            <Kpi label="Evaluations" value={selectedFlag.evaluations.toLocaleString()} />
            <Kpi label="Enabled" value={`${selectedFlag.enabled.toLocaleString()} (${pct(selectedFlag.enabled, selectedFlag.evaluations)}%)`} />
            <Kpi label="Disabled" value={`${selectedFlag.disabled.toLocaleString()} (${pct(selectedFlag.disabled, selectedFlag.evaluations)}%)`} />
            <Kpi label="Unique users" value={selectedFlag.uniqueUsers.toLocaleString()} />
          </div>

          <div className={styles.detailBlocks}>
            <div className={styles.block}>
              <div className={styles.blockTitle}>Variant distribution</div>
              {selectedFlag.variants?.length ? (
                <div className={styles.variantRowLarge}>
                  {selectedFlag.variants.map(v => (
                    <span key={v.key} className={styles.variantPill}>
                      {v.key}: {pct(v.count, selectedFlag.variants!.reduce((a,b)=>a+b.count,0))}%
                    </span>
                  ))}
                </div>
              ) : (
                <div className={styles.dim}>No variants for this flag.</div>
              )}
            </div>

            <div className={styles.block}>
              <div className={styles.blockTitle}>Top rules matched</div>
              {selectedFlag.topRules?.length ? (
                <ul className={styles.ruleList}>
                  {selectedFlag.topRules.map(r => (
                    <li key={r.id}><code className={styles.code}>{r.id}</code> — {r.count.toLocaleString()}</li>
                  ))}
                </ul>
              ) : (
                <div className={styles.dim}>No rule match data.</div>
              )}
            </div>

            <div className={styles.block}>
              <div className={styles.blockTitle}>Recent trend</div>
              <Sparkline data={selectedFlag.trend} big />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// -------- small components --------
function Kpi({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className={styles.kpi}>
      <div className={styles.kpiLabel}>{label}</div>
      <div className={styles.kpiValue}>{value}</div>
    </div>
  );
}

function Sparkline({ data, big = false }: { data: number[]; big?: boolean }) {
  const max = Math.max(...data, 1);
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * 100;
    const y = 100 - (v / max) * 100;
    return `${x},${y}`;
  }).join(" ");
  return (
    <div className={big ? styles.sparkWrapBig : styles.sparkWrap}>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none">
        <polyline points={pts} fill="none" stroke="currentColor" strokeWidth="4" />
      </svg>
    </div>
  );
}

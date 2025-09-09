"use client";
import React, { useMemo, useState } from "react";
import styles from "./AuditLogsPage.module.css";

type EnvKey = "dev" | "stage" | "prod";
type EventKind =
  | "flag.created"
  | "flag.updated"
  | "flag.deleted"
  | "flag.enabled"
  | "flag.disabled"
  | "rule.added"
  | "rule.updated"
  | "rule.removed"
  | "rollout.changed"
  | "flag.rolled_back"
  | "sdk.key.created"
  | "sdk.key.rotated"
  | "sdk.key.revoked"
  | "sdk.key.restored"
  | "member.invited"
  | "member.removed"
  | "member.role_changed"
  | "workspace.updated"
  | "api_token.generated"
  | "api_token.revoked"
  | "plan.changed"
  | "workspace.deleted"
  | "cr.opened"
  | "cr.approved"
  | "cr.rejected";

type LogRow = {
  id: string;
  ts: string; // ISO
  timeLabel: string; // "4 min ago" (demo)
  actor: string; // user who did it
  env?: EnvKey; // affected env (if any)
  flag?: string; // affected flag (if any)
  kind: EventKind;
  title: string; // human summary
  before?: any; // JSON or string
  after?: any; // JSON or string
  meta?: Record<string, any>; // extras (ip, userAgent, keyId, crId…)
};

/** -----------------------------
 * MOCK LOGS – examples for each kind
 * ----------------------------- */
const LOGS: LogRow[] = [
  // FLAG lifecycle
  {
    id: "evt_101",
    ts: "2025-08-15T08:30:00Z",
    timeLabel: "4 min ago",
    actor: "Deepansh",
    env: "prod",
    flag: "dark_mode_v2",
    kind: "flag.enabled",
    title: "Flag toggled ON",
    before: { enabled: false },
    after: { enabled: true },
    meta: { ip: "203.0.113.10" }
  },
  {
    id: "evt_102",
    ts: "2025-08-15T07:40:00Z",
    timeLabel: "54 min ago",
    actor: "Ankit",
    env: "stage",
    flag: "onboarding_ui",
    kind: "flag.updated",
    title: "Flag description updated",
    before: { description: "Old desc" },
    after: { description: "Show new onboarding to 50%" }
  },
  {
    id: "evt_103",
    ts: "2025-08-15T06:10:00Z",
    timeLabel: "2 hrs ago",
    actor: "Sana",
    env: "dev",
    flag: "search_v3",
    kind: "flag.created",
    title: "Flag created",
    after: { key: "search_v3", enabled: false, rules: [] }
  },
  {
    id: "evt_104",
    ts: "2025-08-14T18:10:00Z",
    timeLabel: "21 hrs ago",
    actor: "Ravi",
    env: "prod",
    flag: "legacy_checkout",
    kind: "flag.deleted",
    title: "Flag deleted",
    before: { key: "legacy_checkout" }
  },

  // TARGETING & ROLLOUT
  {
    id: "evt_201",
    ts: "2025-08-15T05:40:00Z",
    timeLabel: "2.5 hrs ago",
    actor: "Ankit",
    env: "prod",
    flag: "dark_mode_v2",
    kind: "rule.updated",
    title: "Rule updated",
    before: { ruleId: "geo-IN", text: "user.country == 'IN'" },
    after: { ruleId: "geo-IN", text: "user.country in ['IN', 'US']" }
  },
  {
    id: "evt_202",
    ts: "2025-08-15T05:38:00Z",
    timeLabel: "2.5 hrs ago",
    actor: "Ankit",
    env: "prod",
    flag: "dark_mode_v2",
    kind: "rollout.changed",
    title: "Rollout changed 10% → 50%",
    before: { percent: 10, salt: "v1" },
    after: { percent: 50, salt: "v1" }
  },
  {
    id: "evt_203",
    ts: "2025-08-15T03:10:00Z",
    timeLabel: "5 hrs ago",
    actor: "Sana",
    env: "stage",
    flag: "onboarding_ui",
    kind: "rule.added",
    title: "Rule added",
    after: { ruleId: "first-session", text: "user.sessions == 1" }
  },
  {
    id: "evt_204",
    ts: "2025-08-15T02:40:00Z",
    timeLabel: "5.5 hrs ago",
    actor: "Sana",
    env: "stage",
    flag: "onboarding_ui",
    kind: "rule.removed",
    title: "Rule removed",
    before: { ruleId: "plan-free", text: "user.plan == 'free'" }
  },
  {
    id: "evt_205",
    ts: "2025-08-14T15:12:00Z",
    timeLabel: "1 day ago",
    actor: "Ops Bot",
    env: "prod",
    flag: "dark_mode_v2",
    kind: "flag.rolled_back",
    title: "Rolled back to version 12",
    before: { version: 13 },
    after: { version: 12 }
  },

  // SDK KEYS
  {
    id: "evt_301",
    ts: "2025-08-15T01:00:00Z",
    timeLabel: "7 hrs ago",
    actor: "Ravi",
    env: "prod",
    kind: "sdk.key.rotated",
    title: "Server key rotated",
    before: { keyId: "srv_abc", last4: "5pQz" },
    after: { keyId: "srv_def", last4: "9Lm2" },
    meta: { type: "server" }
  },
  {
    id: "evt_302",
    ts: "2025-08-14T23:20:00Z",
    timeLabel: "9 hrs ago",
    actor: "Ravi",
    env: "prod",
    kind: "sdk.key.revoked",
    title: "Client key revoked",
    before: { keyId: "cli_987", last4: "xT3b" },
    meta: { type: "client", reason: "leaked on CI logs" }
  },
  {
    id: "evt_303",
    ts: "2025-08-14T22:10:00Z",
    timeLabel: "10 hrs ago",
    actor: "Ravi",
    env: "prod",
    kind: "sdk.key.restored",
    title: "Client key restored",
    after: { keyId: "cli_987", last4: "xT3b" },
    meta: { type: "client" }
  },
  {
    id: "evt_304",
    ts: "2025-08-14T20:50:00Z",
    timeLabel: "12 hrs ago",
    actor: "Ravi",
    env: "stage",
    kind: "sdk.key.created",
    title: "New server key created",
    after: { keyId: "srv_new", last4: "Qs7p" }
  },

  // MEMBERS / TEAM
  {
    id: "evt_401",
    ts: "2025-08-14T18:00:00Z",
    timeLabel: "14 hrs ago",
    actor: "Deepansh",
    kind: "member.invited",
    title: "Invited member",
    after: { email: "neha@example.com", role: "viewer" }
  },
  {
    id: "evt_402",
    ts: "2025-08-14T17:20:00Z",
    timeLabel: "15 hrs ago",
    actor: "Deepansh",
    kind: "member.role_changed",
    title: "Role changed",
    before: { email: "ravi@example.com", role: "developer" },
    after: { email: "ravi@example.com", role: "ops" }
  },
  {
    id: "evt_403",
    ts: "2025-08-14T16:40:00Z",
    timeLabel: "16 hrs ago",
    actor: "Deepansh",
    kind: "member.removed",
    title: "Removed member",
    before: { email: "olduser@example.com" }
  },

  // WORKSPACE / SECURITY / BILLING
  {
    id: "evt_501",
    ts: "2025-08-14T12:30:00Z",
    timeLabel: "20 hrs ago",
    actor: "Deepansh",
    kind: "workspace.updated",
    title: "Workspace name updated",
    before: { name: "Nerdeep Labs" },
    after: { name: "Nerdeep" }
  },
  {
    id: "evt_502",
    ts: "2025-08-14T11:50:00Z",
    timeLabel: "21 hrs ago",
    actor: "Deepansh",
    kind: "api_token.generated",
    title: "Global admin token generated",
    after: { tokenPrefix: "adm_live_", last4: "R7xK" }
  },
  {
    id: "evt_503",
    ts: "2025-08-14T11:40:00Z",
    timeLabel: "21 hrs ago",
    actor: "Deepansh",
    kind: "api_token.revoked",
    title: "Global admin token revoked",
    before: { tokenPrefix: "adm_live_", last4: "Qp9Z" }
  },
  {
    id: "evt_504",
    ts: "2025-08-14T10:00:00Z",
    timeLabel: "23 hrs ago",
    actor: "Billing Bot",
    kind: "plan.changed",
    title: "Plan changed Free → Pro",
    before: { plan: "Free" },
    after: { plan: "Pro" }
  },
  // (Destructive) Workspace delete – example only; normally appears in a different audit export
  {
    id: "evt_505",
    ts: "2025-08-13T14:00:00Z",
    timeLabel: "2 days ago",
    actor: "Owner",
    kind: "workspace.deleted",
    title: "Workspace deleted",
    before: { workspaceId: "ws_12345" }
  },

  // APPROVALS (Change Requests)
  {
    id: "evt_601",
    ts: "2025-08-14T08:40:00Z",
    timeLabel: "1 day ago",
    actor: "Ankit",
    env: "prod",
    flag: "dark_mode_v2",
    kind: "cr.opened",
    title: "CR opened for rollout 10% → 50%",
    after: { toVersion: 14, diff: { rolloutPercent: { from: 10, to: 50 } } }
  },
  {
    id: "evt_602",
    ts: "2025-08-14T09:05:00Z",
    timeLabel: "1 day ago",
    actor: "Ravi",
    env: "prod",
    flag: "dark_mode_v2",
    kind: "cr.approved",
    title: "CR approved",
    after: { versionPublished: 14, reviewers: ["Ravi"] }
  },
  {
    id: "evt_603",
    ts: "2025-08-14T09:06:00Z",
    timeLabel: "1 day ago",
    actor: "System",
    env: "prod",
    flag: "dark_mode_v2",
    kind: "flag.updated",
    title: "Change published to prod",
    before: { rolloutPercent: 10 },
    after: { rolloutPercent: 50 }
  }
];

// Filter lists from data
const USERS = ["All", ...Array.from(new Set(LOGS.map((l) => l.actor)))];
const FLAGS = [
  "All",
  ...Array.from(new Set(LOGS.map((l) => l.flag).filter(Boolean)))
];
const TYPES = [
  "All",
  "Flag",
  "Targeting",
  "SDK Keys",
  "Members",
  "Workspace",
  "Approvals"
] as const;

// Map kind → human category
function kindCategory(kind: EventKind): (typeof TYPES)[number] {
  if (kind.startsWith("flag.")) return "Flag";
  if (kind.startsWith("rule.") || kind === "rollout.changed")
    return "Targeting";
  if (kind.startsWith("sdk.key")) return "SDK Keys";
  if (kind.startsWith("member.")) return "Members";
  if (kind.startsWith("cr.")) return "Approvals";
  return "Workspace";
}

export default function AuditLogsPage() {
  const [user, setUser] = useState("All");
  const [flag, setFlag] = useState("All");
  const [type, setType] = useState<(typeof TYPES)[number]>("All");
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return LOGS.filter((l) => {
      if (user !== "All" && l.actor !== user) return false;
      if (flag !== "All" && l.flag !== flag) return false;
      if (type !== "All" && kindCategory(l.kind) !== type) return false;

      if (query.trim()) {
        const q = query.toLowerCase();
        const hay =
          `${l.id} ${l.actor} ${l.title} ${l.flag ?? ""} ${l.env ?? ""} ${JSON.stringify(l.before) ?? ""} ${JSON.stringify(l.after) ?? ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [user, flag, type, query]);

  function copy(text: string) {
    navigator.clipboard.writeText(text);
  }

  function exportCsv() {
    const header = ["id", "ts", "actor", "env", "flag", "kind", "title"];
    const rows = filtered.map((l) => [
      l.id,
      l.ts,
      l.actor,
      l.env ?? "",
      l.flag ?? "",
      l.kind,
      l.title.replace(/,/g, ";")
    ]);
    const csv = [header.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "audit.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className={styles.wrapper}>
      {/* Header */}
      <div className={styles.headerRow}>
        <div className={styles.headerTitle}>Audit Logs</div>
        <div className={styles.headerActions}>
          <input
            className={styles.search}
            placeholder="Search events, flags, users…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button className={styles.csvBtn} onClick={exportCsv}>
            Export CSV
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className={styles.filters}>
        <select
          className={styles.filterSelect}
          value={user}
          onChange={(e) => setUser(e.target.value)}
        >
          {USERS.map((u) => (
            <option key={u}>{u}</option>
          ))}
        </select>
        <select
          className={styles.filterSelect}
          value={flag}
          onChange={(e) => setFlag(e.target.value)}
        >
          {FLAGS.map((f) => (
            <option key={f}>{f}</option>
          ))}
        </select>
        <select
          className={styles.filterSelect}
          value={type}
          onChange={(e) => setType(e.target.value as any)}
        >
          {TYPES.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
      </div>

      {/* Timeline */}
      {filtered.length > 0 ? (
        <div className={styles.timeline}>
          {filtered.map((log) => {
            const isOpen = openId === log.id;
            return (
              <div className={styles.logItem} key={log.id}>
                <div className={styles.logMeta}>
                  <span
                    className={
                      styles.badgeCat +
                      " " +
                      styles[
                        "cat_" +
                          kindCategory(log.kind)
                            .toLowerCase()
                            .replace(/\s/g, "")
                      ]
                    }
                  >
                    {kindCategory(log.kind)}
                  </span>
                  {log.env && <span className={styles.envTag}>{log.env}</span>}
                  {log.flag && (
                    <span className={styles.flagTag}>{log.flag}</span>
                  )}
                  <span className={styles.logTitle}>{log.title}</span>
                  <span className={styles.logUser}>by {log.actor}</span>
                  <span className={styles.logTime}>{log.timeLabel}</span>
                </div>

                {/* Controls */}
                <div className={styles.logControls}>
                  <span className={styles.eventId}>
                    <code>{log.id}</code>
                    <button
                      className={styles.copyBtn}
                      onClick={() => copy(log.id)}
                      title="Copy event id"
                    >
                      📋
                    </button>
                  </span>
                  <button
                    className={styles.detailBtn}
                    onClick={() => setOpenId(isOpen ? null : log.id)}
                  >
                    {isOpen ? "Hide details" : "View details"}
                  </button>
                </div>

                {/* Diff / Details */}
                {isOpen && (
                  <div className={styles.details}>
                    <div className={styles.detailCols}>
                      <div>
                        <div className={styles.detailLabel}>Before</div>
                        <pre className={styles.pre}>{fmt(log.before)}</pre>
                      </div>
                      <div>
                        <div className={styles.detailLabel}>After</div>
                        <pre className={styles.pre}>{fmt(log.after)}</pre>
                      </div>
                    </div>
                    {log.meta && (
                      <div className={styles.metaGrid}>
                        {Object.entries(log.meta).map(([k, v]) => (
                          <div key={k} className={styles.metaItem}>
                            <div className={styles.metaKey}>{k}</div>
                            <div className={styles.metaVal}>
                              <code>
                                {typeof v === "string" ? v : JSON.stringify(v)}
                              </code>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div className={styles.empty}>No events match your filters.</div>
          )}
        </div>
      ) : (
        <div className="text-center">No Logs</div>
      )}
    </div>
  );
}

// helpers
function fmt(v: any) {
  if (v == null) return "—";
  if (typeof v === "string") return v;
  try {
    return JSON.stringify(v, null, 2);
  } catch {
    return String(v);
  }
}

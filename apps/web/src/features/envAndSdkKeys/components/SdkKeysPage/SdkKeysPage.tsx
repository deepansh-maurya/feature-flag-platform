"use client";

import React, { useMemo, useState } from "react";
import styles from "./SdkKeysPage.module.css";

type KeyType = "server" | "client";
type KeyStatus = "active" | "revoked";

type SdkKey = {
  type: KeyType;
  key: string;
  created: string;
  lastUsed: string;
  usage: number;
  limit: number;
  status: KeyStatus;
  lastRotated?: string;
  note?: string;
  // Policy fields (display-only for now)
  ipAllowlist?: string[]; // for server keys
  referrerAllowlist?: string[]; // for client keys
};

type EnvRow = {
  env: "dev" | "stage" | "prod";
  created: string;
  keys: SdkKey[]; // exactly two by default: server + client
};

// ----- mock data -----
const initialData: EnvRow[] = [
  {
    env: "dev",
    created: "2024-07-01",
    keys: [
      {
        type: "server",
        key: "srv-dev-2k5JxzZb7Yp4h",
        created: "2024-07-01",
        lastUsed: "2024-08-07 13:22",
        usage: 850,
        limit: 10000,
        status: "active",
        ipAllowlist: ["127.0.0.1", "10.0.0.0/8"]
      },
      {
        type: "client",
        key: "cli-dev-8Qm9Kp1cYt2",
        created: "2024-07-01",
        lastUsed: "2024-08-07 13:25",
        usage: 350,
        limit: 10000,
        status: "active",
        referrerAllowlist: ["http://localhost:3000", "https://dev.example.com"]
      }
    ]
  },
  {
    env: "stage",
    created: "2024-07-01",
    keys: [
      {
        type: "server",
        key: "srv-stage-jqB99sZZgF7",
        created: "2024-07-01",
        lastUsed: "2024-08-05 08:40",
        usage: 540,
        limit: 5000,
        status: "active",
        ipAllowlist: ["10.20.0.0/16"]
      },
      {
        type: "client",
        key: "cli-stage-V3p77rQa1Z",
        created: "2024-07-02",
        lastUsed: "2024-08-05 09:12",
        usage: 200,
        limit: 5000,
        status: "active",
        referrerAllowlist: ["https://stage.example.com"]
      }
    ]
  },
  {
    env: "prod",
    created: "2024-07-01",
    keys: [
      {
        type: "server",
        key: "srv-prod-XtW0m8aAkpQ",
        created: "2024-07-01",
        lastUsed: "2024-08-07 15:14",
        usage: 2600,
        limit: 25000,
        status: "active",
        ipAllowlist: ["203.0.113.12", "198.51.100.0/24"]
      },
      {
        type: "client",
        key: "cli-prod-pL0Qn6sTzR",
        created: "2024-07-01",
        lastUsed: "2024-08-07 15:10",
        usage: 700,
        limit: 25000,
        status: "active",
        referrerAllowlist: ["https://app.example.com"]
      }
    ]
  }
];

// ----- helpers -----
function randomKey(prefix: string) {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
  let s = "";
  for (let i = 0; i < 12; i++)
    s += alphabet[Math.floor(Math.random() * alphabet.length)];
  return `${prefix}-${s}`;
}
function formatPct(n: number) {
  if (!isFinite(n)) return "0%";
  const pct = Math.max(0, Math.min(100, n));
  return `${pct.toFixed(pct < 10 ? 2 : 1)}%`;
}

export default function SdkKeysPage() {
  const [rows, setRows] = useState<EnvRow[]>([]);
  const [revealed, setRevealed] = useState<Record<string, boolean>>({}); // map key string -> revealed?
  const [toast, setToast] = useState<string>("");

  function withToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 1700);
  }

  function handleCopyKey(key: string) {
    navigator.clipboard.writeText(key);
    withToast("Copied!");
  }

  function toggleReveal(key: string) {
    setRevealed((r) => ({ ...r, [key]: !r[key] }));
  }

  function handleRegenerate(env: EnvRow["env"], type: KeyType) {
    setRows((prev) =>
      prev.map((r) => {
        if (r.env !== env) return r;
        return {
          ...r,
          keys: r.keys.map((k) =>
            k.type === type
              ? {
                  ...k,
                  key: randomKey(`${type === "server" ? "srv" : "cli"}-${env}`),
                  lastRotated: new Date()
                    .toISOString()
                    .slice(0, 16)
                    .replace("T", " ")
                }
              : k
          )
        };
      })
    );
    withToast(`Regenerated ${type} key for ${env}`);
  }

  function handleRevoke(
    env: EnvRow["env"],
    type: KeyType,
    action: "revoke" | "restore"
  ) {
    setRows((prev) =>
      prev.map((r) => {
        if (r.env !== env) return r;
        return {
          ...r,
          keys: r.keys.map((k) =>
            k.type === type
              ? { ...k, status: action === "revoke" ? "revoked" : "active" }
              : k
          )
        };
      })
    );
    withToast(
      `${action === "revoke" ? "Revoked" : "Restored"} ${type} key for ${env}`
    );
  }

  // flatten rows for table display (one row per key)
  const flat = useMemo(
    () =>
      rows.flatMap((r) =>
        r.keys.map((k) => ({
          env: r.env,
          envCreated: r.created,
          ...k
        }))
      ),
    [rows]
  );

  return (
    <div className={styles.wrapper}>
      <div className={styles.headerRow}>
        <div className={styles.headerTitle}>SDK Keys</div>
      </div>

      {toast && <div className={styles.toast}>{toast}</div>}

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead className="head">
            {flat.length > 0 && (
              <tr>
                <th>Environment</th>
                <th>Type</th>
                <th>SDK Key</th>
                <th>Created</th>
                <th>Last Used</th>
                <th>Usage</th>
                <th>Status</th>
                <th>Policies</th>
                <th style={{ textAlign: "center" }}>Actions</th>
              </tr>
            )}
          </thead>
          <tbody className="body">
            {flat.length > 0 ? (
              flat.map((row) => {
                const pct = Math.min(100, (row.usage / row.limit) * 100);
                const masked = row.key.replace(/.(?=.{4})/g, "•");
                const show = revealed[row.key];
                return (
                  <tr key={`${row.env}-${row.type}`}>
                    <td>
                      <span className={styles.envTag}>{row.env}</span>
                    </td>
                    <td>
                      <span
                        className={
                          row.type === "server"
                            ? styles.typeServer
                            : styles.typeClient
                        }
                      >
                        {row.type}
                      </span>
                    </td>
                    <td className={styles.sdkKeyCell}>
                      <span className={styles.sdkKey}>
                        {show ? row.key : masked}
                      </span>
                      <button
                        className={styles.copyBtn}
                        onClick={() => handleCopyKey(row.key)}
                        title="Copy"
                      >
                        📋
                      </button>
                      <button
                        className={styles.eyeBtn}
                        onClick={() => toggleReveal(row.key)}
                        title={show ? "Hide" : "Reveal"}
                      >
                        {show ? "🙈" : "👁️"}
                      </button>
                    </td>
                    <td>
                      <div>{row.created}</div>
                      {row.lastRotated && (
                        <div className={styles.dim}>
                          rotated {row.lastRotated}
                        </div>
                      )}
                    </td>
                    <td>{row.lastUsed}</td>
                    <td>
                      <div className={styles.usageRow}>
                        <span className={styles.usageVal}>
                          {row.usage.toLocaleString()}
                        </span>
                        <span className={styles.usageLimit}>
                          / {row.limit.toLocaleString()}
                        </span>
                      </div>
                      <div className={styles.usageBar}>
                        <div
                          className={styles.usageFill}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <div className={styles.usagePct}>{formatPct(pct)}</div>
                    </td>
                    <td>
                      <span
                        className={
                          row.status === "active"
                            ? styles.statusActive
                            : styles.statusRevoked
                        }
                      >
                        {row.status}
                      </span>
                    </td>
                    <td className={styles.policyCell}>
                      {row.type === "server" && row.ipAllowlist?.length ? (
                        <div>
                          <span className={styles.pill}>IP</span>{" "}
                          <code className={styles.codeList}>
                            {row.ipAllowlist.join(", ")}
                          </code>
                        </div>
                      ) : null}
                      {row.type === "client" &&
                      row.referrerAllowlist?.length ? (
                        <div>
                          <span className={styles.pill}>Referrers</span>{" "}
                          <code className={styles.codeList}>
                            {row.referrerAllowlist.join(", ")}
                          </code>
                        </div>
                      ) : null}
                      {row.note && (
                        <div className={styles.dim}>note: {row.note}</div>
                      )}
                    </td>
                    <td className={styles.actionCol}>
                      <div className={styles.actionStack}>
                        <button
                          className={styles.regenBtn}
                          onClick={() => handleRegenerate(row.env, row.type)}
                        >
                          Regenerate
                        </button>
                        {row.status === "active" ? (
                          <button
                            className={styles.revokeBtn}
                            onClick={() =>
                              handleRevoke(row.env, row.type, "revoke")
                            }
                          >
                            Revoke
                          </button>
                        ) : (
                          <button
                            className={styles.restoreBtn}
                            onClick={() =>
                              handleRevoke(row.env, row.type, "restore")
                            }
                          >
                            Restore
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td className="text-center">No Keys</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className={styles.hintBox}>
        <div className={styles.hintTitle}>Notes</div>
        <ul className={styles.hintList}>
          <li>
            <strong>Server keys</strong> should be kept secret and can be
            IP‑restricted.
          </li>
          <li>
            <strong>Client keys</strong> are public and can be
            referrer‑restricted.
          </li>
          <li>
            <strong>Regenerate</strong> rotates the key; update your services
            accordingly.
          </li>
          <li>
            <strong>Revoke</strong> immediately disables a key (grace logic is
            backend‑side).
          </li>
        </ul>
      </div>
    </div>
  );
}

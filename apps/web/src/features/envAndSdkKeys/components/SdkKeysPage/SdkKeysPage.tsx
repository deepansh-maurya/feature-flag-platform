"use client";
import React, { useMemo, useState, useEffect, useRef } from "react";
import { useEnvironments, useSdkKeys } from "../../hook";
import styles from "./SdkKeysPage.module.css";
import { EnvRow, KeyStatus, KeyType, SdkKey } from "../../types";


function maskKey(key: string) {
  if (!key) return "—";
  return key.replace(/.(?=.{4})/g, "•");
}

function keyId(env: EnvRow["env"], type: KeyType) {
  return `${env}:${type}`;
}

export default function SdkKeysPage({ projectId }: { projectId?: string }) {
  const [toast, setToast] = useState<string>("");
  const [revealUntil, setRevealUntil] = useState<Record<string, number>>({});
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [, force] = useState(0);

  function withToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 1700);
  }

  function findKey(r: EnvRow, type: KeyType) {
    const found = r.keys.find((k) => k.type === type);
    if (found) return found;
    return {
      type,
      key: "",
      created: "",
      lastUsed: "",
      usage: 0,
      limit: 0,
      status: "revoked"
    } as SdkKey;
  }

  function setRevealWindow(env: EnvRow["env"], type: KeyType, ms = 4000) {
    const id = keyId(env, type);
    const until = Date.now() + ms;
    setRevealUntil((prev) => ({ ...prev, [id]: until }));
    setTimeout(() => force((v) => v + 1), ms + 50);
  }

  function handleCopyKey(k: string) {
    if (!k) return;
    navigator.clipboard.writeText(k);
    withToast("Copied!");
  }

  function handleRegenerate(env: EnvRow["env"], type: KeyType) {
    setRevealWindow(env, type, 4000);
    setOpenMenu(null);
    withToast(`Regenerated ${type} key for ${env}`);
  }

  function handleRevoke(env: EnvRow["env"], type: KeyType) {
    setOpenMenu(null);
    withToast(`Revoked ${type} key for ${env}`);
  }

  const pageRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!pageRef.current) return;
      if (!pageRef.current.contains(e.target as Node)) setOpenMenu(null);
    }
    window.addEventListener("click", onClick);
    return () => window.removeEventListener("click", onClick);
  }, []);

  const envQuery = useEnvironments(projectId);
  const keysQuery = useSdkKeys(projectId);

  console.log(envQuery, keysQuery);

  const envs = useMemo(() => {

    if (Array.isArray(envQuery.data)) {
      const envDtos = envQuery.data;
      const keys = Array.isArray(keysQuery.data) ? keysQuery.data : [];

      const map = new Map<string, SdkKey[]>();
      for (const k of keys) {
        const envKey = (k as any).envKey ?? "";
        const sk: SdkKey = {
          type: k.type as KeyType as KeyType,
          key: (k as any).key ?? "",
          created: k.createdAt
            ? new Date(k.createdAt as any)
                .toISOString()
                .slice(0, 16)
                .replace("T", " ")
            : "",
          lastUsed: k.lastUsedAt
            ? new Date(k.lastUsedAt as any)
                .toISOString()
                .slice(0, 16)
                .replace("T", " ")
            : "",
          usage: 0,
          limit: 0,
          status: (k.status as KeyStatus) ?? "active",
          lastRotated: k.rotatedAt
            ? new Date(k.rotatedAt as any)
                .toISOString()
                .slice(0, 16)
                .replace("T", " ")
            : undefined
        };
        const arr = map.get(envKey) ?? [];
        arr.push(sk);
        map.set(envKey, arr);
      }

      return envDtos.map((ed) => ({
        env: (ed as any).key,
        created: (ed as any).createdAt
          ? new Date((ed as any).createdAt)
              .toISOString()
              .slice(0, 16)
              .replace("T", " ")
          : "",
        keys: map.get((ed as any).key) ?? []
      }));
    }

    return []
  }, [envQuery.data, keysQuery.data]);

  const KeyCell = ({ row, type }: { row: EnvRow; type: KeyType }) => {
    const k = findKey(row, type);
    const id = keyId(row.env, type);
    const showing = (revealUntil[id] ?? 0) > Date.now();
    const display = showing ? k.key : maskKey(k.key);
    const revokeDisabled = !k.key || k.status === "revoked";
    const isMenuOpen = openMenu === id;

    return (
      <div className={styles.keyCell}>
        <span className={styles.keyText}>{display}</span>

        {showing && k.key ? (
          <button
            className={styles.copyBtn}
            onClick={() => handleCopyKey(k.key)}
            title="Copy"
          >
            Copy
          </button>
        ) : null}

        <button
          className={styles.kebab}
          onClick={(e) => {
            e.stopPropagation();
            setOpenMenu(isMenuOpen ? null : id);
          }}
          title="Actions"
        >
          ⋯
        </button>

        {isMenuOpen && (
          <div className={styles.menu} onClick={(e) => e.stopPropagation()}>
            <button
              className={styles.menuItem}
              onClick={() => handleRegenerate(row.env, type)}
            >
              Regenerate
            </button>
            <button
              className={`${styles.menuItem} ${revokeDisabled ? styles.menuItemDisabled : ""}`}
              onClick={() => !revokeDisabled && handleRevoke(row.env, type)}
              disabled={revokeDisabled}
              title={revokeDisabled ? "Key not present" : "Revoke this key"}
            >
              Revoke
            </button>
          </div>
        )}

        {k.status === "revoked" && (
          <span className={styles.revokedBadge}>revoked</span>
        )}
      </div>
    );
  };

  return (
    <div className={styles.wrapper} ref={pageRef}>
      <div className={styles.headerRow}>
        <div className={styles.headerTitle}>SDK Keys</div>
      </div>

      {toast && <div className={styles.toast}>{toast}</div>}

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead className="head">
            <tr>
              <th>Environment</th>
              <th>Server key</th>
              <th>Client key</th>
              <th>Created at</th>
            </tr>
          </thead>
          <tbody className="body">
            {envs.map((row) => (
              <tr key={row.env}>
                <td>
                  <span className={styles.envTag}>{row.env}</span>
                </td>
                <td>
                  <KeyCell row={row} type="server" />
                </td>
                <td>
                  <KeyCell row={row} type="client" />
                </td>
                <td>{row.created}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className={styles.hintBox}>
        <div className={styles.hintTitle}>Notes</div>
        <ul className={styles.hintList}>
          <li>
            <strong>Server keys</strong> live on your backend; lock them by IPs.
          </li>
          <li>
            <strong>Client keys</strong> are public; restrict via referrers.
          </li>
          <li>
            <strong>Regenerate</strong> shows the new key for 4s (one-time
            copy), then masks.
          </li>
          <li>
            <strong>Revoke</strong> disables the key immediately; you can only
            create a new one by regenerating.
          </li>
        </ul>
      </div>
    </div>
  );
}

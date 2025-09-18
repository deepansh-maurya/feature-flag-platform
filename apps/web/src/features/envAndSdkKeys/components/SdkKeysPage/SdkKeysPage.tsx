"use client";
import React, { useMemo, useState, useEffect, useRef } from "react";
import {
  useEnvironments,
  useSdkKeys,
  useIssueSdkKey,
  useRotateSdkKey,
  useRevokeSdkKey
} from "../../hook";
import styles from "./SdkKeysPage.module.css";
import { EnvRow, KeyStatus, KeyType, SdkKey } from "../../types";
import { AppConst } from "@/app/constants";
import { useAppContext } from "@/src/shared/context/AppContext";

function maskKey(key: string) {
  if (!key) return "";
  return "********";
}

function randomKey(prefix: string) {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
  let s = "";
  for (let i = 0; i < 12; i++)
    s += alphabet[Math.floor(Math.random() * alphabet.length)];
  return `${prefix}-${s}`;
}

function keyId(env: EnvRow["env"], type: KeyType) {
  return `${env}:${type}`;
}

export default function SdkKeysPage() {
  const { workspace } = useAppContext();
  const projectId = sessionStorage.getItem(AppConst.curPro)!;
  const [toast, setToast] = useState<string>("");
  const [revealUntil, setRevealUntil] = useState<Record<string, number>>({});
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [, force] = useState(0);
  const issueMutation = useIssueSdkKey(projectId ?? "");
  const rotateMutation = useRotateSdkKey(projectId ?? "");
  const revokeMutation = useRevokeSdkKey(projectId ?? "");
  const [revealPlain, setRevealPlain] = useState<Record<string, string>>({});

  function withToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 1700);
  }

  function findKey(r: EnvRow, type: KeyType) {
    console.log(r.keys);

    const found = r.keys.find((k) => k.type === type);
    console.log(found);

    if (found) return found;
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

  function handleRegenerate(env: EnvRow["id"], type: KeyType) {
    const id = keyId(env, type);
    // generate plaintext, reveal to user for a short time and send the hash to server
    const plain = randomKey(`${type === "server" ? "srv" : "cli"}-${env}`);
    setRevealPlain((p) => ({ ...p, [id]: plain }));
    setRevealWindow(env, type, 9000);
    setOpenMenu(null);

    (async () => {
      try {
        // const msgUint8 = new TextEncoder().encode(plain);
        // const hashBuffer = await crypto.subtle.digest("SHA-256", msgUint8);
        // const hashArray = Array.from(new Uint8Array(hashBuffer));
        // const hashHex = hashArray
        //   .map((b) => b.toString(16).padStart(2, "0"))
        //   .join("");

        const row = envs.find((r) => r.id === env);
        const existing = row?.keys.find((k) => k.type === type);
        console.log(existing);
        
        if (existing && existing.id) {
          await rotateMutation.mutateAsync({
            projectId,
            workspaceId: workspace?.id ?? "",
            envId: env,
            type: type as any,
            newKeyHash: plain,
            keepOldActive: false
          });
        } else {
          await issueMutation.mutateAsync({
            projectId,
            workspaceId: workspace?.id ?? "",
            envKey: env,
            type: type as any,
            key: plain
          }); 
        }

        withToast(`Regenerated ${type} key for ${env}`);
      } catch (e: any) {
        withToast(e?.message ?? "Failed to regenerate");
      } finally {
        setTimeout(
          () =>
            setRevealPlain((p) => {
              const c = { ...p };
              delete c[id];
              return c;
            }),
          4000
        );
      }
    })();
  }

  function handleRevoke(env: EnvRow["env"], type: KeyType) {
    setOpenMenu(null);
    const row = envs.find((r) => r.env === env);
    const k = row?.keys.find((x) => x.type === type);
    if (!k || !k.id) {
      withToast("No key to revoke");
      return;
    }

    revokeMutation.mutate(
      { sdkKeyId: k.id },
      {
        onSuccess() {
          withToast(`Revoked ${type} key for ${env}`);
        },
        onError(err: any) {
          withToast(err?.message ?? "Failed to revoke");
        }
      }
    );
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

  const envs = useMemo(() => {
    if (Array.isArray(envQuery.data)) {
      const envDtos = envQuery.data;
      const keys = Array.isArray(keysQuery.data) ? keysQuery.data : [];

      const map = new Map<string, SdkKey[]>();

      for (const k of keys) {
        // backend may return either `envId` (UUID) or `envKey` (string key); accept both
        const envKey =
          (k as any).envId ?? (k as any).envKey ?? (k as any).env ?? "";
        const sk: SdkKey = {
          type: k.type as KeyType as KeyType,
          id: (k as any).id ?? undefined,
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

      console.log(map);

      const dtos = envDtos.map((ed) => {
        const envId = (ed as any).id;
        const envKey = (ed as any).key;
        // try to find keys by env id first, then by env key
        const foundKeys = map.get(envId) ?? map.get(envKey) ?? [];
        console.log(foundKeys);

        return {
          env: envKey,
          created: (ed as any).createdAt
            ? new Date((ed as any).createdAt)
                .toISOString()
                .slice(0, 16)
                .replace("T", " ")
            : "",
          id: envId,
          keys: foundKeys
        } as EnvRow;
      });

      return dtos;
    }

    return [];
  }, [envQuery.data, keysQuery.data]);

  const KeyCell = ({ row, type }: { row: EnvRow; type: KeyType }) => {
    const k = findKey(row, type);
    const id = keyId(row.env, type);
    const showing = (revealUntil[id] ?? 0) > Date.now();
    const display =
      revealPlain[id] ?? (showing ? k?.key : maskKey(k?.key ?? ""));
    const revokeDisabled = !(k && k.key) || k?.status === "revoked";
    const isMenuOpen = openMenu === id;

    console.log(showing, display, k);
    return (
      <div className={styles.keyCell}>
        <span className={styles.keyText}>{display}</span>

        {showing && k?.key ? (
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
              onClick={() => handleRegenerate(row.id, type)}
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

        {k?.status == "revoked" && (
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

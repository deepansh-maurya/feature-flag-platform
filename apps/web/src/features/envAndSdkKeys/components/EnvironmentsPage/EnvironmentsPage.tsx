"use client";

import React, { useMemo, useState, useEffect } from "react";
import styles from "./EnvironmentsPage.module.css";
import CreateEnvModal from "./CreateEnvModel";
import LinkFlagsModal from "./LinkFlagsModal";
import { useFlags } from "@/src/features/flag/hooks";
import { AppConst } from "@/app/constants";
import {
  useEnvironments,
  useAddEnvironment
} from "@/src/features/envAndSdkKeys/hook";
import { useUpdateEnvironment, useDeleteEnvironment } from "@/src/features/envAndSdkKeys/hook";
import { useAppContext } from "@/src/shared/context/AppContext";
import { log } from "node:console";

export type Env = {
  id?: string;
  name: string;
  key?: string;
  isDefault: boolean;
  isProd?: boolean;
  sdkKeys?: { server: string; client?: string };
  linkedFlags: string[];
};

const initialEnvs: Env[] = [];

export default function EnvironmentsPage() {
  const [envs, setEnvs] = useState<Env[]>(initialEnvs);
  const [openCreate, setOpenCreate] = useState(false);

  // which row's “…” flags popover is open (null = none)
  const [openFlagsFor, setOpenFlagsFor] = useState<string | null>(null);

  // which env's Link Flags modal is open (by env id)
  const [openLinkModalFor, setOpenLinkModalFor] = useState<string | null>(null);

  const projectIdFromStorage = sessionStorage.getItem(AppConst.curPro)!;

  const { data: allFlags } = useFlags(projectIdFromStorage);

  const { workspace } = useAppContext();
  const { data: serverEnvs } = useEnvironments(projectIdFromStorage);
  const addEnvMutation = useAddEnvironment(projectIdFromStorage ?? "");
  const updateEnvMutation = useUpdateEnvironment(projectIdFromStorage ?? "");
  const deleteEnvMutation = useDeleteEnvironment(projectIdFromStorage ?? "");
  const [editingEnvId, setEditingEnvId] = useState<string | null>(null);

  // close the flags popover when clicking anywhere else
  useEffect(() => {
    if (openFlagsFor === null) return;
    const onDocClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const inPopover = !!target.closest(`#flags-popover-${openFlagsFor}`);
      const inBtn = !!target.closest(`[data-flags-btn="${openFlagsFor}"]`);
      if (!inPopover && !inBtn) setOpenFlagsFor(null);
    };
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, [openFlagsFor]);

  const envNames = useMemo(() => envs.map((e) => e.name.toLowerCase()), [envs]);
  const envKeys = useMemo(
    () => envs.map((e) => (e.key || e.name).toLowerCase()),
    [envs]
  );

  function setDefault(envId: string) {
    const idx = envs.findIndex((e) => e.id === envId);
    if (idx === -1) return;
    // If this environment is backed by the server, call update to set isDefault=true
    const target = envs[idx];
    if (target?.id && projectIdFromStorage) {
      // optimistic UI update
      const prev = envs;
      setEnvs((curr) => curr.map((e, i) => ({ ...e, isDefault: i === idx })));
      updateEnvMutation.mutate(
        { envId: target.id, body: { isDefault: true } },
        {
          onError: () => {
            // rollback
            setEnvs(prev);
          },
        }
      );
      return;
    }

    // fallback for local-only envs
    setEnvs((curr) => curr.map((e, i) => ({ ...e, isDefault: i === idx })));
  }

  function deleteEnv(envId: string) {
    const idx = envs.findIndex((e) => e.id === envId);
    if (idx === -1) return;
    if (envs[idx].isDefault) return;

    // optimistic remove
    const prev = envs;
    setEnvs((curr) => curr.filter((e) => e.id !== envId));

    if (projectIdFromStorage && envId) {
      deleteEnvMutation.mutate(
        { envId },
        {
          onError: () => setEnvs(prev),
        }
      );
      return;
    }
  }

  function addEnvFromModal(newEnv: Env) {
    console.log(projectIdFromStorage);

    if (projectIdFromStorage && workspace?.id) {
      addEnvMutation.mutate({
        projectId: projectIdFromStorage,
        workspaceId: workspace.id,
        isDefault: newEnv.isDefault,
        isProd: newEnv.isProd!,
        key: newEnv.key ?? newEnv.name.toLowerCase(),
        displayName: newEnv.name
      });
      return;
    }

    setEnvs((curr) => {
      const next = newEnv.isDefault
        ? curr.map((e) => ({ ...e, isDefault: false }))
        : curr;
      return [...next, newEnv];
    });
  }

  // sync with server list when it arrives
  useEffect(() => {
    if (!serverEnvs) return;
    const mapped: Env[] = serverEnvs.map((s) => ({
      id: s.id,
      name: s.displayName,
      key: s.key,
      isDefault: s.isDefault,
      isProd: s.isProd,
      linkedFlags: []
    }));
    setEnvs(mapped);
  }, [serverEnvs]);

  return (
    <div className={styles.wrapper}>
      <div className={styles.headerRow}>
        <div className={styles.headerTitle}>Environments</div>
        <button className={styles.addBtn} onClick={() => setOpenCreate(true)}>
          + Add Environment
        </button>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead className={styles.head}>
            {envs.length > 0 ? (
              <tr>
                <th>Name</th>
                <th>Key</th>
                <th>Default</th>
                <th>Linked Flags</th>
                <th style={{ textAlign: "center" }}>Actions</th>
              </tr>
            ) : (
              <tr>
                <th>No Envs</th>
              </tr>
            )}
          </thead>

          <tbody className={styles.body}>
            {(() => {
              // render production env first
              const prod = envs.find((e) => e.isProd);
              const rest = envs.filter((e) => !e.isProd);
              const display = prod ? [prod, ...rest] : envs;
              return display.map((env, idx) => {
              const moreThanTwo = env.linkedFlags.length > 2;
              const firstTwo = env.linkedFlags.slice(0, 2);

              return (
                <tr key={env.id ?? (env.key || env.name) + String(idx)} className={env.isProd ? styles.prodRow : ""}>
                  <td className={styles.envName}>
                    {env.name}
                    {env.isProd ? <span className={styles.prodBadge}>prod</span> : null}
                  </td>
                  <td className={styles.envName}>{env.key}</td>

                  <td>
                    {env.isDefault ? (
                      <span className={styles.defaultTag}>Default</span>
                    ) : (
                      <button
                        className={styles.setDefaultBtn}
                        onClick={() => setDefault(env.id ?? "")}
                        title="Set as default"
                      >
                        Set Default
                      </button>
                    )}
                  </td>

                  <td className={styles.flagsCell}>
                    {env.linkedFlags.length === 0 ? (
                      <span className={styles.noFlags}></span>
                    ) : (
                      <>
                        {firstTwo.map((flag) => (
                          <span className={styles.flagTag} key={flag}>
                            {flag}
                          </span>
                        ))}
                      </>
                    )}

                    {/* always show the ellipsis manage button */}
                    <button
                      className={styles.moreBtn}
                      data-flags-btn={env.id}
                      onClick={() =>
                        setOpenFlagsFor((open) => (open === env.id ? null : env.id ?? null))
                      }
                      aria-haspopup="dialog"
                      aria-expanded={openFlagsFor === env.id}
                      aria-label="Manage flags"
                      title="Manage flags"
                    >
                      …
                    </button>

                    {openFlagsFor === env.id && (
                      <div
                        id={`flags-popover-${env.id}`}
                        className={styles.popover}
                        role="dialog"
                      >
                        <div className={styles.popoverList}>
                          {env.linkedFlags.length === 0 ? (
                            <button
                              className={styles.popoverAction}
                              onClick={() => {
                                setOpenFlagsFor(null);
                                setOpenLinkModalFor(env.id ?? null);
                              }}
                            >
                              Link flags
                            </button>
                          ) : (
                            <>
                              {env.linkedFlags.map((flag) => (
                                <span
                                  className={styles.popoverBadge}
                                  key={flag}
                                >
                                  {flag}
                                </span>
                              ))}

                              <button
                                className={styles.popoverAction}
                                onClick={() => {
                                  setOpenFlagsFor(null);
                                  setOpenLinkModalFor(env.id ?? null);
                                }}
                              >
                                Manage linked flags
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </td>

                  <td className={styles.actionCol} style={{ display: "flex" }}>
                    <button
                      className={styles.deleteBtn}
                      style={{ display: "flex" }}
                      onClick={() => deleteEnv(env.id ?? "")}
                      title={env.isDefault ? "Can't delete default" : "Delete"}
                      disabled={env.isDefault}
                    >
                      🗑️
                    </button>
                    <button
                      className={styles.deleteBtn}
                      style={{ display: "flex", marginLeft: 8 }}
                      onClick={() => {
                        setEditingEnvId(env.id ?? null);
                        setOpenCreate(true);
                      }}
                      title="Edit"
                    >
                      ✏️
                    </button>
                  </td>
                </tr>
              );
              });
            })()}
          </tbody>
        </table>
      </div>

      {openCreate && (
        <CreateEnvModal
          open={openCreate}
          onClose={() => { setOpenCreate(false); setEditingEnvId(null); }}
          initial={editingEnvId !== null ? envs.find((e) => e.id === editingEnvId) : undefined}
          onCreate={(env) => {
            addEnvFromModal(env);
            setOpenCreate(false);
          }}
          onUpdate={(env) => {
            if (!projectIdFromStorage) return;
            const target = envs.find((e) => e.id === editingEnvId);
            if (!target || !target.id) return;
            updateEnvMutation.mutate({ envId: target.id, body: { displayName: env.name, isDefault: env.isDefault, isProd: env.isProd } });
            setOpenCreate(false);
            setEditingEnvId(null);
          }}
          existingNames={envNames}
          existingKeys={envKeys}
          cloneableEnvs={envs}
        />
      )}

      {openLinkModalFor !== null && (
        <LinkFlagsModal
          open={openLinkModalFor !== null}
          env={envs.find((e) => e.id === openLinkModalFor!)!}
          onClose={() => setOpenLinkModalFor(null)}
          onSave={(linked: string[]) => {
            setEnvs((curr) => curr.map((e) => (e.id === openLinkModalFor ? { ...e, linkedFlags: linked } : e)));
            setOpenLinkModalFor(null);
          }}
        />
      )}
    </div>
  );
}

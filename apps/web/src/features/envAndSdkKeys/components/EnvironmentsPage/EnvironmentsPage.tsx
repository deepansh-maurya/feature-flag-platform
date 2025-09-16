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
import { useAppContext } from "@/src/shared/context/AppContext";
import { log } from "node:console";

export type Env = {
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
  const [openFlagsFor, setOpenFlagsFor] = useState<number | null>(null);

  // which row's Link Flags modal is open
  const [openLinkModalFor, setOpenLinkModalFor] = useState<number | null>(null);

  const projectIdFromStorage = sessionStorage.getItem(AppConst.curPro)!;

  const { data: allFlags } = useFlags(projectIdFromStorage);

  const { workspace } = useAppContext();
  const { data: serverEnvs } = useEnvironments(projectIdFromStorage);
  const addEnvMutation = useAddEnvironment(projectIdFromStorage ?? "");

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

  function setDefault(idx: number) {
    setEnvs((curr) => curr.map((e, i) => ({ ...e, isDefault: i === idx })));
  }

  function deleteEnv(idx: number) {
    if (envs[idx].isDefault) return;
    setEnvs((curr) => curr.filter((_, i) => i !== idx));
  }

  function addEnvFromModal(newEnv: Env) {
    console.log(projectIdFromStorage);
    
    if (projectIdFromStorage && workspace?.id) {
      addEnvMutation.mutate({
        projectId: projectIdFromStorage,
        workspaceId: workspace.id,
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
      name: s.displayName,
      key: s.key,
      isDefault: false,
      isProd: false,
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
            {envs.map((env, idx) => {
              const moreThanTwo = env.linkedFlags.length > 2;
              const firstTwo = env.linkedFlags.slice(0, 2);

              return (
                <tr key={(env.key || env.name) + String(idx)}>
                  <td className={styles.envName}>{env.name}</td>
                  <td className={styles.envName}>{env.key}</td>

                  <td>
                    {env.isDefault ? (
                      <span className={styles.defaultTag}>Default</span>
                    ) : (
                      <button
                        className={styles.setDefaultBtn}
                        onClick={() => setDefault(idx)}
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
                      data-flags-btn={idx}
                      onClick={() =>
                        setOpenFlagsFor((open) => (open === idx ? null : idx))
                      }
                      aria-haspopup="dialog"
                      aria-expanded={openFlagsFor === idx}
                      aria-label="Manage flags"
                      title="Manage flags"
                    >
                      …
                    </button>

                    {openFlagsFor === idx && (
                      <div
                        id={`flags-popover-${idx}`}
                        className={styles.popover}
                        role="dialog"
                      >
                        <div className={styles.popoverList}>
                          {env.linkedFlags.length === 0 ? (
                            <button
                              className={styles.popoverAction}
                              onClick={() => {
                                setOpenFlagsFor(null);
                                setOpenLinkModalFor(idx);
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
                                  setOpenLinkModalFor(idx);
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
                      onClick={() => deleteEnv(idx)}
                      title={env.isDefault ? "Can't delete default" : "Delete"}
                      disabled={env.isDefault}
                    >
                      🗑️
                    </button>
                    <button
                      className={styles.deleteBtn}
                      style={{ display: "flex" }}
                      onClick={() => deleteEnv(idx)}
                      title={env.isDefault ? "Can't delete default" : "Delete"}
                    >
                      ✏️
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {openCreate && (
        <CreateEnvModal
          open={openCreate}
          onClose={() => setOpenCreate(false)}
          onCreate={(env) => {
            addEnvFromModal(env);
            setOpenCreate(false);
          }}
          existingNames={envNames}
          existingKeys={envKeys}
          cloneableEnvs={envs}
        />
      )}

      {openLinkModalFor !== null && (
        <LinkFlagsModal
          open={openLinkModalFor !== null}
          env={envs[openLinkModalFor!]}
          onClose={() => setOpenLinkModalFor(null)}
          onSave={(linked: string[]) => {
            setEnvs((curr) =>
              curr.map((e, i) =>
                i === openLinkModalFor ? { ...e, linkedFlags: linked } : e
              )
            );
            setOpenLinkModalFor(null);
          }}
        />
      )}
    </div>
  );
}

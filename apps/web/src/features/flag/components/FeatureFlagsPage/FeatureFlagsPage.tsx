"use client";

import React, { useMemo, useState, useEffect, useRef } from "react";
import styles from "./FeatureFlagsPage.module.css";
import CreateFlagModal from "../createFlagModel/CreateFlagModal";
import { Flag, FlagStatus } from "../../types";
import { useUpsertMeta, useUpdateFlag, useDeleteFlag } from "@/src/features/flag/hooks";
import { AppConst } from "@/app/constants";
import { useFlags } from "../../hooks";

const STATUS_OPTIONS: ("All" | FlagStatus)[] = ["All", "on", "off", "gradual"];
const TAGS_OPTIONS = ["A/B", "UI", "backend", "growth"];

export default function FeatureFlagsPage({
  projectId
}: {
  projectId?: string;
}) {
  const [flags, setFlags] = useState<Flag[]>([]);
  const [status, setStatus] = useState<(typeof STATUS_OPTIONS)[number]>("All");
  const [tag, setTag] = useState<string>("All");
  const [query, setQuery] = useState("");
  const [openCreate, setOpenCreate] = useState(false);
  const [editing, setEditing] = useState<Flag | null>(null);
  const popupRef = useRef<HTMLDivElement | null>(null);
  const projectIdFromStorage = sessionStorage.getItem(AppConst.curPro)!;
  const { data: apiFlags } = useFlags(projectIdFromStorage);
  const updateMutation = useUpdateFlag(projectIdFromStorage);
  const deleteMutation = useDeleteFlag(projectIdFromStorage);
  const [tagPopupData, setTagPopupData] = useState<{
    index: number;
    tags: string[];
  } | null>(null);
  console.log(apiFlags);

  useEffect(() => {
    if (!apiFlags) return;
    const mapped: Flag[] = apiFlags.map((f) => ({
      name: f.name ?? f.key,
      status: f.archived ? "off" : "on",
      lastModified: f.updatedAt ? new Date(f.updatedAt).toLocaleString() : "",
      tags: f.tags ?? [],
      description: f.description ?? undefined,
      key: f.key
      ,
      id: f.id,
      archived: f.archived,
    }));
    setFlags(mapped);
  }, [apiFlags]);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      const t = e.target as Node | null;
      if (popupRef.current && t && popupRef.current.contains(t)) return;
      setTagPopupData(null);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setTagPopupData(null);
    }
    document.addEventListener("click", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("click", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const filtered = useMemo(() => {
    return flags.filter((f) => {
      const q = query.trim().toLowerCase();
      const matchesQuery = q
        ? f.name.toLowerCase().includes(q) ||
          (f.description || "").toLowerCase().includes(q)
        : true;
      const matchesTag = tag === "All" ? true : (f.tags || []).includes(tag);
      const matchesStatus = status === "All" ? true : f.status === status;
      return matchesQuery && matchesTag && matchesStatus;
    });
  }, [flags, status, tag, query]);

  function toggleFlag(i: number) {
    // Toggle local status immediately
    setFlags((prev) =>
      prev.map((f, idx) => {
        if (idx !== i) return f;
        const next: FlagStatus = f.status === "on" ? "off" : "on";
        return { ...f, status: next, lastModified: "just now" };
      })
    );
    // Also update archived state on the server if we have id
    const f = flags[i];
    if (f && f.id) {
      // if toggling to off, mark archived=true; toggling on -> archived=false
      const shouldArchive = f.status === "on"; // previous state was on -> now off => archive
      updateMutation.mutate({ flagId: f.id, body: { archived: shouldArchive } }, {
        onSuccess: () => {
          setFlags((prev) => prev.map((x) => (x.id === f.id ? { ...x, archived: shouldArchive } : x)));
        },
        onError: () => {
          // revert local toggle on error
          setFlags((prev) => prev.map((x, idx) => (idx === i ? { ...x, status: x.status === "on" ? "off" : "on" } : x)));
        },
      });
    }
  }

  console.log(filtered);

  return (
    <div className={styles.wrapper}>
      <div className={styles.headerRow}>
        <div className={styles.headerTitle}>All Feature Flags</div>
        <button
          className={styles.createBtn}
          onClick={() => setOpenCreate(true)}
        >
          + Create Flag
        </button>
      </div>

      {/* Filters */}
      <div className={styles.filters}>
        <input
          className={styles.search}
          placeholder="Search flags…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select
          className={styles.filterSelect}
          value={status}
          onChange={(e) => setStatus(e.target.value as any)}
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        <select
          className={styles.filterSelect}
          value={tag}
          onChange={(e) => setTag(e.target.value)}
        >
          <option>All</option>
          {TAGS_OPTIONS.map((opt) => (
            <option key={opt}>{opt}</option>
          ))}
        </select>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead className={styles.head}>
            <tr>
              <th className={`${styles.colName} ${styles.alignLeft}`}>
                Flag Name
              </th>
              <th className={`${styles.colName} ${styles.alignLeft}`}>
                Flag Key
              </th>
              <th className={`${styles.colStatus} ${styles.alignCenter}`}>
                Status
              </th>
              <th className={`${styles.colDescription} ${styles.alignLeft}`}>
                Description
              </th>
              <th className={`${styles.colTags} ${styles.alignCenter}`}>
                Tags
              </th>
              <th className={`${styles.colModified} ${styles.alignCenter}`}>
                Last Modified
              </th>
              <th className={`${styles.colToggle} ${styles.alignCenter}`}>
                Toggle
              </th>
              <th className={`${styles.colActions} ${styles.alignCenter}`}>
                Actions
              </th>
            </tr>
          </thead>

          <tbody className={styles.body}>
            {filtered.length > 0 ? (
              filtered.map((f, i) => (
                <tr key={f.name}>
                  <td
                    className={`${styles.flagName} ${styles.colName} ${styles.alignLeft}`}
                  >
                    {f.name}
                  </td>
                  <td
                    className={`${styles.flagName} ${styles.colName} ${styles.alignLeft}`}
                  >
                    {f.key}
                  </td>
                  <td className={`${styles.colStatus} ${styles.alignCenter}`}>
                    {renderStatusBadge(f.status)}
                  </td>

                  <td
                    className={`${styles.colDescription} ${styles.descriptionCol} ${styles.alignLeft}`}
                    title={f.description}
                  >
                    {f.description || "—"}
                  </td>

                  <td className={`${styles.colTags} ${styles.alignCenter}`}>
                    <div
                      className={styles.tagsWrapper}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {(f.tags || []).length ? (
                        <>
                          <span className={styles.tagChip}>
                            {(f.tags || [])[0]}
                          </span>

                          {f.tags!.length > 1 && (
                            <button
                              type="button"
                              aria-label="Show more tags"
                              className={styles.moreTags}
                              onClick={(e) => {
                                e.stopPropagation();
                                setTimeout(() => {
                                  setTagPopupData((cur) =>
                                    cur && cur.index === i
                                      ? null
                                      : { index: i, tags: f.tags!.slice(1) }
                                  );
                                }, 0);
                              }}
                            >
                              …
                            </button>
                          )}
                          {tagPopupData && tagPopupData.index === i && (
                            <div ref={popupRef} className={styles.tagPopup}>
                              <div className={styles.tagPopupArrow} />
                              {tagPopupData.tags.map((t) => (
                                <div key={t} className={styles.tagPopupItem}>
                                  {t}
                                </div>
                              ))}
                            </div>
                          )}
                        </>
                      ) : (
                        <span className={styles.noRules}>—</span>
                      )}
                    </div>
                  </td>

                  <td className={`${styles.colModified} ${styles.alignCenter}`}>
                    {f.lastModified}
                  </td>

                  <td className={`${styles.colToggle} ${styles.alignCenter}`}>
                    <label className={styles.switch}>
                      <input
                        type="checkbox"
                        checked={f.status === "on"}
                        onChange={() => toggleFlag(i)}
                        aria-label={`Toggle ${f.name}`}
                      />
                      <span className={styles.slider}></span>
                    </label>
                  </td>

                  <td className={`${styles.colActions} ${styles.alignCenter}`}>
                    <div className={styles.actionBtns}>
                      <button
                        className={styles.editBtn}
                        onClick={() => {
                          setEditing(f);
                          setOpenCreate(true);
                        }}
                      >
                        ✏️
                      </button>
                      <button
                        className={styles.deleteBtn}
                        onClick={() => {
                          // archive/delete: call archive if id exists, otherwise remove locally
                          if (f.id) {
                            deleteMutation.mutate(f.id, {
                              onSuccess: () => {
                                setFlags((prev) => prev.filter((x) => x.id !== f.id));
                              },
                              onError: () => alert('Failed to delete flag'),
                            });
                          } else {
                            setFlags((prev) => prev.filter((_, idx) => idx !== i));
                          }
                        }}
                      >
                        🗑
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className={styles.emptyState}>
                  No Flags
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {openCreate && (
        <CreateFlagModal
          open={openCreate}
          initial={editing}
          onClose={() => {
            setOpenCreate(false);
            setEditing(null);
          }}
          projectId={projectIdFromStorage}
          onCreate={(newFlag) => {
            setFlags((prev) => [newFlag, ...prev]);
            setOpenCreate(false);
          }}
          onUpdate={(updated) => {
            setFlags((prev) => prev.map((f) => (f.id === updated.id ? updated : f)));
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

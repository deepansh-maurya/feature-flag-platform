import styles from "./TargetingRulesPage.module.css";
import { use, useEffect, useRef, useState } from "react";
import { humanize, parseTokens, renumber, rid } from "./utils";
import CopyFromEnvPrompt from "./CopyFromEnvPrompt";
import InlineAdd from "./InlineAdd";
import VersionHistoryModal from "./VersionHistoryModel";
import RulesTestModal from "./RulesTestModal";
import RuleSetPreview from "../RuleSetPreview/RuleSetPreview";
import { withModal } from "../../../../shared/components/WithModel/withModal";
import { EnvKey, Flag, Rule, Version } from "../../types";
import { useCreateRules } from "../../hooks";
import { AppConst } from "@/app/constants";
import { useAppContext } from "@/src/shared/context/AppContext";

const RuleSetPreviewModal = withModal(RuleSetPreview);

export default function FlagRulesBuilder({
  flag,
  onChange
}: {
  flag: Flag;
  onChange: (f: Flag) => void;
}) {
  const [openModel, setOpenModel] = useState(false);
  const [activeEnv, setActiveEnv] = useState<EnvKey>("dev");
  const [showHistory, setShowHistory] = useState(false);
  const [versions, setVersions] = useState<Version[]>([]);
  const [showCopyPrompt, setShowCopyPrompt] = useState(false);
  const [showTester, setShowTester] = useState(false);
  const lastSavedRulesRef = useRef<Rule[] | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const { user, workspace } = useAppContext();
  const seenEnv = useRef<Record<EnvKey, boolean>>({
    dev: true,
    stage: true,
    prod: false
  });

  useEffect(() => {
    if (
      !seenEnv.current[activeEnv] &&
      (flag.envRules[activeEnv]?.length ?? 0) === 0
    ) {
      setShowCopyPrompt(true);
      seenEnv.current[activeEnv] = true;
    }
  }, [activeEnv, flag.envRules]);

  console.log(activeEnv,isDirty,flag);
  

  // initialize lastSavedRulesRef when flag or environment changes
  useEffect(() => {
    const current = JSON.parse(
      JSON.stringify(flag.envRules[activeEnv] || [])
    ) as Rule[];
    lastSavedRulesRef.current = current;
    setIsDirty(false);
  }, [flag.key, activeEnv, flag.envRules]);

  // recompute dirty when rules change
  useEffect(() => {
    const current = JSON.stringify(flag.envRules[activeEnv] || []);
    const saved = JSON.stringify(lastSavedRulesRef.current || []);
    setIsDirty(current !== saved);
  }, [flag, activeEnv]);

  const rules: Rule[] = flag.envRules[activeEnv] || [];
  const setFlag = (updater: (f: Flag) => Flag) => onChange(updater(flag));

  const createRulesMut = useCreateRules();
  const [submitting, setSubmitting] = useState(false);

  const workspaceId = workspace?.id;
  const projectId = sessionStorage.getItem(AppConst.curPro)!;
  const actorUserId = user?.id;

  function removeRule(idx: number) {
    const arr = rules.filter((_, i) => i !== idx);
    setFlag((f) => ({
      ...f,
      envRules: { ...f.envRules, [activeEnv]: renumber(arr) },
      updatedAt: "just now"
    }));
  }

  function copyFromEnv(src: EnvKey) {
    const cloned = flag.envRules[src]?.map((r) => ({ ...r, id: rid() })) || [];
    setFlag((f) => ({
      ...f,
      envRules: { ...f.envRules, [activeEnv]: renumber(cloned) },
      updatedAt: "just now"
    }));
    setShowCopyPrompt(false);
  }

  function clearAndScratch() {
    setFlag((f) => ({
      ...f,
      envRules: { ...f.envRules, [activeEnv]: [] },
      updatedAt: "just now"
    }));
    setShowCopyPrompt(false);
  }

  function saveSnapshot(note?: string) {
    const v: Version = {
      id: rid(),
      ts: new Date().toISOString(),
      author: "Deepansh",
      note,
      snapshot: JSON.parse(JSON.stringify(flag))
    };
    setVersions((p) => [v, ...p]);
    // mark current rules as saved
    lastSavedRulesRef.current = JSON.parse(
      JSON.stringify(flag.envRules[activeEnv] || [])
    );
    setIsDirty(false);
  }

  function addLocalRule(text: string) {
    const tokens = parseTokens(text);
    const next: Rule = {
      id: rid(),
      name: humanize(text),
      text,
      conditions: tokens,
      priority: (rules.at(-1)?.priority || 0) + 1,
      enabled: true,
      source: { kind: "local" }
    };
    setFlag((f) => ({
      ...f,
      envRules: { ...f.envRules, [activeEnv]: [...rules, next] },
      updatedAt: "just now"
    }));
  }

  function moveRule(idx: number, dir: "up" | "down") {
    const arr = [...rules];
    const swapIdx = dir === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= arr.length) return;
    [arr[idx], arr[swapIdx]] = [arr[swapIdx], arr[idx]];
    setFlag((f) => ({
      ...f,
      envRules: { ...f.envRules, [activeEnv]: renumber(arr) },
      updatedAt: "just now"
    }));
  }

  function toggleEnable(idx: number) {
    const arr = rules.map((r, i) =>
      i === idx ? { ...r, enabled: !r.enabled } : r
    );
    setFlag((f) => ({
      ...f,
      envRules: { ...f.envRules, [activeEnv]: arr },
      updatedAt: "just now"
    }));
  }

  function detachToLocal(idx: number) {
    const arr = rules.map((r, i) =>
      i === idx && r.source?.kind === "segment"
        ? { ...r, source: { kind: "local" } }
        : r
    );
    setFlag((f) => ({
      ...f,
      envRules: { ...f.envRules, [activeEnv]: arr },
      updatedAt: "just now"
    }));
  }

  return (
    <>
      {/* Header actions per flag */}
      <div className={styles.headerRow}>
        <div className={styles.headerActions}>
          <select
            value={activeEnv}
            onChange={(e) => setActiveEnv(e.target.value as EnvKey)}
            className={styles.envSelect}
          >
            {(["dev", "stage", "prod"] as EnvKey[]).map((env) => (
              <option key={env} value={env}>
                {env.toUpperCase()}
              </option>
            ))}
          </select>

          <button
            className={styles.secondaryBtn}
            onClick={() => setOpenModel(true)}
          >
            Preview
          </button>
          <button
            className={styles.secondaryBtn}
            onClick={() => (saveSnapshot("manual save"), setShowHistory(true))}
          >
            History
          </button>
        
          <button
            className={styles.primaryBtn}
            onClick={() => {
              console.log("clicked");
              
              // Collect raw rule texts
              const rawRules = (flag.envRules[activeEnv] || []).map(
                (r) => r.text || ""
              );
              console.log(rawRules, projectId, workspaceId, actorUserId);

              if (!projectId || !workspaceId || !actorUserId) {
                alert("error")
                // fallback: still fire without server ids, backend may reject
              }
              setSubmitting(true);
              createRulesMut
                .mutateAsync({
                  workspaceId: workspaceId ?? "",
                  projectId: projectId ?? "",
                  flagId: flag.key,
                  envKey: activeEnv,
                  actorUserId: actorUserId ?? "",
                  rawRules
                })
                .then(() => {
                  saveSnapshot("saved via server");
                })
                .catch(() => {
                  // TODO: surface error to user (toast)
                })
                .finally(() => setSubmitting(false));
            }}
            title={!isDirty ? "No changes to submit" : "Submit rules to server"}
          >
            {submitting ? "Submitting..." : "Submit"}
          </button>
        </div>
        <button
          className={styles.secondaryBtn}
          onClick={() => setShowTester(true)}
        >
          Test rules
        </button>
      </div>

      {/* Environment selector */}
      <div className={styles.envSelectWrapper}></div>

      {/* Copy-from prompt on first visit to an empty env */}
      {showCopyPrompt && (
        <CopyFromEnvPrompt
          env={activeEnv}
          hasDev={!!flag.envRules.dev?.length}
          hasStage={!!flag.envRules.stage?.length}
          onCopy={(src) => copyFromEnv(src)}
          onScratch={clearAndScratch}
          onClose={() => setShowCopyPrompt(false)}
        />
      )}

      {/* Rule builder */}
      <div className={styles.builder}>
        <section
          className={styles.ruleStack}
          onDragOver={(e) => e.preventDefault()}
        >
          <div className={styles.ruleList}>
            {rules.map((r, idx) => (
              <div
                key={r.id}
                className={styles.ruleCard}
                onDragOver={(e) => e.preventDefault()}
              >
                <div className={styles.ruleHeader}>
                  <div className={styles.ruleTitle} style={{ width: "100%" }}>
                    <span className={styles.priority}>#{r.priority}</span>
                    <div className={styles.ruleBody} style={{ width: "94%" }}>
                      <textarea
                        className={styles.textArea}
                        disabled={
                          r.source?.kind === "segment" && r.source.linked
                        }
                        value={r.text || ""}
                        placeholder="Type a rule in plain English, e.g. ‘Turn ON for Pro users in India on iOS’"
                        onChange={(e) => {
                          const v = e.target.value;
                          setFlag((f) => {
                            const arr = [...(f.envRules[activeEnv] || [])];
                            arr[idx] = {
                              ...arr[idx],
                              text: v,
                              name: humanize(v),
                              conditions: parseTokens(v)
                            };
                            return {
                              ...f,
                              envRules: { ...f.envRules, [activeEnv]: arr },
                              updatedAt: "just now"
                            };
                          });
                        }}
                      />
                    </div>
                    {r.source?.kind === "segment" && (
                      <span className={styles.segmentBadge}>
                        {r.source.key}
                        {r.source.linked ? " (linked)" : ""}
                      </span>
                    )}
                  </div>
                  <div className={styles.ruleActions}>
                    {r.source?.kind === "segment" && r.source.linked && (
                      <button
                        className={styles.miniBtn}
                        onClick={() => detachToLocal(idx)}
                        title="Convert to local"
                      >
                        Detach
                      </button>
                    )}
                    <button
                      className={styles.miniBtn}
                      onClick={() => moveRule(idx, "up")}
                      disabled={idx === 0}
                      title="Move up"
                    >
                      ▲
                    </button>
                    <button
                      className={styles.miniBtn}
                      onClick={() => moveRule(idx, "down")}
                      disabled={idx === rules.length - 1}
                      title="Move down"
                    >
                      ▼
                    </button>
                    <label className={styles.switch}>
                      <input
                        type="checkbox"
                        checked={r.enabled}
                        onChange={() => toggleEnable(idx)}
                      />
                      <span className={styles.slider}></span>
                    </label>
                    <button
                      className={styles.deleteBtn}
                      onClick={() => removeRule(idx)}
                      title="Delete"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))}
            <InlineAdd onAdd={(t) => addLocalRule(t)} />
          </div>
        </section>
      </div>

      {showHistory && (
        <VersionHistoryModal
          versions={versions}
          current={flag}
          onRestore={(snapshot) => {
            onChange(snapshot);
            setShowHistory(false);
          }}
          onClose={() => setShowHistory(false)}
        />
      )}
      {showTester && (
        <RulesTestModal
          flag={flag}
          env={activeEnv}
          onClose={() => setShowTester(false)}
        />
      )}
      <RuleSetPreviewModal
        isOpen={openModel}
        onOpenChange={() => {
          setOpenModel(!openModel);
        }}
        trigger={undefined}
        modalTitle="RuleSet Preview"
        componentProps={{ ruleSet: null, segmentsById: null }}
      />
    </>
  );
}

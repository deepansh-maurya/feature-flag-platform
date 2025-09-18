import styles from "./TargetingRulesPage.module.css";
import { useEffect, useRef, useState } from "react";
import { humanize, parseTokens, renumber, rid } from "./utils";
import CopyFromEnvPrompt from "./CopyFromEnvPrompt";
import EmptyRules from "./EmptyRules";
import InlineAdd from "./InlineAdd";
import SegmentsDrawer from "./SegmentDrawer";
import VersionHistoryModal from "./VersionHistoryModel";
import RulesTestModal from "./RulesTestModal";
import PrerequisitesPicker, {
  FlagMeta,
  Prereq
} from "../PrerequisitesPicker/PrerequisitesPicker";
import RuleSetPreview from "../RuleSetPreview/RuleSetPreview";
import { withModal } from "../../../../shared/components/WithModel/withModal";
import { EnvKey, Flag, Rule, Segment, Version } from "../../types";
import { SEGMENTS } from "./TargetingRulesPage";

const RuleSetPreviewModal = withModal(RuleSetPreview);

// -----------------------------------------------------------------------------
export default function FlagRulesBuilder({
  flag,
  onChange
}: {
  flag: Flag;
  onChange: (f: Flag) => void;
}) {
  const flags: FlagMeta[] = [
    {
      key: "enable_checkout",
      name: "Enable Checkout",
      variations: [{ key: "on" }, { key: "off" }]
    },
    {
      key: "checkout_redesign",
      name: "Checkout Redesign",
      variations: [{ key: "control" }, { key: "new" }]
    },
    {
      key: "dark_mode",
      name: "Dark Mode",
      variations: [{ key: "on" }, { key: "off" }]
    },
    {
      key: "ios_gate",
      name: "iOS Gate",
      variations: [{ key: "allow" }, { key: "deny" }]
    }
  ];

  const [state, setState] = useState<Prereq[]>([]);
  const [openModel, setOpenModel] = useState(false);
  const [activeEnv, setActiveEnv] = useState<EnvKey>("dev");
  const [showSegments, setShowSegments] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [versions, setVersions] = useState<Version[]>([]);
  const [showCopyPrompt, setShowCopyPrompt] = useState(false);
  const [showTester, setShowTester] = useState(false);
  // first-time copy/scratch prompt per env (per-flag)
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

  const rules = flag.envRules[activeEnv] || [];
  const setFlag = (updater: (f: Flag) => Flag) => onChange(updater(flag));

  function saveSnapshot(note?: string) {
    const v: Version = {
      id: rid(),
      ts: new Date().toISOString(),
      author: "Deepansh",
      note,
      snapshot: JSON.parse(JSON.stringify(flag))
    };
    setVersions((p) => [v, ...p]);
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

  function onDropSegment(seg: Segment, index?: number) {
    const insertAt =
      typeof index === "number"
        ? Math.max(0, Math.min(index, rules.length))
        : rules.length;
    const next: Rule = {
      id: rid(),
      name: seg.name,
      text: seg.hint,
      conditions: seg.tokens,
      priority: 0,
      enabled: true,
      source: { kind: "segment", key: seg.key, linked: true }
    };
    const updated = [
      ...rules.slice(0, insertAt),
      next,
      ...rules.slice(insertAt)
    ];
    setFlag((f) => ({
      ...f,
      envRules: { ...f.envRules, [activeEnv]: renumber(updated) },
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

  return (
    <>
      {/* Header actions per flag */}
      <div className={styles.headerRow}>
        <div className={styles.headerLeft}>
          <div className={styles.subTitle}>Rules · {flag.key}</div>
          <span className={styles.updatedAt}>
            Last updated {flag.updatedAt}
          </span>
        </div>
        <div className={styles.headerActions}>
          <button
            className={styles.secondaryBtn}
            onClick={() => setOpenModel(true)}
          >
            Preview
          </button>
          <button
            className={styles.secondaryBtn}
            onClick={() => setShowSegments(true)}
          >
            Global Segments
          </button>
          <button
            className={styles.secondaryBtn}
            onClick={() => (saveSnapshot("manual save"), setShowHistory(true))}
          >
            History
          </button>
          <button
            className={styles.primaryBtn}
            onClick={() => saveSnapshot("auto save")}
          >
            Save
          </button>
        </div>
        <button
          className={styles.secondaryBtn}
          onClick={() => setShowTester(true)}
        >
          Test rules
        </button>
      </div>

      {/* Env tabs */}
      <div className={styles.tabs}>
        {(["dev", "stage", "prod"] as EnvKey[]).map((e) => (
          <button
            key={e}
            className={`${styles.tab} ${activeEnv === e ? styles.tabActive : ""}`}
            onClick={() => setActiveEnv(e)}
          >
            {e}
          </button>
        ))}
      </div>

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
        {/* Left: segments palette */}
        <aside className={styles.palette}>
          <div className={styles.paletteTitle}>Segments</div>
          <div className={styles.segmentList}>
            {SEGMENTS.map((s) => (
              <div
                key={s.key}
                className={styles.segmentChip}
                draggable
                onDragStart={(e) =>
                  e.dataTransfer.setData("text/segment", s.key)
                }
                title={s.hint}
              >
                #{s.name}
              </div>
            ))}
          </div>
          <button
            className={styles.linkBtn}
            onClick={() => setShowSegments(true)}
          >
            Manage segments →
          </button>

          <div>
            <PrerequisitesPicker
              availableFlags={flags}
              value={state}
              onChange={setState}
            />
            {/* <pre
              style={{
                marginTop: 12,
                fontSize: 12,
                background: "#f7f7f7",
                padding: 8
              }}
            >
              {JSON.stringify(state, null, 2)}
            </pre> */}
          </div>
        </aside>

        {/* Center: rule stack */}
        <section
          className={styles.ruleStack}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            const key = e.dataTransfer.getData("text/segment");
            const seg = SEGMENTS.find((x) => x.key === key);
            if (seg) onDropSegment(seg, undefined);
          }}
        >
          {rules.length === 0 ? (
            <EmptyRules
              onAdd={(t) => addLocalRule(t)}
              onDropSegment={(seg) => onDropSegment(seg)}
            />
          ) : (
            <div className={styles.ruleList}>
              {rules.map((r, idx) => (
                <div
                  key={r.id}
                  className={styles.ruleCard}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    const key = e.dataTransfer.getData("text/segment");
                    const seg = SEGMENTS.find((x) => x.key === key);
                    if (seg) onDropSegment(seg, idx + 1);
                  }}
                >
                  <div className={styles.ruleHeader}>
                    <div className={styles.ruleTitle}>
                      <span className={styles.priority}>#{r.priority}</span>
                      {r.name}
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

                  <div className={styles.ruleBody}>
                    <textarea
                      className={styles.textArea}
                      disabled={r.source?.kind === "segment" && r.source.linked}
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
                </div>
              ))}
              <InlineAdd onAdd={(t) => addLocalRule(t)} />
            </div>
          )}
        </section>
      </div>

      {/* Drawers/Modals */}
      {showSegments && (
        <SegmentsDrawer
          segments={SEGMENTS}
          onClose={() => setShowSegments(false)}
          onDrop={(seg) => onDropSegment(seg)}
        />
      )}
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

"use client";

import React, { useMemo, useState } from "react";
import styles from "./RulesTestModal.module.css";
import { EnvKey, Flag, Rule } from "../../types";

type Props = { flag: Flag; env: EnvKey; onClose: () => void };

export default function RulesTestModal({ flag, env, onClose }: Props) {
  const [activeEnv, setActiveEnv] = useState<EnvKey>(env);
  const [contextText, setContextText] = useState<string>(
    JSON.stringify(
      {
        user: { id: "u1", country: "IN", plan: "PRO", platform: "web" },
        __env: env
      },
      null,
      2
    )
  );
  const [dateISO, setDateISO] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [result, setResult] = useState<any | null>(null);

  const rules = useMemo(() => flag.envRules?.[activeEnv] ?? [], [flag, activeEnv]);

  // -----------------------------
  // Rollout Tester state
  // -----------------------------
  const [bucketAttrPath, setBucketAttrPath] = useState<string>("user.id");
  const [rolloutSalt, setRolloutSalt] = useState<string>(""); // optional
  const [percentGate, setPercentGate] = useState<string>("10"); // % gate as string for input
  const [variantWeightsText, setVariantWeightsText] = useState<string>(""); // e.g. "control:50,treatment:50"
  const [rolloutView, setRolloutView] = useState<RolloutView | null>(null);

  function run() {
    setError("");
    try {
      const base = JSON.parse(contextText || "{}");
      const ctx: any = { ...base };

      // env override
      ctx.__env = activeEnv;

      // date/time override
      if (dateISO?.trim()) {
        const d = new Date(dateISO);
        if (isNaN(d.getTime())) throw new Error("Invalid date/time override");
        ctx.__now = d.toISOString();
      }

      // evaluate with selected env rules
      const flagForEnv: Flag = {
        ...flag,
        envRules: { ...flag.envRules, [activeEnv]: rules }
      };

      // const res = evaluateFlag(flagForEnv, ctx);
      // setResult(res);
      // For now, we leave it as a no-op to keep this tester independent:
      setResult(null);
    } catch (e: any) {
      setError(e.message || "Failed to parse context");
      setResult(null);
    }
  }

  // -----------------------------
  // Rollout Tester: compute
  // -----------------------------
  function runRolloutTest() {
    setError("");
    try {
      const base = JSON.parse(contextText || "{}");
      const ctx: any = { ...base, __env: activeEnv };

      const attrVal = pick(ctx, bucketAttrPath);
      if (attrVal == null || attrVal === "") {
        setRolloutView({
          ok: false,
          reason: `Bucketing attribute "${bucketAttrPath}" not found/empty`,
          detail: null
        });
        return;
      }

      // Seed = flagKey : env : salt : attrValue
      const seed = `${flag.key}:${activeEnv}:${rolloutSalt}:${String(attrVal)}`;
      const bucket = fnv1aBucket(seed); // 0..9999
      const ratio = bucket / 10000; // 0..0.9999

      // % gate check
      const pct = clampPercent(parseFloat(percentGate));
      const pass = ratio < pct / 100;

      // Variant selection (optional)
      const weights = parseVariantWeights(variantWeightsText); // [] when empty or invalid
      let variant: string | null = null;
      if (weights.length > 0) {
        variant = chooseVariant(weights, ratio); // deterministic via ratio
      }

      const trace: string[] = [
        `seed = "${seed}"`,
        `hash → bucket = ${bucket} (ratio=${ratio.toFixed(4)})`,
        `% gate = ${pct}% → ${pass ? "IN" : "OUT"}`
      ];
      if (weights.length > 0) {
        trace.push(
          `weights = ${weights.map(w => `${w.key}:${w.weight}`).join(", ")}`,
          `variant = ${variant}`
        );
      }

      setRolloutView({
        ok: true,
        reason: pass ? "User is IN the rollout" : "User is OUT of the rollout",
        detail: {
          bucket,
          ratio,
          pass,
          variant,
          weights,
          seed,
          attrPath: bucketAttrPath,
          attrVal
        },
        trace
      });
    } catch (e: any) {
      setError(e.message || "Failed to run rollout test");
      setRolloutView(null);
    }
  }

  return (
    <div className={styles.backdrop}>
      <div className={styles.modal}>
        {/* Header */}
        <div className={styles.header}>
          <div>
            <div className={styles.title}>Test rules · {flag.key}</div>
            <div className={styles.subtitle}>Simulate evaluation without publishing</div>
          </div>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        {/* Controls */}
        <div className={styles.controlsRow}>
          <div className={styles.control}>
            <label>Environment</label>
            <select value={activeEnv} onChange={(e) => setActiveEnv(e.target.value as EnvKey)}>
              <option value="dev">dev</option>
              <option value="stage">stage</option>
              <option value="prod">prod</option>
            </select>
          </div>

          <div className={styles.control}>
            <label>Date/Time override</label>
            <input
              type="datetime-local"
              value={dateISO}
              onChange={(e) => setDateISO(e.target.value)}
              placeholder="optional"
            />
          </div>
        </div>

        {/* Split */}
        <div className={styles.split}>
          {/* LEFT: Context JSON */}
          <div className={styles.left}>
            <label className={styles.blockLabel}>Context (JSON)</label>
            <textarea
              className={`${styles.textarea} ${styles.textareaLarge}`}
              value={contextText}
              onChange={(e) => setContextText(e.target.value)}
              spellCheck={false}
            />
            {error && <div className={styles.error}>{error}</div>}
            <div className={styles.actionsRow}>
              <button className={styles.primaryBtn} onClick={run}>Run</button>
              <button
                className={styles.secondaryBtn}
                onClick={() =>
                  setContextText(
                    JSON.stringify(
                      { user: { id: "u1", country: "IN", plan: "PRO", platform: "web" }, __env: activeEnv },
                      null,
                      2
                    )
                  )
                }
              >
                Reset sample
              </button>
            </div>

            {/* --- NEW: Rollout Tester Form --- */}
            <div className={styles.rolloutCard}>
              <div className={styles.blockLabel}>Rollout test</div>

              <div className={styles.formRow}>
                <div className={styles.control}>
                  <label>Bucketing attribute (dot‑path)</label>
                  <input
                    type="text"
                    value={bucketAttrPath}
                    onChange={(e) => setBucketAttrPath(e.target.value)}
                    placeholder="e.g. user.id"
                  />
                </div>
                <div className={styles.control}>
                  <label>Salt (optional)</label>
                  <input
                    type="text"
                    value={rolloutSalt}
                    onChange={(e) => setRolloutSalt(e.target.value)}
                    placeholder="e.g. v2"
                  />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.control}>
                  <label>% gate</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    step={0.01}
                    value={percentGate}
                    onChange={(e) => setPercentGate(e.target.value)}
                    placeholder="10"
                  />
                </div>
                <div className={styles.control} style={{ flex: 1 }}>
                  <label>Variant weights (optional)</label>
                  <input
                    type="text"
                    value={variantWeightsText}
                    onChange={(e) => setVariantWeightsText(e.target.value)}
                    placeholder="A:50,B:50 or control:10,treatment:90"
                  />
                </div>
              </div>

              <div className={styles.actionsRow}>
                <button className={styles.primaryBtn} onClick={runRolloutTest}>Run rollout</button>
              </div>

              {rolloutView && (
                <div className={styles.resultCard} style={{ marginTop: 12 }}>
                  <div className={styles.resultRow}>
                    <div className={styles.pill}>Bucketing</div>
                    <code className={styles.code}>
                      bucket={rolloutView.detail?.bucket} ({(rolloutView.detail?.ratio ?? 0).toFixed(4)})
                    </code>
                  </div>
                  <div className={styles.resultRow}>
                    <div className={styles.pill}>Decision</div>
                    <span className={rolloutView.detail?.pass ? styles.pass : styles.fail}>
                      {rolloutView.reason}
                    </span>
                  </div>
                  {rolloutView.detail?.variant && (
                    <div className={styles.resultRow}>
                      <div className={styles.pill}>Variant</div>
                      <code className={styles.code}>{rolloutView.detail.variant}</code>
                    </div>
                  )}
                  {Array.isArray(rolloutView.trace) && rolloutView.trace.length > 0 && (
                    <>
                      <div className={styles.blockLabel}>Trace</div>
                      <div className={styles.trace}>
                        {rolloutView.trace.map((t, i) => (
                          <div key={i} className={styles.traceRow}>
                            <code className={styles.code}>#{i + 1}</code>
                            <span>{t}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
            {/* --- /Rollout Tester --- */}
          </div>

          {/* RIGHT: Result (from evaluateFlag) */}
          <div className={styles.right}>
            <label className={styles.blockLabel}>Result</label>
            {!result ? (
              <div className={styles.resultEmpty}>Run a test to see the decision</div>
            ) : (
              <div className={styles.resultCard}>
                <div className={styles.resultRow}>
                  <div className={styles.pill}>Decision</div>
                  <code className={styles.code}>{valueSummary(result)}</code>
                </div>
                {result.matchedRuleId && (
                  <div className={styles.resultRow}>
                    <div className={styles.pill}>Matched rule</div>
                    <span>{ruleTitle(rules, result.matchedRuleId)}</span>
                  </div>
                )}
                {Array.isArray(result.reasons) && result.reasons.length > 0 && (
                  <div className={styles.resultRow}>
                    <div className={styles.pill}>Why</div>
                    <ul className={styles.list}>
                      {result.reasons.map((r: string, i: number) => <li key={i}>{r}</li>)}
                    </ul>
                  </div>
                )}
                {Array.isArray(result.trace) && result.trace.length > 0 && (
                  <>
                    <div className={styles.blockLabel}>Trace</div>
                    <div className={styles.trace}>
                      {result.trace.map((t: any, i: number) => (
                        <div key={i} className={styles.traceRow}>
                          <code className={styles.code}>#{i + 1}</code>
                          <span className={styles.traceRule}>{ruleTitle(rules, t.ruleId)}</span>
                          <span className={t.matched ? styles.pass : styles.fail}>
                            {t.matched ? "matched" : "no match"}
                          </span>
                          {t.reason && <span className={styles.traceReason}>{t.reason}</span>}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// -----------------------------
// helpers already present
// -----------------------------
function valueSummary(res: any) {
  if (typeof res.enabled === "boolean" && res.variant == null && res.payload == null) return String(res.enabled);
  const parts: string[] = [];
  if (res.enabled !== undefined) parts.push(`enabled=${res.enabled}`);
  if (res.variant !== undefined) parts.push(`variant=${JSON.stringify(res.variant)}`);
  if (res.payload !== undefined) parts.push(`payload=${JSON.stringify(res.payload)}`);
  return parts.join(" | ");
}
function ruleTitle(rules: Rule[], id?: string) {
  if (!id) return "fallthrough";
  const r = rules.find((x) => x.id === id);
  return r ? `#${r.priority} ${r.name}` : id;
}

// -----------------------------
// NEW: rollout helpers
// -----------------------------
type RolloutView = {
  ok: boolean;
  reason: string;
  detail: null | {
    bucket: number;
    ratio: number;
    pass: boolean;
    variant: string | null;
    weights: { key: string; weight: number }[];
    seed: string;
    attrPath: string;
    attrVal: unknown;
  };
  trace?: string[];
};

function pick(obj: any, path: string): any {
  if (!path) return undefined;
  return path.split(".").reduce((acc, k) => (acc == null ? undefined : acc[k]), obj);
}

function clampPercent(n: number) {
  if (Number.isNaN(n)) return 0;
  if (n < 0) return 0;
  if (n > 100) return 100;
  return n;
}

// FNV-1a 32-bit (deterministic, fast, decent distribution)
function fnv1a32(str: string): number {
  let h = 0x811c9dc5; // offset basis
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

// Normalize to a 10k bucket space (0..9999)
function fnv1aBucket(seed: string): number {
  const h = fnv1a32(seed);
  return h % 10000;
}

// "A:50,B:50" => [{key:"A", weight:50}, {key:"B", weight:50}]
function parseVariantWeights(s: string): { key: string; weight: number }[] {
  if (!s || !s.trim()) return [];
  const parts = s.split(",").map(p => p.trim()).filter(Boolean);
  const out: { key: string; weight: number }[] = [];
  for (const p of parts) {
    const [k, v] = p.split(":").map(x => x.trim());
    const w = Number(v);
    if (!k || Number.isNaN(w) || w < 0) continue;
    out.push({ key: k, weight: w });
  }
  const total = out.reduce((a, b) => a + b.weight, 0);
  return total > 0 ? out : [];
}

// ratio in [0,1) → choose variant by cumulative weights
function chooseVariant(weights: { key: string; weight: number }[], ratio: number): string {
  const total = weights.reduce((a, b) => a + b.weight, 0);
  let cumul = 0;
  for (const w of weights) {
    cumul += w.weight / total;
    if (ratio < cumul) return w.key;
  }
  return weights[weights.length - 1].key; // fallback
}

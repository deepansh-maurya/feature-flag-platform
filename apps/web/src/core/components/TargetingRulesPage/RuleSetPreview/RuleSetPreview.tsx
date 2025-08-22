import React, { useMemo, useState } from "react";
import "./RuleSetPreview.css"
/**
 * RuleSetPreview
 * -------------------------------------------------------------
 * Shows a pretty JSON preview of the saved RuleSet and derives
 * the required input traits to test the flag based on its rules.
 *
 * Business impact:
 * - Makes configs auditable & explainable for PMs and reviewers.
 * - Surfaces which user/app traits are actually used → fewer prod surprises.
 * - Encourages creating only the traits you truly need → simpler SDK payloads.
 */

// ---------- Types (aligned with your earlier schema) ----------
export type ConditionOp =
  | "eq"
  | "in"
  | "not_in"
  | "gt"
  | "gte"
  | "lt"
  | "lte"
  | "regex"
  | "semver_gte"
  | "cidr_in"
  | "between"
  | "time_window";

export type Condition = {
  attr: string; // e.g., "country", "plan", "appVersion", "ip", "now"
  op: ConditionOp;
  value?: any;
  values?: any[];
  range?: { start: number; end: number };
  window?: { startIso?: string; endIso?: string };
};

export type Match = {
  all?: Match[];
  any?: Match[];
  cond?: Condition;
  segmentId?: string;
};

export type Distribution = {
  stickinessAttr?: string; // defaults to userId
  allocations: { variation: string; percent: number }[];
};

export type Rule =
  | { kind: "deny"; reason?: string; match: Match }
  | {
      kind: "allow";
      reason?: string;
      match: Match;
      outcome?: { fixedVariation?: string; rollout?: Distribution };
    };

export type Prereq = { flagKey: string; variations: string[] };

export type RuleSet = {
  prerequisites?: Prereq[];
  rules: Rule[];
  defaultVar: string;
  killswitch?: boolean;
  salt?: string;
};

export type Segment = {
  id: string;
  name?: string;
  definition: Match; // same shape; reusable predicate
};

export type RuleSetPreviewProps = {
  ruleSet?: RuleSet | null;
  segmentsById?: Record<string, Segment> | null; // optional; used to expand segment inputs
  title?: string;
};

// ---------- Helper: collect required inputs ----------
function collectInputsFromMatch(
  out: Set<string>,
  match?: Match,
  segments?: Record<string, Segment>
) {
  if (!match) return;
  if (match.cond) {
    const c = match.cond;
    // normalize well-known virtual attrs
    if (c.op === "time_window") out.add("now");
    out.add(c.attr);
  }
  if (match.all)
    match.all.forEach((m) => collectInputsFromMatch(out, m, segments));
  if (match.any)
    match.any.forEach((m) => collectInputsFromMatch(out, m, segments));
  if (match.segmentId && segments && segments[match.segmentId]) {
    collectInputsFromMatch(out, segments[match.segmentId].definition, segments);
  }
}

function collectRequiredInputs(
  ruleSet?: RuleSet | null,
  segments?: Record<string, Segment> | null
) {
  const required = new Set<string>();
  if (!ruleSet) return { traits: [], sticky: "userId" };

  for (const r of ruleSet.rules ?? []) {
    collectInputsFromMatch(required, (r as any).match, segments ?? undefined);
    if (r.kind === "allow" && r.outcome?.rollout) {
      required.add(r.outcome.rollout.stickinessAttr || "userId");
    }
  }
  return { traits: Array.from(required).sort(), sticky: "userId" };
}

// ---------- Helper: naive type-hint from ops ----------
function hintTypeFor(attr: string): string {
  const a = attr.toLowerCase();
  if (a.includes("version")) return "semver";
  if (a === "now" || a.includes("time")) return "iso-datetime";
  if (a === "ip") return "ip-address";
  if (a.includes("count") || a.includes("age") || a.includes("price"))
    return "number";
  if (a.startsWith("is") || a.startsWith("has")) return "boolean";
  return "string";
}

// ---------- Component ----------
export default function RuleSetPreview({
  ruleSet,
  segmentsById,
  title = "RuleSet Preview"
}: RuleSetPreviewProps) {
  const prettyJson = useMemo(() => {
    try {
      return JSON.stringify(ruleSet ?? {}, null, 2);
    } catch {
      return "{}";
    }
  }, [ruleSet]);

  const { traits } = useMemo(
    () => collectRequiredInputs(ruleSet, segmentsById),
    [ruleSet, segmentsById]
  );

  const sample = useMemo(() => {
    const obj: Record<string, any> = {};
    traits.forEach((t) => {
      const tHint = hintTypeFor(t);
      obj[t] =
        tHint === "semver"
          ? "3.2.0"
          : tHint === "iso-datetime"
            ? new Date().toISOString()
            : tHint === "ip-address"
              ? "203.0.113.10"
              : tHint === "number"
                ? 1
                : tHint === "boolean"
                  ? false
                  : t === "country"
                    ? "IN"
                    : t === "plan"
                      ? "pro"
                      : "";
    });
    return obj;
  }, [traits]);

  const prereqList = ruleSet?.prerequisites ?? [];
  const [copied, setCopied] = useState(false);

  function copy(text: string) {
    navigator.clipboard
      ?.writeText(text)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1200);
      })
      .catch(() => {});
  }

  return (
    <div className="rsp-card">
      <div className="rsp-head">
        <div className="rsp-title">{title}</div>
        <div className="rsp-sub">
          Preview the exact JSON your SDK will fetch and the traits needed to
          evaluate it.
        </div>
      </div>

      <div className="rsp-grid">
        <section className="rsp-pane">
          <div className="rsp-pane-title">RuleSet JSON</div>
          <pre className="rsp-pre" aria-label="RuleSet JSON">
            {prettyJson}
          </pre>
          <div className="rsp-row">
            <button className="rsp-btn" onClick={() => copy(prettyJson)}>
              Copy JSON
            </button>
            {copied && <span className="rsp-copied">Copied</span>}
          </div>
        </section>

        <section className="rsp-pane">
          <div className="rsp-pane-title">Required inputs to test</div>
          {traits.length === 0 ? (
            <div className="rsp-empty">No traits detected in rules.</div>
          ) : (
            <ul className="rsp-list">
              {traits.map((t) => (
                <li key={t} className="rsp-li">
                  <span className="rsp-attr">{t}</span>
                  <span className="rsp-hint">{hintTypeFor(t)}</span>
                </li>
              ))}
            </ul>
          )}

          <div className="rsp-pane-title" style={{ marginTop: 10 }}>
            Sample payload
          </div>
          <pre className="rsp-pre" aria-label="Sample payload">
            {JSON.stringify(sample, null, 2)}
          </pre>

          {prereqList.length > 0 && (
            <div className="rsp-prereq">
              <div className="rsp-pane-title">Prerequisites</div>
              <ul className="rsp-list">
                {prereqList.map((p, i) => (
                  <li key={`${p.flagKey}-${i}`} className="rsp-li">
                    <span className="rsp-attr">{p.flagKey}</span>
                    <span className="rsp-hint">
                      must be one of: [{p.variations.join(", ")}]
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      </div>

    
    </div>
  );
}

// ---------------- Demo Harness & Test Cases ----------------
// These are simple test cases to ensure the collector finds the right attributes.
export function DemoRuleSetPreview() {
  const demoSegments: Record<string, Segment> = {
    early_access_ios: {
      id: "early_access_ios",
      name: "Early Access (iOS)",
      definition: {
        all: [
          { cond: { attr: "os", op: "eq", value: "ios" } },
          { cond: { attr: "appVersion", op: "semver_gte", value: "3.2.0" } }
        ]
      }
    }
  };

  const ruleSet: RuleSet = {
    prerequisites: [{ flagKey: "enable_checkout", variations: ["on"] }],
    defaultVar: "control",
    rules: [
      {
        kind: "deny",
        reason: "compliance",
        match: {
          any: [
            { cond: { attr: "country", op: "in", values: ["CU", "SY"] } },
            { cond: { attr: "ip", op: "cidr_in", value: "10.0.0.0/8" } }
          ]
        }
      },
      {
        kind: "allow",
        match: {
          all: [
            { segmentId: "early_access_ios" },
            {
              cond: {
                attr: "now",
                op: "time_window",
                window: { startIso: "2025-09-01T00:00:00Z" }
              }
            }
          ]
        },
        outcome: {
          rollout: {
            stickinessAttr: "userId",
            allocations: [{ variation: "newUI", percent: 25 }]
          }
        }
      }
    ]
  };

  // Additional test case: boolean parent with child only when ON
  const ruleSet2: RuleSet = {
    prerequisites: [{ flagKey: "dark_mode", variations: ["on"] }],
    defaultVar: "off",
    rules: [
      {
        kind: "allow",
        match: {
          cond: { attr: "plan", op: "in", values: ["pro", "enterprise"] }
        },
        outcome: { fixedVariation: "on" }
      }
    ]
  };

  const [sel, setSel] = useState<"A" | "B">("A");

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={() => setSel("A")}>Dataset A</button>
        <button onClick={() => setSel("B")}>Dataset B</button>
      </div>
      <RuleSetPreview
        ruleSet={sel === "A" ? ruleSet : ruleSet2}
        segmentsById={demoSegments}
        title={
          sel === "A"
            ? "Preview – iOS Early Access"
            : "Preview – Dark Mode Child Gate"
        }
      />
    </div>
  );
}

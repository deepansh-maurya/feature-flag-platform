// CreateProjectModal.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import styles from "./CreateProjectModal.module.css";

// If you use react-hook-form/zod in your stack, swap to them easily.
// For now, vanilla controlled inputs with lightweight validation logic.

// ------------------------------
// Types
// ------------------------------
export type Region = "US" | "EU" | "APAC";
export type FlagType = "boolean" | "multivariate" | "experiment";
export type SdkPlatform =
  | "node"
  | "browser"
  | "react"
  | "ios"
  | "android"
  | "go"
  | "python";

export type Env = {
  id: string; // local temp id for list operations
  name: string; // "Production"
  key: string; // "production"
  isProd: boolean; // prod policies
  sdkKeys: { server: string; client?: string }; // server always, client optional
};

export type ChangeControl = {
  requiredForProd: boolean;
  minApprovers?: number; // 1..5
};

export type Guardrails = {
  mode?: "safe" | "normal" | "aggressive"; // preset, optional
  maxRampPercent?: number; // 1..100
  minHoldMinutes?: number; // 5..1440
};

export type Audit = {
  enabled: boolean;
  webhookUrl?: string; // url
};

export type ProjectCreate = {
  name: string;
  key: string; // slug
  region: Region;
  timezone: string; // e.g., "Asia/Kolkata"
  defaultIdentifier: string; // e.g., "userId" | "accountId"
  bucketingSeed?: string; // defaults to key server-side
  ownerId?: string; // user id
  teamId?: string; // team id
  tags?: string[];
  namingConvention?: string; // regex string
  changeControl?: ChangeControl;
  audit?: Audit;
  defaults?: {
    flagType?: FlagType;
    guardrails?: Guardrails;
  };
  integrations?: string[]; // ids of integrations
  sdkPlatforms?: SdkPlatform[]; // for snippet prep
  environments: Env[]; // must be >=1
};

// ------------------------------
// Helpers
// ------------------------------
const slugify = (s: string) =>
  s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 40);

const randomKey = (len = 24) =>
  Array.from(crypto.getRandomValues(new Uint8Array(len)))
    .map((b) => (b % 36).toString(36))
    .join("");

const DEFAULT_ENVS: Env[] = [
  {
    id: crypto.randomUUID(),
    name: "Development",
    key: "development",
    isProd: false,
    sdkKeys: { server: randomKey(32), client: randomKey(28) },
  },
  {
    id: crypto.randomUUID(),
    name: "Staging",
    key: "staging",
    isProd: false,
    sdkKeys: { server: randomKey(32), client: randomKey(28) },
  },
  {
    id: crypto.randomUUID(),
    name: "Production",
    key: "production",
    isProd: true,
    sdkKeys: { server: randomKey(32) }, // no client by default
  },
];

const TIMEZONES = [
  "UTC",
  "Asia/Kolkata",
  "America/Los_Angeles",
  "America/New_York",
  "Europe/London",
  "Europe/Berlin",
  "Asia/Singapore",
  "Asia/Tokyo",
];

const INTEGRATIONS = [
  { id: "posthog", label: "PostHog" },
  { id: "segment", label: "Segment" },
  { id: "amplitude", label: "Amplitude" },
  { id: "datadog", label: "Datadog" },
];

const TEAMS = [
  { id: "t_payments", label: "Payments Team" },
  { id: "t_growth", label: "Growth Team" },
  { id: "t_core", label: "Core Platform" },
];

const USERS = [
  { id: "u_deepansh", label: "Deepansh" },
  { id: "u_alice", label: "Alice" },
  { id: "u_bob", label: "Bob" },
];

const SDK_PLATFORMS: { id: SdkPlatform; label: string }[] = [
  { id: "node", label: "Node.js (server)" },
  { id: "browser", label: "Browser (JS)" },
  { id: "react", label: "React" },
  { id: "ios", label: "iOS" },
  { id: "android", label: "Android" },
  { id: "go", label: "Go" },
  { id: "python", label: "Python" },
];

// ------------------------------
// Props
// ------------------------------
export interface CreateProjectModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (project: ProjectCreate) => Promise<void> | void;
  defaultTimezone?: string; // e.g., from user profile
  defaultRegion?: Region;
}

// ------------------------------
// Component
// ------------------------------
export default function CreateProjectModal({
  open,
  onClose,
  onCreate,
  defaultTimezone = "Asia/Kolkata",
  defaultRegion = "US",
}: CreateProjectModalProps) {
  const [name, setName] = useState("");
  const [key, setKey] = useState("");
  const [region, setRegion] = useState<Region>(defaultRegion);
  const [timezone, setTimezone] = useState(defaultTimezone);
  const [defaultIdentifier, setDefaultIdentifier] = useState("userId");
  const [bucketingSeed, setBucketingSeed] = useState("");
  const [ownerId, setOwnerId] = useState<string | undefined>();
  const [teamId, setTeamId] = useState<string | undefined>();
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [namingConvention, setNamingConvention] = useState<string>("");

  const [requiredForProd, setRequiredForProd] = useState(false);
  const [minApprovers, setMinApprovers] = useState<number>(1);

  const [auditEnabled, setAuditEnabled] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState("");

  const [defaultFlagType, setDefaultFlagType] = useState<FlagType>("boolean");
  const [guardMode, setGuardMode] = useState<Guardrails["mode"]>("normal");
  const [maxRampPercent, setMaxRampPercent] = useState<number>(20);
  const [minHoldMinutes, setMinHoldMinutes] = useState<number>(30);

  const [integrations, setIntegrations] = useState<string[]>([]);
  const [sdkPlatforms, setSdkPlatforms] = useState<SdkPlatform[]>(["node", "react"]);

  const [envs, setEnvs] = useState<Env[]>(DEFAULT_ENVS);

  // Auto-slugify name → key on first entry
  useEffect(() => {
    if (!key) setKey(slugify(name));
  }, [name]);

  // Guardrail presets
  useEffect(() => {
    if (guardMode === "safe") {
      setMaxRampPercent(10);
      setMinHoldMinutes(60);
    } else if (guardMode === "normal") {
      setMaxRampPercent(20);
      setMinHoldMinutes(30);
    } else if (guardMode === "aggressive") {
      setMaxRampPercent(50);
      setMinHoldMinutes(10);
    }
  }, [guardMode]);

  const canSubmit = useMemo(() => {
    const nameOk = name.trim().length >= 2 && name.trim().length <= 50;
    const keyOk = /^[a-z0-9-]{2,40}$/.test(key);
    const tzOk = !!timezone;
    const envOk = envs.length >= 1;
    const identOk = /^[a-zA-Z_][a-zA-Z0-9_]{1,63}$/.test(defaultIdentifier);
    const webhookOk = !auditEnabled || (!webhookUrl || isValidUrl(webhookUrl));
    return nameOk && keyOk && tzOk && envOk && identOk && webhookOk;
  }, [name, key, timezone, envs, defaultIdentifier, auditEnabled, webhookUrl]);

  function isValidUrl(u: string) {
    try {
      new URL(u);
      return true;
    } catch {
      return false;
    }
  }

  // ENV operations
  const addEnv = () => {
    const next: Env = {
      id: crypto.randomUUID(),
      name: "",
      key: "",
      isProd: false,
      sdkKeys: { server: randomKey(32) },
    };
    setEnvs((p) => [...p, next]);
  };

  const removeEnv = (id: string) => setEnvs((p) => p.filter((e) => e.id !== id));

  const updateEnv = (id: string, patch: Partial<Env>) =>
    setEnvs((prev) => prev.map((e) => (e.id === id ? { ...e, ...patch } : e)));

  const onEnvNameChange = (id: string, v: string) => {
    updateEnv(id, { name: v });
    const slug = slugify(v);
    if (slug) updateEnv(id, { key: slug });
  };

  // Tag operations
  const addTag = () => {
    const t = tagInput.trim();
    if (!t) return;
    if (tags.includes(t)) return;
    setTags((p) => [...p, t]);
    setTagInput("");
  };
  const removeTag = (t: string) => setTags((p) => p.filter((x) => x !== t));

  // Submit
  const handleCreate = async () => {
    if (!canSubmit) return;

    const payload: ProjectCreate = {
      name: name.trim(),
      key,
      region,
      timezone,
      defaultIdentifier,
      bucketingSeed: bucketingSeed.trim() || undefined,
      ownerId,
      teamId,
      tags: tags.length ? tags : undefined,
      namingConvention: namingConvention.trim() || undefined,
      changeControl: requiredForProd
        ? { requiredForProd: true, minApprovers }
        : undefined,
      audit: auditEnabled ? { enabled: true, webhookUrl: webhookUrl || undefined } : { enabled: false },
      defaults: {
        flagType: defaultFlagType,
        guardrails: {
          mode: guardMode,
          maxRampPercent,
          minHoldMinutes,
        },
      },
      integrations,
      sdkPlatforms,
      environments: envs.map((e) => ({
        id: e.id,
        name: e.name || e.key || "",
        key: e.key,
        isProd: e.isProd,
        sdkKeys: e.sdkKeys,
      })),
    };

    await onCreate(payload);
  };

  if (!open) return null;

  return (
    <div className={styles.backdrop} role="dialog" aria-modal="true" aria-label="Create project">
      <div className={styles.modal}>
        {/* Header */}
        <div className={styles.header}>
          <div>
            <h2 className={styles.title}>Create project</h2>
            <div className={styles.subtitle}>Projects contain your environments, flags, rules and SDK keys.</div>
          </div>
          <button className={styles.iconBtn} onClick={onClose} aria-label="Close">✕</button>
        </div>

        {/* Body */}
        <div className={styles.body}>
          {/* Main section */}
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>Basics</h3>
            <div className={styles.grid2}>
              <LabeledInput
                label="Project name"
                required
                value={name}
                onChange={setName}
                placeholder="Payments Service"
                maxLength={50}
              />

              <LabeledInput
                label="Project key (slug)"
                required
                value={key}
                onChange={(v) => setKey(v.toLowerCase())}
                placeholder="payments-service"
                hint="Lowercase, a-z 0-9 -"
              />

              <LabeledSelect
                label="Timezone"
                value={timezone}
                onChange={setTimezone}
                options={TIMEZONES.map((t) => ({ value: t, label: t }))}
                hint="Used for scheduling rollouts like 'enable at 9:00'."
              />

              <LabeledSelect
                label="Region (data residency)"
                value={region}
                onChange={(v) => setRegion(v as Region)}
                options={[
                  { value: "US", label: "United States" },
                  { value: "EU", label: "European Union" },
                  { value: "APAC", label: "Asia Pacific" },
                ]}
                hint="Choose where your flag data & keys are hosted."
              />

              <LabeledInput
                label="Default user identifier"
                value={defaultIdentifier}
                onChange={setDefaultIdentifier}
                placeholder="userId"
                hint="Used to make rollouts sticky per user (e.g., userId/accountId)."
              />

              <LabeledInput
                label="Bucketing namespace/seed"
                value={bucketingSeed}
                onChange={setBucketingSeed}
                placeholder="(defaults to project key)"
                hint="Advanced: ensures consistent hashing across flags."
              />
            </div>
          </section>

          {/* Environments */}
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>Environments</h3>
            <div className={styles.envList}>
              {envs.map((env) => (
                <div className={styles.envRow} key={env.id}>
                  <div className={styles.envRowMain}>
                    <input
                      className={styles.input}
                      value={env.name}
                      onChange={(e) => onEnvNameChange(env.id, e.target.value)}
                      placeholder="Production"
                    />
                    <input
                      className={styles.input}
                      value={env.key}
                      onChange={(e) => updateEnv(env.id, { key: e.target.value.toLowerCase() })}
                      placeholder="production"
                    />
                    <label className={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        checked={env.isProd}
                        onChange={(e) => updateEnv(env.id, { isProd: e.target.checked })}
                      />
                      Prod
                    </label>
                  </div>
                  <div className={styles.envKeys}>
                    <LabeledInput
                      small
                      label="Server SDK key"
                      value={env.sdkKeys.server}
                      onChange={(v) => updateEnv(env.id, { sdkKeys: { ...env.sdkKeys, server: v } })}
                    />
                    <LabeledInput
                      small
                      label="Client SDK key (optional)"
                      value={env.sdkKeys.client || ""}
                      onChange={(v) => updateEnv(env.id, { sdkKeys: { ...env.sdkKeys, client: v || undefined } })}
                    />
                    <button className={styles.keyGenBtn} onClick={() => updateEnv(env.id, { sdkKeys: { ...env.sdkKeys, server: randomKey(32) } })}>↻</button>
                    <button className={styles.keyGenBtn} onClick={() => updateEnv(env.id, { sdkKeys: { ...env.sdkKeys, client: randomKey(28) } })}>↻</button>
                    <button className={styles.removeBtn} onClick={() => removeEnv(env.id)} aria-label="Remove environment">Remove</button>
                  </div>
                </div>
              ))}
            </div>
            <button className={styles.addEnvBtn} onClick={addEnv}>+ Add environment</button>
          </section>

          {/* Ownership & Tags */}
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>Ownership</h3>
            <div className={styles.grid3}>
              <LabeledSelect
                label="Owner"
                value={ownerId || ""}
                onChange={(v) => setOwnerId(v || undefined)}
                options={[{ value: "", label: "— None —" }, ...USERS.map((u) => ({ value: u.id, label: u.label }))]}
              />
              <LabeledSelect
                label="Team"
                value={teamId || ""}
                onChange={(v) => setTeamId(v || undefined)}
                options={[{ value: "", label: "— None —" }, ...TEAMS.map((t) => ({ value: t.id, label: t.label }))]}
              />
              <div>
                <label className={styles.label}>Tags</label>
                <div className={styles.tagRow}>
                  <input
                    className={styles.input}
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    placeholder="payments, beta"
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                  />
                  <button className={styles.secondaryBtn} onClick={addTag}>Add</button>
                </div>
                <div className={styles.tagChips}>
                  {tags.map((t) => (
                    <span className={styles.tagChip} key={t}>
                      {t}
                      <button onClick={() => removeTag(t)} aria-label={`Remove tag ${t}`}>×</button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Policies */}
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>Policies</h3>
            <div className={styles.grid3}>
              <div className={styles.boxRow}>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={requiredForProd}
                    onChange={(e) => setRequiredForProd(e.target.checked)}
                  />
                  Require approval for Production changes
                </label>
                {requiredForProd && (
                  <LabeledSelect
                    small
                    label="Min approvers"
                    value={String(minApprovers)}
                    onChange={(v) => setMinApprovers(Number(v))}
                    options={[1, 2, 3, 4, 5].map((n) => ({ value: String(n), label: String(n) }))}
                  />
                )}
              </div>

              <div className={styles.boxCol}>
                <label className={styles.label}>Guardrails</label>
                <div className={styles.row}>
                  <LabeledSelect
                    small
                    label="Preset"
                    value={guardMode || ""}
                    onChange={(v) => setGuardMode(v as Guardrails["mode"])}
                    options={[
                      { label: "Safe", value: "safe" },
                      { label: "Normal", value: "normal" },
                      { label: "Aggressive", value: "aggressive" },
                    ]}
                  />
                  <LabeledInput
                    small
                    label="Max ramp %"
                    type="number"
                    value={String(maxRampPercent)}
                    onChange={(v) => setMaxRampPercent(Number(v))}
                  />
                  <LabeledInput
                    small
                    label="Min hold (min)"
                    type="number"
                    value={String(minHoldMinutes)}
                    onChange={(v) => setMinHoldMinutes(Number(v))}
                  />
                </div>
                <div className={styles.hint}>Controls how fast you can increase exposure and the wait between steps.</div>
              </div>

              <div className={styles.boxCol}>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={auditEnabled}
                    onChange={(e) => setAuditEnabled(e.target.checked)}
                  />
                  Enable audit & webhooks
                </label>
                {auditEnabled && (
                  <LabeledInput
                    label="Webhook URL"
                    value={webhookUrl}
                    onChange={setWebhookUrl}
                    placeholder="https://..."
                  />
                )}
              </div>
            </div>
          </section>

          {/* Conventions & Integrations */}
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>Conventions & Integrations</h3>
            <div className={styles.grid3}>
              <LabeledInput
                label="Flag naming convention (regex)"
                value={namingConvention}
                onChange={setNamingConvention}
                placeholder="^[a-z0-9_]{3,50}$"
              />

              <LabeledSelect
                label="Default flag type"
                value={defaultFlagType}
                onChange={(v) => setDefaultFlagType(v as FlagType)}
                options={[
                  { value: "boolean", label: "Boolean" },
                  { value: "multivariate", label: "Multivariate" },
                  { value: "experiment", label: "Experiment" },
                ]}
              />

              <div>
                <label className={styles.label}>Integrations</label>
                <div className={styles.checkGrid}>
                  {INTEGRATIONS.map((i) => (
                    <label key={i.id} className={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        checked={integrations.includes(i.id)}
                        onChange={(e) =>
                          setIntegrations((prev) =>
                            e.target.checked ? [...prev, i.id] : prev.filter((x) => x !== i.id)
                          )
                        }
                      />
                      {i.label}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* SDK Platforms */}
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>SDK platforms to prep</h3>
            <div className={styles.checkGrid}>
              {SDK_PLATFORMS.map((p) => (
                <label key={p.id} className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={sdkPlatforms.includes(p.id)}
                    onChange={(e) =>
                      setSdkPlatforms((prev) =>
                        e.target.checked ? [...prev, p.id] : prev.filter((x) => x !== p.id)
                      )
                    }
                  />
                  {p.label}
                </label>
              ))}
            </div>
            <div className={styles.hint}>Used to render install snippets and env-aware examples right after creation.</div>
          </section>
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <button className={styles.secondaryBtn} onClick={onClose}>Cancel</button>
          <button className={styles.primaryBtn} disabled={!canSubmit} onClick={handleCreate}>
            Create project
          </button>
        </div>
      </div>
    </div>
  );
}

// ------------------------------
// Small form primitives
// ------------------------------
function LabeledInput({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  hint,
  required,
  small,
  maxLength,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  hint?: string;
  required?: boolean;
  small?: boolean;
  maxLength?: number;
}) {
  return (
    <div className={small ? styles.inputColSmall : styles.inputCol}>
      <label className={styles.label}>
        {label} {required && <span className={styles.req}>*</span>}
      </label>
      <input
        className={styles.input}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        type={type}
        maxLength={maxLength}
      />
      {hint && <div className={styles.hint}>{hint}</div>}
    </div>
  );
}

function LabeledSelect({
  label,
  value,
  onChange,
  options,
  hint,
  small,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  hint?: string;
  small?: boolean;
}) {
  return (
    <div className={small ? styles.inputColSmall : styles.inputCol}>
      <label className={styles.label}>{label}</label>
      <select className={styles.input} value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {hint && <div className={styles.hint}>{hint}</div>}
    </div>
  );
}

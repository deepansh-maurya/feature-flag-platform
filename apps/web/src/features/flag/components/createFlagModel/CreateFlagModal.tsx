import { useMemo, useState } from "react";
import styles from "../FeatureFlagsPage/FeatureFlagsPage.module.css";
import { EnvKey, Flag, FlagStatus, FlagType } from "../FeatureFlagsPage/FeatureFlagsPage";

// ---------------- Create Flag Modal ----------------
export default function CreateFlagModal({
  open,
  onClose,
  onCreate,
}: {
  open: boolean;
  onClose: () => void;
  onCreate: (flag: Flag) => void;
}) {
  const [name, setName] = useState("");
  const [key, setKey] = useState("");
  const [flagType, setFlagType] = useState<FlagType>("Boolean");
  const [desc, setDesc] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  const [enableDev, setEnableDev] = useState(true);
  const [enableStage, setEnableStage] = useState(true);
  const [enableProd, setEnableProd] = useState(false); // safe default OFF in prod

  const [prodStartState, setProdStartState] = useState<FlagStatus>("off"); // if enabled prod now

  const slug = useMemo(() => (key || slugify(name)), [key, name]);

  function addTag() {
    const t = tagInput.trim();
    if (!t) return;
    if (!tags.includes(t)) setTags((p) => [...p, t]);
    setTagInput("");
  }
  function removeTag(t: string) { setTags((p) => p.filter((x) => x !== t)); }

  const canSubmit = name.trim().length >= 3 && /^[a-z0-9_\-]{3,60}$/.test(slug);

  function submit() {
    if (!canSubmit) return;
    const envDefaults: Partial<Record<EnvKey, FlagStatus>> = {};
    if (enableDev) envDefaults.dev = "on";
    else envDefaults.dev = "off";
    if (enableStage) envDefaults.stage = "on";
    else envDefaults.stage = "off";
    if (enableProd) envDefaults.prod = prodStartState; // on/off/gradual
    else envDefaults.prod = "off";

    const created: Flag = {
      name: slug,
      type: flagType,
      status: envDefaults.prod || "off",
      targeting: [],
      lastModified: "just now",
      tags,
      envDefaults,
      description: desc || undefined,
    };
    onCreate(created);
  }

  if (!open) return null;

  return (
    <div className={styles.backdrop} role="dialog" aria-modal="true" aria-label="Create flag">
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>Create feature flag</h3>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close">✕</button>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.grid2}>
            <Field label="Flag name (display)" value={name} onChange={setName} placeholder="New checkout UI" autoFocus />
            <Field label="Flag key" value={slug} onChange={(v) => setKey(v.toLowerCase())} placeholder="new_checkout_ui" hint="Lowercase letters, numbers, -_" />
          </div>

          <div className={styles.grid2}>
            <Select
              label="Type"
              value={flagType}
              onChange={(v) => setFlagType(v as FlagType)}
              options={["Boolean", "% Rollout", "String", "Number", "Multivariate"].map((x) => ({ value: x, label: x }))}
            />
            <Field label="Description (optional)" value={desc} onChange={setDesc} placeholder="Short context for teammates" />
          </div>

          <div className={styles.sectionTitleSm}>Tags</div>
          <div className={styles.tagRow}>
            <input className={styles.input} value={tagInput} onChange={(e) => setTagInput(e.target.value)} placeholder="UI, growth…" onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())} />
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

          <div className={styles.sectionTitleSm}>Environments (initial state)</div>
          <div className={styles.envGrid}>
            <label className={styles.checkboxLabel}>
              <input type="checkbox" checked={enableDev} onChange={(e) => setEnableDev(e.target.checked)} /> dev — start ON
            </label>
            <label className={styles.checkboxLabel}>
              <input type="checkbox" checked={enableStage} onChange={(e) => setEnableStage(e.target.checked)} /> stage — start ON
            </label>
            <div className={styles.prodRow}>
              <label className={styles.checkboxLabel}>
                <input type="checkbox" checked={enableProd} onChange={(e) => setEnableProd(e.target.checked)} /> prod —
              </label>
              <select className={styles.input} disabled={!enableProd} value={prodStartState} onChange={(e) => setProdStartState(e.target.value as FlagStatus)}>
                <option value="off">Start OFF (recommended)</option>
                <option value="on">Start ON</option>
                <option value="gradual">Start GRADUAL</option>
              </select>
            </div>
          </div>
          <div className={styles.hint}>You can add targeting rules after creation. For now we just set the default state per environment.</div>
        </div>

        <div className={styles.modalFooter}>
          <button className={styles.secondaryBtn} onClick={onClose}>Cancel</button>
          <button className={styles.primaryBtn} disabled={!canSubmit} onClick={submit}>Create flag</button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, hint, autoFocus }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; hint?: string; autoFocus?: boolean;
}) {
  return (
    <div className={styles.inputCol}>
      <label className={styles.label}>{label}</label>
      <input className={styles.input} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} autoFocus={autoFocus} />
      {hint && <div className={styles.hint}>{hint}</div>}
    </div>
  );
}

function Select({ label, value, onChange, options }: {
  label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[];
}) {
  return (
    <div className={styles.inputCol}>
      <label className={styles.label}>{label}</label>
      <select className={styles.input} value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}

// -------------- utils --------------
function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-_]/g, "")
    .replace(/\s+/g, "_")
    .replace(/_+/g, "_")
    .slice(0, 60);
}
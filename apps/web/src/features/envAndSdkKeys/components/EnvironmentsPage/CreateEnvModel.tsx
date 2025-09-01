
// -----------------------------------------------------------------------------
// CreateEnvModal — simple UI, valuable fields (name, key, prod, default, keys)

import { useMemo, useState } from "react";
import styles from "./EnvironmentsPage.module.css";
import { Env } from "./EnvironmentsPage";

// -----------------------------------------------------------------------------
export default function CreateEnvModal({
  open,
  onClose,
  onCreate,
  existingNames,
  existingKeys,
  cloneableEnvs,
}: {
  open: boolean;
  onClose: () => void;
  onCreate: (env: Env) => void;
  existingNames: string[];
  existingKeys: string[];
  cloneableEnvs: Env[];
}) {
  const [name, setName] = useState ("");
  const [key, setKey] = useState("");
  const [isProd, setIsProd] = useState(false);
  const [isDefault, setIsDefault] = useState(false);
  const [allowClient, setAllowClient] = useState(true);
  const [serverKey, setServerKey] = useState(genKey(32));
  const [clientKey, setClientKey] = useState(genKey(28));
  const [cloneFrom, setCloneFrom] = useState<string>("");

  const slug = useMemo(() => (key || slugify(name)), [key, name]);

  const nameErr = useMemo(() => {
    const n = name.trim().toLowerCase();
    if (n.length < 2) return "Name too short";
    if (existingNames.includes(n)) return "Name already exists";
    return "";
  }, [name, existingNames]);

  const keyErr = useMemo(() => {
    const k = slug.toLowerCase();
    if (!/^[a-z0-9-]{2,30}$/.test(k)) return "Use a-z 0-9 - (2-30)";
    if (existingKeys.includes(k)) return "Key already exists";
    return "";
  }, [slug, existingKeys]);

  const canSubmit = !nameErr && !keyErr && (!!serverKey && (!allowClient || !!clientKey));

  function submit() {
    if (!canSubmit) return;

    const base: Env = {
      name: name.trim(),
      key: slug,
      isDefault,
      isProd,
      sdkKeys: { server: serverKey, client: allowClient ? clientKey : undefined },
      linkedFlags: [],
    };

    // Clone linked flags from another env if selected
    const source = cloneableEnvs.find((e) => (e.key || e.name) === cloneFrom);
    const withFlags = source ? { ...base, linkedFlags: [...(source.linkedFlags || [])] } : base;

    onCreate(withFlags);
  }

  if (!open) return null;

  return (
    <div className={styles.backdrop} role="dialog" aria-modal="true" aria-label="Create environment">
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>Create environment</h3>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close">✕</button>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.grid2}>
            <Field
              label="Environment name"
              value={name}
              onChange={setName}
              placeholder="Production"
              error={nameErr}
              autoFocus
            />
            <Field
              label="Environment key (slug)"
              value={slug}
              onChange={(v) => setKey(v.toLowerCase())}
              placeholder="production"
              error={keyErr}
            />
          </div>

          <div className={styles.rowSplit}>
            <label className={styles.checkboxLabel}>
              <input type="checkbox" checked={isProd} onChange={(e) => setIsProd(e.target.checked)} />
              Mark as Production environment
            </label>
            <label className={styles.checkboxLabel}>
              <input type="checkbox" checked={isDefault} onChange={(e) => setIsDefault(e.target.checked)} />
              Make default
            </label>
          </div>
          <div className={styles.hint}>Prod envs may enforce approvals/guardrails (set at project level).</div>

          <div className={styles.sectionTitleSm}>SDK keys</div>
          <div className={styles.grid2}>
            <Field label="Server SDK key" value={serverKey} onChange={setServerKey} />
            <div className={styles.rowSplit}>
              <label className={styles.checkboxLabel}>
                <input type="checkbox" checked={allowClient} onChange={(e) => setAllowClient(e.target.checked)} />
                Allow client-side SDK
              </label>
              {allowClient && (
                <div className={styles.clientKeyRow}>
                  <Field small label="Client SDK key" value={clientKey} onChange={setClientKey} />
                  <button className={styles.keyGenBtn} onClick={() => setClientKey(genKey(28))} title="Regenerate">↻</button>
                </div>
              )}
            </div>
          </div>
          <div className={styles.rowSplit}>
            <div className={styles.keyRowLeft}>
              <button className={styles.keyGenBtn} onClick={() => setServerKey(genKey(32))} title="Regenerate">↻</button>
              <span className={styles.hint}>Keep server keys secret (backend only).</span>
            </div>
          </div>

          <div className={styles.sectionTitleSm}>Clone flags (optional)</div>
          <div className={styles.grid2}>
            <Select
              label="Copy linked flags from"
              value={cloneFrom}
              onChange={setCloneFrom}
              options={[{ value: "", label: "— None —" }, ...cloneableEnvs.map((e) => ({ value: e.key || e.name, label: e.name }))]}
            />
          </div>
        </div>

        <div className={styles.modalFooter}>
          <button className={styles.secondaryBtn} onClick={onClose}>Cancel</button>
          <button className={styles.primaryBtn} disabled={!canSubmit} onClick={submit}>
            Create environment
          </button>
        </div>
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Small primitives
// -----------------------------------------------------------------------------
function Field({ label, value, onChange, placeholder, error, autoFocus, small }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  error?: string;
  autoFocus?: boolean;
  small?: boolean;
}) {
  return (
    <div className={small ? styles.inputColSmall : styles.inputCol}>
      <label className={styles.label}>{label}</label>
      <input
        className={`${styles.input} ${error ? styles.inputErr : ""}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
      />
      {error ? <div className={styles.error}>{error}</div> : null}
    </div>
  );
}

function Select({ label, value, onChange, options }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className={styles.inputCol}>
      <label className={styles.label}>{label}</label>
      <select className={styles.input} value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Utils
// -----------------------------------------------------------------------------
function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 30);
}

function genKey(len = 24) {
  if (typeof crypto === "undefined" || !crypto.getRandomValues) {
    return Array.from({ length: len }, () => Math.floor(Math.random() * 36).toString(36)).join("");
  }
  return Array.from(crypto.getRandomValues(new Uint8Array(len)))
    .map((b) => (b % 36).toString(36))
    .join("");
}

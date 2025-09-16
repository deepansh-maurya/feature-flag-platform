import { useMemo, useState, useEffect } from "react";
import styles from "./CreateEnvModal.module.css";
import { Env } from "./EnvironmentsPage";

export default function CreateEnvModal({
  open,
  onClose,
  onCreate,
  onUpdate,
  initial,
  existingNames,
  existingKeys,
  cloneableEnvs,
}: {
  open: boolean;
  onClose: () => void;
  onCreate?: (env: Env) => void;
  onUpdate?: (env: Env) => void;
  initial?: Env | null;
  existingNames: string[];
  existingKeys: string[];
  cloneableEnvs: Env[];
}) {
  const [name, setName] = useState (initial?.name ?? "");
  const [key, setKey] = useState(initial?.key ?? "");
  const [isProd, setIsProd] = useState(initial?.isProd ?? false);
  const [isDefault, setIsDefault] = useState(initial?.isDefault ?? false);

  useEffect(() => {
    if (!open) return;
    setName(initial?.name ?? "");
    setKey(initial?.key ?? "");
    setIsProd(initial?.isProd ?? false);
    setIsDefault(initial?.isDefault ?? false);
  }, [initial, open]);

  const slug = useMemo(() => (key || slugify(name)), [key, name]);
  // When editing, exclude the current env's own name/key from the uniqueness checks
  const filteredExistingNames = useMemo(() =>
    initial ? existingNames.filter((n) => n !== initial.name.toLowerCase()) : existingNames,
    [existingNames, initial]
  );

  const filteredExistingKeys = useMemo(() =>
    initial ? existingKeys.filter((k) => k !== (initial.key ?? '').toLowerCase()) : existingKeys,
    [existingKeys, initial]
  );

  const nameErr = useMemo(() => {
    const n = name.trim().toLowerCase();
    if (n.length < 2) return "Name too short";
    if (filteredExistingNames.includes(n)) return "Name already exists";
    return "";
  }, [name, filteredExistingNames]);

  const keyErr = useMemo(() => {
    const k = slug.toLowerCase();
    if (!/^[a-z0-9-]{2,30}$/.test(k)) return "Use a-z 0-9 - (2-30)";
    if (filteredExistingKeys.includes(k)) return "Key already exists";
    return "";
  }, [slug, filteredExistingKeys]);

  const isDirty = useMemo(() => {
    if (!initial) return true; // create mode -> treat as dirty when fields valid
    const nameChanged = name.trim() !== (initial.name ?? "");
    const keyChanged = slug !== (initial.key ?? "");
    const prodChanged = isProd !== !!initial.isProd;
    const defChanged = isDefault !== !!initial.isDefault;
    return nameChanged || keyChanged || prodChanged || defChanged;
  }, [initial, name, slug, isProd, isDefault]);

  const canSubmit = !nameErr && !keyErr && (initial ? isDirty : true);


  // if open becomes true after initial changes, ensure local state is synced
  // (simple approach: re-init when initial changes)
  if (!open) return null;

  return (
    <div className={styles.backdrop} role="dialog" aria-modal="true" aria-label="Create environment">
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>{initial ? 'Update environment' : 'Create environment'}</h3>
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
        </div>

        <div className={styles.modalFooter}>
          <button className={styles.secondaryBtn} onClick={onClose}>Cancel</button>
          <button
            className={styles.primaryBtn}
            disabled={!canSubmit}
            onClick={() => {
              if (!canSubmit) return;
              const env: Env = {
                name: name.trim(),
                key: slug,
                isDefault,
                isProd,
                linkedFlags: [],
              };
              console.log(env);
              if (initial && onUpdate) {
                onUpdate(env);
                return;
              }
              if (!initial && onCreate) {
                onCreate(env);
              }
            }}
          >
            {initial ? 'Update environment' : 'Create environment'}
          </button>
        </div>
      </div>
    </div>
  );
}

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
        disabled={label.includes("key") && value != ""}
      />
      {error && label.includes("key") && value == "" ? <div className={styles.error}>{error}</div> : null}
    </div>
  );
}

function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 30);
}

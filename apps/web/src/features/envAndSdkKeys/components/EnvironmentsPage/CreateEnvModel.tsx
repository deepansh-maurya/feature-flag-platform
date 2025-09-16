import { useMemo, useState } from "react";
import styles from "./CreateEnvModal.module.css";
import { Env } from "./EnvironmentsPage";

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

  const canSubmit = !nameErr && !keyErr 


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
              
              onCreate(env);
            }}
          >
            Create environment
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
      />
      {error ? <div className={styles.error}>{error}</div> : null}
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

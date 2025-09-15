import { useMemo, useState, useEffect } from "react";
import { useCreateFlag, useUpsertMeta } from "@/src/features/flag/hooks";
import styles from "./CreateFlagModal.module.css";
import { Flag } from "../../types";

// ---------------- Create Flag Modal ----------------
export default function CreateFlagModal({
  open,
  onClose,
  onCreate,
  onUpdate,
  projectId,
  initial,
}: {
  open: boolean;
  onClose: () => void;
  onCreate: (flag: Flag) => void;
  onUpdate?: (flag: Flag) => void;
  projectId?: string;
  initial?: Flag | null;
}) {
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const createMutation = useCreateFlag(projectId);
  const upsertMutation = useUpsertMeta(projectId);

  // prefill when editing
  useEffect(() => {
    if (!initial) {
      setName("");
      setDesc("");
      setTags([]);
      setTagInput("");
      return;
    }
    setName(initial.name || "");
    setDesc(initial.description || "");
    setTags(initial.tags || []);
    setTagInput("");
  }, [initial]);

  function addTag() {
    const t = tagInput.trim();
    if (!t) return;
    if (!tags.includes(t)) setTags((p) => [...p, t]);
    setTagInput("");
  }
  function removeTag(t: string) {
    setTags((p) => p.filter((x) => x !== t));
  }

  if (!open) return null;

  return (
    <div
      className={styles.backdrop}
      role="dialog"
      aria-modal="true"
      aria-label="Create flag"
    >
      <div className={styles.modal}>
          <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>{initial ? 'Update feature flag' : 'Create feature flag'}</h3>
          <button
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.grid2}>
            <Field
              label="Flag name (display)"
              value={name}
              onChange={setName}
              placeholder="New checkout UI"
              autoFocus
            />
            <Field
              label="Description (optional)"
              value={desc}
              onChange={setDesc}
              placeholder="Short context for teammates"
            />
          </div>

          <div className={styles.sectionTitleSm}>Tags</div>
          <div className={styles.tagRow}>
            <input
              className={styles.input}
              style={{width:"100%"}}
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              placeholder="UI, growth…"
              onKeyDown={(e) =>
                e.key === "Enter" && (e.preventDefault(), addTag())
              }
            />
            <button className={styles.secondaryBtn} onClick={addTag}>
              Add
            </button>
          </div>
          <div className={styles.tagChips}>
            {tags.map((t) => (
              <span className={styles.tagChip} key={t}>
                {t}
                <button
                  onClick={() => removeTag(t)}
                  aria-label={`Remove tag ${t}`}
                >
                  ×
                </button>
              </span>
            ))}
          </div>

          <div className={styles.hint}>
            You can add targeting rules after creation.
          </div>
        </div>

        <div className={styles.modalFooter}>
          <button className={styles.secondaryBtn} onClick={onClose}>
            Cancel
          </button>
          <button
            className={styles.primaryBtn}
            onClick={() => {
              if (!projectId) {
                alert('projectId not provided');
                return;
              }

              if (initial && initial.id) {
                // update metadata (name, tags)
                const payload = {
                  flagId: initial.id,
                  name,
                  tags,
                } as any;
                upsertMutation.mutate(payload, {
                  onSuccess: () => {
                    const updated: Flag = {
                      ...initial,
                      name,
                      description: desc || undefined,
                      tags,
                      lastModified: 'just now',
                    };
                    onUpdate ? onUpdate(updated) : onCreate(updated);
                    onClose();
                  },
                  onError: (err: any) => {
                    alert('Failed to update flag: ' + (err?.message || err));
                  },
                });
                return;
              }

              const payload = {
                projectId,
                key: slugify(name),
                name,
                description: desc || undefined,
                tags,
              } as any;

              createMutation.mutate(payload, {
                onSuccess: () => {
                  onCreate({
                    name,
                    status: "off",
                    lastModified: "just now",
                    tags,
                  });
                  onClose();
                },
                onError: (err: any) => {
                  alert('Failed to create flag: ' + (err?.message || err));
                },
              });
            }}
          >
            {initial ? 'Update flag' : 'Create flag'}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  hint,
  autoFocus
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  hint?: string;
  autoFocus?: boolean;
}) {
  return (
    <div className={styles.inputCol}>
      <label className={styles.label}>{label}</label>
      <input
        className={styles.input}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
      />
      {hint && <div className={styles.hint}>{hint}</div>}
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

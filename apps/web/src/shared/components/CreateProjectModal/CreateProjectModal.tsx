"use client";
import React, { useEffect, useMemo, useState } from "react";
import styles from "./CreateProjectModal.module.css";
import { Env, Guardrails, ProjectCreate, Region } from "../../types/types";
import { useCreateProject } from "@/src/features/projects/hooks";

const slugify = (s: string) =>
  s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 40);

const SDK_PLATFORMS = [
  { id: "node", label: "Node.js" },
  { id: "python", label: "Python" },
  { id: "java", label: "Java" },
  { id: "kotlin", label: "Kotlin" },
  { id: "swift", label: "Swift" },
  { id: "objectivec", label: "Objective-C" },
  { id: "c", label: "C" },
  { id: "cpp", label: "C++" },
  { id: "csharp", label: "C#" },
  { id: "fsharp", label: "F#" },
  { id: "go", label: "Go" },
  { id: "rust", label: "Rust" },
  { id: "ruby", label: "Ruby" },
  { id: "php", label: "PHP" },
  { id: "perl", label: "Perl" },
  { id: "scala", label: "Scala" },
  { id: "elixir", label: "Elixir" },
  { id: "erlang", label: "Erlang" },
  { id: "haskell", label: "Haskell" },
  { id: "clojure", label: "Clojure" },
  { id: "dart", label: "Dart" },
  { id: "r", label: "R" }
];

export interface CreateProjectModalProps {
  open: boolean;
  onClose: () => void;
  defaultTimezone?: string; // e.g., from user profile
}

export default function CreateProjectModal({
  open,
  onClose,
  defaultTimezone = "Asia/Kolkata"
}: CreateProjectModalProps) {
  const [TIMEZONES, setTimezones] = useState<string[]>([]);

  useEffect(() => {
    setTimezones(Intl.supportedValuesOf("timeZone"));
  }, []);

  const [name, setName] = useState("");
  const [timezone, setTimezone] = useState(defaultTimezone);
  const [guardMode, setGuardMode] = useState<"Normal" | "Safe" | "Aggressive">(
    "Normal"
  );
  const [sdkPlatforms, setSdkPlatforms] = useState<any[]>(["node", "react"]);

  const [guardRails, setGuardRails] = useState({
    Safe: {
      key: "Safe",
      maxRampPercent: 10,
      minHoldMinutes: 60
    },
    Normal: {
      key: "Normal",
      maxRampPercent: 20,
      minHoldMinutes: 50
    },
    Aggressive: {
      key: "Aggressive",
      maxRampPercent: 50,
      minHoldMinutes: 10
    }
  });

  console.log(guardRails, guardMode);

  const canSubmit = useMemo(() => {
    const nameOk = name.trim().length >= 2 && name.trim().length <= 50;
    const tzOk = !!timezone;
    return nameOk && tzOk;
  }, [name, timezone]);

  const project = useCreateProject();

  const onSubmit = () => {
    project.mutate(
      {
        guardrails: guardRails as any,
        langSupport: sdkPlatforms,
        name: name,
        timeZone: timezone
      },
      {
        onSuccess(data) {
          console.log(data);
        }
      }
    );
  };

  return (
    open && (
      <div
        className={styles.backdrop}
        role="dialog"
        aria-modal="true"
        aria-label="Create project"
      >
        <div className={styles.modal}>
          {/* Header */}
          <div className={styles.header}>
            <div>
              <h2 className={styles.title}>Create project</h2>
              <div className={styles.subtitle}>
                Projects contain your environments, flags, rules and SDK keys.
              </div>
            </div>
            <button
              className={styles.iconBtn}
              onClick={onClose}
              aria-label="Close"
            >
              ✕
            </button>
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

                <LabeledSelect
                  label="Timezone"
                  value={timezone}
                  onChange={setTimezone}
                  options={TIMEZONES.map((t) => ({ value: t, label: t }))}
                  hint="Used for scheduling rollouts like 'enable at 9:00'."
                  required
                />
              </div>
            </section>

            {/* Policies */}
            <section className={styles.section}>
              <h3 className={styles.sectionTitle}>
                Guardrails <span className={styles.req}>*</span>
              </h3>
              <div className={styles.grid3}>
                <div className={styles.boxCol}>
                  <div className={styles.row}>
                    <LabeledSelect
                      small
                      label="Preset"
                      value={guardMode || ""}
                      onChange={(v: any) => setGuardMode(v)}
                      options={[
                        { label: "Safe", value: "safe" },
                        { label: "Normal", value: "normal" },
                        { label: "Aggressive", value: "aggressive" }
                      ]}
                    />
                    <LabeledInput
                      small
                      label="Max ramp %"
                      type="number"
                      value={String(guardRails[guardMode]?.maxRampPercent)}
                      onChange={(v) =>
                        setGuardRails((prev) => ({
                          ...prev,
                          [guardMode as string]: {
                            maxRampPercent: v,
                            minHoldMinutes: prev?.[guardMode].minHoldMinutes
                          }
                        }))
                      }
                    />
                    <LabeledInput
                      small
                      label="Min hold (min)"
                      type="number"
                      value={String(guardRails[guardMode]?.minHoldMinutes)}
                      onChange={(v) =>
                        setGuardRails((prev) => ({
                          ...prev,
                          [guardMode as string]: {
                            minHoldMinutes: v,
                            maxRampPercent: prev?.[guardMode].maxRampPercent
                          }
                        }))
                      }
                    />
                  </div>
                  <div className={styles.hint}>
                    Controls how fast you can increase exposure and the wait
                    between steps.
                  </div>
                </div>
              </div>
            </section>

            {/* SDK Platforms */}
            <section className={styles.section}>
              <h3 className={styles.sectionTitle}>
                SDK platforms to prep <span className={styles.req}>*</span>
              </h3>
              <div className={styles.checkGrid}>
                {SDK_PLATFORMS.map((p) => (
                  <label key={p.id} className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={sdkPlatforms.includes(p.id)}
                      onChange={(e) =>
                        setSdkPlatforms((prev) =>
                          e.target.checked
                            ? [...prev, p.id]
                            : prev.filter((x) => x !== p.id)
                        )
                      }
                    />
                    {p.label}
                  </label>
                ))}
              </div>
              <div className={styles.hint}>
                Used to render install snippets and env-aware examples right
                after creation.
              </div>
            </section>
          </div>

          {/* Footer */}
          <div className={styles.footer}>
            <button className={styles.secondaryBtn} onClick={onClose}>
              Cancel
            </button>
            <button
              onClick={onSubmit}
              className={styles.primaryBtn}
              disabled={!canSubmit}
            >
              Create project
            </button>
          </div>
        </div>
      </div>
    )
  );
}

function LabeledInput({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  hint,
  required,
  small,
  maxLength
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
  required
}: {
  label: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  value?: string;
  hint?: string;
  small?: boolean;
  required?: boolean;
}) {
  return (
    <div className={small ? styles.inputColSmall : styles.inputCol}>
      <label className={styles.label}>
        {label} {required && <span className={styles.req}>*</span>}
      </label>
      <select
        className={styles.input}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((o) => (
          <option key={o.label} value={o.label}>
            {o.label}
          </option>
        ))}
      </select>
      {hint && <div className={styles.hint}>{hint}</div>}
    </div>
  );
}

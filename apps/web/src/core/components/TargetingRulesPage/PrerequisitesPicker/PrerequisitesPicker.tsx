import React, { useEffect, useMemo, useRef, useState } from "react";
import "./PrerequisitesPicker.css"
/**
 * PrerequisitesPicker
 * -------------------------------------------------------------
 * UI to attach prerequisite flags to the current flag.
 * - Click "Set prerequisite" to open a dropdown of available flags.
 * - Clicking a flag adds it to the ordered list below.
 * - Use ↑/↓ to change evaluation order; ❌ to remove.
 * - (Optional) Choose required variations per prerequisite.
 *
 * Business impact (why this matters):
 * - Keeps dependencies explicit → prevents leaking child features.
 * - Ordered evaluation makes behavior deterministic → fewer prod surprises.
 * - Inline, self-serve config → faster reviews and safer rollouts.
 */

// ---------- Types ----------
export type Variation = { key: string; name?: string };
export type FlagMeta = { key: string; name: string; variations: Variation[] };
export type Prereq = { flagKey: string; variationKeys: string[] };

export type PrerequisitesPickerProps = {
  availableFlags: FlagMeta[]; // all flags in project (for this env)
  value?: Prereq[];           // initial selected prereqs (ordered)
  onChange?: (next: Prereq[]) => void;
  maxPrereqs?: number;        // optional cap, e.g. 5
  disabled?: boolean;
};

export default function PrerequisitesPicker({
  availableFlags,
  value = [],
  onChange,
  maxPrereqs = 5,
  disabled = false,
}: PrerequisitesPickerProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<Prereq[]>(value);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // Keep parent informed
  useEffect(() => { onChange?.(items); }, [items]);
  useEffect(() => { setItems(value); }, [JSON.stringify(value)]); // reflect external updates

  // Filter out flags already chosen & search
  const chosenKeys = new Set(items.map(i => i.flagKey));
  const options = useMemo(() => {
    const q = query.trim().toLowerCase();
    return availableFlags
      .filter(f => !chosenKeys.has(f.key))
      .filter(f => !q || f.name.toLowerCase().includes(q) || f.key.toLowerCase().includes(q));
  }, [availableFlags, query, items]);

  // Close dropdown on outside click
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!open) return;
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  function addFlag(flag: FlagMeta) {
    if (disabled) return;
    if (items.length >= maxPrereqs) return;
    setItems(prev => [...prev, { flagKey: flag.key, variationKeys: [] }]);
    setQuery("");
    // keep dropdown open for quick multi-adds
  }

  function removeAt(idx: number) {
    if (disabled) return;
    setItems(prev => prev.filter((_, i) => i !== idx));
  }

  function move(idx: number, dir: -1 | 1) {
    if (disabled) return;
    const next = [...items];
    const j = idx + dir;
    if (j < 0 || j >= next.length) return;
    const [it] = next.splice(idx, 1);
    next.splice(j, 0, it);
    setItems(next);
  }

  function updateVariations(idx: number, nextKeys: string[]) {
    if (disabled) return;
    const next = [...items];
    next[idx] = { ...next[idx], variationKeys: nextKeys };
    setItems(next);
  }

  function flagMeta(key: string) { return availableFlags.find(f => f.key === key); }

  return (
    <div className="prq-container" aria-disabled={disabled}>
      {/* <div className="prq-header">
        <div className="prq-title">Prerequisites</div>
        <div className="prq-sub">These flags must pass before this flag is evaluated.</div>
      </div> */}

      <div className="prq-actions" ref={dropdownRef}>
        <button
          type="button"
          className="prq-btn"
          disabled={disabled || items.length >= maxPrereqs}
          onClick={() => setOpen(v => !v)}
          aria-expanded={open}
        >
          Set prerequisite
          <span className="prq-caret" aria-hidden>▾</span>
        </button>

        {open && (
          <div className="prq-dropdown" role="listbox">
            <input
              className="prq-search"
              type="text"
              placeholder="Search flags…"
              value={query}
              onChange={e => setQuery(e.target.value)}
              autoFocus
            />
            <div className="prq-options">
              {options.length === 0 && (
                <div className="prq-empty">No flags available</div>
              )}
              {options.map(opt => (
                <button
                  key={opt.key}
                  type="button"
                  className="prq-option"
                  onClick={() => addFlag(opt)}
                  role="option"
                >
                  <span className="prq-opt-name">{opt.name}</span>
                  <span className="prq-opt-key">{opt.key}</span>
                </button>
              ))}
            </div>
            <div className="prq-footer">{items.length}/{maxPrereqs} added</div>
          </div>
        )}
      </div>

      <ul className="prq-list">
        {items.map((it, idx) => {
          const meta = flagMeta(it.flagKey);
          return (
            <li key={it.flagKey} className="prq-item">
              <div className="prq-item-row">
                <div className="prq-item-main">
                  <div className="prq-flag-name">{meta?.name || it.flagKey}</div>
                </div>
                <div className="prq-item-ctrls">
                  <button className="prq-icon" onClick={() => move(idx, -1)} disabled={idx===0 || disabled} aria-label="Move up">↑</button>
                  <button className="prq-icon" onClick={() => move(idx, +1)} disabled={idx===items.length-1 || disabled} aria-label="Move down">↓</button>
                  <button className="prq-icon prq-danger" onClick={() => removeAt(idx)} disabled={disabled} aria-label="Remove">❌</button>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

    
    </div>
  );
}
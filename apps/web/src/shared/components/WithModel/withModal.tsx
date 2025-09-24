import React, { useEffect, useRef, useState } from "react";
import "./withModel.css"
/**
 * withModal HOC
 * -------------------------------------------------------------
 * A higher-order component that wraps any component in an accessible modal.
 * You can use it to show RuleSetPreview, PrerequisitesPicker, or any other UI.
 *
 * Business impact:
 * - Lets PMs/devs preview configs without leaving the editor → faster reviews.
 * - Reusable pattern reduces duplicated modal code across dashboard pages.
 */

export type WithModalInjectedProps = {
  /** Optional title shown in the modal header */
  modalTitle?: string;
  /** Optional className for the dialog container */
  modalClassName?: string;
};

export type WithModalOuterProps<T> = {
  /** Props to pass to the wrapped component */
  componentProps: T;
  /** Text/element for the trigger button */
  trigger?: React.ReactNode;
  /** Control the modal from parent (optional). If omitted, HOC manages internal state */
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Optional title for the modal */
  modalTitle?: string;
  modalClassName?: string;
};

export function withModal<T extends object>(Component: React.ComponentType<T & WithModalInjectedProps>) {
  return function ModalWrapped(props: WithModalOuterProps<T>) {
    const { componentProps, trigger, isOpen, onOpenChange, modalTitle, modalClassName } = props;

    const [internalOpen, setInternalOpen] = useState(false);
    const open = typeof isOpen === "boolean" ? isOpen : internalOpen;
    const setOpen = (v: boolean) => (onOpenChange ? onOpenChange(v) : setInternalOpen(v));

    const dialogRef = useRef<HTMLDivElement | null>(null);
    const lastActiveRef = useRef<HTMLElement | null>(null);

    // focus management: trap focus inside modal; restore on close
    useEffect(() => {
      if (open) {
        lastActiveRef.current = document.activeElement as HTMLElement | null;
        setTimeout(() => dialogRef.current?.focus(), 0);
        const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
      } else if (lastActiveRef.current) {
        lastActiveRef.current.focus?.();
      }
    }, [open]);

    function onBackdrop(e: React.MouseEvent) {
      if (e.target === e.currentTarget) setOpen(false);
    }

    return (
      <>
        {/* Only render trigger button if a trigger prop was provided */}
        {typeof trigger !== 'undefined' && (
          <button className="wm-trigger" onClick={() => setOpen(true)}>
            {trigger ?? "Open"}
          </button>
        )}

        {open && (
          <div className="wm-backdrop" onMouseDown={onBackdrop}>
            <div
              className={`wm-dialog ${modalClassName ?? ""}`}
              role="dialog"
              aria-modal="true"
              aria-label={modalTitle || "Dialog"}
              tabIndex={-1}
              ref={dialogRef}
            >
              <div className="wm-head">
                <div className="wm-title">{modalTitle ?? ""}</div>
                <button className="wm-close" onClick={() => setOpen(false)} aria-label="Close">✕</button>
              </div>
              <div className="wm-body">
                <Component {...(componentProps as T)} modalTitle={modalTitle} />
              </div>
            </div>
          </div>
        )}

      
      </>
    );
  };
}

// ---------------- Example usage ----------------
// Assuming you already have RuleSetPreview from the other canvas document:
// import RuleSetPreview from "./RuleSetPreview";

/* // Dummy types to avoid TS errors in this isolated file. Replace with your real ones.
// Remove these when you import the actual component.
// BEGIN DUMMIES
export type DummyRuleSet = { defaultVar: string; rules: any[]; prerequisites?: any[] };
function DummyRuleSetPreview(p: { ruleSet: DummyRuleSet; modalTitle?: string }) {
  return (
    <div>
      <div style={{ fontWeight: 700, marginBottom: 6 }}>{p.modalTitle || "RuleSet Preview"}</div>
      <pre style={{ background:'#f7f7f7', border:'1px solid #283462', borderRadius:8, padding:8, maxHeight:400, overflow:'auto' }}>
        {JSON.stringify(p.ruleSet, null, 2)}
      </pre>
    </div>
  );
}
// END DUMMIES
 */
/* 
export const PreviewModal = withModal(DummyRuleSetPreview);

// Simple demo harness
export function DemoModal() {
  const ruleSet: DummyRuleSet = {
    defaultVar: "control",
    rules: [ { kind: "allow", match: { cond: { attr: "country", op: "eq", value: "IN" } }, outcome: { fixedVariation: "on" } } ],
    prerequisites: [ { flagKey: "enable_checkout", variations: ["on"] } ]
  };

  return (
    <div style={{ display:'grid', gap: 12 }}>
      <PreviewModal
        trigger={<span>Open JSON Preview</span>}
        modalTitle="RuleSet Preview"
        componentProps={{ ruleSet }}
      />
    </div>
  );
}
 */
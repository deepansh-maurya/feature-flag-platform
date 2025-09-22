import { useState } from "react";
import styles from "./TargetingRulesPage.module.css";

export default function InlineAdd({ onAdd, autofocus }: { onAdd: (t: string) => void; autofocus?: boolean }) {
  const [val, setVal] = useState("");
  return (
    <div className={styles.inlineAdd}>
      <input
        className={styles.input}
        value={val}
        onChange={(e) => setVal(e.target.value)}
        placeholder="e.g., Turn ON for users in India with plan=pro"
        autoFocus={autofocus}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            const v = val.trim();
            if (v) onAdd(v);
            setVal("");
          }
        }}
      />
      <button className={styles.secondaryBtn} onClick={() => { const v = val.trim(); if (v) onAdd(v); setVal(""); }}>+</button>
    </div>
  );
}

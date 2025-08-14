import { Flag, Version } from "./TargetingRulesPage";
import styles from "./TargetingRulesPage.module.css";

export default function VersionHistoryModal({ versions, current, onRestore, onClose }: { versions: Version []; current: Flag; onRestore: (f: Flag) => void; onClose: () => void }) {
  return (
    <div className={styles.backdrop} role="dialog" aria-modal="true">
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <div className={styles.modalTitle}>Version History</div>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>
        <div className={styles.modalBody}>
          {versions.length === 0 ? (
            <div className={styles.emptyInline}>No versions yet. Click Save to snapshot.</div>
          ) : (
            <ul className={styles.versionList}>
              {versions.map((v) => (
                <li key={v.id} className={styles.versionItem}>
                  <div>
                    <div className={styles.versionTitle}>{new Date(v.ts).toLocaleString()} · {v.author}</div>
                    <div className={styles.versionNote}>{v.note || ""}</div>
                  </div>
                  <div className={styles.versionActions}>
                    <button className={styles.secondaryBtn} onClick={() => onRestore(structuredClone(v.snapshot))}>Restore</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
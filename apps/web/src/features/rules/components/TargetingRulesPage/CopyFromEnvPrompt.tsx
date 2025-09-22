import { EnvKey } from "../../types";
import styles from "./TargetingRulesPage.module.css";

export default function CopyFromEnvPrompt({ env, hasDev, hasStage, onCopy, onScratch, onClose }: {
  env: EnvKey; hasDev: boolean; hasStage: boolean; onCopy: (src: EnvKey) => void; onScratch: () => void; onClose: () => void;
}) {
  return (
    <div className={styles.backdrop}>
      <div className={styles.modalSmall}>
        <div className={styles.modalHeader}>
          <div className={styles.modalTitle}>Start rules for {env}</div>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>
        <div className={styles.modalBody}>
          <div className={styles.hint}>Do you want to copy rules from another environment or start from scratch?</div>
          <div className={styles.copyRow}>
            {hasDev && <button className={styles.secondaryBtn} onClick={() => onCopy("dev")}>Copy from dev</button>}
            {hasStage && <button className={styles.secondaryBtn} onClick={() => onCopy("stage")}>Copy from stage</button>}
            <button className={styles.primaryBtn} onClick={onScratch}>Start from scratch</button>
          </div>
        </div>
      </div>
    </div>
  );
}

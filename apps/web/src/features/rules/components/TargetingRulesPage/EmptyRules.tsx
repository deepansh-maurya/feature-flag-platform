import { Segment } from "../../types";
import InlineAdd from "./InlineAdd";
import styles from "./TargetingRulesPage.module.css";

export default function EmptyRules({ onAdd, onDropSegment }: { onAdd: (t: string) => void; onDropSegment: (s: Segment) => void }) {
  return (
    <div className={styles.emptyCard}
      onDragOver={(e) => e.preventDefault()}
     
    >
      <div className={styles.illu}>🧩</div>
      <div className={styles.emptyTitle}>No rules yet</div>
      <div className={styles.emptyDesc}>Type a simple sentence to add your first rule, or drag a global segment from the left.</div>
      <InlineAdd onAdd={onAdd} autofocus />
    </div>
  );
}
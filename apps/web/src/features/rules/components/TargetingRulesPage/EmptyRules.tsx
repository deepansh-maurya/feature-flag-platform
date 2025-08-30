import InlineAdd from "./InlineAdd";
import { Segment, SEGMENTS } from "./TargetingRulesPage";
import styles from "./TargetingRulesPage.module.css";

export default function EmptyRules({ onAdd, onDropSegment }: { onAdd: (t: string) => void; onDropSegment: (s: Segment) => void }) {
  return (
    <div className={styles.emptyCard}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        const key = e.dataTransfer.getData("text/segment");
        const seg = SEGMENTS.find((x) => x.key === key);
        if (seg) onDropSegment(seg);
      }}
    >
      <div className={styles.illu}>🧩</div>
      <div className={styles.emptyTitle}>No rules yet</div>
      <div className={styles.emptyDesc}>Type a simple sentence to add your first rule, or drag a global segment from the left.</div>
      <InlineAdd onAdd={onAdd} autofocus />
    </div>
  );
}
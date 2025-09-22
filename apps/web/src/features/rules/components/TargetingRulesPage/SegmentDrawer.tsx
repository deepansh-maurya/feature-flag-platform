import { Segment } from "../../types";
import styles from "./TargetingRulesPage.module.css";

export default function SegmentsDrawer({ segments, onClose, onDrop }: { segments: Segment[]; onClose: () => void; onDrop: (s: Segment) => void }) {
  return (
    <div className={styles.drawerBackdrop}>
      <aside className={styles.drawer}>
        <div className={styles.drawerHeader}>
          <div className={styles.drawerTitle}>Global Segments</div>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>
        <div className={styles.drawerBody}>
          {segments.map((s) => (
            <div key={s.key} className={styles.segmentRow}
              draggable
              onDragStart={(e) => e.dataTransfer.setData("text/segment", s.key)}
            >
              <div className={styles.segmentName}>#{s.name}</div>
              <div className={styles.segmentHint}>{s.hint}</div>
              <button className={styles.miniBtn} onClick={() => onDrop(s)}>Insert</button>
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}
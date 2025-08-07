"use clientc"
import React, { useState } from 'react';
import styles from './AnalyticsPage.module.css';

// Dummy flag usage data
const flagUsage = [
  { name: "dark_mode_v2", usage: 1270, api: 4200 },
  { name: "referral_program", usage: 820, api: 1700 },
  { name: "onboarding_ui", usage: 310, api: 1000 }
];

// For "Who saw what" simulation
const users = [
  { id: "u123", context: { region: "IN", plan: "pro" }, flags: ["dark_mode_v2", "referral_program"] },
  { id: "u294", context: { region: "US", plan: "free" }, flags: ["onboarding_ui"] }
];

export default function AnalyticsPage() {
  const [userId, setUserId] = useState("");
  const [result, setResult] = useState<null | { flags: string[] }>(null);

  function handleSimulate() {
    const user = users.find(u => u.id === userId.trim());
    setResult(user ? { flags: user.flags } : { flags: [] });
  }

  function exportCsv() {
    alert('Export as CSV (not implemented in static demo)');
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.headerRow}>
        <div className={styles.headerTitle}>Feature Flag Analytics</div>
        <button className={styles.csvBtn} onClick={exportCsv}>Export as CSV</button>
      </div>

      {/* Heatmap / Usage */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>Flag Usage Heatmap</div>
        <div className={styles.heatmapGrid}>
          {flagUsage.map(f => (
            <div className={styles.heatmapCard} key={f.name}>
              <div className={styles.flagName}>{f.name}</div>
              <div className={styles.usageBarWrap}>
                <div className={styles.usageBarBg}>
                  <div
                    className={styles.usageBar}
                    style={{ width: Math.min(f.usage / 14, 100) + "%" }}
                  ></div>
                </div>
                <span className={styles.usageVal}>{f.usage}</span>
              </div>
              <div className={styles.apiStat}>API Requests: {f.api}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Who saw what */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>Who Saw What?</div>
        <div className={styles.simForm}>
          <input
            className={styles.input}
            placeholder="Enter user id (e.g., u123)"
            value={userId}
            onChange={e => setUserId(e.target.value)}
          />
          <button className={styles.simBtn} onClick={handleSimulate}>Simulate</button>
        </div>
        {result && (
          <div className={styles.simResult}>
            <div>
              {result.flags.length === 0
                ? "No flags active for this user."
                : (
                  <>
                    <span className={styles.simActive}>Active Flags:</span>
                    {result.flags.map(f => (
                      <span key={f} className={styles.simFlag}>{f}</span>
                    ))}
                  </>
                )
              }
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

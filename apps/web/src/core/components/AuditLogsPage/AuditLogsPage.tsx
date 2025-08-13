"use client"
import React, { useState } from 'react';
import styles from './AuditLogsPage.module.css';

const logs = [
  {
    time: "4 min ago",
    user: "Deepansh",
    type: "Flag Toggle",
    flag: "dark_mode_v2",
    change: "Toggled ON",
    before: "off",
    after: "on"
  },
  {
    time: "24 min ago",
    user: "Ankit",
    type: "Rule Update",
    flag: "onboarding_ui",
    change: "Updated targeting rule",
    before: "plan=free",
    after: "plan=pro"
  },
  {
    time: "2 hrs ago",
    user: "Sana",
    type: "SDK Key Regen",
    flag: "prod",
    change: "Regenerated SDK Key",
    before: "prod-xYZ123...ZZa",
    after: "prod-ZZG889...Ab8"
  }
];

// Static user/filter lists (demo)
const USERS = ["All", "Deepansh", "Ankit", "Sana"];
const FLAGS = ["All", "dark_mode_v2", "onboarding_ui", "prod"];
const TYPES = ["All", "Flag Toggle", "Rule Update", "SDK Key Regen"];

export default function AuditLogsPage() {
  const [user, setUser] = useState("All");
  const [flag, setFlag] = useState("All");
  const [type, setType] = useState("All");

  // No actual filtering logic, just UI
  return (
    <div className={styles.wrapper}>
      <div className={styles.headerRow}>
        <div className={styles.headerTitle}>Audit Logs</div>
      </div>
      <div className={styles.filters}>
        <select className={styles.filterSelect} value={user} onChange={e => setUser(e.target.value)}>
          {USERS.map(u => <option key={u}>{u}</option>)}
        </select>
        <select className={styles.filterSelect} value={flag} onChange={e => setFlag(e.target.value)}>
          {FLAGS.map(f => <option key={f}>{f}</option>)}
        </select>
        <select className={styles.filterSelect} value={type} onChange={e => setType(e.target.value)}>
          {TYPES.map(t => <option key={t}>{t}</option>)}
        </select>
      </div>
      <div className={styles.timeline}>
        {logs.map((log, i) => (
          <div className={styles.logItem} key={i}>
            <div className={styles.logMeta}>
              <span className={styles.logUser}>{log.user}</span>
              <span className={styles.logType}>{log.type}</span>
              <span className={styles.logFlag}>{log.flag}</span>
              <span className={styles.logTime}>{log.time}</span>
            </div>
            <div className={styles.logChange}>{log.change}</div>
            <div className={styles.logDiff}>
              <div>
                <span className={styles.beforeTag}>Before:</span>
                <span className={styles.diffVal}>{log.before}</span>
              </div>
              <div>
                <span className={styles.afterTag}>After:</span>
                <span className={styles.diffVal}>{log.after}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

"use client"

import React, { useState } from 'react';
import styles from './FeatureFlagsPage.module.css';

const allFlags = [
  {
    name: "dark_mode_v2",
    type: "Boolean",
    status: "on",
    targeting: ["plan=pro"],
    lastModified: "2 min ago"
  },
  {
    name: "referral_program",
    type: "% Rollout",
    status: "gradual",
    targeting: ["region=IN", "plan=free"],
    lastModified: "5 min ago"
  },
  {
    name: "onboarding_ui",
    type: "String",
    status: "off",
    targeting: [],
    lastModified: "20 min ago"
  }
];

const ENV_OPTIONS = ["All", "dev", "stage", "prod"];
const STATUS_OPTIONS = ["All", "on", "off", "gradual"];
const TAGS_OPTIONS = ["A/B", "UI", "backend"];

export default function FeatureFlagsPage() {
  const [flags, setFlags] = useState(allFlags);
  const [env, setEnv] = useState("All");
  const [status, setStatus] = useState("All");
  const [tag, setTag] = useState("All");

  // Filters: all dummy, does not actually filter here (plug backend later)
  // Toggle logic (inline)
  function toggleFlag(i: number) {
    setFlags(f =>
      f.map((flag, idx) =>
        idx === i
          ? {
              ...flag,
              status: flag.status === "on" ? "off" : "on"
            }
          : flag
      )
    );
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.headerRow}>
        <div className={styles.headerTitle}>All Feature Flags</div>
        <button className={styles.createBtn}>+ Create Flag</button>
      </div>

      {/* Filters */}
      <div className={styles.filters}>
        <select className={styles.filterSelect} value={env} onChange={e => setEnv(e.target.value)}>
          {ENV_OPTIONS.map(opt => <option key={opt}>{opt}</option>)}
        </select>
        <select className={styles.filterSelect} value={status} onChange={e => setStatus(e.target.value)}>
          {STATUS_OPTIONS.map(opt => <option key={opt}>{opt}</option>)}
        </select>
        <select className={styles.filterSelect} value={tag} onChange={e => setTag(e.target.value)}>
          <option>All</option>
          {TAGS_OPTIONS.map(opt => <option key={opt}>{opt}</option>)}
        </select>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Flag Name</th>
              <th>Type</th>
              <th>Status</th>
              <th>Targeting Rules</th>
              <th>Last Modified</th>
              <th style={{textAlign:"center"}}>Toggle</th>
            </tr>
          </thead>
          <tbody>
            {flags.map((f, i) => (
              <tr key={f.name}>
                <td className={styles.flagName}>{f.name}</td>
                <td>{f.type}</td>
                <td>
                  {f.status === "on" ? (
                    <span className={styles.statusOn}>ON</span>
                  ) : f.status === "off" ? (
                    <span className={styles.statusOff}>OFF</span>
                  ) : (
                    <span className={styles.statusGradual}>GRADUAL</span>
                  )}
                </td>
                <td>
                  {f.targeting.length ? (
                    f.targeting.map((rule, idx) => (
                      <span key={idx} className={styles.ruleTag}>
                        {rule}
                      </span>
                    ))
                  ) : (
                    <span className={styles.noRules}>—</span>
                  )}
                </td>
                <td>{f.lastModified}</td>
                <td className={styles.toggleCol}>
                  <label className={styles.switch}>
                    <input
                      type="checkbox"
                      checked={f.status === "on"}
                      onChange={() => toggleFlag(i)}
                    />
                    <span className={styles.slider}></span>
                  </label>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

"use client"

import React, { useState } from 'react';
import styles from './TargetingRulesPage.module.css';

type Rule = {
  name: string;
  conditions: string[];
  flag: string;
  priority: number;
  enabled: boolean;
};

const initialRules: Rule[] = [
  {
    name: "Pro Users in US",
    conditions: ["plan=pro", "region=US"],
    flag: "dark_mode_v2",
    priority: 1,
    enabled: true
  },
  {
    name: "All India Free Users",
    conditions: ["plan=free", "region=IN"],
    flag: "referral_program",
    priority: 2,
    enabled: false
  },
  {
    name: "Default",
    conditions: ["*"],
    flag: "onboarding_ui",
    priority: 3,
    enabled: true
  }
];

export default function TargetingRulesPage() {
  const [rules, setRules] = useState(initialRules);

  // Demo reorder logic (move rule up)
  function moveRule(idx: number, dir: 'up' | 'down') {
    let arr = [...rules];
    if (
      (dir === 'up' && idx === 0) ||
      (dir === 'down' && idx === arr.length - 1)
    )
      return;
    const swapIdx = dir === 'up' ? idx - 1 : idx + 1;
    [arr[idx], arr[swapIdx]] = [arr[swapIdx], arr[idx]];
    setRules(arr.map((r, i) => ({ ...r, priority: i + 1 })));
  }

  // Enable/disable rule
  function toggleEnable(idx: number) {
    setRules(rules =>
      rules.map((r, i) =>
        i === idx ? { ...r, enabled: !r.enabled } : r
      )
    );
  }

  // Dummy edit/delete
  function editRule(idx: number) {
    alert("Edit Rule - not implemented in static demo");
  }
  function deleteRule(idx: number) {
    setRules(rules => rules.filter((_, i) => i !== idx));
  }
  function addRule() {
    alert("Add Rule - not implemented in static demo");
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.headerRow}>
        <div className={styles.headerTitle}>Targeting Rules</div>
        <button className={styles.addBtn} onClick={addRule}>+ Add Rule</button>
      </div>
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Priority</th>
              <th>Rule Name</th>
              <th>Conditions</th>
              <th>Assigned Flag</th>
              <th>Status</th>
              <th style={{textAlign:"center"}}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rules.map((rule, idx) => (
              <tr key={rule.name + idx}>
                <td>
                  <div className={styles.priorityBox}>
                    #{rule.priority}
                    <button
                      className={styles.reorderBtn}
                      onClick={() => moveRule(idx, 'up')}
                      disabled={idx === 0}
                      title="Move Up"
                    >▲</button>
                    <button
                      className={styles.reorderBtn}
                      onClick={() => moveRule(idx, 'down')}
                      disabled={idx === rules.length - 1}
                      title="Move Down"
                    >▼</button>
                  </div>
                </td>
                <td className={styles.ruleName}>{rule.name}</td>
                <td>
                  {rule.conditions.map((c, i) => (
                    <span className={styles.condTag} key={i}>{c}</span>
                  ))}
                </td>
                <td>
                  <span className={styles.flagTag}>{rule.flag}</span>
                </td>
                <td>
                  <label className={styles.switch}>
                    <input
                      type="checkbox"
                      checked={rule.enabled}
                      onChange={() => toggleEnable(idx)}
                    />
                    <span className={styles.slider}></span>
                  </label>
                </td>
                <td className={styles.actionCol}>
                  <button className={styles.editBtn} onClick={() => editRule(idx)} title="Edit Rule">✏️</button>
                  <button className={styles.deleteBtn} onClick={() => deleteRule(idx)} title="Delete Rule">🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

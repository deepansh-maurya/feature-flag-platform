
"use client"

import React from 'react';
import styles from './SdkKeysPage.module.css';

const sdkKeys = [
  {
    env: "dev",
    key: "dev-2k5JxzZb7Yp4h",
    created: "2024-07-01",
    lastUsed: "2024-08-07 13:22",
    usage: 1200,
    limit: 10000
  },
  {
    env: "stage",
    key: "stage-jqB99sZZgF7",
    created: "2024-07-01",
    lastUsed: "2024-08-05 08:40",
    usage: 740,
    limit: 5000
  },
  {
    env: "prod",
    key: "prod-XtW0m8aAkpQ",
    created: "2024-07-01",
    lastUsed: "2024-08-07 15:14",
    usage: 3300,
    limit: 25000
  }
];

export default function SdkKeysPage() {
  function handleRegenerate(env: string) {
    alert(`Regenerate SDK key for ${env} (not implemented)`);
  }

  function handleCopyKey(key: string) {
    navigator.clipboard.writeText(key);
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.headerRow}>
        <div className={styles.headerTitle}>SDK Keys</div>
      </div>
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead className='head'>
            <tr>
              <th>Environment</th>
              <th>SDK Key</th>
              <th>Created On</th>
              <th>Last Used</th>
              <th>Usage</th>
              <th style={{textAlign:'center'}}>Actions</th>
            </tr>
          </thead>
          <tbody className='body'>
            {sdkKeys.map(k => (
              <tr key={k.env}>
                <td>
                  <span className={styles.envTag}>{k.env}</span>
                </td>
                <td className={styles.sdkKeyCell}>
                  <span className={styles.sdkKey}>{k.key}</span>
                  <button
                    className={styles.copyBtn}
                    onClick={() => handleCopyKey(k.key)}
                    title="Copy"
                  >📋</button>
                </td>
                <td>{k.created}</td>
                <td>{k.lastUsed}</td>
                <td>
                  <span className={styles.usageVal}>{k.usage}</span>
                  <span className={styles.usageLimit}>/ {k.limit}</span>
                </td>
                <td className={styles.actionCol}>
                  <button
                    className={styles.regenBtn}
                    onClick={() => handleRegenerate(k.env)}
                  >Regenerate</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

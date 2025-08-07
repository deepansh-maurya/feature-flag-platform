"use client"

import React, { useState } from 'react';
import styles from './EnvironmentsPage.module.css';

type Env = {
  name: string;
  isDefault: boolean;
  linkedFlags: string[];
};

const initialEnvs: Env[] = [
  { name: "dev", isDefault: false, linkedFlags: ["onboarding_ui", "dark_mode_v2"] },
  { name: "stage", isDefault: false, linkedFlags: ["dark_mode_v2"] },
  { name: "prod", isDefault: true, linkedFlags: ["dark_mode_v2", "referral_program"] }
];

export default function EnvironmentsPage() {
  const [envs, setEnvs] = useState(initialEnvs);

  function setDefault(idx: number) {
    setEnvs(envs => envs.map((e, i) => ({
      ...e,
      isDefault: i === idx
    })));
  }

  function deleteEnv(idx: number) {
    if (envs[idx].isDefault) return;
    setEnvs(envs => envs.filter((_, i) => i !== idx));
  }

  function addEnv() {
    const name = prompt("New environment name? (dev/stage/prod/custom)")?.trim();
    if (!name) return;
    setEnvs(envs => [...envs, { name, isDefault: false, linkedFlags: [] }]);
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.headerRow}>
        <div className={styles.headerTitle}>Environments</div>
        <button className={styles.addBtn} onClick={addEnv}>+ Add Environment</button>
      </div>
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Default</th>
              <th>Linked Flags</th>
              <th style={{textAlign:'center'}}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {envs.map((env, idx) => (
              <tr key={env.name}>
                <td className={styles.envName}>{env.name}</td>
                <td>
                  {env.isDefault ? (
                    <span className={styles.defaultTag}>Default</span>
                  ) : (
                    <button
                      className={styles.setDefaultBtn}
                      onClick={() => setDefault(idx)}
                      title="Set as default"
                    >Set Default</button>
                  )}
                </td>
                <td>
                  {env.linkedFlags.length === 0 ? (
                    <span className={styles.noFlags}>—</span>
                  ) : (
                    env.linkedFlags.map(flag => (
                      <span className={styles.flagTag} key={flag}>{flag}</span>
                    ))
                  )}
                </td>
                <td className={styles.actionCol}>
                  <button
                    className={styles.deleteBtn}
                    onClick={() => deleteEnv(idx)}
                    title={env.isDefault ? "Can't delete default" : "Delete"}
                    disabled={env.isDefault}
                  >🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

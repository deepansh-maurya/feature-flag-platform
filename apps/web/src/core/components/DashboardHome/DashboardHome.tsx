"use client"

import React from 'react';
import styles from './DashboardHome.module.css';

const kpis = [
  { label: "Projects", value: 4 },
  { label: "Feature Flags", value: 23 },
  { label: "API Calls (30d)", value: "37,200" }
];

const recentActivity = [
  {
    type: 'flag',
    desc: "Toggled ON: `dark_mode_v2`",
    user: "Deepansh",
    time: "4 min ago"
  },
  {
    type: 'rule',
    desc: "Updated targeting rule for `onboarding_flow`",
    user: "Deepansh",
    time: "20 min ago"
  },
  {
    type: 'project',
    desc: "Created project: `Payments`",
    user: "Deepansh",
    time: "1 hr ago"
  },
  {
    type: 'flag',
    desc: "Toggled OFF: `referral_program`",
    user: "Deepansh",
    time: "2 hr ago"
  }
];

export default function DashboardHome() {
  return (
    <div className={styles.wrapper}>
      {/* Welcome */}
      <div className={styles.welcome}>
        <span>👋</span> Welcome back, <span className={styles.username}>Deepansh</span>
      </div>

      {/* KPIs */}
      <div className={styles.kpiGrid}>
        {kpis.map(kpi => (
          <div className={styles.kpiCard} key={kpi.label}>
            <div className={styles.kpiValue}>{kpi.value}</div>
            <div className={styles.kpiLabel}>{kpi.label}</div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className={styles.sectionHeader}>Recent Activity</div>
      <div className={styles.activityTimeline}>
        {recentActivity.map((item, i) => (
          <div className={styles.activityItem} key={i}>
            <div className={styles.activityType}>{getTypeIcon(item.type)}</div>
            <div className={styles.activityDesc}>
              <span className={styles.activityText}>{item.desc}</span>
              <span className={styles.activityUser}>by {item.user}</span>
              <span className={styles.activityTime}>{item.time}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className={styles.actions}>
        <button className={styles.createBtn}>+ Create Project</button>
        <button className={styles.createBtn}>+ Create Feature Flag</button>
      </div>
    </div>
  );
}

// Simple icon helper
function getTypeIcon(type: string) {
  if (type === 'flag')
    return <span className={styles.flagIcon}>🚩</span>;
  if (type === 'project')
    return <span className={styles.projectIcon}>📁</span>;
  if (type === 'rule')
    return <span className={styles.ruleIcon}>⚡</span>;
  return null;
}

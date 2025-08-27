// DashboardHome.tsx
// TODO toggle optional from client sdk key
// did not get the tags
// Conventions & Integrations did not get the posthog datadog, segment, \
// amplitude
// sdk platforms to prep

"use client";

import React, { useEffect, useState } from "react";
import styles from "./DashboardHome.module.css";
import CreateProjectModal from "../CreateProjectModal/CreateProjectModal";
import Observer from "../../../../app/observer";
import { useRouter } from "next/navigation";
import { Routes } from "@/app/constants";

// ---- Types ----
export type ActivityItem = {
  type: "flag" | "project" | "rule";
  desc: string;
  user: string;
  time: string;
};

export interface DashboardHomeProps {
  username?: string;
  stats?: {
    projects: number;
    flags: number;
    apiCalls30d: number | string;
  };
  activity?: ActivityItem[];
  onCreateFlag?: () => void;
  onCreateProject?: () => void;
}

// ---- Component ----
export default function DashboardHome({
  username = "Deepansh",
  stats = { projects: 0, flags: 0, apiCalls30d: 0 },
  activity = [],
  onCreateFlag
}: DashboardHomeProps) {
  const hasProjects = (stats?.projects ?? 0) > 0;
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const onCreateProject = () => {
    setIsOpen(!isOpen);
  };
  useEffect(() => {
    Observer.add("model", (obj: any) => {
      if (obj.openCreateProjectModel) {
        setIsOpen(true);
      }
    });
    return () => Observer.remove("model");
  });

  return (
    <div className={styles.wrapper}>
      {/* Welcome */}
      <div className={styles.welcome}>
        <span aria-hidden>👋</span> Welcome back,{" "}
        <span className={styles.username}>{username}</span>
      </div>

      {/* Main content switches on whether any project exists */}
      {hasProjects ? (
        <>
          {/* KPIs */}
          <div className={styles.kpiGrid} role="list" aria-label="Key metrics">
            <KpiCard label="Projects" value={String(stats.projects)} />
            <KpiCard label="Feature Flags" value={String(stats.flags)} />
            <KpiCard
              label="API Calls (30d)"
              value={String(stats.apiCalls30d)}
            />
          </div>

          {/* Recent Activity */}
          <div className={styles.sectionHeader}>Recent Activity</div>
          <div className={styles.activityTimeline} aria-live="polite">
            {activity.length === 0 ? (
              <div className={styles.emptyInline}>No activity yet.</div>
            ) : (
              activity.map((item, i) => (
                <div className={styles.activityItem} key={i} role="listitem">
                  <div className={styles.activityType}>
                    {getTypeIcon(item.type)}
                  </div>
                  <div className={styles.activityDesc}>
                    <span className={styles.activityText}>{item.desc}</span>
                    <span className={styles.activityMeta}>
                      <span className={styles.activityUser}>
                        by {item.user}
                      </span>
                      <span className={styles.activityTime}>{item.time}</span>
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Actions */}
          <div className={styles.actions}>
            <button
              className={styles.createBtn}
              onClick={onCreateProject}
              aria-label="Create a new project"
            >
              + Create Project
            </button>
            <button
              className={styles.createBtn}
              onClick={onCreateFlag}
              aria-label="Create a new feature flag"
            >
              + Create Feature Flag
            </button>
          </div>
        </>
      ) : (
        // ------- EMPTY STATE (no projects yet) -------
        <div
          className={styles.emptyCard}
          role="region"
          aria-label="Get started"
        >
          <div className={styles.illu} aria-hidden>
            🚀
          </div>
          <h2 className={styles.emptyTitle}>Create your first project</h2>
          <p className={styles.emptyDesc}>
            Projects are containers for your environments, flags, rules, and SDK
            keys. Start by creating a project—then add environments (prod, dev),
            and create your first flag.
          </p>

          <div className={styles.steps}>
            <div className={styles.step}>
              <span className={styles.stepBadge}>1</span>
              <div>
                <div className={styles.stepTitle}>Create a project</div>
                <div className={styles.stepText}>
                  Name it (e.g., <code>Payments</code>) and choose default
                  environments.
                </div>
              </div>
            </div>
            <div className={styles.step}>
              <span className={styles.stepBadge}>2</span>
              <div>
                <div className={styles.stepTitle}>Add a feature flag</div>
                <div className={styles.stepText}>
                  Configure targeting rules and rollout %.
                </div>
              </div>
            </div>
            <div className={styles.step}>
              <span className={styles.stepBadge}>3</span>
              <div>
                <div className={styles.stepTitle}>Install the SDK</div>
                <div className={styles.stepText}>
                  Use your client/server keys to evaluate flags in code.
                </div>
              </div>
            </div>
          </div>

          <div className={styles.emptyActions}>
            <button
              className={`${styles.createBtn} ${styles.mutedBtn}`}
              onClick={onCreateProject}
              autoFocus
            >
              + Create Project
            </button>
            <button
              className={`${styles.createBtn} ${styles.mutedBtn}`}
              disabled
            >
              + Create Feature Flag
            </button>
            <button
              className={`${styles.btn} ${styles.lg} ${styles.pro}`} // choose variant(s)
              onClick={() => router.push(Routes.Billing)}
            >
              <span className={styles.label}>
                Choose a plan
                <span className={styles.sub}>Compare features & pricing</span>
              </span>
            </button>
          </div>

          <div className={styles.tip}>
            Pro tip: you’ll unlock flags, rules and SDK keys after creating a
            project.
          </div>
        </div>
      )}

      <CreateProjectModal
        open={isOpen}
        onClose={() => setIsOpen(false)}
        onCreate={async (payload) => {
          // POST to your API then close + refresh
          // await api.createProject(payload)
          console.log(payload);
          setIsOpen(false);
        }}
        defaultTimezone="Asia/Kolkata"
        defaultRegion="US"
      />
    </div>
  );
}

// ---- Subcomponents ----
function KpiCard({ label, value }: { label: string; value: string }) {
  return (
    <div className={styles.kpiCard} role="listitem" tabIndex={0}>
      <div className={styles.kpiValue}>{value}</div>
      <div className={styles.kpiLabel}>{label}</div>
    </div>
  );
}

// Simple icon helper (kept from your original)
function getTypeIcon(type: "flag" | "project" | "rule") {
  if (type === "flag") return <span className={styles.flagIcon}>🚩</span>;
  if (type === "project") return <span className={styles.projectIcon}>📁</span>;
  if (type === "rule") return <span className={styles.ruleIcon}>⚡</span>;
  return null;
}

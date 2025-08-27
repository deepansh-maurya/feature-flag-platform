"use client";

import React, { useState } from "react";
import styles from "./TopNavBar.module.css";
import { Routes } from "../../../../app/constants";
import { useRouter } from "next/navigation";
import Observer from "../../../../app/observer";
import Link from "next/link";

const projects = [{ name: "Project" }];

const user = {
  name: "Deepansh",
  avatar: "https://i.pravatar.cc/40?img=5"
};

const tabs = [
  { tab: "Environments", route: Routes.Environment },
  { tab: "Flags", route: Routes.Featureflag },
  { tab: "Rules", route: Routes.Rules },
  { tab: "SDK Keys", route: Routes.SdkKeys },
  { tab: "Analytics", route: Routes.Analytics },
  { tab: "Logs", route: Routes.AuditLogs },
  { tab: "Projects", route: Routes.Projects }
];

export default function TopNavBar() {
  const [projectMenuOpen, setProjectMenuOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(projects[0]);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState({ tab: "", route: () => {} });
  const router = useRouter();

  return (
    <header className={styles.navbar}>
      {/* LEFT: Project dropdown */}
      <div className={styles.left}>
        <div
          className={styles.projectDropdown}
          onClick={() => setProjectMenuOpen((v) => !v)}
          tabIndex={0}
        >
          <span className={styles.projectName}>
            {selectedProject ? selectedProject.name : "Select Project"}
          </span>
          <span className={styles.dropdownArrow}>▼</span>
        </div>
        <button
          onClick={() => Observer.seData({ openCreateProjectModel: true })}
          className={styles.addProjectBtn}
        >
          +
        </button>
        {projectMenuOpen && (
          <div className={styles.projectMenu}>
            {projects.map((p) => (
              <div
                key={p.name}
                className={styles.projectMenuItem}
                onClick={() => {
                  setSelectedProject(p);
                  setProjectMenuOpen(false);
                  setActiveTab(tabs[0]);
                  router.push("/dashboard");
                }}
              >
                {p.name}
              </div>
            ))}
            <div
              onClick={() => Observer.seData({ openCreateProjectModel: true })}
              className={styles.projectMenuAdd}
            >
              + Add Project
            </div>
          </div>
        )}
      </div>

      {/* MIDDLE: Horizontal tabs */}
      <nav className={styles.tabs}>
        {tabs.map((tab) => (
          <Link
            href={tab.route()}
            key={tab.tab}
            className={`${styles.tab} ${activeTab.tab === tab.tab ? styles.activeTab : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.tab}
          </Link>
        ))}
      </nav>

      {/* RIGHT: User profile dropdown */}
      <div className={styles.right}>
        <div
          className={styles.userProfile}
          onClick={() => setUserMenuOpen((v) => !v)}
          tabIndex={0}
        >
          <img src={user.avatar} alt="avatar" className={styles.avatar} />
          <span className={styles.userName}>{user.name}</span>
        </div>
        {userMenuOpen && (
          <div className={styles.userMenu}>
            <div
              onClick={() => router.push(Routes.Account())}
              className={styles.userMenuItem}
            >
              Account Settings
            </div>
            <div
              onClick={() => router.push(Routes.Team())}
              className={styles.userMenuItem}
            >
              Team Management
            </div>
            <div
              onClick={() => router.push(Routes.Billing())}
              className={styles.userMenuItem}
            >
              Billing
            </div>
            <div className={styles.userMenuItem}>Logout</div>
          </div>
        )}
      </div>
    </header>
  );
}

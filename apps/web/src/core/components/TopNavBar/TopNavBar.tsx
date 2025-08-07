"use client";

import React, { useState } from "react";
import styles from "./TopNavBar.module.css";
import { Routes } from "../../constants/routes";

const projects = [
  { name: "MainApp" },
  { name: "Payments" },
  { name: "Internal Tools" }
];

const user = {
  name: "Deepansh",
  avatar: "https://i.pravatar.cc/40?img=5" // replace with actual user avatar
};

const tabs = [
  { tab: "Environments", route: Routes.Environment },
  { tab: "Feature Flags", route: Routes.Featureflag },
  { tab: "Targeting Rules", route: Routes.Rules },
  { tab: "SDK Keys", route: Routes.SdkKeys },
  { tab: "Analytics", route: Routes.Analytics },
  { tab: "Audit Logs", route: Routes.Analytics }
];

export default function TopNavBar() {
  const [projectMenuOpen, setProjectMenuOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(projects[0]);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(tabs[0]);

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
        <button className={styles.addProjectBtn}>+</button>
        {projectMenuOpen && (
          <div className={styles.projectMenu}>
            {projects.map((p) => (
              <div
                key={p.name}
                className={styles.projectMenuItem}
                onClick={() => {
                  setSelectedProject(p);
                  setProjectMenuOpen(false);
                }}
              >
                {p.name}
              </div>
            ))}
            <div className={styles.projectMenuAdd}>+ Add Project</div>
          </div>
        )}
      </div>

      {/* MIDDLE: Horizontal tabs */}
      <nav className={styles.tabs}>
        {tabs.map((tab) => (
          <a
            href={tab.route}
            key={tab.tab}
            className={`${styles.tab} ${activeTab === tab ? styles.activeTab : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.tab}
          </a>
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
            <div className={styles.userMenuItem}>Account Settings</div>
            <div className={styles.userMenuItem}>Team Management</div>
            <div className={styles.userMenuItem}>Billing</div>
            <div className={styles.userMenuItem}>Logout</div>
          </div>
        )}
      </div>
    </header>
  );
}

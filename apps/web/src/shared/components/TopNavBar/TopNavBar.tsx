"use client";

import React, { useEffect, useState } from "react";
import styles from "./TopNavBar.module.css";
import { Routes } from "../../../../app/constants";
import { useRouter } from "next/navigation";
import Observer from "../../../../app/observer";
import Link from "next/link";
import { useProjects } from "@/src/features/projects/hooks";
import { ProjectSummaryDto } from "@/src/features/projects/types";

// const projects = [{ name: "Project" }];

const user = {
  name: "Deepansh",
  avatar: "https://i.pravatar.cc/40?img=5"
};

const tabs = [
  { tab: "Projects", route: Routes.Projects },
  { tab: "Flags", route: Routes.Featureflag },
  { tab: "Rules", route: Routes.Rules },
  { tab: "Keys", route: Routes.SdkKeys },
  { tab: "Environments", route: Routes.Environment },
  { tab: "Analytics", route: Routes.Analytics },
  { tab: "Logs", route: Routes.AuditLogs },
];

export default function TopNavBar() {
  const { data: projects, isLoading } = useProjects(20);
  const [projectMenuOpen, setProjectMenuOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<ProjectSummaryDto>();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState({ tab: "", route: () => {} });
  const router = useRouter();

  useEffect(() => {
    if (projects?.items && projects.items.length > 0) {
      setSelectedProject(projects.items[0]);
    }
  }, [projects]);

  return (
    <header className={styles.navbar}>
      {/* LEFT: Project dropdown */}
      <div className={styles.left}>
        <div
          onClick={() => {
            router.push(Routes.dashboard());
          }}
          className="h-8 w-8 rounded-lg mr-5 bg-gradient-to-br from-indigo-400 to-fuchsia-500 shadow-inner"
        />

        <div className="flex">
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

          {projectMenuOpen && (
            <div className={styles.projectMenu}>
              {projects?.items?.map((p) => (
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
                onClick={() =>
                  Observer.seData({ openCreateProjectModel: true })
                }
                className={styles.projectMenuAdd}
              >
                + Add Project
              </div>
            </div>
          )}
        </div>
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

"use client";

import React, { useState } from "react";
import styles from "./ProjectsPage.module.css";
import CreateProjectModal from "@/src/shared/components/CreateProjectModal/CreateProjectModal";
import { useSubscription } from "@/src/features/billing/hooks";

const projects: any = [
  // {
  //   name: "MainApp",
  //   sdkKey: "abc123xyz",
  //   createdOn: "2024-06-04",
  //   members: ["Deepansh", "Ankit", "Sana"]
  // },
  // {
  //   name: "Payments",
  //   sdkKey: "pay789key",
  //   createdOn: "2024-07-10",
  //   members: ["Deepansh"]
  // },
  // {
  //   name: "Internal Tools",
  //   sdkKey: "int001key",
  //   createdOn: "2024-07-27",
  //   members: ["Deepansh", "Rohit"]
  // }
];

export default function ProjectsPage() {
  const [isOpen, setIsOpen] = useState(false);
  const { data } = useSubscription();
  console.log(data);

  return (
    <div className={styles.wrapper}>
      <div className={styles.headerRow}>
        <div className={styles.headerTitle}>Projects</div>
        <button
          onClick={() => setIsOpen(true)}
          className={`${styles.createBtn} ${data ? styles.mutedBtn : ""}`}
        >
          + Add Project
        </button>
      </div>
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead className="head">
            {projects.length > 0 && (
              <tr>
                <th>Project Name</th>
                <th>SDK Key</th>
                <th>Created On</th>
                <th>Team Members</th>
                <th style={{ textAlign: "center" }}>Actions</th>
              </tr>
            )}
          </thead>
          <tbody className="body">
            {projects.length > 0 ? (
              projects.map((p:any) => (
                <tr key={p.name}>
                  <td className={styles.projectName}>{p.name}</td>
                  <td className={styles.sdkKey}>
                    <span>{p.sdkKey}</span>
                    <button className={styles.copyBtn} title="Copy SDK Key">
                      📋
                    </button>
                  </td>
                  <td>{p.createdOn}</td>
                  <td>
                    <div className={styles.memberList}>
                      {p.members.map((m:any) => (
                        <span className={styles.member} key={m}>
                          {m}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className={styles.actionCol}>
                    <button className={styles.editBtn} title="Edit Project">
                      ✏️
                    </button>
                    <button className={styles.teamBtn} title="Manage Team">
                      👥
                    </button>
                    <button className={styles.deleteBtn} title="Delete Project">
                      🗑️
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="text-center">No Projects</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

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

"use client";

import React, { useEffect, useState } from "react";
import styles from "./ProjectsPage.module.css";
import CreateProjectModal from "@/src/shared/components/CreateProjectModal/CreateProjectModal";
import { useSubscription } from "@/src/features/billing/hooks";
import { useProjects } from "../../hooks";
import { ProjectSummaryDto } from "../../types";
import { useCreateProject, useUpdateProject, useDeleteProject } from "../../hooks";

export default function ProjectsPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [projects, setProjects] = useState<ProjectSummaryDto[]>([]);
  const [editing, setEditing] = useState<ProjectSummaryDto | null>(null);
  const createProject = useCreateProject();
  const updateProject = useUpdateProject();
  const deleteProject = useDeleteProject();
  const { data } = useSubscription();
  const { data: projectData, isLoading, isSuccess } = useProjects(20);

  useEffect(() => {
    if (isSuccess) {
      setProjects(projectData.items);
    }
  }, [projectData]);

  return (
    <div className={styles.wrapper}>
      <div className={styles.headerRow}>
        <div className={styles.headerTitle}>Projects</div>
        <button
          onClick={() => setIsOpen(true)}
          className={`${styles.createBtn} ${data && data.status != "trialing" ? styles.mutedBtn : ""}`}
        >
          + Add Project
        </button>
      </div>
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead className={styles.head}>
            <tr>
              <th>Project Name</th>
              <th>SDK Key</th>
              <th>Created On</th>
              <th style={{ textAlign: "center" }}>Actions</th>
            </tr>
          </thead>
          <tbody className={styles.body}>
            {projects.length > 0 ? (
              projects.map((p: any) => (
                <tr key={p.id}>
                  <td className={styles.projectName}>{p.name}</td>
                  <td className={styles.sdkKey}>
                    <span>{p.sdkKey}</span>
                    <button className={styles.copyBtn} title="Copy SDK Key">
                      📋
                    </button>
                  </td>
                  <td>{new Date(p.createdAt).toLocaleString("en-IN")}</td>
                  <td className={styles.actionCol}>
                    <button
                      className={styles.editBtn}
                      title="Edit Project"
                      onClick={() => {
                        setEditing(p);
                        setIsOpen(true);
                      }}
                    >
                      ✏️
                    </button>
                    <button
                      className={styles.deleteBtn}
                      title="Delete Project"
                      onClick={() => {
                        if (!confirm(`Delete project "${p.name}"? This action cannot be undone.`)) return;
                        deleteProject.mutate(p.id);
                      }}
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} style={{ textAlign: "center" }}>
                  No Projects
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <CreateProjectModal
        open={isOpen}
        onClose={() => {
          setIsOpen(false);
          setEditing(null);
        }}
        defaultTimezone="Asia/Kolkata"
        initial={
          editing
            ? {
                id: editing.id,
                name: editing.name,
                  timeZone: editing.timeZone ?? "",
                  guardrails: editing.rolloutPollicies ?? {},
                  langSupport: editing.langSupport ?? []
              }
            : undefined
        }
        submitLabel={editing ? "Update project" : "Create project"}
        onSubmit={(payload) => {
          if (payload.id) {
            updateProject.mutate({
              id: payload.id,
              name: payload.name,
              timeZone: payload.timeZone,
                guardrails: payload.guardrails,
                langSupport: payload.langSupport
            });
          } else {
            createProject.mutate({
              name: payload.name,
              timeZone: payload.timeZone,
                guardrails: payload.guardrails,
                langSupport: payload.langSupport
            });
          }
        }}
      />
    </div>
  );
}

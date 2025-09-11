"use client";
import React, { useEffect, useRef, useState } from "react";
import styles from "./AccountSettingsPage.module.css";
import { useAppContext } from "@/src/shared/context/AppContext";
import { PlanKey } from "@/src/features/billing/types";
import { useMe } from "@/src/features/auth/hooks";
import { useRouter } from "next/navigation";
import { Routes } from "@/app/constants";

export default function AccountSettingsPage() {
  const { setUser, setWorkspace } = useAppContext();
  const { data, isSuccess } = useMe();
  const [workspaceName, setWorkspaceName] = useState<string>();
  const [ownerName, setOwnerName] = useState<string>();
  const [billingEmail, setBillingEmail] = useState<string>();
  const [plan, setPlan] = useState<PlanKey>();
  const [globalApiKey, setGlobalApiKey] = useState("adm_live_9qRa…R7xK");
  useEffect(() => {
    if (isSuccess && data) {
      //@ts-ignore
      setUser((prev) => prev ?? data.user);
      //@ts-ignore
      setWorkspace((prev) => prev ?? data.workspace);
      setWorkspaceName(data.workspace?.name);
      setOwnerName(data.user?.name);
      setBillingEmail(data.user?.email);
      setPlan(data.workspace?.planKey as PlanKey);
    }
  }, [isSuccess, data, setUser, setWorkspace]);

  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <div className={styles.wrapper}>
      <div className={styles.headerRow}>
        <div>
          <div className={styles.headerTitle}>Account Settings</div>
          <div className={styles.subTitle}>Workspace, billing, security</div>
        </div>
      </div>

      <div className={styles.grid}>
        {/* LEFT COLUMN */}
        <div className={styles.card}>
          <div className={styles.cardTitle}>Workspace</div>

          <label className={styles.label}>Name</label>
          <input
            className={styles.input}
            value={workspaceName}
            onChange={(e) => setWorkspaceName(e.target.value)}
            placeholder="Workspace name"
          />

          <label className={styles.label}>Logo</label>
          <div className={styles.logoRow}>
            <div className={styles.logoPreview}>
              <div className={styles.logoFallback}>{workspaceName || "W"}</div>
            </div>
            <div className={styles.logoActions}>
              <button
                className={styles.secondaryBtn}
                onClick={() => fileRef.current?.click()}
              >
                Upload
              </button>
              <input ref={fileRef} type="file" accept="image/*" hidden />
            </div>
          </div>

          <div className={styles.actionsRow}>
            <button className={styles.primaryBtn}>Save changes</button>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className={styles.stack}>
          <div className={styles.card}>
            <div className={styles.cardTitle}>Owner</div>

            <div className={styles.row}>
              <div className={styles.kv}>
                <div className={styles.kValue}>{ownerName}</div>
              </div>
            </div>
            <input
              className={styles.input}
              value={billingEmail}
              onChange={(e) => setBillingEmail(e.target.value)}
              placeholder="billing@company.com"
            />
          </div>

          <div className={styles.card}>
            <div className={styles.planRow}>
              <div className={styles.planBadge}>{plan}</div>
              <button
                onClick={() => {
                  router.push(Routes.Billing());
                }}
                className={styles.secondaryBtn}
              >
                Manage plan
              </button>
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.actionsRow}>
              <button className={styles.secondaryBtn}>Change password</button>
            </div>

            <div className={styles.hr} />

            <div className={styles.rowKey}>
              <div>
                <div className={styles.kLabel}>Global Admin API Key</div>
                <div className={styles.kSub}>
                  Use for admin/CLI actions. Keep secret.
                </div>
              </div>
              <div className={styles.keyBox}>
                <code className={styles.code}>{globalApiKey}</code>
                <div className={styles.keyActions}>
                  <button className={styles.smallBtn}>Copy</button>
                  <button className={styles.smallDanger}>Regenerate</button>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.cardDanger}>
            <div className={styles.cardTitle}>Danger zone</div>
            <p className={styles.dangerText}>
              Deleting the workspace removes all projects, flags, keys, and
              analytics. This cannot be undone.
            </p>
            <button
              className={styles.dangerBtn}
              onClick={() => setConfirmOpen(true)}
            >
              Delete workspace
            </button>
          </div>
        </div>
      </div>

      {confirmOpen && (
        <Confirm
          label={`Delete workspace “${workspaceName}”?`}
          onCancel={() => setConfirmOpen(false)}
          onYes={() => {}}
        />
      )}
    </div>
  );
}

function Confirm({
  label,
  onCancel,
  onYes
}: {
  label: string;
  onCancel: () => void;
  onYes: () => void;
}) {
  return (
    <div className={styles.backdrop}>
      <div className={styles.modalSmall}>
        <div className={styles.modalTitle}>{label}</div>
        <div className={styles.modalActions}>
          <button className={styles.secondaryBtn} onClick={onCancel}>
            Cancel
          </button>
          <button className={styles.dangerBtn} onClick={onYes}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

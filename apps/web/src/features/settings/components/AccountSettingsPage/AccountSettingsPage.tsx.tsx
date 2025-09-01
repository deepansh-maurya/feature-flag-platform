"use client";

import React, { useRef, useState } from "react";
import styles from "./AccountSettingsPage.module.css";

type Plan = "Free" | "Pro";

export default function AccountSettingsPage() {
  // ---- mock state (replace with your data fetch) ----
  const [workspaceName, setWorkspaceName] = useState("Nerdeep Labs");
  const [logoDataUrl, setLogoDataUrl] = useState<string | null>(null);
  const [ownerName] = useState("Deepansh Maurya");
  const [ownerEmail] = useState("deepansh@example.com");
  const [billingEmail, setBillingEmail] = useState("billing@nerdeep.in");
  const [plan, setPlan] = useState<Plan>("Free");
  const [globalApiKey, setGlobalApiKey] = useState("adm_live_9qRa…R7xK"); // masked in UI below
  const [toast, setToast] = useState("");

  const fileRef = useRef<HTMLInputElement>(null);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 1500);
  }

  // ---- actions (stubbed) ----
  function handleSaveWorkspace() {
    // call: PATCH /orgs/:id { name, logo }
    showToast("Workspace updated");
  }
  function handleUploadLogo(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => setLogoDataUrl(String(reader.result));
    reader.readAsDataURL(f);
  }
  function handleUpgrade() {
    // open your billing checkout later
    setPlan("Pro");
    showToast("Upgraded to Pro (demo)");
  }
  function handleChangePassword() {
    // open modal / route to auth provider
    showToast("Password change link sent (demo)");
  }
  function handleRegenerateGlobalKey() {
    // call: POST /orgs/:id/global-key/rotate
    const newKey = "adm_live_" + Math.random().toString(36).slice(2, 10) + "…" + Math.random().toString(36).slice(2, 6);
    setGlobalApiKey(newKey);
    showToast("Global admin key regenerated");
  }
  function handleCopyKey() {
    navigator.clipboard.writeText(globalApiKey.replace("…", "")); // in demo we store masked; real app store full key
    showToast("Copied");
  }

  // danger zone modal
  const [confirmOpen, setConfirmOpen] = useState(false);
  function handleDeleteWorkspace() {
    // call: DELETE /orgs/:id
    setConfirmOpen(false);
    showToast("Workspace deleted (demo)");
  }

  // helpers
  const maskedKey = globalApiKey; // already masked in demo
  return (
    <div className={styles.wrapper}>
      <div className={styles.headerRow}>
        <div>
          <div className={styles.headerTitle}>Account Settings</div>
          <div className={styles.subTitle}>Workspace, billing, security</div>
        </div>
      </div>

      {toast && <div className={styles.toast}>{toast}</div>}

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
              {logoDataUrl ? (
                <img src={logoDataUrl} alt="logo" />
              ) : (
                <div className={styles.logoFallback}>{workspaceName[0] || "W"}</div>
              )}
            </div>
            <div className={styles.logoActions}>
              <button
                className={styles.secondaryBtn}
                onClick={() => fileRef.current?.click()}
              >
                Upload
              </button>
              {logoDataUrl && (
                <button className={styles.smallDanger} onClick={() => setLogoDataUrl(null)}>
                  Remove
                </button>
              )}
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                hidden
                onChange={handleUploadLogo}
              />
            </div>
          </div>

          <div className={styles.actionsRow}>
            <button className={styles.primaryBtn} onClick={handleSaveWorkspace}>Save changes</button>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className={styles.stack}>
          <div className={styles.card}>
            <div className={styles.cardTitle}>Owner & Billing</div>

            <div className={styles.row}>
              <div className={styles.kv}>
                <div className={styles.kLabel}>Owner</div>
                <div className={styles.kValue}>{ownerName}</div>
                <div className={styles.kSub}>{ownerEmail}</div>
              </div>
            </div>

            <label className={styles.label}>Billing email</label>
            <input
              className={styles.input}
              value={billingEmail}
              onChange={(e) => setBillingEmail(e.target.value)}
              placeholder="billing@company.com"
            />

            <div className={styles.actionsRow}>
              <button className={styles.secondaryBtn} onClick={() => showToast("Billing email saved")}>
                Save billing
              </button>
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardTitle}>Plan</div>
            <div className={styles.planRow}>
              <div className={styles.planBadge}>{plan}</div>
              {plan === "Free" ? (
                <button className={styles.primaryBtn} onClick={handleUpgrade}>Upgrade to Pro</button>
              ) : (
                <button className={styles.secondaryBtn} onClick={() => showToast("Manage plan (demo)")}>Manage plan</button>
              )}
            </div>
            <ul className={styles.planList}>
              <li>Feature flags & rollouts</li>
              <li>Team management</li>
              <li>{plan === "Pro" ? "Priority support" : "Community support"}</li>
            </ul>
          </div>

          <div className={styles.card}>
            <div className={styles.cardTitle}>Security</div>

            <div className={styles.row}>
              <div className={styles.kLabel}>Password</div>
              <div className={styles.kValue}>********</div>
              <div className={styles.actionsRow}>
                <button className={styles.secondaryBtn} onClick={handleChangePassword}>Change password</button>
              </div>
            </div>

            <div className={styles.hr} />

            <div className={styles.rowKey}>
              <div>
                <div className={styles.kLabel}>Global Admin API Key</div>
                <div className={styles.kSub}>Use for admin/CLI actions. Keep secret.</div>
              </div>
              <div className={styles.keyBox}>
                <code className={styles.code}>{maskedKey}</code>
                <div className={styles.keyActions}>
                  <button className={styles.smallBtn} onClick={handleCopyKey}>Copy</button>
                  <button className={styles.smallDanger} onClick={handleRegenerateGlobalKey}>Regenerate</button>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.cardDanger}>
            <div className={styles.cardTitle}>Danger zone</div>
            <p className={styles.dangerText}>
              Deleting the workspace removes all projects, flags, keys, and analytics. This cannot be undone.
            </p>
            <button className={styles.dangerBtn} onClick={() => setConfirmOpen(true)}>Delete workspace</button>
          </div>
        </div>
      </div>

      {confirmOpen && (
        <Confirm
          label={`Delete workspace “${workspaceName}”?`}
          onCancel={() => setConfirmOpen(false)}
          onYes={handleDeleteWorkspace}
        />
      )}
    </div>
  );
}

function Confirm({ label, onCancel, onYes }: { label: string; onCancel: () => void; onYes: () => void; }) {
  return (
    <div className={styles.backdrop}>
      <div className={styles.modalSmall}>
        <div className={styles.modalTitle}>{label}</div>
        <div className={styles.modalActions}>
          <button className={styles.secondaryBtn} onClick={onCancel}>Cancel</button>
          <button className={styles.dangerBtn} onClick={onYes}>Delete</button>
        </div>
      </div>
    </div>
  );
}

"use client";
import React, { useMemo, useState } from "react";
import styles from "./BillingPage.module.css";
import Pricing, { PLAN_LIMITS } from "@/src/features/billing/components/Pricing/Pricing";
import { PlanUsageModern } from "./PlanUsageGrid";

const invoices = [
  {
    id: "inv_1001",
    date: "2025-07-01",
    amount: "₹0.00",
    status: "Paid",
    plan: "Free"
  },
  {
    id: "inv_1000",
    date: "2025-06-01",
    amount: "₹0.00",
    status: "Paid",
    plan: "Free"
  }
];

const sampleUsageStarter = {
  api: 750_000,
  flags: 38,
  members: 4,
  envs: 2
};

const sampleLimitsStarter = {
  apiRequestsPerMonth: PLAN_LIMITS.starter.apiRequestsPerMonth,
  flags: PLAN_LIMITS.starter.flags,
  seats: PLAN_LIMITS.starter.seats,
  environmentsPerWorkspace: PLAN_LIMITS.starter.environmentsPerWorkspace,
  segments: PLAN_LIMITS.starter.segments, // 0 → “Not available”
  webhooks: PLAN_LIMITS.starter.webhooks, // 0 → “Not available”
  auditRetentionDays: PLAN_LIMITS.starter.auditRetentionDays,
  projects: PLAN_LIMITS.starter.projects,
  workspaces: PLAN_LIMITS.starter.workspaces
};

export default function BillingPage() {
  const [active, setActive] = useState(false);
  return (
    <div className={styles.wrapper}>
      {/* Header */}
      <div className={styles.headerRow}>
        <div className="toggle">
          <button
            onClick={() => setActive(!active)}
            className={!active ? "active" : ""}
          >
            Plan usage
          </button>
          <button
            onClick={() => setActive(!active)}
            className={active ? "active" : ""}
          >
            Update
          </button>
        </div>
      </div>

      {!active ? (
        <div>
          <PlanUsageModern
            usage={sampleUsageStarter}
            //@ts-ignore
            limits={sampleLimitsStarter}
            accent="#0ea5e9"
          />

          <div className={styles.section}>
            <div className={styles.sectionTitle}>Invoices</div>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Invoice</th>
                    <th>Date</th>
                    <th>Plan</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((inv) => (
                    <tr key={inv.id}>
                      <td>
                        <code className={styles.code}>{inv.id}</code>
                      </td>
                      <td>{inv.date}</td>
                      <td>{inv.plan}</td>
                      <td>{inv.amount}</td>
                      <td>
                        <span className={styles.badgePaid}>{inv.status}</span>
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <button
                          className={styles.smallBtn}
                          onClick={() => alert("Download PDF (demo)")}
                        >
                          Download
                        </button>
                      </td>
                    </tr>
                  ))}
                  {invoices.length === 0 && (
                    <tr>
                      <td colSpan={6} className={styles.empty}>
                        No invoices yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <Pricing toShowHeading={false} />
      )}
    </div>
  );
}

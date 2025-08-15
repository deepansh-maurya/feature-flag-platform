"use client";

import React, { useMemo, useState } from "react";
import styles from "./BillingPage.module.css";

type PlanKey = "free" | "pro" | "business";

type Plan = {
  key: PlanKey;
  name: string;
  priceMonthly: number; // 0 for free
  priceYearly: number;  // 0 for free
  features: Array<{ label: string; included: boolean | number | string }>;
  limits: { api: number; flags: number; members: number; envs: number };
};

type Usage = { api: number; flags: number; members: number; envs: number };

const PLANS: Plan[] = [
  {
    key: "free",
    name: "Free",
    priceMonthly: 0,
    priceYearly: 0,
    features: [
      { label: "Rollouts & Targeting", included: true },
      { label: "Audit Logs", included: false },
      { label: "Analytics", included: "Basic" },
      { label: "SSO/SCIM", included: false }
    ],
    limits: { api: 50_000, flags: 5, members: 2, envs: 2 }
  },
  {
    key: "pro",
    name: "Pro",
    priceMonthly: 49,
    priceYearly: 490,
    features: [
      { label: "Rollouts & Targeting", included: true },
      { label: "Audit Logs", included: true },
      { label: "Analytics", included: "Standard" },
      { label: "SSO/SCIM", included: false }
    ],
    limits: { api: 1_000_000, flags: 50, members: 10, envs: 5 }
  },
  {
    key: "business",
    name: "Business",
    priceMonthly: 199,
    priceYearly: 1990,
    features: [
      { label: "Rollouts & Targeting", included: true },
      { label: "Audit Logs", included: true },
      { label: "Analytics", included: "Advanced" },
      { label: "SSO/SCIM", included: true }
    ],
    limits: { api: 10_000_000, flags: 9999, members: 9999, envs: 9999 }
  }
];

// mocked org state
const INITIAL_CURRENT: PlanKey = "free";
const INITIAL_USAGE: Usage = { api: 8_200, flags: 4, members: 2, envs: 2 };

const invoices = [
  { id: "inv_1001", date: "2025-07-01", amount: "₹0.00", status: "Paid", plan: "Free" },
  { id: "inv_1000", date: "2025-06-01", amount: "₹0.00", status: "Paid", plan: "Free" }
];

export default function BillingPage() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [currentPlan, setCurrentPlan] = useState<PlanKey>(INITIAL_CURRENT);
  const [usage] = useState<Usage>(INITIAL_USAGE);

  const plan = useMemo(() => PLANS.find(p => p.key === currentPlan)!, [currentPlan]);
  const otherPlans = useMemo(() => PLANS.filter(p => p.key !== currentPlan), [currentPlan]);

  function price(p: Plan) {
    const n = billingCycle === "monthly" ? p.priceMonthly : p.priceYearly;
    return n === 0 ? "Free" : `₹${n.toLocaleString()}/${billingCycle === "monthly" ? "mo" : "yr"}`;
  }

  function pct(v: number, max: number) {
    if (max <= 0) return 0;
    return Math.max(0, Math.min(100, (v / max) * 100));
  }

  function barClass(valPct: number) {
    if (valPct >= 100) return styles.barOver;
    if (valPct >= 85) return styles.barWarn;
    return styles.barOk;
  }

  function manageSubscription() {
    alert("Open Stripe customer portal (not wired in demo).");
  }

  function buyPlan(next: Plan) {
    // In real app: redirect to checkout or call upgrade API
    setCurrentPlan(next.key);
    alert(`Upgraded to ${next.name} (${billingCycle}).`);
  }

  return (
    <div className={styles.wrapper}>
      {/* Header */}
      <div className={styles.headerRow}>
        <div className={styles.headerTitle}>Billing</div>
        <div className={styles.headerControls}>
          <div className={styles.toggleWrap}>
            <button
              className={`${styles.toggleBtn} ${billingCycle === "monthly" ? styles.toggleActive : ""}`}
              onClick={() => setBillingCycle("monthly")}
            >
              Monthly
            </button>
            <button
              className={`${styles.toggleBtn} ${billingCycle === "yearly" ? styles.toggleActive : ""}`}
              onClick={() => setBillingCycle("yearly")}
            >
              Yearly <span className={styles.savePill}>save ~2 months</span>
            </button>
          </div>
        </div>
      </div>

      {/* Plans grid */}
      <div className={styles.grid}>
        {/* Current plan */}
        <div className={`${styles.card} ${styles.current}`}>
          <div className={styles.cardHeader}>
            <div className={styles.planLeft}>
              <div className={styles.planName}>{plan.name}</div>
              <div className={styles.currentBadge}>Current plan</div>
            </div>
            <div className={styles.price}>{price(plan)}</div>
          </div>

          {/* Usage bars */}
          <div className={styles.usageBox}>
            <UsageBar label="API Requests" value={usage.api} limit={plan.limits.api} />
            <UsageBar label="Feature Flags" value={usage.flags} limit={plan.limits.flags} />
            <UsageBar label="Team Members" value={usage.members} limit={plan.limits.members} />
            <UsageBar label="Environments" value={usage.envs} limit={plan.limits.envs} />
          </div>

          {/* Features (read-only for current) */}
          <div className={styles.featList}>
            {plan.features.map((f, i) => (
              <FeatureRow key={i} label={f.label} value={f.included} />
            ))}
          </div>

          <div className={styles.actionsRow}>
            <button className={styles.manageBtn} onClick={manageSubscription}>Manage subscription</button>
          </div>
        </div>

        {/* Other plans */}
        {otherPlans.map(p => (
          <div className={styles.card} key={p.key}>
            <div className={styles.cardHeader}>
              <div className={styles.planLeft}>
                <div className={styles.planName}>{p.name}</div>
              </div>
              <div className={styles.price}>{price(p)}</div>
            </div>

            {/* limits preview */}
            <div className={styles.limitsGrid}>
              <LimitPill label="API" value={p.limits.api === 9999 || p.limits.api > 9_000_000 ? "10M+" : p.limits.api.toLocaleString()} />
              <LimitPill label="Flags" value={p.limits.flags >= 9999 ? "Unlimited" : p.limits.flags} />
              <LimitPill label="Members" value={p.limits.members >= 9999 ? "Unlimited" : p.limits.members} />
              <LimitPill label="Envs" value={p.limits.envs >= 9999 ? "Unlimited" : p.limits.envs} />
            </div>

            <div className={styles.featList}>
              {p.features.map((f, i) => (
                <FeatureRow key={i} label={f.label} value={f.included} />
              ))}
            </div>

            <div className={styles.actionsRow}>
              <button className={styles.buyBtn} onClick={() => buyPlan(p)}>
                {p.priceMonthly === 0 ? "Choose Free" : "Upgrade"}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Invoices */}
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
                  <td><code className={styles.code}>{inv.id}</code></td>
                  <td>{inv.date}</td>
                  <td>{inv.plan}</td>
                  <td>{inv.amount}</td>
                  <td><span className={styles.badgePaid}>{inv.status}</span></td>
                  <td style={{ textAlign: "right" }}>
                    <button className={styles.smallBtn} onClick={() => alert("Download PDF (demo)")}>Download</button>
                  </td>
                </tr>
              ))}
              {invoices.length === 0 && (
                <tr><td colSpan={6} className={styles.empty}>No invoices yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/** --- Components --- */
function UsageBar({ label, value, limit }: { label: string; value: number; limit: number }) {
  const pct = limit ? Math.min(100, (value / limit) * 100) : 0;
  const fmt = (n: number) => n.toLocaleString();
  let klass = "";
  if (pct >= 100) klass = "barOver";
  else if (pct >= 85) klass = "barWarn";
  else klass = "barOk";
  return (
    <div className={styles.usageRow}>
      <div className={styles.usageTop}>
        <span className={styles.usageLabel}>{label}</span>
        <span className={styles.usageVal}>{fmt(value)} / {limit >= 9999 ? "Unlimited" : fmt(limit)}</span>
      </div>
      <div className={styles.barBg}>
        <div className={`${styles.barFill} ${styles[klass]}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function FeatureRow({ label, value }: { label: string; value: boolean | number | string }) {
  const isTrue = value === true;
  const isFalse = value === false;
  return (
    <div className={styles.featRow}>
      <span className={styles.featLabel}>{label}</span>
      <span className={styles.featVal}>
        {isTrue && <span className={styles.ok}>Included</span>}
        {isFalse && <span className={styles.dim}>Not included</span>}
        {!isTrue && !isFalse && <span className={styles.info}>{String(value)}</span>}
      </span>
    </div>
  );
}

function LimitPill({ label, value }: { label: string; value: string | number }) {
  return (
    <span className={styles.limitPill}>
      <span className={styles.limitLabel}>{label}</span>
      <span className={styles.limitVal}>{value}</span>
    </span>
  );
}

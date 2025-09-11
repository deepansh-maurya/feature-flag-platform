"use client";
import React, { useEffect, useMemo, useState } from "react";
import "./Pricing.css";
import { useParams, usePathname, useRouter } from "next/navigation";
import { Routes } from "../../../../../app/constants";
import { useOpenCheckout } from "../../hooks";
import { useAppContext } from "@/src/shared/context/AppContext";
import { PlanKey } from "../../types";
import { useMe } from "@/src/features/auth/hooks";

type Primitive = number | string;
type PlanLimits = {
  workspaces: Primitive;
  projects: Primitive;
  environmentsPerWorkspace: Primitive;
  seats: Primitive;
  flags: Primitive;
  segments: Primitive;
  apiRequestsPerMonth: Primitive;
  webhooks: Primitive;
  auditRetentionDays: Primitive;
  features: {
    experiments: Primitive | boolean;
    advancedRules: Primitive | boolean;
    integrations: Primitive | boolean;
    rbac: Primitive | boolean;
    sso: Primitive | boolean;
  };
};

export const PLAN_LIMITS: Record<string, PlanLimits> = {
  starter: {
    workspaces: 1,
    projects: 3,
    environmentsPerWorkspace: 2,
    seats: 5,
    flags: 50,
    segments: 0,
    apiRequestsPerMonth: 1_000_000,
    webhooks: 0,
    auditRetentionDays: 7,
    features: {
      experiments: false,
      advancedRules: false,
      integrations: false,
      rbac: false,
      sso: false
    }
  },
  growth: {
    workspaces: 3,
    projects: 10,
    environmentsPerWorkspace: 5,
    seats: 20,
    flags: 500,
    segments: 100,
    apiRequestsPerMonth: 10_000_000,
    webhooks: 5,
    auditRetentionDays: 90,
    features: {
      experiments: true,
      advancedRules: true,
      integrations: true,
      rbac: false,
      sso: false
    }
  },
  enterprise: {
    workspaces: "unlimited",
    projects: "unlimited",
    environmentsPerWorkspace: "unlimited",
    seats: "unlimited",
    flags: "unlimited",
    segments: "unlimited",
    apiRequestsPerMonth: "custom",
    webhooks: "unlimited",
    auditRetentionDays: "unlimited",
    features: {
      experiments: "advanced",
      advancedRules: true,
      integrations: true,
      rbac: true,
      sso: true
    }
  }
};

const prettify = (v: Primitive) =>
  typeof v === "number"
    ? v >= 1_000_000
      ? `${(v / 1_000_000).toFixed(v % 1_000_000 === 0 ? 0 : 1)}M`
      : v.toString()
    : String(v).charAt(0).toUpperCase() + String(v).slice(1);

const coreRows = [
  { k: "workspaces", label: "Workspaces" },
  { k: "projects", label: "Projects" },
  { k: "environmentsPerWorkspace", label: "Environments / WS" },
  { k: "seats", label: "Seats" },
  { k: "flags", label: "Feature Flags" },
  { k: "segments", label: "Segments" },
  { k: "apiRequestsPerMonth", label: "API requests / month" },
  { k: "webhooks", label: "Webhooks" },
  { k: "auditRetentionDays", label: "Audit log retention" }
];

const Feature = ({ ok }: { ok: boolean | string }) => {
  if (typeof ok === "string") return <span className="chip">{ok}</span>;
  return ok ? (
    <span className="ok" aria-label="Included">
      ✓
    </span>
  ) : (
    <span className="no" aria-label="Not included">
      —
    </span>
  );
};

export default function Pricing({
  toShowHeading = true
}: {
  toShowHeading: boolean;
}) {
  const { setUser, setWorkspace } = useAppContext();
  const path = usePathname();
  const [yearly, setYearly] = useState<boolean>(false);
  const router = useRouter();
  const prices = useMemo(
    () => ({
      starter: yearly ? 29 * 12 * 0.83 : 29,
      growth: yearly ? 49 * 12 * 0.83 : 49, // ~2 months free yearly
      enterprise: yearly ? 399 * 12 * 0.83 : 399 // custom
    }),
    [yearly]
  );
  const { data, isSuccess } = useMe();
  useEffect(() => {
    if (isSuccess && data) {
      //@ts-ignore
      setUser((prev) => prev ?? data.user);
      //@ts-ignore
      setWorkspace((prev) => prev ?? data.workspace);
    }
  }, [isSuccess, data, setUser, setWorkspace]);

  const openCheckout = useOpenCheckout();
  const { user, workspace } = useAppContext();
  console.log(user, workspace);

  const goToRegisterPage = (plankey: PlanKey) => {
    if (path?.includes("dashboard")) {
      console.log(plankey,workspace?.id);

      openCheckout.mutate(
        {
          cycle: yearly ? "yearly" : "monthly",
          planKey: yearly
            ? (plankey.toUpperCase() as any)
            : plankey.toUpperCase(),
          prefillName: user?.name,
          prefillEmail: user?.email,
          workspaceId: workspace!.id
        },
        {
          onSuccess(data, variables, context) {
            console.log(data);
            const options = {
              key: data.keyId,
              subscription_id: data.subscriptionId,
              amount: data.amount,
              currency: data.currency,
              name: "Flagly Inc.",
              description: `${data.planKey} subscription`,
              handler: function (response: any) {
                console.log("Frontend success:", response);
              },
              prefill: {
                name: user?.name,
                email: user?.email
              },
              method: {
                netbanking: true,
                card: true,
                upi: true,
                wallet: true
              },
              theme: { color: "#3399cc" }
            };

            const rzp = new (window as any).Razorpay(options);
            rzp.open();
          }
        }
      );
    } else router.push(Routes.signup());
  };

  return (
    <div className="pricing-wrap">
      <header className="pricing-hero">
        {toShowHeading && (
          <div>
            <h1 className="fx-title flex  justify-center items-center gap-6">
              <div
                onClick={() => {
                  router.push(Routes.landingPage());
                }}
                className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-400 to-fuchsia-500 shadow-inner cursor-pointer"
              />
              Pricing that scales with <span className="grad">confidence</span>
            </h1>

            <p className="fx-sub flex  justify-center items-center">
              Powerful flags, safe rollouts, instant control.
              <button
                className="login-btn"
                onClick={() => router.push(Routes.login())}
              >
                Login
              </button>
            </p>
          </div>
        )}

        <div className="toggle">
          <button
            className={!yearly ? "active" : ""}
            onClick={() => setYearly(false)}
          >
            Monthly
          </button>
          <button
            className={yearly ? "active" : ""}
            onClick={() => setYearly(true)}
          >
            Yearly <span className="save">save ~17%</span>
          </button>
        </div>
      </header>

      {/* Cards */}
      <section className="cards">
        {(["starter", "growth", "enterprise"] as const).map((key) => {
          const plan = PLAN_LIMITS[key];
          const isGrowth = key === "growth";
          return (
            <article className={`card ${key}`} key={key}>
              {isGrowth && <div className="badge">Most Popular</div>}
              <h2 className="card-title">
                {key.charAt(0).toUpperCase() + key.slice(1)}
              </h2>

              <div className="price-row">
                {key === "enterprise" ? (
                  <div className="price">
                    ${Math.round(prices[key])}
                    <span className="per">/{yearly ? "yr" : "mo"} </span>
                  </div>
                ) : (
                  <div className="price">
                    {prices[key] === 0 ? "$29" : `$${Math.round(prices[key])}`}
                    {prices[key] !== 0 && (
                      <span className="per">/ {yearly ? "yr" : "mo"}</span>
                    )}
                  </div>
                )}
              </div>

              <button className="cta" onClick={() => goToRegisterPage(key)}>
                {key === "starter"
                  ? "Start Starter →"
                  : key === "growth"
                    ? "Try Growth →"
                    : "Try Enterprise →"}
              </button>

              <ul className="bullets">
                {coreRows.slice(0, 5).map((row) => (
                  <li key={row.k}>
                    <span>{row.label}</span>
                    <strong>{prettify((plan as any)[row.k])}</strong>
                  </li>
                ))}
              </ul>
            </article>
          );
        })}
      </section>

      {/* Comparison table */}
      <section className="table">
        <div className="thead">
          <div className="cell head">Compare plans</div>
          <div className="cell">Starter</div>
          <div className="cell">Growth</div>
          <div className="cell">Enterprise</div>
        </div>

        {coreRows.map((row) => (
          <div className="trow" key={row.k}>
            <div className="cell head">{row.label}</div>
            <div className="cell">
              {prettify(
                PLAN_LIMITS.starter[row.k as keyof PlanLimits] as Primitive
              )}
            </div>
            <div className="cell">
              {prettify(
                PLAN_LIMITS.growth[row.k as keyof PlanLimits] as Primitive
              )}
            </div>
            <div className="cell">
              {prettify(
                PLAN_LIMITS.enterprise[row.k as keyof PlanLimits] as Primitive
              )}
            </div>
          </div>
        ))}

        <div className="trow">
          <div className="cell head">Experiments</div>
          <div className="cell">
            <Feature ok={PLAN_LIMITS.starter.features.experiments as any} />
          </div>
          <div className="cell">
            <Feature ok={PLAN_LIMITS.growth.features.experiments as any} />
          </div>
          <div className="cell">
            <Feature ok={PLAN_LIMITS.enterprise.features.experiments as any} />
          </div>
        </div>
        <div className="trow">
          <div className="cell head">Advanced Rules</div>
          <div className="cell">
            <Feature ok={PLAN_LIMITS.starter.features.advancedRules as any} />
          </div>
          <div className="cell">
            <Feature ok={PLAN_LIMITS.growth.features.advancedRules as any} />
          </div>
          <div className="cell">
            <Feature
              ok={PLAN_LIMITS.enterprise.features.advancedRules as any}
            />
          </div>
        </div>
        <div className="trow">
          <div className="cell head">Integrations</div>
          <div className="cell">
            <Feature ok={PLAN_LIMITS.starter.features.integrations as any} />
          </div>
          <div className="cell">
            <Feature ok={PLAN_LIMITS.growth.features.integrations as any} />
          </div>
          <div className="cell">
            <Feature ok={PLAN_LIMITS.enterprise.features.integrations as any} />
          </div>
        </div>
        <div className="trow">
          <div className="cell head">RBAC</div>
          <div className="cell">
            <Feature ok={PLAN_LIMITS.starter.features.rbac as any} />
          </div>
          <div className="cell">
            <Feature ok={PLAN_LIMITS.growth.features.rbac as any} />
          </div>
          <div className="cell">
            <Feature ok={PLAN_LIMITS.enterprise.features.rbac as any} />
          </div>
        </div>
        <div className="trow">
          <div className="cell head">SSO</div>
          <div className="cell">
            <Feature ok={PLAN_LIMITS.starter.features.sso as any} />
          </div>
          <div className="cell">
            <Feature ok={PLAN_LIMITS.growth.features.sso as any} />
          </div>
          <div className="cell">
            <Feature ok={PLAN_LIMITS.enterprise.features.sso as any} />
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="faqs">
        <div className="faq">
          <h3>How are API requests counted?</h3>
          <p>
            Every SDK config fetch and evaluation call hitting our API counts as
            one request. SDK‑side cached reads don’t count.
          </p>
        </div>
        <div className="faq">
          <h3>Can I upgrade or downgrade anytime?</h3>
          <p>
            Yes. Pro‑rate is applied automatically. Enterprise plans are
            contract based.
          </p>
        </div>
        <div className="faq">
          <h3>What happens if I exceed limits?</h3>
          <p>
            We won’t hard‑throttle your production traffic. We’ll notify the
            workspace owner and give a grace period.
          </p>
        </div>
      </section>
    </div>
  );
}

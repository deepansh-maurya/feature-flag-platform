"use client";

import React, { useMemo, useState } from "react";
import "./plans.css";
import {
  BillingCycle,
  CreatePlan,
  FeatureItem,
  LimitItem,
  PlanAggregate,
  PriceInput
} from "../../types";
import {
  useArchivePlan,
  useCreatePlan,
  usePlans,
  usePublishPlan
} from "../../hooks";

const NF_INT = new Intl.NumberFormat("en-US");
const formatMoney = (cents: number, currency: string) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
    maximumFractionDigits: 2
  }).format((cents ?? 0) / 100);

export default function PlansPage() {
  // --- form state
  const [key, setKey] = useState("starter");
  const [name, setName] = useState("Starter");
  const [description, setDescription] = useState("");
  const [trialDays, setTrialDays] = useState(14);

  const [prices, setPrices] = useState<PriceInput[]>([
    {
      recurringInterval: "monthly",
      currency: "usd",
      unitAmountCents: 0,
      active: true
    }
  ]);
  const [features, setFeatures] = useState<FeatureItem[]>([
    { key: "rbac", enabled: true }
  ]);
  const [limits, setLimits] = useState<LimitItem[]>([
    { resource: "projects", hard: 3 },
    { resource: "flags", hard: 50 }
  ]);

  const canSubmit = useMemo(() => {
    if (!key.trim() || !name.trim()) return false;
    if (prices.length === 0) return false;
    if (prices.some((p) => !p.currency || p.unitAmountCents < 0)) return false;
    return true;
  }, [key, name, prices]);

  const { data: plans = [], isLoading } = usePlans({ includeArchived: true });
  const createPlan = useCreatePlan();
  const publishPlan = usePublishPlan();
  const archivePlan = useArchivePlan();

  function toCreatePlan(): CreatePlan {
    return {
      key: key.trim(),
      name: name.trim(),
      description: description.trim() || undefined,
      // trialDays isn’t in our base dto; if your backend supports it, include it there.
      // @ts-ignore(next)
      trialDays,
      prices: prices.map((p) => ({
        recurringInterval: p.recurringInterval as "monthly" | "yearly",
        unitAmountCents: p.unitAmountCents,
        currency: p.currency?.toUpperCase() || "USD",
        active: p.active ?? true
        // If you support usage-based: uncomment when backend ready
        // isMetered: !!p.isMetered,
        // meterKey: p.meterKey || undefined,
      })),
      features: features
        .filter((f) => f.key.trim())
        .map((f) => ({
          key: f.key.trim(),
          enabled: !!f.enabled // maps to PlanFeature.included
          // label/notes optional: you can store notes as label if desired
          // label: f.notes,
        })),
      limits: limits
        .filter((l) => l.resource.trim())
        .map((l) => ({
          resource: l.resource.trim(),
          // prefer hard; fall back to soft; 0 means “not available”
          hard: l.hard,
          soft: l.soft
        }))
    };
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit || createPlan.isPending) return;
    const dto = toCreatePlan();
    await createPlan.mutateAsync(dto).catch(() => {});
    // Keep form as-is so admin can make another plan; or reset if you prefer:
    // resetForm();
  }

  // utilities to modify arrays
  const addPrice = () =>
    setPrices((p) => [
      ...p,
      {
        recurringInterval: "monthly",
        currency: "usd",
        unitAmountCents: 0,
        active: true
      }
    ]);
  const rmPrice = (i: number) =>
    setPrices((p) => p.filter((_, idx) => idx !== i));

  const addFeature = () =>
    setFeatures((f) => [...f, { key: "", enabled: true }]);
  const rmFeature = (i: number) =>
    setFeatures((f) => f.filter((_, idx) => idx !== i));

  const addLimit = () =>
    setLimits((l) => [
      ...l,
      { resource: "", soft: undefined, hard: undefined }
    ]);
  const rmLimit = (i: number) =>
    setLimits((l) => l.filter((_, idx) => idx !== i));

  return (
    <div className="sa-wrap">
      <h1 className="sa-title">Super Admin — Plans</h1>

      <section className="sa-card">
        <h2>Create Plan</h2>
        <form className="sa-form" onSubmit={onSubmit}>
          <div className="sa-grid">
            <label className="sa-field">
              <span>Key</span>
              <input
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder="starter"
                required
              />
            </label>
            <label className="sa-field">
              <span>Name</span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Starter"
                required
              />
            </label>
            <label className="sa-field">
              <span>Trial days</span>
              <input
                type="number"
                min={0}
                value={trialDays}
                onChange={(e) => setTrialDays(Number(e.target.value))}
              />
            </label>
          </div>

          <label className="sa-field">
            <span>Description</span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional short description..."
            />
          </label>

          <div className="sa-subtitle">Prices</div>
          <div className="sa-rows">
            {prices.map((p, i) => (
              <div className="sa-row" key={i}>
                <select
                  value={p.recurringInterval}
                  onChange={(e) =>
                    setPrices((prev) =>
                      prev.map((x, idx) =>
                        idx === i
                          ? {
                              ...x,
                              recurringInterval: e.target.value as BillingCycle
                            }
                          : x
                      )
                    )
                  }
                >
                  <option value="monthly">monthly</option>
                  <option value="yearly">yearly</option>
                </select>
                <input
                  value={p.currency}
                  onChange={(e) =>
                    setPrices((prev) =>
                      prev.map((x, idx) =>
                        idx === i ? { ...x, currency: e.target.value } : x
                      )
                    )
                  }
                  placeholder="usd"
                />
                <input
                  type="number"
                  min={0}
                  value={p.unitAmountCents}
                  onChange={(e) =>
                    setPrices((prev) =>
                      prev.map((x, idx) =>
                        idx === i
                          ? { ...x, unitAmountCents: Number(e.target.value) }
                          : x
                      )
                    )
                  }
                  placeholder="9900"
                />
                <label className="sa-checkbox">
                  <input
                    type="checkbox"
                    checked={!!p.isMetered}
                    onChange={(e) =>
                      setPrices((prev) =>
                        prev.map((x, idx) =>
                          idx === i ? { ...x, isMetered: e.target.checked } : x
                        )
                      )
                    }
                  />
                  <span>metered</span>
                </label>
                <input
                  value={p.meterKey || ""}
                  onChange={(e) =>
                    setPrices((prev) =>
                      prev.map((x, idx) =>
                        idx === i
                          ? { ...x, meterKey: e.target.value || null }
                          : x
                      )
                    )
                  }
                  placeholder="meterKey (optional)"
                />
                <label className="sa-checkbox">
                  <input
                    type="checkbox"
                    checked={p.active ?? true}
                    onChange={(e) =>
                      setPrices((prev) =>
                        prev.map((x, idx) =>
                          idx === i ? { ...x, active: e.target.checked } : x
                        )
                      )
                    }
                  />
                  <span>active</span>
                </label>
                <button
                  type="button"
                  className="sa-btn danger"
                  onClick={() => rmPrice(i)}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
          <button type="button" className="sa-btn" onClick={addPrice}>
            + Add price
          </button>

          <div className="sa-subtitle">Features</div>
          <div className="sa-rows">
            {features.map((f, i) => (
              <div className="sa-row" key={i}>
                <input
                  value={f.key}
                  onChange={(e) =>
                    setFeatures((prev) =>
                      prev.map((x, idx) =>
                        idx === i ? { ...x, key: e.target.value } : x
                      )
                    )
                  }
                  placeholder="sso"
                />
                <label className="sa-checkbox">
                  <input
                    type="checkbox"
                    checked={!!f.enabled}
                    onChange={(e) =>
                      setFeatures((prev) =>
                        prev.map((x, idx) =>
                          idx === i ? { ...x, enabled: e.target.checked } : x
                        )
                      )
                    }
                  />
                  <span>enabled</span>
                </label>
                <input
                  value={f.notes || ""}
                  onChange={(e) =>
                    setFeatures((prev) =>
                      prev.map((x, idx) =>
                        idx === i ? { ...x, notes: e.target.value } : x
                      )
                    )
                  }
                  placeholder="notes (optional)"
                />
                <button
                  type="button"
                  className="sa-btn danger"
                  onClick={() => rmFeature(i)}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
          <button type="button" className="sa-btn" onClick={addFeature}>
            + Add feature
          </button>

          <div className="sa-subtitle">Limits</div>
          <div className="sa-rows">
            {limits.map((l, i) => (
              <div className="sa-row" key={i}>
                <input
                  value={l.resource}
                  onChange={(e) =>
                    setLimits((prev) =>
                      prev.map((x, idx) =>
                        idx === i ? { ...x, resource: e.target.value } : x
                      )
                    )
                  }
                  placeholder="flags"
                />
                <input
                  type="number"
                  min={0}
                  value={l.soft ?? ""}
                  onChange={(e) =>
                    setLimits((prev) =>
                      prev.map((x, idx) =>
                        idx === i
                          ? {
                              ...x,
                              soft:
                                e.target.value === ""
                                  ? undefined
                                  : Number(e.target.value)
                            }
                          : x
                      )
                    )
                  }
                  placeholder="soft (optional)"
                />
                <input
                  type="number"
                  min={0}
                  value={l.hard ?? ""}
                  onChange={(e) =>
                    setLimits((prev) =>
                      prev.map((x, idx) =>
                        idx === i
                          ? {
                              ...x,
                              hard:
                                e.target.value === ""
                                  ? undefined
                                  : Number(e.target.value)
                            }
                          : x
                      )
                    )
                  }
                  placeholder="hard (optional)"
                />
                <button
                  type="button"
                  className="sa-btn danger"
                  onClick={() => rmLimit(i)}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
          <button type="button" className="sa-btn" onClick={addLimit}>
            + Add limit
          </button>

          {createPlan.isError && (
            <div className="sa-error">
              Error:{" "}
              {(createPlan.error as any)?.message ?? "Failed to create plan"}
            </div>
          )}
          <div className="sa-actions">
            <button
              className="sa-btn primary"
              disabled={!canSubmit || createPlan.isPending}
            >
              {createPlan.isPending ? "Creating…" : "Create Plan"}
            </button>
          </div>
        </form>
      </section>

      <section className="sa-card">
        <h2>Existing Plans</h2>
        {isLoading ? (
          <div>Loading…</div>
        ) : plans.length === 0 ? (
          <div>No plans yet.</div>
        ) : (
          <table className="sa-table">
            <thead>
              <tr>
                <th>Key</th>
                <th>Name</th>
                <th>Status</th>
                <th>Prices</th>
                <th>Features</th>
                <th>Limits</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {plans.map((p: PlanAggregate) => (
                <tr key={p.id}>
                  <td>{p.key}</td>
                  <td>{p.name}</td>
                  <td>
                    <span className={`badge ${p.status}`}>{p.status}</span>
                  </td>
                  <td>
                    {[...p.prices]
                      .sort(
                        (a, b) =>
                          a.recurringInterval.localeCompare(
                            b.recurringInterval
                          ) /* uses API shape */
                      )
                      .map((pr) => (
                        <div key={pr.id} className={!pr.active ? "muted" : ""}>
                          {pr.recurringInterval}:{" "}
                          {pr.currency?.toUpperCase() || "USD"}{" "}
                          {formatMoney(
                            pr.unitAmountCents,
                            pr.currency || "USD"
                          )}{" "}
                          {pr.active ? "" : "(inactive)"}
                        </div>
                      ))}
                  </td>
                  <td>{NF_INT.format(p.features.length)}</td>
                  <td>{NF_INT.format(p.limits.length)}</td>
                  <td>
                    <div className="row-actions">
                      {p.status !== "published" && p.status !== "archived" && (
                        <button
                          className="sa-btn small"
                          onClick={() => publishPlan.mutate({ planId: p.id })}
                          disabled={publishPlan.isPending}
                        >
                          {publishPlan.isPending ? "Publishing…" : "Publish"}
                        </button>
                      )}
                      {p.status !== "archived" && (
                        <button
                          className="sa-btn small danger"
                          onClick={() => archivePlan.mutate({ planId: p.id })}
                          disabled={archivePlan.isPending}
                        >
                          {archivePlan.isPending ? "Archiving…" : "Archive"}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}

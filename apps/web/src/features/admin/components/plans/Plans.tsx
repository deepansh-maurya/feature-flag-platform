'use client';

import React, { useEffect, useMemo, useState } from 'react';
import './plans.css';
import { BillingCycle, FeatureItem, LimitItem, PlanAggregate, PriceInput } from '../../types';

export default function PlansPage() {
  const [plans, setPlans] = useState<PlanAggregate[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- form state
  const [key, setKey] = useState('starter');
  const [name, setName] = useState('Starter');
  const [description, setDescription] = useState('');
  const [trialDays, setTrialDays] = useState(14);

  const [prices, setPrices] = useState<PriceInput[]>([
    { recurringInterval: 'monthly', currency: 'usd', unitAmountCents: 0, active: true },
  ]);
  const [features, setFeatures] = useState<FeatureItem[]>([
    { key: 'rbac', enabled: true },
  ]);
  const [limits, setLimits] = useState<LimitItem[]>([
    { resource: 'projects', hard: 3 },
    { resource: 'flags', hard: 50 },
  ]);

  const canSubmit = useMemo(() => {
    if (!key.trim() || !name.trim()) return false;
    if (prices.length === 0) return false;
    if (prices.some(p => !p.currency || p.unitAmountCents < 0)) return false;
    return true;
  }, [key, name, prices]);

  async function loadPlans() {
    setLoading(true);
    setError(null);
  }

  useEffect(() => { loadPlans(); }, []);

  // utilities to modify arrays
  const addPrice = () => setPrices(p => [...p, { recurringInterval: 'monthly', currency: 'usd', unitAmountCents: 0, active: true }]);
  const rmPrice = (i: number) => setPrices(p => p.filter((_, idx) => idx !== i));

  const addFeature = () => setFeatures(f => [...f, { key: '', enabled: true }]);
  const rmFeature = (i: number) => setFeatures(f => f.filter((_, idx) => idx !== i));

  const addLimit = () => setLimits(l => [...l, { resource: '', soft: undefined, hard: undefined }]);
  const rmLimit = (i: number) => setLimits(l => l.filter((_, idx) => idx !== i));

  return (
    <div className="sa-wrap">
      <h1 className="sa-title">Super Admin — Plans</h1>

      <section className="sa-card">
        <h2>Create Plan</h2>
        <form className="sa-form" >
          <div className="sa-grid">
            <label className="sa-field">
              <span>Key</span>
              <input value={key} onChange={e => setKey(e.target.value)} placeholder="starter" required />
            </label>
            <label className="sa-field">
              <span>Name</span>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="Starter" required />
            </label>
            <label className="sa-field">
              <span>Trial days</span>
              <input type="number" min={0} value={trialDays} onChange={e => setTrialDays(Number(e.target.value))} />
            </label>
          </div>

          <label className="sa-field">
            <span>Description</span>
            <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Optional short description..." />
          </label>

          <div className="sa-subtitle">Prices</div>
          <div className="sa-rows">
            {prices.map((p, i) => (
              <div className="sa-row" key={i}>
                <select
                  value={p.recurringInterval}
                  onChange={e => setPrices(prev => prev.map((x, idx) => idx === i ? { ...x, recurringInterval: e.target.value as BillingCycle } : x))}
                >
                  <option value="monthly">monthly</option>
                  <option value="yearly">yearly</option>
                </select>
                <input
                  value={p.currency}
                  onChange={e => setPrices(prev => prev.map((x, idx) => idx === i ? { ...x, currency: e.target.value } : x))}
                  placeholder="usd"
                />
                <input
                  type="number"
                  min={0}
                  value={p.unitAmountCents}
                  onChange={e => setPrices(prev => prev.map((x, idx) => idx === i ? { ...x, unitAmountCents: Number(e.target.value) } : x))}
                  placeholder="9900"
                />
                <label className="sa-checkbox">
                  <input
                    type="checkbox"
                    checked={!!p.isMetered}
                    onChange={e => setPrices(prev => prev.map((x, idx) => idx === i ? { ...x, isMetered: e.target.checked } : x))}
                  />
                  <span>metered</span>
                </label>
                <input
                  value={p.meterKey || ''}
                  onChange={e => setPrices(prev => prev.map((x, idx) => idx === i ? { ...x, meterKey: e.target.value || null } : x))}
                  placeholder="meterKey (optional)"
                />
                <label className="sa-checkbox">
                  <input
                    type="checkbox"
                    checked={p.active ?? true}
                    onChange={e => setPrices(prev => prev.map((x, idx) => idx === i ? { ...x, active: e.target.checked } : x))}
                  />
                  <span>active</span>
                </label>
                <button type="button" className="sa-btn danger" onClick={() => rmPrice(i)}>Remove</button>
              </div>
            ))}
          </div>
          <button type="button" className="sa-btn" onClick={addPrice}>+ Add price</button>

          <div className="sa-subtitle">Features</div>
          <div className="sa-rows">
            {features.map((f, i) => (
              <div className="sa-row" key={i}>
                <input
                  value={f.key}
                  onChange={e => setFeatures(prev => prev.map((x, idx) => idx === i ? { ...x, key: e.target.value } : x))}
                  placeholder="sso"
                />
                <label className="sa-checkbox">
                  <input
                    type="checkbox"
                    checked={!!f.enabled}
                    onChange={e => setFeatures(prev => prev.map((x, idx) => idx === i ? { ...x, enabled: e.target.checked } : x))}
                  />
                  <span>enabled</span>
                </label>
                <input
                  value={f.notes || ''}
                  onChange={e => setFeatures(prev => prev.map((x, idx) => idx === i ? { ...x, notes: e.target.value } : x))}
                  placeholder="notes (optional)"
                />
                <button type="button" className="sa-btn danger" onClick={() => rmFeature(i)}>Remove</button>
              </div>
            ))}
          </div>
          <button type="button" className="sa-btn" onClick={addFeature}>+ Add feature</button>

          <div className="sa-subtitle">Limits</div>
          <div className="sa-rows">
            {limits.map((l, i) => (
              <div className="sa-row" key={i}>
                <input
                  value={l.resource}
                  onChange={e => setLimits(prev => prev.map((x, idx) => idx === i ? { ...x, resource: e.target.value } : x))}
                  placeholder="flags"
                />
                <input
                  type="number"
                  min={0}
                  value={l.soft ?? ''}
                  onChange={e => setLimits(prev => prev.map((x, idx) => idx === i ? { ...x, soft: e.target.value === '' ? undefined : Number(e.target.value) } : x))}
                  placeholder="soft (optional)"
                />
                <input
                  type="number"
                  min={0}
                  value={l.hard ?? ''}
                  onChange={e => setLimits(prev => prev.map((x, idx) => idx === i ? { ...x, hard: e.target.value === '' ? undefined : Number(e.target.value) } : x))}
                  placeholder="hard (optional)"
                />
                <button type="button" className="sa-btn danger" onClick={() => rmLimit(i)}>Remove</button>
              </div>
            ))}
          </div>
          <button type="button" className="sa-btn" onClick={addLimit}>+ Add limit</button>

          {error && <div className="sa-error">Error: {error}</div>}
          <div className="sa-actions">
            <button className="sa-btn primary" disabled={!canSubmit || creating}>
              {creating ? 'Creating…' : 'Create Plan'}
            </button>
          </div>
        </form>
      </section>

      <section className="sa-card">
        <h2>Existing Plans</h2>
        {loading ? (
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
              {plans.map(p => (
                <tr key={p.id}>
                  <td>{p.key}</td>
                  <td>{p.name}</td>
                  <td><span className={`badge ${p.status}`}>{p.status}</span></td>
                  <td>
                    {p.prices
                      .sort((a, b) => a.recurringInterval.localeCompare(b.recurringInterval))
                      .map(pr => (
                        <div key={pr.id} className={!pr.active ? 'muted' : ''}>
                          {pr.recurringInterval}: {pr.currency.toUpperCase()} {(pr.unitAmountCents/100).toFixed(2)} {pr.active ? '' : '(inactive)'}
                        </div>
                      ))}
                  </td>
                  <td>{p.features.length}</td>
                  <td>{p.limits.length}</td>
                  <td>
                    <div className="row-actions">
                      {p.status !== 'active' && p.status !== 'archived' && (
                        <button className="sa-btn small" >Publish</button>
                      )}
                      {p.status !== 'archived' && (
                        <button className="sa-btn small danger">Archive</button>
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
"use client"
import React, { useState } from "react";
import "./Projects.css";

type Project = {
  id: string;
  name: string;
  environments: string[];
  flagsCount: number;
  apiHits: number;
  lastUpdated: string;
};

const dummyProjects: Project[] = [
  {
    id: "1",
    name: "MainApp",
    environments: ["Dev", "Staging", "Prod"],
    flagsCount: 7,
    apiHits: 22981,
    lastUpdated: "2025-08-07 13:29",
  },
  {
    id: "2",
    name: "CheckoutService",
    environments: ["Dev", "Prod"],
    flagsCount: 4,
    apiHits: 10911,
    lastUpdated: "2025-08-07 12:01",
  },
  {
    id: "3",
    name: "WidgetX",
    environments: ["Dev", "Staging"],
    flagsCount: 2,
    apiHits: 7011,
    lastUpdated: "2025-08-06 19:20",
  },
];

const tabs = [
  "Environments",
  "Feature Flags",
  "Targeting Rules",
  "SDK Keys",
  "Analytics",
  "Audit Logs",
];

export default function Projects() {
  const [selected, setSelected] = useState<Project | null>(null);
  const [activeTab, setActiveTab] = useState(0);

  if (!selected)
    return (
      <div className="proj-list-bg">
        <div className="proj-list glass">
          <h2>Projects</h2>
          <table>
            <thead>
              <tr>
                <th>📛 Project</th>
                <th>🌐 Environments</th>
                <th>🔢 Flags</th>
                <th>📊 API Hits</th>
                <th>⏱ Last Updated</th>
                <th>⚙️ Actions</th>
              </tr>
            </thead>
            <tbody>
              {dummyProjects.map((p) => (
                <tr key={p.id}>
                  <td>
                    <span className="proj-name" onClick={() => setSelected(p)}>
                      {p.name}
                    </span>
                  </td>
                  <td>
                    {p.environments.map((env, i) => (
                      <span className={`env-tag env-${env.toLowerCase()}`} key={i}>
                        {env}
                      </span>
                    ))}
                  </td>
                  <td>{p.flagsCount}</td>
                  <td>{p.apiHits.toLocaleString()}</td>
                  <td>{p.lastUpdated}</td>
                  <td>
                    <button className="proj-action" title="View" onClick={() => setSelected(p)}>
                      🔍
                    </button>
                    <button className="proj-action" title="Edit">✏️</button>
                    <button className="proj-action" title="Delete">🗑️</button>
                    <button className="proj-action" title="Duplicate">🧬</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="proj-create-cta">
            <button className="proj-btn primary">+ Create Project</button>
          </div>
        </div>
      </div>
    );

  // Project Details View
  return (
    <div className="proj-detail-bg">
      <div className="proj-detail glass">
        <div className="proj-detail-head">
          <button className="proj-back" onClick={() => setSelected(null)}>
            ← Back to Projects
          </button>
          <div>
            <span className="proj-detail-title">{selected.name}</span>
            <span className="proj-detail-envs">
              {selected.environments.map((env, i) => (
                <span className={`env-tag env-${env.toLowerCase()}`} key={i}>
                  {env}
                </span>
              ))}
            </span>
          </div>
        </div>
        <div className="proj-tabs">
          {tabs.map((tab, i) => (
            <button
              className={`proj-tab ${activeTab === i ? "active" : ""}`}
              key={tab}
              onClick={() => setActiveTab(i)}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="proj-tab-panel">
          {activeTab === 0 && (
            <div>
              <h3>Environments</h3>
              <ul>
                {selected.environments.map((env, i) => (
                  <li key={env} className="env-row">
                    <span className={`env-tag env-${env.toLowerCase()}`}>{env}</span>
                    <button className="env-edit">✏️ Rename</button>
                    <button className="env-del">🗑️ Delete</button>
                    <span className="env-sdk-key">SDK Key: <code>sk-{selected.id.slice(0, 4)}-{env.toLowerCase()}</code></span>
                  </li>
                ))}
              </ul>
              <button className="proj-btn small">+ Add Environment</button>
            </div>
          )}
          {activeTab === 1 && (
            <div>
              <h3>Feature Flags</h3>
              <table className="flags-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Envs</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>beta_checkout</td>
                    <td>Boolean</td>
                    <td>ON</td>
                    <td>
                      <span className="env-tag env-prod">Prod</span>
                      <span className="env-tag env-dev">Dev</span>
                    </td>
                    <td>
                      <button className="proj-action">✏️</button>
                      <button className="proj-action">🗑️</button>
                      <button className="proj-action">📥 Archive</button>
                    </td>
                  </tr>
                  <tr>
                    <td>new_ui</td>
                    <td>Gradual</td>
                    <td>50%</td>
                    <td>
                      <span className="env-tag env-staging">Staging</span>
                      <span className="env-tag env-prod">Prod</span>
                    </td>
                    <td>
                      <button className="proj-action">✏️</button>
                      <button className="proj-action">🗑️</button>
                      <button className="proj-action">📥 Archive</button>
                    </td>
                  </tr>
                </tbody>
              </table>
              <button className="proj-btn small">+ Create Feature Flag</button>
            </div>
          )}
          {activeTab === 2 && (
            <div>
              <h3>Targeting Rules</h3>
              <div className="rules-section">
                <div className="rule-block">
                  <div className="rule-flag">Flag: <b>new_ui</b></div>
                  <div className="rule-list">
                    <div className="rule">
                      <span className="rule-num">1.</span>
                      <span>plan = <b>pro</b> → <span className="rule-on">ON</span></span>
                      <button className="rule-edit">✏️</button>
                      <button className="rule-del">🗑️</button>
                    </div>
                    <div className="rule">
                      <span className="rule-num">2.</span>
                      <span>country = <b>IN</b> → <span className="rule-half">50%</span></span>
                      <button className="rule-edit">✏️</button>
                      <button className="rule-del">🗑️</button>
                    </div>
                  </div>
                  <button className="proj-btn tiny">+ Add Rule</button>
                </div>
              </div>
            </div>
          )}
          {activeTab === 3 && (
            <div>
              <h3>SDK Keys & Integration</h3>
              <div className="sdk-keys">
                {selected.environments.map((env, i) => (
                  <div key={env} className="sdk-key-row">
                    <span className={`env-tag env-${env.toLowerCase()}`}>{env}</span>
                    <span className="sdk-key">
                      Public: <code>pk-{selected.id.slice(0, 4)}-{env.toLowerCase()}</code>
                    </span>
                    <span className="sdk-key">
                      Secret: <code>sk-{selected.id.slice(0, 4)}-{env.toLowerCase()}</code>
                    </span>
                    <button className="proj-btn tiny">Copy</button>
                  </div>
                ))}
              </div>
              <div className="sdk-snippets">
                <h4>Integrate in your app</h4>
                <pre>{`// React
import { getFlag } from 'flagly';
const value = getFlag('new_ui');`}</pre>
                <pre>{`// Node
const { getFlag } = require('flagly');
const value = getFlag('new_ui');`}</pre>
                <pre>{`// CLI
flagly get-flag new_ui --env=prod`}</pre>
              </div>
            </div>
          )}
          {activeTab === 4 && (
            <div>
              <h3>Analytics</h3>
              <div className="analytics-cards">
                <div className="analytics-card">
                  <div>Total API Hits (30d)</div>
                  <div className="analytics-num">20,101</div>
                </div>
                <div className="analytics-card">
                  <div>Most Used Flag</div>
                  <div className="analytics-num">new_ui</div>
                </div>
                <div className="analytics-card">
                  <div>Prod Error Rate</div>
                  <div className="analytics-num">0.02%</div>
                </div>
              </div>
              {/* Put chart libs or SVGs for real usage */}
            </div>
          )}
          {activeTab === 5 && (
            <div>
              <h3>Audit Logs</h3>
              <table className="audit-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Action</th>
                    <th>Env</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>deepansh</td>
                    <td>Flag <b>new_ui</b> set to 50%</td>
                    <td>Prod</td>
                    <td>2025-08-07 13:29</td>
                  </tr>
                  <tr>
                    <td>deepansh</td>
                    <td>Project created</td>
                    <td>-</td>
                    <td>2025-08-07 13:19</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

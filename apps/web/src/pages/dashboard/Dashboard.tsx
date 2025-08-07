import React from "react";
import "./Dashboard.css";

const stats = [
  { label: "Projects", value: 3 },
  { label: "Feature Flags", value: 17 },
  { label: "API Calls (30d)", value: "59,340" },
];

const recent = [
  { text: "Flag 'beta_checkout' toggled ON in Project 'MainApp'", time: "3 min ago" },
  { text: "New project 'WidgetX' created", time: "1 day ago" },
  { text: "Flag 'dark_mode' rollout changed to 50%", time: "3 days ago" },
];

export default function Dashboard() {
  return (
      <div className="dash-main">
        {/* Topbar */}
        <header className="dash-topbar glass">
          <div className="dash-proj-switch">
            <span className="dash-proj-icon">🗂️</span>
            <span className="dash-proj-name">MainApp</span>
            <span className="dash-proj-arrow">▼</span>
          </div>
          <div className="dash-profile">
            <span className="dash-profile-avatar">D</span>
            <span className="dash-profile-name">Deepansh</span>
          </div>
        </header>

        {/* Content */}
        <main className="dash-content">
          <h1 className="dash-welcome">Welcome back, <span>Deepansh</span> 👋</h1>
          <div className="dash-quick">
            {stats.map((s) => (
              <div key={s.label} className="dash-stat glass">
                <div className="dash-stat-value">{s.value}</div>
                <div className="dash-stat-label">{s.label}</div>
              </div>
            ))}
            <div className="dash-cta-group">
              <button className="dash-btn primary">+ Create Project</button>
              <button className="dash-btn">+ Create Feature Flag</button>
            </div>
          </div>

          {/* Recent activity / logs */}
          <div className="dash-activity glass">
            <div className="dash-activity-title">Recent Activity</div>
            {recent.length === 0 ? (
              <div className="dash-empty">
                <span className="dash-empty-ico">🔎</span>
                <span>No activity yet. Start by creating a project or a flag!</span>
              </div>
            ) : (
              <ul>
                {recent.map((r, i) => (
                  <li key={i}>
                    <span className="dash-activity-dot" />
                    <span>{r.text}</span>
                    <span className="dash-activity-time">{r.time}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </main>
      </div>
  );
}

"use client"
import React from "react";
import "./LandingPage.css";

const steps = [
  {
    icon: "🛠️",
    title: "Create Flag",
    desc: "Spin up a new feature flag from the dashboard instantly.",
  },
  {
    icon: "💻",
    title: "Integrate SDK",
    desc: "Drop our SDK into your app. Access flags in one line.",
  },
  {
    icon: "🚀",
    title: "Deploy Safely",
    desc: "Toggle features live, do canary rollouts, and never redeploy.",
  },
];

export default function LandingPage() {
  return (
    <div className="dark-bg">
      <div className="noise-bg" />
      {/* Hero */}
      <section className="glass hero">
        <nav className="nav">
          <span className="nav-logo">Flagly</span>
          <div>
            <a href="#" className="nav-link">Docs</a>
            <a href="#" className="nav-link">GitHub</a>
            <a href="#" className="nav-btn">Try Free</a>
          </div>
        </nav>
        <div className="hero-content">
          <h1>
            <span className="gradient-text">Deploy Features Without Fear</span>
          </h1>
          <p>
            Powerful feature flags, safe rollouts, and instant control. <br />
            For developers shipping real products—no more risky deploys.
          </p>
          <div className="hero-ctas">
            <a href="#" className="btn primary">Try Free</a>
            <a href="#" className="btn secondary">See Docs</a>
          </div>
        </div>
      </section>

      {/* Problem / Solution */}
      <section className="problem-solution">
        <div className="problem glass">
          <h2>😰 Launching features shouldn't keep you up at night.</h2>
          <p>
            Shipping new code should be reversible, safe, and fast. Ditch the risky deploys and late-night emergencies.
          </p>
        </div>
        <div className="solution glass">
          <ul>
            <li><span>🛡️</span> Kill switch for any feature</li>
            <li><span>🎯</span> Gradual / % rollouts</li>
            <li><span>🔬</span> Canary launches & A/B tests</li>
            <li><span>♻️</span> No redeploy required</li>
          </ul>
        </div>
      </section>

      {/* Code Example */}
      <section className="glass code-section">
        <div className="code-label">Get a flag in one line:</div>
        <div className="code-block">
          <code>getFlag('new_ui', &#123; plan: 'pro' &#125;)</code>
          <button className="copy-btn"
            onClick={() =>
              navigator.clipboard.writeText(
                "getFlag('new_ui', { plan: 'pro' })"
              )
            }
          >
            Copy
          </button>
        </div>
        <div className="usecases">
          <span>Safe Deploys</span>
          <span>Canary Launches</span>
          <span>A/B Testing</span>
          <span>Personalization</span>
        </div>
      </section>

      {/* How it works */}
      <section className="how-section">
        <h2>How It Works</h2>
        <div className="how-steps">
          {steps.map((step, i) => (
            <div className="how-step glass" key={i}>
              <span className="how-icon">{step.icon}</span>
              <div>
                <div className="how-title">{step.title}</div>
                <div className="how-desc">{step.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="glass pricing-section">
        <h3>
          <span className="gradient-text">Free for solo devs.</span> <br />
          Usage-based pricing for teams.
        </h3>
        <a className="btn primary" href="#">View Pricing</a>
      </section>

      {/* Footer */}
      <footer className="footer glass">
        <div className="footer-links">
          <a href="#">About</a>
          <a href="#">GitHub</a>
          <a href="#">Twitter</a>
          <a href="#">Privacy</a>
        </div>
        <div className="footer-copy">
          &copy; {new Date().getFullYear()} Flagly, All Rights Reserved.
        </div>
      </footer>
    </div>
  );
}

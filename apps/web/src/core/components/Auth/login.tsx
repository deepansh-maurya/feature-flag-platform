"use client";
import { useState } from "react";
import styles from "./Auth.module.css";

export default function LoginPage() {
  const [show, setShow] = useState(false);

  return (
    <div className={styles.container}>
      {/* optional toast slot */}
      {/* <div className={styles.toast}>Wrong credentials</div> */}

      <div className={styles.grid}>
        {/* LEFT: form card */}
        <div className={styles.card}>
          <div className={styles.cardTitle}>Welcome back</div>
          <p className={styles.muted}>Sign in to your account to continue.</p>

          <label className={styles.label} htmlFor="email">Email</label>
          <input id="email" className={styles.input} placeholder="you@company.com" />

          <label className={styles.label} htmlFor="password">Password</label>
          <div className={styles.passwordRow}>
            <input
              id="password"
              className={styles.input}
              type={show ? "text" : "password"}
              placeholder="••••••••"
            />
            <button
              type="button"
              className={styles.ghostBtn}
              onClick={() => setShow((s) => !s)}
            >
              {show ? "Hide" : "Show"}
            </button>
          </div>

          <div className={styles.rowBetween}>
            <label className={styles.checkbox}>
              <input type="checkbox" /> <span>Remember me</span>
            </label>
            <a className={styles.link} href="#">Forgot password?</a>
          </div>

          <button className={styles.button}>Sign in</button>

          <div className={styles.divider}><span>or continue with</span></div>

          <div className={styles.oauthRow}>
            <button className={styles.oauthBtn}>Google</button>
            <button className={styles.oauthBtn}>GitHub</button>
          </div>

          <p className={styles.hint}>
            Don’t have an account? <a className={styles.link} href="/register">Create one</a>
          </p>
        </div>

        {/* RIGHT: brand / illustration */}
        <div className={styles.sidePanel}>
          <div className={styles.brandRow}>
            <div className={styles.brandDot} />
            <span className={styles.brand}>YourApp</span>
          </div>
          <h2 className={styles.sideHeading}>Ship features faster</h2>
          <p className={styles.sideText}>
            Manage flags, target users, and roll out safely — all from one clean dashboard.
          </p>
        </div>
      </div>
    </div>
  );
}

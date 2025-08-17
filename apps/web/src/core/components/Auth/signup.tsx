"use client";
import { useState } from "react";
import styles from "./Auth.module.css";

export default function SignupPage() {
  const [show, setShow] = useState(false);

  return (
    <div className={styles.container}>
      <div className={styles.grid}>
        {/* LEFT: form card */}
        <div className={styles.card}>
          <div className={styles.cardTitle}>Create your account</div>
          <p className={styles.muted}>Start your 14-day free trial. No credit card needed.</p>

          <label className={styles.label} htmlFor="name">Full name</label>
          <input id="name" className={styles.input} placeholder="Ada Lovelace" />

          <label className={styles.label} htmlFor="email">Email</label>
          <input id="email" className={styles.input} placeholder="you@company.com" />

          <label className={styles.label} htmlFor="password">Password</label>
          <div className={styles.passwordRow}>
            <input
              id="password"
              className={styles.input}
              type={show ? "text" : "password"}
              placeholder="Minimum 6 characters"
            />
            <button
              type="button"
              className={styles.ghostBtn}
              onClick={() => setShow((s) => !s)}
            >
              {show ? "Hide" : "Show"}
            </button>
          </div>

          <label className={styles.checkbox}>
            <input type="checkbox" /> <span>I agree to the Terms & Privacy</span>
          </label>

          <button className={styles.button}>Create account</button>

          <div className={styles.divider}><span>or sign up with</span></div>

          <div className={styles.oauthRow}>
            <button className={styles.oauthBtn}>Google</button>
            <button className={styles.oauthBtn}>GitHub</button>
          </div>

          <p className={styles.hint}>
            Already have an account? <a className={styles.link} href="/login">Sign in</a>
          </p>
        </div>

        {/* RIGHT: brand / illustration */}
        <div className={styles.sidePanel}>
          <div className={styles.brandRow}>
            <div className={styles.brandDot} />
            <span className={styles.brand}>YourApp</span>
          </div>
          <h2 className={styles.sideHeading}>Focus on building</h2>
          <p className={styles.sideText}>
            Reliable auth, clear UI, and a smooth onboarding flow so your users don’t bounce.
          </p>
        </div>
      </div>
    </div>
  );
}

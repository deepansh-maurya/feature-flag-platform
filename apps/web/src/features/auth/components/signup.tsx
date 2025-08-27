"use client";
import { useEffect, useState } from "react";
import styles from "./Auth.module.css";
import Image from "next/image";
import FlagCard from "../../../../public/img/image.png";
import { AppConst, Routes } from "../../../../app/constants";
import { useRouter } from "next/navigation";
import { useRegister } from "../hooks";

export default function SignupPage() {
  const [show, setShow] = useState(false);
  const [name, setName] = useState("");
  const [workspace, setWorkSpace] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agree, setAgree] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const router = useRouter();
  const register = useRegister();

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);

    if (!name || !email || !password || !workspace) {
      setErrorMsg("Name, email, workspace name and password are required.");
      return;
    }
    if (password.length < 8) {
      setErrorMsg("Password must be at least 8 characters.");
      return;
    }
    if (!agree) {
      setErrorMsg("You must agree to the Terms & Privacy.");
      return;
    }

    register.mutate(
      { name, email, password, workspace },
      {
        onSuccess: () => {
          // token persisted in api.ts; header set globally
          router.push(Routes.dashboard); // or Routes.onboarding/pricing if you have those
        },
        onError: (err: any) => {
          const apiMsg =
            err?.response?.data?.message ||
            err?.message ||
            "Unable to create account. Please try again.";
          setErrorMsg(apiMsg);
        }
      }
    );
  }

  useEffect(() => {
    setErrorMsg(null);
  }, [name, email, password, agree]);

  return (
    <div className={styles.container}>
      {errorMsg && <div className={styles.toast}>{errorMsg}</div>}

      <div className={styles.grid}>
        {/* LEFT: form card */}
        <div className={styles.card}>
          <div className={styles.cardTitle}>Create your account</div>
          <p className={styles.muted}>
            Choose the <span className="grad">right plan</span> for your team
          </p>

          <form onSubmit={onSubmit} className={styles.form}>
            <label className={styles.label} htmlFor="name">
              Workspace Name
            </label>
            <input
              id="workspace"
              className={styles.input}
              placeholder="Org workspace"
              value={workspace}
              onChange={(e) => setWorkSpace(e.target.value)}
              autoComplete="workspace"
              required
            />

            <label className={styles.label} htmlFor="name">
              Full name
            </label>
            <input
              id="name"
              className={styles.input}
              placeholder="Ada Lovelace"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              required
            />

            <label className={styles.label} htmlFor="email">
              Email
            </label>
            <input
              id="email"
              className={styles.input}
              placeholder="you@company.com"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />

            <label className={styles.label} htmlFor="password">
              Password
            </label>
            <div className={styles.passwordRow}>
              <input
                id="password"
                className={styles.input}
                type={show ? "text" : "password"}
                placeholder="Minimum 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                required
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
              <input
                type="checkbox"
                checked={agree}
                onChange={(e) => setAgree(e.target.checked)}
              />{" "}
              <span>I agree to the Terms &amp; Privacy</span>
            </label>

            <button
              className={styles.button}
              type="submit"
              disabled={register.isPending}
            >
              {register.isPending ? "Creating…" : "Create account"}
            </button>
          </form>

          <div className={styles.divider}>
            <span>or sign up with</span>
          </div>

          <div className={styles.oauthRow}>
            <button className={styles.oauthBtn} type="button" disabled>
              Google
            </button>
            <button className={styles.oauthBtn} type="button" disabled>
              GitHub
            </button>
          </div>

          <p className={styles.hint}>
            Already have an account?{" "}
            <a className={styles.link} href="/login">
              Sign in
            </a>
          </p>
        </div>

        {/* RIGHT: brand / illustration */}
        <div className={styles.sidePanel}>
          <div className={styles.brandRow}>
            <div className={styles.brandDot} />
            <span
              style={{ cursor: "pointer" }}
              className={styles.brand}
              onClick={() => router.push(Routes.landingPage)}
            >
              {AppConst.appName}
            </span>
          </div>
          <h2 className={styles.sideHeading}>Deploy with confidence</h2>
          <p className={styles.sideText}>
            Flip features live, roll out gradually, and ship without fear.
          </p>

          <div className={styles.mockImage}>
            <Image
              src={FlagCard}
              alt="Feature flag card"
              width={400}
              height={300}
              priority
            />
          </div>
        </div>
      </div>
    </div>
  );
}

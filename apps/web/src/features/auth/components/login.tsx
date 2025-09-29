"use client";
import { useEffect, useState } from "react";
import styles from "./Auth.module.css";
import Image from "next/image";
import FlagCard from "../../../../public/img/image.png";
import { AppConst, Routes } from "../../../../app/constants";
import { useRouter } from "next/navigation";
import { useLogin } from "../hooks";
import { useAppContext } from "@/src/shared/context/AppContext";

export default function LoginPage() {
  const [show, setShow] = useState(false);
  const router = useRouter();
  const { setUser, setWorkspace } = useAppContext();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true); // visual only for now
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const login = useLogin();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);

    // Minimal guard
    if (!email || !password) {
      setErrorMsg("Email and password are required.");
      return;
    }

    login.mutate(
      { email, password, remember },
      {
        onSuccess: async (data) => {
          console.log(data);

          const user = data.user as any;
          setUser({
            email: user?.email,
            id: user.id,
            name: user.name
          });

          const workspace = data.workspace;

          setWorkspace({
            id: workspace!.id,
            name: workspace!.name,
            plan: workspace.planKey
          });

          router.push(Routes.dashboard());
        },
        onError: (err: any) => {
          const apiMsg =
            err?.response?.data?.message ||
            err?.message ||
            "Unable to sign in. Check your credentials.";
          setErrorMsg(apiMsg);
        }
      }
    );
  }

  // Press Enter to submit when focused in inputs (form handles it already)
  useEffect(() => {
    setErrorMsg(null);
  }, [email, password]);

  return (
    <div className={styles.container}>
      {/* toast / error slot */}
      {errorMsg && <div className={styles.toast}>{errorMsg}</div>}

      <div className={styles.grid}>
        {/* LEFT: form card */}
        <div className={styles.card}>
          <div className={styles.cardTitle}>Welcome back</div>
          <p className={styles.muted}>Sign in to your account to continue.</p>

          <form onSubmit={onSubmit} className={styles.form}>
            <label className={styles.label} htmlFor="email">
              Email
            </label>
            <input
              id="email"
              className={styles.input}
              placeholder="you@company.com"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
                placeholder="••••••••"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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

            <div className={styles.rowBetween}>
              <label className={styles.checkbox}>
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                />{" "}
                <span>Remember me</span>
              </label>
              <a className={styles.link} href="/forgot-password">
                Forgot password?
              </a>
            </div>

            <button
              className={styles.button}
              type="submit"
              disabled={login.isPending}
            >
              {login.isPending ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <div className={styles.divider}>
            <span>or continue with</span>
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
            Don’t have an account?{" "}
            <a className={styles.link} href="/register">
              Create one
            </a>
          </p>
        </div>

        {/* RIGHT: brand / illustration */}
        <div className={styles.sidePanel}>
          <div className={styles.brandRow}>
            <div className={styles.brandDot} />
            <span
              style={{ cursor: "pointer" }}
              onClick={() => {
                router.push(Routes.landingPage());
              }}
              className={styles.brand}
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

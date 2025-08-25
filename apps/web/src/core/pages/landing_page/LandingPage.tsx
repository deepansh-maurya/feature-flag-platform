"use client";
import React, { useEffect, useRef, useState } from "react";
import { motion, useMotionTemplate, useMotionValue } from "framer-motion";
import {
  Github,
  BookOpen,
  ArrowRight,
  CheckCircle2,
  Shield,
  Telescope,
  Zap,
  Droplet,
  Flame,
  ChevronRight,
  Twitter
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Routes } from "../../constants/routes";

// =============================================
// Supercharged Flagly Landing Page (single file)
// - Tailwind for styling
// - Framer Motion for animation
// - Fancy background (aurora + starfield + gooey blobs)
// - Magnetic buttons, 3D tilt cards, scroll reveals, marquee
// - Self-contained: drop into Next.js/React app
// =============================================

// ---- Config ----
const steps = [
  {
    icon: <Telescope className="w-6 h-6" />,
    title: "Create Flag",
    desc: "Spin up a new feature flag from the dashboard instantly."
  },
  {
    icon: <Zap className="w-6 h-6" />,
    title: "Integrate SDK",
    desc: "Drop our SDK into your app. Access flags in one line."
  },
  {
    icon: <Shield className="w-6 h-6" />,
    title: "Deploy Safely",
    desc: "Toggle features live, do canary rollouts, and never redeploy."
  }
];

const usecases = [
  "Safe Deploys",
  "Canary Launches",
  "A/B Testing",
  "Personalization"
];

// ---- Utility: 3D tilt on hover ----
function useTilt(max = 12) {
  const ref = useRef<HTMLDivElement | null>(null);
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const t = useMotionTemplate`rotateX(${rx}deg) rotateY(${ry}deg)`;
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width; // 0..1
      const py = (e.clientY - rect.top) / rect.height; // 0..1
      rx.set((0.5 - py) * max);
      ry.set((px - 0.5) * max);
    };
    const onLeave = () => {
      rx.set(0);
      ry.set(0);
    };
    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, [max, rx, ry]);
  return { ref, t };
}

// ---- Starfield Canvas ----
function Starfield() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  useEffect(() => {
    const c = canvasRef.current!;
    const ctx = c.getContext("2d")!;
    let raf = 0;
    let w = (c.width = window.innerWidth);
    let h = (c.height = window.innerHeight);
    let stars = Array.from(
      { length: Math.min(220, Math.floor((w * h) / 18000)) },
      () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        z: Math.random() * 0.8 + 0.2,
        s: Math.random() * 1.2 + 0.2
      })
    );
    const onResize = () => {
      w = c.width = window.innerWidth;
      h = c.height = window.innerHeight;
    };
    window.addEventListener("resize", onResize);
    const tick = () => {
      ctx.clearRect(0, 0, w, h);
      for (const st of stars) {
        st.x += st.z * 0.25;
        if (st.x > w) st.x = 0;
        ctx.globalAlpha = 0.5 + st.z * 0.5;
        ctx.fillStyle = "#a7b8ff";
        ctx.fillRect(st.x, st.y, st.s, st.s);
      }
      raf = requestAnimationFrame(tick);
    };
    tick();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, []);
  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-0 opacity-30"
    />
  );
}

// ---- Aurora Gradient Background ----
function Aurora() {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden">
      <div className="absolute -top-64 -left-64 h-[48rem] w-[48rem] rounded-full bg-[radial-gradient(circle_at_center,rgba(108,99,255,0.35),transparent_60%)] blur-3xl" />
      <div className="absolute top-1/3 -right-64 h-[36rem] w-[36rem] rounded-full bg-[radial-gradient(circle_at_center,rgba(168,134,253,0.35),transparent_60%)] blur-3xl" />
      <div className="absolute bottom-0 left-1/4 h-[32rem] w-[32rem] rounded-full bg-[radial-gradient(circle_at_center,rgba(147,243,252,0.30),transparent_60%)] blur-3xl" />
      <svg className="absolute inset-0 w-full h-full">
        <defs>
          <filter id="goo">
            <feGaussianBlur
              in="SourceGraphic"
              stdDeviation="12"
              result="blur"
            />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -10"
            />
          </filter>
        </defs>
      </svg>
      {/* Gooey blobs */}
      <div className="absolute left-1/3 top-24" style={{ filter: "url(#goo)" }}>
        <div className="blob" />
        <div className="blob delay-200" />
        <div className="blob delay-500" />
      </div>
    </div>
  );
}

// ---- Magnetic Button ----
function MagneticButton({
  children,
  className,
  href
}: {
  children: React.ReactNode;
  className?: string;
  href?: string;
}) {
  const ref = useRef<HTMLAnchorElement | null>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const transform = useMotionTemplate`translate(${x}px, ${y}px)`;
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const dx = e.clientX - (rect.left + rect.width / 2);
      const dy = e.clientY - (rect.top + rect.height / 2);
      x.set(dx * 0.2);
      y.set(dy * 0.2);
    };
    const onLeave = () => {
      x.set(0);
      y.set(0);
    };
    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, [x, y]);
  const Base = (
    <motion.a
      href={href || "#"}
      ref={ref}
      style={{ transform }}
      className={
        "relative inline-flex items-center gap-2 rounded-xl px-5 py-3 font-semibold text-white shadow-[0_10px_30px_rgba(130,90,255,0.35)] transition-all hover:shadow-[0_16px_40px_rgba(130,90,255,0.45)] " +
        (className || "")
      }
    >
      {children}
    </motion.a>
  );
  return Base;
}

// ---- Marquee ----
function Marquee() {
  return (
    <div className="relative mt-16 w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_20%,black_80%,transparent)]">
      <div className="flex animate-marquee whitespace-nowrap text-sm text-indigo-200/70">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="mx-6 inline-flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            <span>Gradual Rollouts</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---- Code Block ----
function CodeBlock() {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText("getFlag('new_ui', { plan: 'pro' })");
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {}
  };
  return (
    <div className="mx-auto mt-10 max-w-xl rounded-2xl border border-indigo-400/20 bg-slate-900/50 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] backdrop-blur">
      <div className="mb-3 text-xs font-medium text-cyan-300">
        Get a flag in one line:
      </div>
      <div className="relative rounded-xl bg-slate-950/70 p-4 font-mono text-[0.95rem] text-cyan-200 ring-1 ring-white/5">
        <span className="opacity-70">getFlag</span>(
        <span className="text-pink-300">'new_ui'</span>,{" "}
        <span className="text-indigo-300">&#123; plan: 'pro' &#125;</span>)
        <button
          onClick={copy}
          className="absolute right-3 top-3 rounded-md border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-white/90 hover:bg-white/10"
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-indigo-200/80">
        {usecases.map((u) => (
          <span
            key={u}
            className="rounded-full border border-cyan-400/20 bg-cyan-400/5 px-3 py-1"
          >
            {u}
          </span>
        ))}
      </div>
    </div>
  );
}

// ---- Section Wrapper: fade/slide in ----
function Reveal({
  children,
  className
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.section>
  );
}

// ---- Main Component ----
export default function LandingPage() {
  const gradientX = useMotionValue(50);
  const gradientY = useMotionValue(50);
  const gradient = useMotionTemplate`radial-gradient(1200px_circle_at_${gradientX}%_${gradientY}%, rgba(147,243,252,0.16), transparent 60%)`;
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 100;
      const y = (e.clientY / window.innerHeight) * 100;
      gradientX.set(x);
      gradientY.set(y);
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [gradientX, gradientY]);

  const { ref: tiltRef, t } = useTilt(10);

  const router = useRouter();

  const goToPricingPage = () => {
    router.push(Routes.pricing);
  };

  return (
    <div className="relative min-h-screen overflow-x-clip bg-gradient-to-br from-[#191926] via-[#1b1b2a] to-[#202032] text-slate-100">
      <Starfield />
      <Aurora />

      {/* Cursor spotlight */}
      <motion.div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10"
        style={{ background: gradient }}
      />

      {/* Nav */}
      <div className="mx-auto max-w-6xl px-4 pt-6">
        <nav className="glassmorph flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-400 to-fuchsia-500 shadow-inner" />
            <span className="text-lg font-extrabold tracking-tight text-indigo-200">
              Flagly
            </span>
          </div>
          <div className="hidden items-center gap-2 md:flex">
            <a href="#" className="navlink">
              Docs
            </a>
            <a href="#" className="navlink">
              GitHub
            </a>
            <div onClick={goToPricingPage}>
              <MagneticButton className="bg-gradient-to-r from-indigo-500 to-fuchsia-500">
                Try <ArrowRight className="h-4 w-4" />
              </MagneticButton>
            </div>
          </div>
        </nav>
      </div>

      {/* Hero */}
      <header className="relative mx-auto mt-14 max-w-6xl px-4">
        <motion.div
          style={{ transform: t }}
          ref={tiltRef}
          className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-10 text-center shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur"
        >
          <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-[radial-gradient(circle_at_center,rgba(164,134,253,0.25),transparent_60%)] blur-2xl" />
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="mx-auto max-w-3xl bg-gradient-to-r from-cyan-200 via-indigo-200 to-fuchsia-300 bg-clip-text text-4xl font-extrabold leading-tight text-transparent md:text-6xl"
          >
            Deploy Features Without Fear
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.6 }}
            className="mx-auto mt-4 max-w-2xl text-lg text-indigo-100/80"
          >
            Powerful feature flags, safe rollouts, and instant control. For
            developers shipping real products—no more risky deploys.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.6 }}
            className="mt-7 flex items-center justify-center gap-3"
          >
            <div onClick={goToPricingPage}>
              <MagneticButton className="bg-gradient-to-r from-indigo-500 to-fuchsia-500">
                Try <ArrowRight className="h-4 w-4" />
              </MagneticButton>
            </div>
            <a
              href="#"
              className="inline-flex items-center gap-2 rounded-xl border border-indigo-400/30 bg-white/5 px-5 py-3 font-semibold text-indigo-100/90 backdrop-blur hover:bg-white/10"
            >
              See Docs <BookOpen className="h-4 w-4" />
            </a>
          </motion.div>
          <Marquee />
        </motion.div>
      </header>

      {/* Problem / Solution */}
      <Reveal className="mx-auto mt-16 max-w-6xl px-4">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/10 to-transparent p-6 backdrop-blur">
            <h2 className="text-lg font-bold text-pink-200">
              😰 Launching features shouldn't keep you up at night.
            </h2>
            <p className="mt-2 text-indigo-100/80">
              Shipping new code should be reversible, safe, and fast. Ditch the
              risky deploys and late-night emergencies.
            </p>
            <div className="mt-6 grid grid-cols-2 gap-3 text-sm text-indigo-100/80">
              <div className="flex items-center gap-2">
                <Droplet className="h-4 w-4 text-cyan-300" />
                <span>Instant kill switches</span>
              </div>
              <div className="flex items-center gap-2">
                <Flame className="h-4 w-4 text-fuchsia-300" />
                <span>Rollback without redeploy</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-indigo-300" />
                <span>Safeguards & policies</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-amber-300" />
                <span>Zero-downtime flips</span>
              </div>
            </div>
          </div>
          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
            <ul className="space-y-3 text-indigo-100/90">
              {[
                ["🛡️", "Kill switch for any feature"],
                ["🎯", "Gradual / % rollouts"],
                ["🔬", "Canary launches & A/B tests"],
                ["♻️", "No redeploy required"]
              ].map(([emoji, text]) => (
                <li
                  key={text}
                  className="flex items-center gap-3 rounded-xl border border-cyan-400/10 bg-cyan-400/5 px-4 py-3"
                >
                  <span className="text-xl" aria-hidden>
                    {emoji}
                  </span>
                  <span className="font-medium">{text}</span>
                  <ChevronRight className="ml-auto h-4 w-4 opacity-60" />
                </li>
              ))}
            </ul>
            {/* Shimmer */}
            <div className="pointer-events-none absolute inset-0 rounded-2xl [mask-image:linear-gradient(180deg,black,transparent)]">
              <div className="absolute -inset-x-10 -top-10 h-24 animate-shimmer rounded-full bg-gradient-to-r from-transparent via-white/15 to-transparent" />
            </div>
          </div>
        </div>
      </Reveal>

      {/* Code Example */}
      <Reveal>
        <CodeBlock />
      </Reveal>

      {/* How it works */}
      <Reveal className="mx-auto mt-16 max-w-6xl px-4">
        <h2 className="mb-6 text-center text-xl font-extrabold tracking-tight text-indigo-200">
          How It Works
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          {steps.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06, duration: 0.6 }}
              className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur"
            >
              <div className="mb-3 inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1 text-sm text-indigo-100/90">
                {s.icon} <span className="font-semibold">{s.title}</span>
              </div>
              <p className="text-indigo-100/80">{s.desc}</p>
              <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-[radial-gradient(circle_at_center,rgba(147,243,252,0.2),transparent_60%)] blur-xl" />
            </motion.div>
          ))}
        </div>
      </Reveal>

      {/* Pricing */}
      <Reveal className="mx-auto mt-16 max-w-4xl px-4 text-center">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-10 backdrop-blur">
          <h3 className="bg-gradient-to-r from-cyan-200 to-fuchsia-300 bg-clip-text text-2xl font-extrabold text-transparent md:text-3xl">
            Free for solo devs.{" "}
            <span className="block text-base font-semibold text-indigo-100/80">
              Usage-based pricing for teams.
            </span>
          </h3>
          <div className="mt-6 flex items-center justify-center gap-3">
            <MagneticButton className="bg-gradient-to-r from-indigo-500 to-fuchsia-500">
              View Pricing
            </MagneticButton>
            <a
              href="#"
              className="inline-flex items-center gap-2 rounded-xl border border-indigo-400/30 bg-white/5 px-5 py-3 font-semibold text-indigo-100/90 backdrop-blur hover:bg-white/10"
            >
              GitHub <Github className="h-4 w-4" />
            </a>
          </div>
        </div>
      </Reveal>

      {/* Footer */}
      <footer className="mx-auto mt-16 max-w-6xl px-4 pb-10">
        <div className="rounded-2xl border border-white/10 bg-white/5 px-6 py-5 backdrop-blur">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="text-sm text-indigo-100/70">
              © {new Date().getFullYear()} Flagly, All Rights Reserved.
            </div>
            <div className="flex items-center gap-4 text-sm text-indigo-100/80">
              <a href="#" className="hover:text-white">
                About
              </a>
              <a href="#" className="hover:text-white">
                Docs
              </a>
              <a
                href="#"
                className="hover:text-white inline-flex items-center gap-1"
              >
                <Twitter className="h-4 w-4" />
                Twitter
              </a>
              <a href="#" className="hover:text-white">
                Privacy
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Local styles for special effects */}
      <style>{`
        .navlink{ @apply text-indigo-200/80 hover:text-white px-3 py-2 rounded-lg transition-colors; }
        .blob{ width: 160px; height: 160px; border-radius: 9999px; background: radial-gradient(circle at 30% 30%, rgba(164,134,253,0.45), rgba(108,99,255,0.45)); position: absolute; animation: float 6s ease-in-out infinite; opacity: .7; }
        .blob.delay-200{ left: 120px; top: 40px; animation-delay: .2s; background: radial-gradient(circle at 30% 30%, rgba(147,243,252,0.42), rgba(164,134,253,0.42)); }
        .blob.delay-500{ left: 240px; top: -10px; animation-delay: .5s; background: radial-gradient(circle at 30% 30%, rgba(255,255,255,0.15), rgba(147,243,252,0.35)); }
        @keyframes float { 0%,100%{ transform: translateY(0) } 50%{ transform: translateY(18px) } }
        .animate-marquee{ animation: marquee 16s linear infinite; }
        @keyframes marquee { 0%{ transform: translateX(0) } 100%{ transform: translateX(-50%) } }
        .animate-shimmer{ animation: shimmer 2.1s linear infinite; }
        @keyframes shimmer { 0%{ transform: translateX(-10%) } 100%{ transform: translateX(110%) } }
      `}</style>
    </div>
  );
}

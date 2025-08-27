'use client';

import styles from './PlanUsageModern.module.css';

type NumOrTag = number | 'unlimited' | 'custom';
type Usage = { api?: number; flags?: number; members?: number; envs?: number };

export function PlanUsageModern({
  usage,
  limits,
  accent = '#7c3aed',
}: {
  usage: Usage;
  limits: {
    apiRequestsPerMonth: NumOrTag;
    flags: NumOrTag;
    seats: NumOrTag;
    environmentsPerWorkspace: NumOrTag;
    // extra capabilities with no usage bars:
    segments?: NumOrTag;
    webhooks?: NumOrTag;
    auditRetentionDays?: NumOrTag;
    projects?: NumOrTag;
    workspaces?: NumOrTag;
  };
  accent?: string;
}) {
  // rows WITH usage bars
  const withUsage = [
    { label: 'API Requests', value: usage.api,    limit: limits.apiRequestsPerMonth },
    { label: 'Feature Flags', value: usage.flags, limit: limits.flags },
    { label: 'Team Members',  value: usage.members, limit: limits.seats },
    { label: 'Environments',  value: usage.envs,  limit: limits.environmentsPerWorkspace },
  ] as const;

  // rows WITHOUT usage (show “Not available”, “Unlimited/Custom”, or “Up to …” chip)
  const noUsage = [
    limits.segments !== undefined && { label: 'Segments', limit: limits.segments },
    limits.webhooks !== undefined && { label: 'Webhooks', limit: limits.webhooks },
    limits.auditRetentionDays !== undefined && { label: 'Audit log retention', limit: limits.auditRetentionDays, format: fmtDays },
    limits.projects !== undefined && { label: 'Projects', limit: limits.projects },
    limits.workspaces !== undefined && { label: 'Workspaces', limit: limits.workspaces },
  ].filter(Boolean) as Array<{ label: string; limit: NumOrTag; format?: (n:number)=>string }>;

  return (
    <div className={styles.box} style={{ ['--accent' as any]: accent }}>
      {withUsage.map(r => (
        <CapabilityRow key={r.label} label={r.label} limit={r.limit} value={r.value} />
      ))}

      {noUsage.length > 0 && <div style={{ height: 4 }} />}

      {noUsage.map(r => (
        <CapabilityRow key={r.label} label={r.label} limit={r.limit} format={r.format} />
      ))}
    </div>
  );
}

function CapabilityRow({
  label,
  limit,
  value,
  format,
}: {
  label: string;
  limit: NumOrTag;
  value?: number;                 // if omitted → no bar
  format?: (n:number)=>string;    // optional formatter for numeric limits
}) {
  // 0 or falsey number ⇒ Not available
  if (typeof limit === 'number' && limit <= 0) {
    return (
      <div className={`${styles.row} ${styles.rowNA}`}>
        <div className={styles.left}><span className={styles.label}>{label}</span></div>
        <span className={styles.badgeNA}>Not available</span>
      </div>
    );
  }

  // Unlimited / Custom ⇒ info chip (no bar)
  if (limit === 'unlimited' || limit === 'custom') {
    return (
      <div className={styles.row}>
        <div className={styles.left}><span className={styles.label}>{label}</span></div>
        <span className={styles.badgeInfo}>{limit === 'unlimited' ? 'Unlimited' : 'Custom'}</span>
      </div>
    );
  }

  // Numeric limit > 0
  const max = limit as number;

  // If no usage provided, show a simple “Up to …” chip (no bar)
  if (value === undefined) {
    return (
      <div className={styles.row}>
        <div className={styles.left}><span className={styles.label}>{label}</span></div>
        <span className={styles.badgeInfo}>Up to {format ? format(max) : formatInt(max)}</span>
      </div>
    );
  }

  // With usage value → progress bar
  const pct = Math.min(100, Math.round((value / max) * 100));

  return (
    <div className={styles.row}>
      <div className={styles.left}>
        <span className={styles.label}>{label}</span>
        <span className={styles.sub}>
          {value.toLocaleString()} / {format ? format(max) : formatInt(max)}
        </span>
      </div>
      <div className={styles.right}>
        <div className={styles.bar} role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={`${label} usage`}>
          <div className={`${styles.fill} ${pct >= 100 ? styles.fillDanger : ''}`} style={{ width: `${pct}%` }} />
        </div>
        <span className={styles.percent}>{pct}%</span>
      </div>
    </div>
  );
}

function formatInt(n: number) {
  return n >= 9_999_999 ? '10M+' : n >= 9_999 ? '10k+' : n.toLocaleString();
}
function fmtDays(n: number) {
  return `${n} day${n === 1 ? '' : 's'}`;
}

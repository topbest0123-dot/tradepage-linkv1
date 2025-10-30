// lib/accountState.js
export function deriveAccountState({ profile, sub }) {
  const now = new Date();

  // pick sensible defaults if columns missing
  const trialStart = new Date(profile?.trial_start || profile?.created_at || now);
  const trialDays = Number(profile?.trial_days ?? 14);
  const trialEnd = new Date(trialStart.getTime() + trialDays * 24 * 60 * 60 * 1000);

  const diffMs = trialEnd.getTime() - now.getTime();
  const daysLeft = Math.max(0, Math.ceil(diffMs / (24 * 60 * 60 * 1000)));

  const status = (sub?.status || '').toLowerCase();
  const hasSub = Boolean(sub?.subscription_id);

  // Active sub wins
  if (status === 'active') return { state: 'active', daysLeft: 0 };

  // If user once had a sub (subscription_id present) but not active → treat as past_due/suspended
  if (hasSub && status !== 'active') return { state: 'past_due', daysLeft: 0 };

  // Otherwise fall back to trial window
  if (now < trialEnd) return { state: 'trial', daysLeft };

  // Trial ended, no active sub
  return { state: 'expired', daysLeft: 0 };
}

// lib/accountState.js
export function deriveAccountState({ profile, sub }) {
  const now = new Date();
  const start = profile?.trial_start ? new Date(profile.trial_start)
              : profile?.created_at   ? new Date(profile.created_at)
              : now;
  const trialDays = Number(profile?.trial_days ?? 14);
  const daysUsed  = Math.floor((now - start) / 86400000);
  const daysLeft  = Math.max(trialDays - daysUsed, 0);

  const subStatus = (sub?.status || '').toLowerCase();

  if (subStatus === 'active') return { state: 'active', daysLeft: 0 };
  if (['past_due','incomplete','suspended'].includes(subStatus)) {
    return { state: 'past_due', daysLeft };
  }
  if (daysLeft > 0) return { state: 'trial', daysLeft };
  return { state: 'expired', daysLeft: 0 };
}

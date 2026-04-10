/**
 * Subscription plan definitions and enforcement utilities.
 */

export interface PlanConfig {
  name: string;
  label: string;
  price: number;
  priceLabel: string;
  period: string;
  durationDays: number;
  maxAccounts: number;
  maxUploadsPerDay: number;
  totalUploads: number;
  features: string[];
  highlighted?: boolean;
}

export const PLANS: Record<string, PlanConfig> = {
  test: {
    name: "test",
    label: "Test",
    price: 0,
    priceLabel: "Free",
    period: "5 days",
    durationDays: 5,
    maxAccounts: 1,
    maxUploadsPerDay: 1,
    totalUploads: 5,
    features: [
      "5 video uploads",
      "1 connected account",
      "1 video/day",
      "Basic SEO titles",
      "Email support",
    ],
  },
  standard: {
    name: "standard",
    label: "Standard",
    price: 50,
    priceLabel: "$50",
    period: "30 days",
    durationDays: 30,
    maxAccounts: 3,
    maxUploadsPerDay: 1,
    totalUploads: 30,
    features: [
      "30 video uploads",
      "Up to 3 accounts",
      "1 video/day",
      "AI SEO optimization",
      "Priority support",
      "Google Drive integration",
    ],
    highlighted: true,
  },
  premium: {
    name: "premium",
    label: "Premium",
    price: 70,
    priceLabel: "$70",
    period: "30 days",
    durationDays: 30,
    maxAccounts: 4,
    maxUploadsPerDay: 2,
    totalUploads: 60,
    features: [
      "60 video uploads",
      "Up to 4 accounts",
      "1–2 videos/day",
      "Advanced AI SEO",
      "Priority support",
      "Google Drive integration",
      "Custom scheduling",
    ],
  },
};

export const PLAN_LIST = [PLANS.test, PLANS.standard, PLANS.premium];

export interface SubscriptionState {
  plan: string;
  status: string;
  startsAt: string | null;
  expiresAt: string | null;
  maxAccounts: number;
  maxUploadsPerDay: number;
  totalUploadsAllowed: number;
  uploadsUsed: number;
}

/**
 * Check if the subscription is currently active.
 */
export function isSubscriptionActive(sub: SubscriptionState | null): boolean {
  if (!sub || sub.status !== "active") return false;
  if (sub.expiresAt && new Date(sub.expiresAt) < new Date()) return false;
  return true;
}

/**
 * Return remaining uploads for the subscription.
 */
export function remainingUploads(sub: SubscriptionState | null): number {
  if (!sub || !isSubscriptionActive(sub)) return 0;
  return Math.max(0, sub.totalUploadsAllowed - sub.uploadsUsed);
}

/**
 * Check if user can connect more accounts.
 */
export function canConnectMoreAccounts(
  sub: SubscriptionState | null,
  currentCount: number
): boolean {
  if (!sub || !isSubscriptionActive(sub)) {
    // Allow 1 account even without a sub (free trial encouragement)
    return currentCount < 1;
  }
  return currentCount < sub.maxAccounts;
}

/**
 * Get the plan config for a subscription.
 */
export function getPlanConfig(planName: string): PlanConfig | null {
  return PLANS[planName] || null;
}

/**
 * Days remaining in subscription.
 */
export function daysRemaining(sub: SubscriptionState | null): number {
  if (!sub || !sub.expiresAt) return 0;
  const diff = new Date(sub.expiresAt).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / 86400000));
}

/**
 * Format subscription for display from raw DB row.
 */
export function formatSubscription(row: any): SubscriptionState {
  return {
    plan: row.plan || "none",
    status: row.status || "inactive",
    startsAt: row.starts_at || null,
    expiresAt: row.expires_at || null,
    maxAccounts: row.max_accounts || 1,
    maxUploadsPerDay: row.max_uploads_per_day || 1,
    totalUploadsAllowed: row.total_uploads_allowed || 5,
    uploadsUsed: row.uploads_used || 0,
  };
}

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  formatSubscription,
  isSubscriptionActive,
  remainingUploads,
  daysRemaining,
  canConnectMoreAccounts,
  type SubscriptionState,
} from "@/lib/subscription";

export function useSubscription() {
  const [subscription, setSubscription] = useState<SubscriptionState | null>(null);
  const [loading, setLoading] = useState(true);
  const [accountCount, setAccountCount] = useState(0);

  const load = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    const [{ data: sub }, { count }] = await Promise.all([
      supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle(),
      supabase
        .from("social_accounts")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id),
    ]);

    setSubscription(sub ? formatSubscription(sub) : null);
    setAccountCount(count || 0);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  return {
    subscription,
    loading,
    accountCount,
    reload: load,
    isActive: isSubscriptionActive(subscription),
    remaining: remainingUploads(subscription),
    daysLeft: daysRemaining(subscription),
    canAddAccount: canConnectMoreAccounts(subscription, accountCount),
  };
}

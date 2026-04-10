import { useState, useEffect } from "react";
import { Check, Zap, CreditCard, Clock, CheckCircle2, XCircle, AlertCircle, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useSubscription } from "@/hooks/useSubscription";
import { PLAN_LIST } from "@/lib/subscription";

export default function SubscriptionPage() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [payerName, setPayerName] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("bank_transfer");
  const [submitting, setSubmitting] = useState(false);
  const [paymentRequests, setPaymentRequests] = useState<any[]>([]);
  const { toast } = useToast();
  const { subscription, isActive, remaining, daysLeft, reload: reloadSub } = useSubscription();

  useEffect(() => { loadPayments(); }, []);

  const loadPayments = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data: payments } = await supabase.from("payment_requests").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
    setPaymentRequests(payments || []);
  };

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlan) return;
    setSubmitting(true);

    const plan = PLAN_LIST.find(p => p.label === selectedPlan);
    if (!plan) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("payment_requests").insert({
      user_id: user.id,
      plan: plan.name,
      amount: plan.price,
      payer_name: payerName,
      transaction_id: transactionId,
      payment_method: paymentMethod,
    });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Payment submitted!", description: "Your payment is pending admin approval." });
      setSelectedPlan(null);
      setPayerName(""); setTransactionId("");
      loadPayments();
    }
    setSubmitting(false);
  };

  const handleSelectFreePlan = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("payment_requests").insert({
      user_id: user.id,
      plan: "test",
      amount: 0,
      payer_name: "Free Trial",
      transaction_id: "free-" + Date.now(),
      payment_method: "free",
    });

    if (!error) {
      toast({ title: "Free trial requested!", description: "Pending admin activation." });
      loadPayments();
    }
  };

  const statusIcon = (status: string) => {
    if (status === "approved") return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    if (status === "rejected") return <XCircle className="h-4 w-4 text-destructive" />;
    return <Clock className="h-4 w-4 text-yellow-500" />;
  };

  // Usage progress
  const usagePercent = subscription
    ? Math.min(100, Math.round((subscription.uploadsUsed / subscription.totalUploadsAllowed) * 100))
    : 0;

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold mb-1">Subscription</h1>
      <p className="text-muted-foreground text-sm mb-8">Choose a plan and manage your subscription.</p>

      {/* Current subscription status */}
      {isActive && subscription ? (
        <div className="rounded-xl border border-primary/20 bg-card p-5 mb-8" style={{ boxShadow: "var(--shadow-glow)" }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <CreditCard className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium capitalize">{subscription.plan} Plan — Active</p>
                <p className="text-xs text-muted-foreground">
                  {daysLeft} days remaining · Expires {subscription.expiresAt ? new Date(subscription.expiresAt).toLocaleDateString() : "N/A"}
                </p>
              </div>
            </div>
            {daysLeft <= 5 && (
              <span className="text-xs bg-yellow-500/10 text-yellow-500 px-2 py-1 rounded-full">Expiring Soon</span>
            )}
          </div>

          {/* Usage stats */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="rounded-lg bg-muted/50 p-3 text-center">
              <p className="text-lg font-bold font-heading">{subscription.uploadsUsed}</p>
              <p className="text-xs text-muted-foreground">Uploads Used</p>
            </div>
            <div className="rounded-lg bg-muted/50 p-3 text-center">
              <p className="text-lg font-bold font-heading text-primary">{remaining}</p>
              <p className="text-xs text-muted-foreground">Remaining</p>
            </div>
            <div className="rounded-lg bg-muted/50 p-3 text-center">
              <p className="text-lg font-bold font-heading">{subscription.maxAccounts}</p>
              <p className="text-xs text-muted-foreground">Max Accounts</p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="relative">
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${usagePercent}%` }}
              />
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-xs text-muted-foreground">{usagePercent}% used</span>
              <span className="text-xs text-muted-foreground">{subscription.totalUploadsAllowed} total</span>
            </div>
          </div>

          {remaining <= 5 && remaining > 0 && (
            <div className="mt-4 flex items-center gap-2 text-xs text-yellow-500">
              <AlertCircle className="h-3 w-3" />
              Low uploads remaining. Consider upgrading your plan.
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-lg border border-border bg-card/50 p-4 mb-8 flex items-center gap-3">
          <CreditCard className="h-5 w-5 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">No active subscription</p>
            <p className="text-xs text-muted-foreground">Select a plan below to get started</p>
          </div>
        </div>
      )}

      {/* Payment form */}
      {selectedPlan && selectedPlan !== "Test" && (
        <form onSubmit={handleSubmitPayment} className="rounded-xl border border-primary/30 bg-card p-6 mb-8" style={{ boxShadow: "var(--shadow-glow)" }}>
          <h3 className="font-heading text-lg font-semibold mb-4">
            Payment for {selectedPlan} Plan
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <Label>Your Name</Label>
              <Input value={payerName} onChange={e => setPayerName(e.target.value)} placeholder="Full name" required className="bg-muted border-border mt-1" />
            </div>
            <div>
              <Label>Transaction ID</Label>
              <Input value={transactionId} onChange={e => setTransactionId(e.target.value)} placeholder="e.g. TXN123456" required className="bg-muted border-border mt-1" />
            </div>
            <div>
              <Label>Payment Method</Label>
              <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} className="w-full h-10 rounded-md border border-border bg-muted px-3 text-sm mt-1">
                <option value="bank_transfer">Bank Transfer</option>
                <option value="easypaisa">EasyPaisa</option>
                <option value="jazzcash">JazzCash</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
          <div className="flex gap-3">
            <Button type="submit" disabled={submitting} className="bg-primary hover:bg-primary/90 text-primary-foreground">
              {submitting ? "Submitting..." : "Submit Payment"}
            </Button>
            <Button type="button" variant="outline" onClick={() => setSelectedPlan(null)} className="border-border">Cancel</Button>
          </div>
        </form>
      )}

      {/* Plans */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {PLAN_LIST.map((plan) => (
          <div
            key={plan.name}
            className={`relative rounded-xl border p-5 flex flex-col ${plan.highlighted ? "border-primary/60" : "border-border"} bg-card`}
            style={{ boxShadow: plan.highlighted ? "var(--shadow-glow)" : "var(--shadow-card)" }}
          >
            {plan.highlighted && (
              <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-0.5 text-xs font-medium text-primary-foreground">
                <Zap className="h-3 w-3" /> Popular
              </div>
            )}
            <h3 className="font-heading text-lg font-semibold">{plan.label}</h3>
            <div className="mt-2 mb-4">
              <span className="text-3xl font-bold font-heading">{plan.priceLabel}</span>
              {plan.priceLabel !== "Free" && <span className="text-muted-foreground text-sm ml-1">/ {plan.period}</span>}
            </div>
            <ul className="space-y-2 mb-6 flex-1">
              {plan.features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Check className="h-3.5 w-3.5 text-primary shrink-0" /> {f}
                </li>
              ))}
            </ul>
            <Button
              onClick={() => plan.name === "test" ? handleSelectFreePlan() : setSelectedPlan(plan.label)}
              className={plan.highlighted ? "bg-primary hover:bg-primary/90 text-primary-foreground" : "bg-muted hover:bg-muted/80 text-foreground"}
              disabled={isActive && subscription?.plan === plan.name}
            >
              {isActive && subscription?.plan === plan.name
                ? "Current Plan"
                : plan.name === "test" ? "Start Free Trial" : "Select Plan"}
            </Button>
          </div>
        ))}
      </div>

      {/* Payment history */}
      {paymentRequests.length > 0 && (
        <div>
          <h3 className="font-heading text-lg font-semibold mb-3">Payment History</h3>
          <div className="space-y-2">
            {paymentRequests.map((pr) => (
              <div key={pr.id} className="flex items-center justify-between rounded-lg border border-border bg-card/50 p-4">
                <div className="flex items-center gap-3">
                  {statusIcon(pr.status)}
                  <div>
                    <p className="text-sm font-medium capitalize">{pr.plan} Plan — ${pr.amount}</p>
                    <p className="text-xs text-muted-foreground">{new Date(pr.created_at).toLocaleDateString()}</p>
                    {pr.admin_note && <p className="text-xs text-muted-foreground mt-0.5">Note: {pr.admin_note}</p>}
                  </div>
                </div>
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                  pr.status === "approved" ? "bg-green-500/10 text-green-500"
                    : pr.status === "rejected" ? "bg-destructive/10 text-destructive"
                    : "bg-yellow-500/10 text-yellow-500"
                }`}>
                  {pr.status.charAt(0).toUpperCase() + pr.status.slice(1)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

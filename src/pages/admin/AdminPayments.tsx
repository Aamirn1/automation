import { useEffect, useState } from "react";
import { CheckCircle2, XCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function AdminPayments() {
  const [payments, setPayments] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => { loadPayments(); }, []);

  const loadPayments = async () => {
    const { data } = await supabase
      .from("payment_requests")
      .select("*, profiles!payment_requests_user_id_fkey(display_name, email)")
      .order("created_at", { ascending: false });
    setPayments(data || []);
  };

  const handleAction = async (payment: any, action: "approved" | "rejected") => {
    const { error } = await supabase
      .from("payment_requests")
      .update({ status: action })
      .eq("id", payment.id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }

    if (action === "approved") {
      const durationDays = payment.plan === "test" ? 5 : 30;
      const startsAt = new Date();
      const expiresAt = new Date(startsAt.getTime() + durationDays * 86400000);

      await supabase
        .from("subscriptions")
        .update({
          plan: payment.plan,
          status: "active",
          starts_at: startsAt.toISOString(),
          expires_at: expiresAt.toISOString(),
        })
        .eq("user_id", payment.user_id);
    }

    toast({ title: `Payment ${action}` });
    loadPayments();
  };

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold mb-6">Payment Approvals</h1>
      <div className="space-y-3">
        {payments.map(p => {
          const profile = p.profiles;
          return (
            <div key={p.id} className="rounded-xl border border-border bg-card p-4" style={{ boxShadow: "var(--shadow-card)" }}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-medium">{profile?.display_name || p.payer_name}</p>
                  <p className="text-xs text-muted-foreground">{profile?.email}</p>
                  <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                    <span>Plan: <span className="text-foreground capitalize">{p.plan}</span></span>
                    <span>Amount: <span className="text-foreground">${p.amount}</span></span>
                    <span>Method: <span className="text-foreground capitalize">{p.payment_method}</span></span>
                    <span>TXN: <span className="text-foreground">{p.transaction_id}</span></span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{new Date(p.created_at).toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-2">
                  {p.status === "pending" ? (
                    <>
                      <Button size="sm" onClick={() => handleAction(p, "approved")} className="bg-green-600 hover:bg-green-700 text-white">
                        <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Approve
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleAction(p, "rejected")} className="border-destructive text-destructive hover:bg-destructive/10">
                        <XCircle className="h-3.5 w-3.5 mr-1" /> Reject
                      </Button>
                    </>
                  ) : (
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                      p.status === "approved" ? "bg-green-500/10 text-green-500" : "bg-destructive/10 text-destructive"
                    }`}>
                      {p.status.charAt(0).toUpperCase() + p.status.slice(1)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        {payments.length === 0 && <p className="text-muted-foreground text-sm">No payment requests yet.</p>}
      </div>
    </div>
  );
}

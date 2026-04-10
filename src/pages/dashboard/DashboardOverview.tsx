import { useState, useEffect } from "react";
import { Link2, FileVideo, CalendarClock, CreditCard, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export default function DashboardOverview() {
  const [stats, setStats] = useState({ accounts: 0, content: 0, scheduled: 0, plan: "none" });

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const [{ count: accounts }, { count: content }, { count: scheduled }, { data: sub }] = await Promise.all([
        supabase.from("social_accounts").select("*", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("content_items").select("*", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("scheduled_posts").select("*", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("subscriptions").select("plan, status").eq("user_id", user.id).maybeSingle(),
      ]);
      setStats({
        accounts: accounts || 0,
        content: content || 0,
        scheduled: scheduled || 0,
        plan: sub?.status === "active" ? sub.plan : "none",
      });
    })();
  }, []);

  const steps = [
    { icon: Link2, title: "Connect Accounts", desc: `${stats.accounts} connected`, link: "/dashboard/accounts", done: stats.accounts > 0 },
    { icon: FileVideo, title: "Add Content", desc: `${stats.content} items`, link: "/dashboard/content", done: stats.content > 0 },
    { icon: CalendarClock, title: "Schedule Posts", desc: `${stats.scheduled} scheduled`, link: "/dashboard/schedule", done: stats.scheduled > 0 },
    { icon: CreditCard, title: "Choose Plan", desc: stats.plan !== "none" ? `${stats.plan} plan active` : "No active plan", link: "/dashboard/subscription", done: stats.plan !== "none" },
  ];

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold mb-1">Dashboard</h1>
      <p className="text-muted-foreground text-sm mb-8">Get started with your video automation setup.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {steps.map((step, i) => (
          <Link
            key={step.title}
            to={step.link}
            className="group rounded-xl border border-border bg-card p-5 hover:border-primary/40 transition-all"
            style={{ boxShadow: "var(--shadow-card)" }}
          >
            <div className="flex items-start justify-between">
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${step.done ? "bg-green-500/10 text-green-500" : "bg-primary/10 text-primary"} mb-3`}>
                <step.icon className="h-5 w-5" />
              </div>
              <span className="text-xs text-muted-foreground font-mono">Step {i + 1}</span>
            </div>
            <h3 className="font-heading font-semibold mb-1">{step.title}</h3>
            <p className="text-sm text-muted-foreground mb-3">{step.desc}</p>
            <span className="inline-flex items-center gap-1 text-sm text-primary group-hover:gap-2 transition-all">
              {step.done ? "Manage" : "Get started"} <ArrowRight className="h-3 w-3" />
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}

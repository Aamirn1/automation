import { useEffect, useState } from "react";
import { Users, CreditCard, FileVideo, CalendarClock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export default function AdminOverview() {
  const [stats, setStats] = useState({ users: 0, pendingPayments: 0, content: 0, schedules: 0 });

  useEffect(() => {
    (async () => {
      const [{ count: users }, { count: pending }, { count: content }, { count: schedules }] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("payment_requests").select("*", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("content_items").select("*", { count: "exact", head: true }),
        supabase.from("scheduled_posts").select("*", { count: "exact", head: true }),
      ]);
      setStats({ users: users || 0, pendingPayments: pending || 0, content: content || 0, schedules: schedules || 0 });
    })();
  }, []);

  const cards = [
    { icon: Users, label: "Total Users", value: stats.users, color: "text-primary" },
    { icon: CreditCard, label: "Pending Payments", value: stats.pendingPayments, color: "text-yellow-500" },
    { icon: FileVideo, label: "Content Items", value: stats.content, color: "text-secondary" },
    { icon: CalendarClock, label: "Scheduled Posts", value: stats.schedules, color: "text-green-500" },
  ];

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold mb-6">Admin Overview</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(c => (
          <div key={c.label} className="rounded-xl border border-border bg-card p-5" style={{ boxShadow: "var(--shadow-card)" }}>
            <c.icon className={`h-6 w-6 ${c.color} mb-3`} />
            <p className="text-2xl font-bold font-heading">{c.value}</p>
            <p className="text-sm text-muted-foreground">{c.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

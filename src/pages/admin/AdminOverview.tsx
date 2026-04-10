import { useEffect, useState } from "react";
import { Users, CreditCard, FileVideo, CalendarClock, TrendingUp, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

export default function AdminOverview() {
  const [stats, setStats] = useState({ users: 0, pendingPayments: 0, content: 0, schedules: 0, posted: 0, failed: 0, pendingDrives: 0 });
  const [uploadsByDay, setUploadsByDay] = useState<any[]>([]);
  const [platformBreakdown, setPlatformBreakdown] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const [
        { count: users },
        { count: pending },
        { count: content },
        { count: schedules },
        { count: posted },
        { count: failed },
        { count: pendingDrives },
        { data: recentPosts },
        { data: accountData },
      ] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("payment_requests").select("*", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("content_items").select("*", { count: "exact", head: true }),
        supabase.from("scheduled_posts").select("*", { count: "exact", head: true }).eq("status", "scheduled"),
        supabase.from("scheduled_posts").select("*", { count: "exact", head: true }).eq("status", "posted"),
        supabase.from("scheduled_posts").select("*", { count: "exact", head: true }).eq("status", "failed"),
        supabase.from("google_drive_links").select("*", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("scheduled_posts").select("completed_at").eq("status", "posted").order("completed_at", { ascending: false }).limit(200),
        supabase.from("social_accounts").select("platform"),
      ]);

      setStats({
        users: users || 0,
        pendingPayments: pending || 0,
        content: content || 0,
        schedules: schedules || 0,
        posted: posted || 0,
        failed: failed || 0,
        pendingDrives: pendingDrives || 0,
      });

      // Uploads by day (last 7 days)
      const dayCounts: Record<string, number> = {};
      const today = new Date();
      for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        dayCounts[d.toLocaleDateString("en-US", { weekday: "short" })] = 0;
      }
      (recentPosts || []).forEach((p: any) => {
        if (p.completed_at) {
          const d = new Date(p.completed_at);
          const key = d.toLocaleDateString("en-US", { weekday: "short" });
          if (key in dayCounts) dayCounts[key]++;
        }
      });
      setUploadsByDay(Object.entries(dayCounts).map(([day, count]) => ({ day, count })));

      // Platform breakdown
      const platCounts: Record<string, number> = {};
      (accountData || []).forEach((a: any) => {
        platCounts[a.platform] = (platCounts[a.platform] || 0) + 1;
      });
      setPlatformBreakdown(Object.entries(platCounts).map(([name, value]) => ({ name, value })));
    })();
  }, []);

  const cards = [
    { icon: Users, label: "Total Users", value: stats.users, color: "text-primary" },
    { icon: CreditCard, label: "Pending Payments", value: stats.pendingPayments, color: "text-yellow-500" },
    { icon: FileVideo, label: "Content Items", value: stats.content, color: "text-secondary" },
    { icon: CalendarClock, label: "Queued Posts", value: stats.schedules, color: "text-blue-400" },
    { icon: TrendingUp, label: "Uploaded", value: stats.posted, color: "text-green-500" },
    { icon: AlertCircle, label: "Failed", value: stats.failed, color: "text-destructive" },
  ];

  const pieColors = ["#8b5cf6", "#3b82f6", "#ec4899", "#f8fafc"];

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold mb-6">Admin Overview</h1>

      {/* Alert for pending items */}
      {(stats.pendingPayments > 0 || stats.pendingDrives > 0) && (
        <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/5 p-4 mb-6 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-yellow-500 shrink-0" />
          <div className="text-sm">
            {stats.pendingPayments > 0 && <span className="text-yellow-500 font-medium">{stats.pendingPayments} payment(s)</span>}
            {stats.pendingPayments > 0 && stats.pendingDrives > 0 && " and "}
            {stats.pendingDrives > 0 && <span className="text-yellow-500 font-medium">{stats.pendingDrives} Drive link(s)</span>}
            {" "}pending review.
          </div>
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {cards.map(c => (
          <div key={c.label} className="rounded-xl border border-border bg-card p-4" style={{ boxShadow: "var(--shadow-card)" }}>
            <c.icon className={`h-5 w-5 ${c.color} mb-2`} />
            <p className="text-2xl font-bold font-heading">{c.value}</p>
            <p className="text-xs text-muted-foreground">{c.label}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Uploads per day */}
        <div className="rounded-xl border border-border bg-card p-5" style={{ boxShadow: "var(--shadow-card)" }}>
          <h3 className="font-heading font-semibold mb-4">Uploads (Last 7 Days)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={uploadsByDay}>
              <XAxis dataKey="day" tick={{ fill: "hsl(220, 10%, 55%)", fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "hsl(220, 10%, 55%)", fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: "hsl(240, 12%, 9%)", border: "1px solid hsl(240, 10%, 18%)", borderRadius: 8, color: "#fff" }}
              />
              <Bar dataKey="count" fill="hsl(265, 90%, 60%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Platform breakdown */}
        <div className="rounded-xl border border-border bg-card p-5" style={{ boxShadow: "var(--shadow-card)" }}>
          <h3 className="font-heading font-semibold mb-4">Connected Accounts by Platform</h3>
          {platformBreakdown.length === 0 ? (
            <p className="text-sm text-muted-foreground">No accounts connected yet.</p>
          ) : (
            <div className="flex items-center gap-6">
              <ResponsiveContainer width={150} height={150}>
                <PieChart>
                  <Pie data={platformBreakdown} dataKey="value" cx="50%" cy="50%" outerRadius={60} strokeWidth={0}>
                    {platformBreakdown.map((_, i) => (
                      <Cell key={i} fill={pieColors[i % pieColors.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2">
                {platformBreakdown.map((p, i) => (
                  <div key={p.name} className="flex items-center gap-2 text-sm">
                    <div className="h-3 w-3 rounded-full" style={{ background: pieColors[i % pieColors.length] }} />
                    <span className="capitalize text-muted-foreground">{p.name}</span>
                    <span className="font-medium">{p.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import { Link2, FileVideo, CalendarClock, CreditCard, ArrowRight, Bell, Clock, CheckCircle2, Rocket, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useSubscription } from "@/hooks/useSubscription";
import { useNotifications } from "@/hooks/useNotifications";

export default function DashboardOverview() {
  const [stats, setStats] = useState({ accounts: 0, content: 0, scheduled: 0, posted: 0, failed: 0 });
  const [recentPosts, setRecentPosts] = useState<any[]>([]);
  const [nextPost, setNextPost] = useState<any>(null);
  const { subscription, isActive, remaining, daysLeft } = useSubscription();
  const { notifications, unreadCount, markAsRead } = useNotifications();

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const [
        { count: accounts },
        { count: content },
        { count: scheduled },
        { count: posted },
        { count: failed },
        { data: recent },
        { data: next },
      ] = await Promise.all([
        supabase.from("social_accounts").select("*", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("content_items").select("*", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("scheduled_posts").select("*", { count: "exact", head: true }).eq("user_id", user.id).eq("status", "scheduled"),
        supabase.from("scheduled_posts").select("*", { count: "exact", head: true }).eq("user_id", user.id).eq("status", "posted"),
        supabase.from("scheduled_posts").select("*", { count: "exact", head: true }).eq("user_id", user.id).eq("status", "failed"),
        supabase.from("scheduled_posts").select("*, social_accounts(platform, platform_username), content_items(title)")
          .eq("user_id", user.id).eq("status", "posted").order("completed_at", { ascending: false }).limit(5),
        supabase.from("scheduled_posts").select("*, social_accounts(platform), content_items(title)")
          .eq("user_id", user.id).eq("status", "scheduled").order("scheduled_at", { ascending: true }).limit(1).maybeSingle(),
      ]);
      setStats({
        accounts: accounts || 0,
        content: content || 0,
        scheduled: scheduled || 0,
        posted: posted || 0,
        failed: failed || 0,
      });
      setRecentPosts(recent || []);
      setNextPost(next);
    })();
  }, []);

  const steps = [
    { icon: Link2, title: "Connect Accounts", desc: `${stats.accounts} connected`, link: "/dashboard/accounts", done: stats.accounts > 0 },
    { icon: FileVideo, title: "Add Content", desc: `${stats.content} items`, link: "/dashboard/content", done: stats.content > 0 },
    { icon: CalendarClock, title: "Schedule Posts", desc: `${stats.scheduled} queued`, link: "/dashboard/schedule", done: stats.scheduled > 0 || stats.posted > 0 },
    { icon: CreditCard, title: "Choose Plan", desc: isActive ? `${subscription?.plan} plan active` : "No plan", link: "/dashboard/subscription", done: isActive },
  ];

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold mb-1">Dashboard</h1>
      <p className="text-muted-foreground text-sm mb-6">Your video automation command center.</p>

      {/* Subscription banner */}
      {isActive ? (
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Rocket className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm font-medium capitalize">{subscription?.plan} Plan Active</p>
              <p className="text-xs text-muted-foreground">
                {remaining} uploads remaining · {daysLeft} days left
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span>{stats.posted} posted</span>
            <span>{stats.scheduled} queued</span>
            {stats.failed > 0 && <span className="text-destructive">{stats.failed} failed</span>}
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/5 p-4 mb-6 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-yellow-500" />
          <div>
            <p className="text-sm font-medium text-yellow-500">No Active Subscription</p>
            <p className="text-xs text-muted-foreground">
              <Link to="/dashboard/subscription" className="text-primary hover:underline">Choose a plan</Link> to start automating your uploads.
            </p>
          </div>
        </div>
      )}

      {/* Next post */}
      {nextPost && (
        <div className="rounded-xl border border-border bg-card p-4 mb-6 flex items-center gap-3" style={{ boxShadow: "var(--shadow-card)" }}>
          <Clock className="h-5 w-5 text-yellow-500" />
          <div>
            <p className="text-sm font-medium">Next Upload</p>
            <p className="text-xs text-muted-foreground">
              "{nextPost.content_items?.title}" → {nextPost.social_accounts?.platform} · {new Date(nextPost.scheduled_at).toLocaleString()}
            </p>
          </div>
        </div>
      )}

      {/* Setup wizard steps */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
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

      {/* Notifications & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Notifications */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-heading text-lg font-semibold flex items-center gap-2">
              <Bell className="h-4 w-4" /> Notifications
              {unreadCount > 0 && (
                <span className="bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">{unreadCount}</span>
              )}
            </h3>
          </div>
          {notifications.length === 0 ? (
            <p className="text-sm text-muted-foreground">No notifications yet.</p>
          ) : (
            <div className="space-y-2">
              {notifications.slice(0, 5).map(n => (
                <div
                  key={n.id}
                  onClick={() => !n.is_read && markAsRead(n.id)}
                  className={`rounded-lg border p-3 cursor-pointer transition-colors ${
                    n.is_read ? "border-border bg-card/50" : "border-primary/30 bg-primary/5"
                  }`}
                >
                  <p className="text-sm font-medium">{n.title}</p>
                  <p className="text-xs text-muted-foreground line-clamp-2">{n.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">{new Date(n.created_at).toLocaleString()}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div>
          <h3 className="font-heading text-lg font-semibold mb-3">Recent Uploads</h3>
          {recentPosts.length === 0 ? (
            <p className="text-sm text-muted-foreground">No uploads yet. Set up automation to get started.</p>
          ) : (
            <div className="space-y-2">
              {recentPosts.map(post => (
                <div key={post.id} className="rounded-lg border border-border bg-card/50 p-3 flex items-center gap-3">
                  <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{post.ai_title || post.content_items?.title || "Untitled"}</p>
                    <p className="text-xs text-muted-foreground">
                      {post.social_accounts?.platform} · {post.completed_at ? new Date(post.completed_at).toLocaleString() : "—"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

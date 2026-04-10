import { useEffect, useState } from "react";
import { Pause, Play, RotateCcw, Trash2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function AdminSchedules() {
  const [posts, setPosts] = useState<any[]>([]);
  const [filter, setFilter] = useState("all");
  const { toast } = useToast();

  useEffect(() => { loadPosts(); }, []);

  const loadPosts = async () => {
    let query = supabase
      .from("scheduled_posts")
      .select("*, content_items(title), social_accounts(platform, platform_username)")
      .order("scheduled_at", { ascending: true });

    const { data } = await query;
    if (!data) { setPosts([]); return; }

    const userIds = [...new Set(data.map(p => p.user_id))];
    const { data: profiles } = await supabase.from("profiles").select("user_id, display_name, email").in("user_id", userIds);
    const profileMap = Object.fromEntries((profiles || []).map(p => [p.user_id, p]));
    setPosts(data.map(p => ({ ...p, profile: profileMap[p.user_id] || null })));
  };

  const handlePause = async (id: string) => {
    await supabase.from("scheduled_posts").update({ status: "paused" }).eq("id", id);
    toast({ title: "Post paused" });
    loadPosts();
  };

  const handleResume = async (id: string) => {
    await supabase.from("scheduled_posts").update({ status: "scheduled" }).eq("id", id);
    toast({ title: "Post resumed" });
    loadPosts();
  };

  const handleRetry = async (id: string) => {
    await supabase.from("scheduled_posts").update({ status: "scheduled", error_message: null, retry_count: 0 }).eq("id", id);
    toast({ title: "Post re-queued" });
    loadPosts();
  };

  const handleDelete = async (id: string) => {
    await supabase.from("scheduled_posts").delete().eq("id", id);
    toast({ title: "Post deleted" });
    loadPosts();
  };

  const handleCancelUserAutomation = async (userId: string) => {
    if (!confirm("Cancel ALL scheduled posts for this user?")) return;
    await supabase.from("scheduled_posts").update({ status: "cancelled" }).eq("user_id", userId).eq("status", "scheduled");

    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from("audit_logs").insert({
      actor_id: user?.id,
      action: "automation_cancelled",
      entity_type: "user",
      entity_id: userId,
    });

    toast({ title: "User's automation cancelled" });
    loadPosts();
  };

  const filtered = filter === "all" ? posts : posts.filter(p => p.status === filter);

  const statusColor = (status: string) => {
    switch (status) {
      case "posted": return "bg-green-500/10 text-green-500";
      case "failed": return "bg-destructive/10 text-destructive";
      case "uploading": return "bg-primary/10 text-primary";
      case "paused": return "bg-muted text-muted-foreground";
      case "cancelled": return "bg-muted text-muted-foreground";
      default: return "bg-yellow-500/10 text-yellow-500";
    }
  };

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold mb-2">Scheduling Dashboard</h1>
      <p className="text-sm text-muted-foreground mb-6">Manage all user scheduled posts. Failed: {posts.filter(p => p.status === "failed").length}</p>

      {/* Filter */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {["all", "scheduled", "posted", "failed", "uploading", "paused"].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`text-xs px-3 py-1.5 rounded-full capitalize transition-colors ${
              filter === f ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            {f} {f !== "all" && `(${posts.filter(p => p.status === f).length})`}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="text-muted-foreground text-sm">No posts matching filter.</p>
      ) : (
        <div className="space-y-2">
          {filtered.map(p => (
            <div key={p.id} className="rounded-xl border border-border bg-card p-4" style={{ boxShadow: "var(--shadow-card)" }}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-medium">{p.content_items?.title || "Untitled"}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${statusColor(p.status)}`}>
                      {p.status}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    User: {p.profile?.display_name || p.profile?.email || "—"} ·
                    Platform: {p.social_accounts?.platform || "—"} (@{p.social_accounts?.platform_username || "—"}) ·
                    Scheduled: {new Date(p.scheduled_at).toLocaleString()}
                  </p>
                  {p.error_message && (
                    <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" /> {p.error_message}
                    </p>
                  )}
                  {p.ai_title && (
                    <p className="text-xs text-primary mt-1">AI Title: {p.ai_title}</p>
                  )}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {p.status === "scheduled" && (
                    <Button variant="ghost" size="sm" onClick={() => handlePause(p.id)} className="text-yellow-500 hover:bg-yellow-500/10" title="Pause">
                      <Pause className="h-4 w-4" />
                    </Button>
                  )}
                  {p.status === "paused" && (
                    <Button variant="ghost" size="sm" onClick={() => handleResume(p.id)} className="text-green-500 hover:bg-green-500/10" title="Resume">
                      <Play className="h-4 w-4" />
                    </Button>
                  )}
                  {p.status === "failed" && (
                    <Button variant="ghost" size="sm" onClick={() => handleRetry(p.id)} className="text-primary hover:bg-primary/10" title="Retry">
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                  )}
                  {["scheduled", "paused", "failed"].includes(p.status) && (
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(p.id)} className="text-destructive hover:bg-destructive/10" title="Delete">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

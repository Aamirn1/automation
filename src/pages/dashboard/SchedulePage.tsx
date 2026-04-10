import { useState, useEffect } from "react";
import { CalendarClock, Clock, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function SchedulePage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [contentItems, setContentItems] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState("");
  const [selectedContent, setSelectedContent] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const [{ data: postsData }, { data: accts }, { data: content }] = await Promise.all([
      supabase.from("scheduled_posts").select("*, social_accounts(platform, platform_username), content_items(title)").eq("user_id", user.id).order("scheduled_at", { ascending: true }),
      supabase.from("social_accounts").select("*").eq("user_id", user.id),
      supabase.from("content_items").select("*").eq("user_id", user.id),
    ]);
    setPosts(postsData || []);
    setAccounts(accts || []);
    setContentItems(content || []);
  };

  const handleSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("scheduled_posts").insert({
      user_id: user.id,
      account_id: selectedAccount || null,
      content_id: selectedContent || null,
      scheduled_at: new Date(scheduledAt).toISOString(),
      status: "scheduled",
    });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Post scheduled!" });
      setShowForm(false);
      setSelectedAccount("");
      setSelectedContent("");
      setScheduledAt("");
      loadData();
    }
    setSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    await supabase.from("scheduled_posts").delete().eq("id", id);
    toast({ title: "Schedule removed" });
    loadData();
  };

  const canSchedule = accounts.length > 0 && contentItems.length > 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading text-2xl font-bold mb-1">Schedule</h1>
          <p className="text-muted-foreground text-sm">Configure your automated posting schedule.</p>
        </div>
        {canSchedule && (
          <Button onClick={() => setShowForm(!showForm)} className="bg-primary hover:bg-primary/90 text-primary-foreground">
            <Plus className="h-4 w-4 mr-2" /> Schedule Post
          </Button>
        )}
      </div>

      {!canSchedule && (
        <div className="rounded-xl border border-border bg-card p-6 mb-6" style={{ boxShadow: "var(--shadow-card)" }}>
          <div className="flex items-center gap-3 mb-4">
            <CalendarClock className="h-6 w-6 text-muted-foreground" />
            <div>
              <h3 className="font-heading font-semibold">Setup Required</h3>
              <p className="text-sm text-muted-foreground">
                {accounts.length === 0 && "Connect at least one social account. "}
                {contentItems.length === 0 && "Add at least one content item. "}
              </p>
            </div>
          </div>
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSchedule} className="rounded-xl border border-primary/30 bg-card p-6 mb-6" style={{ boxShadow: "var(--shadow-glow)" }}>
          <h3 className="font-heading text-lg font-semibold mb-4">Schedule a Post</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <div>
              <Label>Account</Label>
              <select value={selectedAccount} onChange={e => setSelectedAccount(e.target.value)} required className="w-full h-10 rounded-md border border-border bg-muted px-3 text-sm mt-1">
                <option value="">Select account</option>
                {accounts.map(a => (
                  <option key={a.id} value={a.id}>{a.platform} — @{a.platform_username}</option>
                ))}
              </select>
            </div>
            <div>
              <Label>Content</Label>
              <select value={selectedContent} onChange={e => setSelectedContent(e.target.value)} required className="w-full h-10 rounded-md border border-border bg-muted px-3 text-sm mt-1">
                <option value="">Select content</option>
                {contentItems.map(c => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
            </div>
            <div>
              <Label>Date & Time</Label>
              <Input type="datetime-local" value={scheduledAt} onChange={e => setScheduledAt(e.target.value)} required className="bg-muted border-border mt-1" />
            </div>
          </div>
          <div className="flex gap-3">
            <Button type="submit" disabled={submitting} className="bg-primary hover:bg-primary/90 text-primary-foreground">
              {submitting ? "Scheduling..." : "Schedule"}
            </Button>
            <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="border-border">Cancel</Button>
          </div>
        </form>
      )}

      {posts.length === 0 && canSchedule ? (
        <div className="rounded-xl border border-border bg-card p-10 text-center" style={{ boxShadow: "var(--shadow-card)" }}>
          <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-heading font-semibold mb-2">No scheduled posts</h3>
          <p className="text-sm text-muted-foreground">Click "Schedule Post" to create your first automated upload.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map(post => (
            <div key={post.id} className="flex items-center justify-between rounded-xl border border-border bg-card p-4" style={{ boxShadow: "var(--shadow-card)" }}>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                  <CalendarClock className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium text-sm">{post.content_items?.title || "Untitled"}</p>
                  <p className="text-xs text-muted-foreground">
                    {post.social_accounts?.platform ? `${post.social_accounts.platform} — @${post.social_accounts.platform_username}` : "—"} 
                    {" · "}{new Date(post.scheduled_at).toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs px-2 py-1 rounded-full capitalize ${
                  post.status === "scheduled" ? "bg-yellow-500/10 text-yellow-500"
                    : post.status === "posted" ? "bg-green-500/10 text-green-500"
                    : "bg-muted text-muted-foreground"
                }`}>{post.status}</span>
                <Button variant="ghost" size="sm" onClick={() => handleDelete(post.id)} className="text-destructive hover:bg-destructive/10">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

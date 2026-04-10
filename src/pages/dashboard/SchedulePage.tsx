import { useState, useEffect } from "react";
import { CalendarClock, Clock, Plus, Trash2, Rocket, AlertCircle, CheckCircle2, XCircle, Loader2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useSubscription } from "@/hooks/useSubscription";

export default function SchedulePage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [contentItems, setContentItems] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [driveLinks, setDriveLinks] = useState<any[]>([]);
  const [showWizard, setShowWizard] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const { toast } = useToast();
  const { subscription, isActive, remaining } = useSubscription();

  // Wizard state
  const [contentSource, setContentSource] = useState<"premade" | "drive">("premade");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedDriveLink, setSelectedDriveLink] = useState("");
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]);
  const [startDate, setStartDate] = useState("");
  const [uploadTimes, setUploadTimes] = useState(["09:00"]);
  const [uploadsPerDay, setUploadsPerDay] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const [{ data: postsData }, { data: accts }, { data: content }, { data: cats }, { data: drives }] = await Promise.all([
      supabase.from("scheduled_posts").select("*, social_accounts(platform, platform_username), content_items(title)").eq("user_id", user.id).order("scheduled_at", { ascending: true }),
      supabase.from("social_accounts").select("*").eq("user_id", user.id),
      supabase.from("content_items").select("*").eq("user_id", user.id).eq("status", "ready"),
      supabase.from("content_categories").select("*").order("name"),
      supabase.from("google_drive_links").select("*").eq("user_id", user.id).eq("status", "approved"),
    ]);
    setPosts(postsData || []);
    setAccounts(accts || []);
    setContentItems(content || []);
    setCategories(cats || []);
    setDriveLinks(drives || []);
  };

  const handleCreateSchedule = async () => {
    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const res = await supabase.functions.invoke("create-schedule", {
        body: {
          user_id: user.id,
          content_source: contentSource,
          category_id: contentSource === "premade" ? selectedCategory || null : null,
          drive_link_id: contentSource === "drive" ? selectedDriveLink || null : null,
          account_ids: selectedAccounts,
          start_date: startDate,
          upload_times: uploadTimes,
          uploads_per_day: uploadsPerDay,
        },
      });

      if (res.error) throw new Error(res.error.message);
      if (res.data?.error) throw new Error(res.data.error);

      toast({
        title: "Automation Scheduled! 🚀",
        description: `${res.data.total_posts} uploads scheduled across ${selectedAccounts.length} account(s).`,
      });
      setShowWizard(false);
      resetWizard();
      loadData();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
    setSubmitting(false);
  };

  const resetWizard = () => {
    setWizardStep(1);
    setContentSource("premade");
    setSelectedCategory("");
    setSelectedDriveLink("");
    setSelectedAccounts([]);
    setStartDate("");
    setUploadTimes(["09:00"]);
    setUploadsPerDay(1);
  };

  const handleDeletePost = async (id: string) => {
    await supabase.from("scheduled_posts").delete().eq("id", id);
    toast({ title: "Schedule removed" });
    loadData();
  };

  const handleRetry = async (id: string) => {
    await supabase.from("scheduled_posts").update({ status: "scheduled", error_message: null }).eq("id", id);
    toast({ title: "Post re-queued for upload" });
    loadData();
  };

  const toggleAccount = (id: string) => {
    setSelectedAccounts((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  };

  const addUploadTime = () => {
    if (uploadTimes.length < 2) setUploadTimes([...uploadTimes, "18:00"]);
  };

  const canStartWizard = accounts.length > 0 && isActive;

  const statusIcon = (status: string) => {
    switch (status) {
      case "posted": return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "failed": return <XCircle className="h-4 w-4 text-destructive" />;
      case "uploading": return <Loader2 className="h-4 w-4 text-primary animate-spin" />;
      default: return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const statusColor = (status: string) => {
    switch (status) {
      case "posted": return "bg-green-500/10 text-green-500";
      case "failed": return "bg-destructive/10 text-destructive";
      case "uploading": return "bg-primary/10 text-primary";
      default: return "bg-yellow-500/10 text-yellow-500";
    }
  };

  // Stats
  const scheduled = posts.filter(p => p.status === "scheduled").length;
  const posted = posts.filter(p => p.status === "posted").length;
  const failed = posts.filter(p => p.status === "failed").length;

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h1 className="font-heading text-2xl font-bold">Schedule & Automation</h1>
        {canStartWizard && (
          <Button onClick={() => { setShowWizard(!showWizard); resetWizard(); }} className="bg-primary hover:bg-primary/90 text-primary-foreground">
            <Rocket className="h-4 w-4 mr-2" /> Setup Automation
          </Button>
        )}
      </div>
      <p className="text-muted-foreground text-sm mb-6">Configure automated daily uploads across your connected accounts.</p>

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: "Scheduled", value: scheduled, color: "text-yellow-500" },
          { label: "Uploaded", value: posted, color: "text-green-500" },
          { label: "Failed", value: failed, color: "text-destructive" },
        ].map(s => (
          <div key={s.label} className="rounded-lg border border-border bg-card/50 p-3 text-center">
            <p className={`text-2xl font-bold font-heading ${s.color}`}>{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      {!canStartWizard && (
        <div className="rounded-xl border border-border bg-card p-6 mb-6" style={{ boxShadow: "var(--shadow-card)" }}>
          <div className="flex items-center gap-3">
            <AlertCircle className="h-6 w-6 text-yellow-500" />
            <div>
              <h3 className="font-heading font-semibold">Setup Required</h3>
              <p className="text-sm text-muted-foreground">
                {accounts.length === 0 && "Connect at least one social account. "}
                {!isActive && "Activate a subscription plan. "}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Automation Wizard */}
      {showWizard && (
        <div className="rounded-xl border border-primary/30 bg-card p-6 mb-6" style={{ boxShadow: "var(--shadow-glow)" }}>
          <h3 className="font-heading text-lg font-semibold mb-1">Automation Wizard</h3>
          <p className="text-xs text-muted-foreground mb-4">Step {wizardStep} of 4 · {remaining} uploads remaining in plan</p>

          {/* Progress */}
          <div className="flex gap-1 mb-6">
            {[1, 2, 3, 4].map(s => (
              <div key={s} className={`h-1 flex-1 rounded-full ${s <= wizardStep ? "bg-primary" : "bg-muted"}`} />
            ))}
          </div>

          {/* Step 1: Content Source */}
          {wizardStep === 1 && (
            <div className="space-y-4">
              <h4 className="font-medium">Select Content Source</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={() => setContentSource("premade")}
                  className={`rounded-lg border p-4 text-left transition-colors ${contentSource === "premade" ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"}`}
                >
                  <p className="font-medium text-sm">Pre-made Content</p>
                  <p className="text-xs text-muted-foreground mt-1">Select from admin-curated video library</p>
                </button>
                <button
                  onClick={() => setContentSource("drive")}
                  className={`rounded-lg border p-4 text-left transition-colors ${contentSource === "drive" ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"}`}
                >
                  <p className="font-medium text-sm">My Content (Drive)</p>
                  <p className="text-xs text-muted-foreground mt-1">Use your approved Google Drive videos</p>
                </button>
              </div>
              {contentSource === "premade" && categories.length > 0 && (
                <div>
                  <Label className="text-xs">Category (optional)</Label>
                  <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)} className="w-full h-10 rounded-md border border-border bg-muted px-3 text-sm mt-1">
                    <option value="">All categories</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              )}
              {contentSource === "drive" && (
                <div>
                  <Label className="text-xs">Select Drive Folder</Label>
                  {driveLinks.length === 0 ? (
                    <p className="text-xs text-muted-foreground mt-1">No approved Drive links. Submit one in the Content page.</p>
                  ) : (
                    <select value={selectedDriveLink} onChange={e => setSelectedDriveLink(e.target.value)} className="w-full h-10 rounded-md border border-border bg-muted px-3 text-sm mt-1">
                      <option value="">Select a folder</option>
                      {driveLinks.map(d => <option key={d.id} value={d.id}>{d.label || d.drive_folder_url.substring(0, 50)}</option>)}
                    </select>
                  )}
                </div>
              )}
              <Button onClick={() => setWizardStep(2)} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                Next →
              </Button>
            </div>
          )}

          {/* Step 2: Select Accounts */}
          {wizardStep === 2 && (
            <div className="space-y-4">
              <h4 className="font-medium">Select Target Accounts</h4>
              <p className="text-xs text-muted-foreground">Videos will be uploaded to all selected accounts.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {accounts.map(a => (
                  <button
                    key={a.id}
                    onClick={() => toggleAccount(a.id)}
                    className={`rounded-lg border p-3 flex items-center gap-3 transition-colors ${
                      selectedAccounts.includes(a.id) ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"
                    }`}
                  >
                    <div className={`h-3 w-3 rounded-full ${selectedAccounts.includes(a.id) ? "bg-primary" : "bg-muted"}`} />
                    <div className="text-left">
                      <p className="text-sm font-medium capitalize">{a.platform}</p>
                      <p className="text-xs text-muted-foreground">@{a.platform_username}</p>
                    </div>
                    {!a.access_token && <span className="text-xs text-yellow-500 ml-auto">No token</span>}
                  </button>
                ))}
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setWizardStep(1)} className="border-border">← Back</Button>
                <Button onClick={() => setWizardStep(3)} disabled={selectedAccounts.length === 0} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  Next →
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Schedule Settings */}
          {wizardStep === 3 && (
            <div className="space-y-4">
              <h4 className="font-medium">Set Schedule</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs">Start Date</Label>
                  <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} min={new Date().toISOString().split("T")[0]} required className="bg-muted border-border mt-1" />
                </div>
                <div>
                  <Label className="text-xs">Uploads Per Day</Label>
                  <select
                    value={uploadsPerDay}
                    onChange={e => {
                      const val = Number(e.target.value);
                      setUploadsPerDay(val);
                      if (val === 1) setUploadTimes(uploadTimes.slice(0, 1));
                    }}
                    className="w-full h-10 rounded-md border border-border bg-muted px-3 text-sm mt-1"
                  >
                    <option value={1}>1 video/day</option>
                    {(subscription?.maxUploadsPerDay || 1) >= 2 && <option value={2}>2 videos/day</option>}
                  </select>
                </div>
              </div>
              <div>
                <Label className="text-xs">Upload Time(s)</Label>
                {uploadTimes.map((time, i) => (
                  <div key={i} className="flex items-center gap-2 mt-1">
                    <Input type="time" value={time} onChange={e => {
                      const updated = [...uploadTimes];
                      updated[i] = e.target.value;
                      setUploadTimes(updated);
                    }} className="bg-muted border-border" />
                    {i > 0 && (
                      <Button variant="ghost" size="sm" onClick={() => setUploadTimes(uploadTimes.filter((_, idx) => idx !== i))} className="text-destructive">
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                ))}
                {uploadsPerDay > uploadTimes.length && (
                  <Button variant="outline" size="sm" onClick={addUploadTime} className="mt-2 border-border">
                    <Plus className="h-3 w-3 mr-1" /> Add Time Slot
                  </Button>
                )}
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setWizardStep(2)} className="border-border">← Back</Button>
                <Button onClick={() => setWizardStep(4)} disabled={!startDate} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  Review →
                </Button>
              </div>
            </div>
          )}

          {/* Step 4: Review & Confirm */}
          {wizardStep === 4 && (
            <div className="space-y-4">
              <h4 className="font-medium">Review Your Automation</h4>
              <div className="rounded-lg bg-muted/50 p-4 space-y-2 text-sm">
                <p><span className="text-muted-foreground">Content:</span> {contentSource === "premade" ? "Pre-made Library" : "Google Drive"}</p>
                <p><span className="text-muted-foreground">Accounts:</span> {selectedAccounts.length} selected</p>
                <p><span className="text-muted-foreground">Start:</span> {startDate}</p>
                <p><span className="text-muted-foreground">Schedule:</span> {uploadsPerDay} upload(s)/day at {uploadTimes.join(", ")}</p>
                <p><span className="text-muted-foreground">Uploads remaining:</span> {remaining}</p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setWizardStep(3)} className="border-border">← Back</Button>
                <Button onClick={handleCreateSchedule} disabled={submitting} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  {submitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Creating...</> : <><Rocket className="h-4 w-4 mr-2" /> Start Automation</>}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Post Queue */}
      {posts.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-heading text-lg font-semibold">Upload Queue</h3>
          {posts.map(post => (
            <div key={post.id} className="rounded-xl border border-border bg-card p-4" style={{ boxShadow: "var(--shadow-card)" }}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">{statusIcon(post.status)}</div>
                  <div>
                    <p className="font-medium text-sm">{post.ai_title || post.content_items?.title || "Untitled"}</p>
                    <p className="text-xs text-muted-foreground">
                      {post.social_accounts?.platform ? `${post.social_accounts.platform} — @${post.social_accounts.platform_username}` : "—"}
                      {" · "}{new Date(post.scheduled_at).toLocaleString()}
                    </p>
                    {post.error_message && (
                      <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" /> {post.error_message}
                      </p>
                    )}
                    {post.platform_post_id && (
                      <p className="text-xs text-green-500 mt-1">Post ID: {post.platform_post_id}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`text-xs px-2 py-1 rounded-full capitalize ${statusColor(post.status)}`}>
                    {post.status}
                  </span>
                  {post.status === "failed" && (
                    <Button variant="ghost" size="sm" onClick={() => handleRetry(post.id)} className="text-primary hover:bg-primary/10">
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                  )}
                  {(post.status === "scheduled" || post.status === "failed") && (
                    <Button variant="ghost" size="sm" onClick={() => handleDeletePost(post.id)} className="text-destructive hover:bg-destructive/10">
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

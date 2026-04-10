import { useState, useEffect } from "react";
import { FileVideo, Upload, Plus, Trash2, ExternalLink, FolderOpen, Library, Clock, CheckCircle2, AlertCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type Tab = "my-content" | "premade" | "drive";

export default function ContentPage() {
  const [activeTab, setActiveTab] = useState<Tab>("my-content");
  const [items, setItems] = useState<any[]>([]);
  const [libraryItems, setLibraryItems] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [driveLinks, setDriveLinks] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  // Drive form
  const [driveUrl, setDriveUrl] = useState("");
  const [driveLabel, setDriveLabel] = useState("");
  const [submittingDrive, setSubmittingDrive] = useState(false);
  const { toast } = useToast();

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const [{ data: myContent }, { data: library }, { data: cats }, { data: drives }] = await Promise.all([
      supabase.from("content_items").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
      supabase.from("content_library").select("*, content_categories(name)").eq("is_active", true).order("created_at", { ascending: false }),
      supabase.from("content_categories").select("*").order("name"),
      supabase.from("google_drive_links").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
    ]);
    setItems(myContent || []);
    setLibraryItems(library || []);
    setCategories(cats || []);
    setDriveLinks(drives || []);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("content_items").insert({
      user_id: user.id,
      title: title.trim(),
      description: description.trim() || null,
      file_url: fileUrl.trim() || null,
      video_url: fileUrl.trim() || null,
      source_type: "manual",
      status: "ready",
    });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Content added!" });
      setShowForm(false);
      setTitle(""); setDescription(""); setFileUrl("");
      loadAll();
    }
    setSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("content_items").delete().eq("id", id);
    if (!error) {
      toast({ title: "Content deleted" });
      loadAll();
    }
  };

  const handleSubmitDrive = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!driveUrl.includes("drive.google.com")) {
      toast({ title: "Please enter a valid Google Drive URL", variant: "destructive" });
      return;
    }
    setSubmittingDrive(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("google_drive_links").insert({
      user_id: user.id,
      drive_folder_url: driveUrl.trim(),
      label: driveLabel.trim() || null,
      status: "pending",
    });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Drive link submitted!", description: "Awaiting admin approval." });
      setDriveUrl(""); setDriveLabel("");
      loadAll();
    }
    setSubmittingDrive(false);
  };

  const handleSelectPremade = async (item: any) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("content_items").insert({
      user_id: user.id,
      title: item.title,
      description: item.description || null,
      video_url: item.video_url,
      source_type: "premade",
      source_ref: item.id,
      category_id: item.category_id,
      status: "ready",
    });

    if (!error) {
      toast({ title: "Pre-made content added to your library!" });
      loadAll();
    }
  };

  const generateSEO = async (itemId: string, itemTitle: string) => {
    toast({ title: "Generating AI SEO...", description: "This may take a moment." });
    try {
      const res = await supabase.functions.invoke("generate-seo", {
        body: { originalTitle: itemTitle, platform: "youtube" },
      });

      if (res.error) throw new Error(res.error.message);

      const { title: aiTitle, description: aiDesc } = res.data;
      await supabase.from("content_items").update({
        ai_title: aiTitle,
        ai_description: aiDesc,
      }).eq("id", itemId);

      toast({ title: "SEO generated!", description: `Title: ${aiTitle}` });
      loadAll();
    } catch (err: any) {
      toast({ title: "SEO generation failed", description: err.message, variant: "destructive" });
    }
  };

  const tabs = [
    { key: "my-content" as Tab, label: "My Content", icon: FileVideo },
    { key: "premade" as Tab, label: "Pre-made Library", icon: Library },
    { key: "drive" as Tab, label: "Google Drive", icon: FolderOpen },
  ];

  const statusConfig: Record<string, { color: string; icon: any }> = {
    ready: { color: "bg-green-500/10 text-green-500", icon: CheckCircle2 },
    draft: { color: "bg-muted text-muted-foreground", icon: FileVideo },
    pending: { color: "bg-yellow-500/10 text-yellow-500", icon: Clock },
    approved: { color: "bg-green-500/10 text-green-500", icon: CheckCircle2 },
    rejected: { color: "bg-destructive/10 text-destructive", icon: AlertCircle },
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading text-2xl font-bold mb-1">Content</h1>
          <p className="text-muted-foreground text-sm">Choose content source: your own videos, pre-made library, or Google Drive.</p>
        </div>
        {activeTab === "my-content" && (
          <Button onClick={() => setShowForm(!showForm)} className="bg-primary hover:bg-primary/90 text-primary-foreground">
            <Plus className="h-4 w-4 mr-2" /> Add Content
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-lg bg-muted p-1 mb-6">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm transition-colors flex-1 justify-center ${
              activeTab === tab.key ? "bg-card text-foreground font-medium shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* My Content Tab */}
      {activeTab === "my-content" && (
        <>
          {showForm && (
            <form onSubmit={handleAdd} className="rounded-xl border border-primary/30 bg-card p-6 mb-6" style={{ boxShadow: "var(--shadow-glow)" }}>
              <h3 className="font-heading text-lg font-semibold mb-4">Add New Content</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <Label>Title</Label>
                  <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Video title" required className="bg-muted border-border mt-1" />
                </div>
                <div>
                  <Label>Video URL</Label>
                  <Input value={fileUrl} onChange={e => setFileUrl(e.target.value)} placeholder="https://drive.google.com/..." className="bg-muted border-border mt-1" />
                </div>
              </div>
              <div className="mb-4">
                <Label>Description</Label>
                <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Video description..." className="bg-muted border-border mt-1" rows={3} />
              </div>
              <div className="flex gap-3">
                <Button type="submit" disabled={submitting} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  {submitting ? "Adding..." : "Add Content"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="border-border">Cancel</Button>
              </div>
            </form>
          )}

          {items.length === 0 ? (
            <div className="rounded-xl border border-border bg-card p-10 text-center" style={{ boxShadow: "var(--shadow-card)" }}>
              <FileVideo className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-heading font-semibold mb-2">No content yet</h3>
              <p className="text-sm text-muted-foreground mb-4">Add your own content, select from pre-made library, or submit a Google Drive link.</p>
              <Button onClick={() => setShowForm(true)} variant="outline" className="border-border">
                <Upload className="h-4 w-4 mr-2" /> Add Your First Content
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map(item => (
                <div key={item.id} className="rounded-xl border border-border bg-card p-4" style={{ boxShadow: "var(--shadow-card)" }}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0 mt-0.5">
                        <FileVideo className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{item.title}</p>
                        <p className="text-xs text-muted-foreground line-clamp-1">{item.description || "No description"}</p>
                        {item.ai_title && (
                          <div className="mt-2 rounded-md bg-primary/5 border border-primary/20 p-2">
                            <p className="text-xs font-medium text-primary flex items-center gap-1"><Sparkles className="h-3 w-3" /> AI SEO Title</p>
                            <p className="text-xs text-foreground mt-0.5">{item.ai_title}</p>
                          </div>
                        )}
                        <div className="flex items-center gap-3 mt-2">
                          {item.file_url && (
                            <a href={item.file_url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline inline-flex items-center gap-1">
                              <ExternalLink className="h-3 w-3" /> View File
                            </a>
                          )}
                          <span className="text-xs text-muted-foreground capitalize">Source: {item.source_type}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {!item.ai_title && (
                        <Button variant="outline" size="sm" onClick={() => generateSEO(item.id, item.title)} className="border-primary/30 text-primary hover:bg-primary/10">
                          <Sparkles className="h-3 w-3 mr-1" /> AI SEO
                        </Button>
                      )}
                      <span className={`text-xs px-2 py-1 rounded-full capitalize ${
                        (statusConfig[item.status] || statusConfig.draft).color
                      }`}>{item.status}</span>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(item.id)} className="text-destructive hover:bg-destructive/10">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Pre-made Library Tab */}
      {activeTab === "premade" && (
        <div>
          {categories.length > 0 && (
            <div className="flex gap-2 flex-wrap mb-4">
              {categories.map(cat => (
                <span key={cat.id} className="text-xs px-3 py-1 rounded-full bg-primary/10 text-primary">
                  {cat.name}
                </span>
              ))}
            </div>
          )}
          {libraryItems.length === 0 ? (
            <div className="rounded-xl border border-border bg-card p-10 text-center" style={{ boxShadow: "var(--shadow-card)" }}>
              <Library className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-heading font-semibold mb-2">No pre-made content available</h3>
              <p className="text-sm text-muted-foreground">The admin hasn't added any pre-made videos yet. Check back later!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {libraryItems.map(item => (
                <div key={item.id} className="rounded-xl border border-border bg-card p-4" style={{ boxShadow: "var(--shadow-card)" }}>
                  <h4 className="font-medium text-sm mb-1">{item.title}</h4>
                  <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{item.description || "No description"}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {item.content_categories?.name || "Uncategorized"} · Used {item.usage_count}x
                    </span>
                    <Button size="sm" onClick={() => handleSelectPremade(item)} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                      <Plus className="h-3 w-3 mr-1" /> Select
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Google Drive Tab */}
      {activeTab === "drive" && (
        <div>
          <form onSubmit={handleSubmitDrive} className="rounded-xl border border-border bg-card p-6 mb-6" style={{ boxShadow: "var(--shadow-card)" }}>
            <h3 className="font-heading text-lg font-semibold mb-4">Submit Google Drive Folder</h3>
            <p className="text-xs text-muted-foreground mb-4">
              Paste a Google Drive folder link containing your videos. The admin will review and approve it before your content is available for scheduling.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <Label>Google Drive Folder URL</Label>
                <Input value={driveUrl} onChange={e => setDriveUrl(e.target.value)} placeholder="https://drive.google.com/drive/folders/..." required className="bg-muted border-border mt-1" />
              </div>
              <div>
                <Label>Label (optional)</Label>
                <Input value={driveLabel} onChange={e => setDriveLabel(e.target.value)} placeholder="e.g. Cooking Videos" className="bg-muted border-border mt-1" />
              </div>
            </div>
            <Button type="submit" disabled={submittingDrive} className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <FolderOpen className="h-4 w-4 mr-2" />
              {submittingDrive ? "Submitting..." : "Submit for Approval"}
            </Button>
          </form>

          {driveLinks.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-heading text-lg font-semibold">Your Drive Links</h3>
              {driveLinks.map(link => {
                const sc = statusConfig[link.status] || statusConfig.pending;
                return (
                  <div key={link.id} className="rounded-xl border border-border bg-card p-4 flex items-center justify-between" style={{ boxShadow: "var(--shadow-card)" }}>
                    <div className="flex items-center gap-3">
                      <FolderOpen className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">{link.label || "Drive Folder"}</p>
                        <a href={link.drive_folder_url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline">
                          {link.drive_folder_url.substring(0, 60)}...
                        </a>
                        {link.admin_note && (
                          <p className="text-xs text-muted-foreground mt-1">Note: {link.admin_note}</p>
                        )}
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full capitalize ${sc.color}`}>
                      {link.status}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

import { useEffect, useState } from "react";
import { Plus, Trash2, FolderOpen, CheckCircle2, XCircle, Library, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type Tab = "library" | "categories" | "drive-approvals";

export default function AdminContent() {
  const [activeTab, setActiveTab] = useState<Tab>("library");
  const [content, setContent] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [driveLinks, setDriveLinks] = useState<any[]>([]);
  const { toast } = useToast();

  // Library form
  const [showLibForm, setShowLibForm] = useState(false);
  const [libTitle, setLibTitle] = useState("");
  const [libDesc, setLibDesc] = useState("");
  const [libUrl, setLibUrl] = useState("");
  const [libCategory, setLibCategory] = useState("");
  const [libSubmitting, setLibSubmitting] = useState(false);

  // Category form
  const [showCatForm, setShowCatForm] = useState(false);
  const [catName, setCatName] = useState("");
  const [catDesc, setCatDesc] = useState("");

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    const [{ data: lib }, { data: cats }, { data: drives }] = await Promise.all([
      supabase.from("content_library").select("*, content_categories(name)").order("created_at", { ascending: false }),
      supabase.from("content_categories").select("*").order("name"),
      supabase.from("google_drive_links").select("*").order("created_at", { ascending: false }),
    ]);

    // Fetch profiles for drive links
    if (drives && drives.length > 0) {
      const userIds = [...new Set(drives.map((d: any) => d.user_id))];
      const { data: profiles } = await supabase.from("profiles").select("user_id, display_name, email").in("user_id", userIds);
      const profileMap = Object.fromEntries((profiles || []).map((p: any) => [p.user_id, p]));
      setDriveLinks(drives.map((d: any) => ({ ...d, profile: profileMap[d.user_id] || null })));
    } else {
      setDriveLinks([]);
    }

    setContent(lib || []);
    setCategories(cats || []);
  };

  const handleAddLibrary = async (e: React.FormEvent) => {
    e.preventDefault();
    setLibSubmitting(true);
    const { error } = await supabase.from("content_library").insert({
      title: libTitle.trim(),
      description: libDesc.trim() || null,
      video_url: libUrl.trim(),
      category_id: libCategory || null,
    });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Video added to library!" });
      setShowLibForm(false);
      setLibTitle(""); setLibDesc(""); setLibUrl(""); setLibCategory("");
      loadAll();
    }
    setLibSubmitting(false);
  };

  const handleDeleteLibrary = async (id: string) => {
    await supabase.from("content_library").delete().eq("id", id);
    toast({ title: "Video removed from library" });
    loadAll();
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from("content_categories").insert({
      name: catName.trim(),
      description: catDesc.trim() || null,
    });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Category added!" });
      setShowCatForm(false);
      setCatName(""); setCatDesc("");
      loadAll();
    }
  };

  const handleDeleteCategory = async (id: string) => {
    await supabase.from("content_categories").delete().eq("id", id);
    toast({ title: "Category deleted" });
    loadAll();
  };

  const handleDriveAction = async (linkId: string, userId: string, action: "approved" | "rejected", note: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from("google_drive_links").update({
      status: action,
      admin_note: note || null,
      approved_by: user?.id || null,
      approved_at: action === "approved" ? new Date().toISOString() : null,
    }).eq("id", linkId);

    // Audit log
    await supabase.from("audit_logs").insert({
      actor_id: user?.id,
      action: `drive_link_${action}`,
      entity_type: "google_drive_link",
      entity_id: linkId,
      details: { user_id: userId, note },
    });

    // Notify user
    await supabase.rpc("create_notification", {
      _user_id: userId,
      _type: `drive_${action}`,
      _title: action === "approved" ? "Drive Link Approved ✅" : "Drive Link Not Approved",
      _message: action === "approved"
        ? "Your Google Drive folder has been approved. You can now use it for scheduling."
        : `Your Drive link was not approved. ${note || "Please contact support."}`,
      _metadata: { link_id: linkId },
    });

    toast({ title: `Drive link ${action}` });
    loadAll();
  };

  const tabs = [
    { key: "library" as Tab, label: "Video Library", icon: Library },
    { key: "categories" as Tab, label: "Categories", icon: Tag },
    { key: "drive-approvals" as Tab, label: `Drive Approvals (${driveLinks.filter(d => d.status === "pending").length})`, icon: FolderOpen },
  ];

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold mb-6">Content Management</h1>

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

      {/* Video Library Tab */}
      {activeTab === "library" && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-muted-foreground">Pre-made videos available for users to select.</p>
            <Button onClick={() => setShowLibForm(!showLibForm)} className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <Plus className="h-4 w-4 mr-2" /> Add Video
            </Button>
          </div>

          {showLibForm && (
            <form onSubmit={handleAddLibrary} className="rounded-xl border border-primary/30 bg-card p-6 mb-6" style={{ boxShadow: "var(--shadow-glow)" }}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <Label>Title</Label>
                  <Input value={libTitle} onChange={e => setLibTitle(e.target.value)} placeholder="Video title" required className="bg-muted border-border mt-1" />
                </div>
                <div>
                  <Label>Video URL</Label>
                  <Input value={libUrl} onChange={e => setLibUrl(e.target.value)} placeholder="https://..." required className="bg-muted border-border mt-1" />
                </div>
                <div>
                  <Label>Category</Label>
                  <select value={libCategory} onChange={e => setLibCategory(e.target.value)} className="w-full h-10 rounded-md border border-border bg-muted px-3 text-sm mt-1">
                    <option value="">No category</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="mb-4">
                <Label>Description</Label>
                <Textarea value={libDesc} onChange={e => setLibDesc(e.target.value)} placeholder="Video description..." className="bg-muted border-border mt-1" rows={2} />
              </div>
              <div className="flex gap-3">
                <Button type="submit" disabled={libSubmitting} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  {libSubmitting ? "Adding..." : "Add to Library"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowLibForm(false)} className="border-border">Cancel</Button>
              </div>
            </form>
          )}

          {content.length === 0 ? (
            <p className="text-muted-foreground text-sm">No library videos. Add your first pre-made video above.</p>
          ) : (
            <div className="space-y-3">
              {content.map(c => (
                <div key={c.id} className="rounded-xl border border-border bg-card p-4 flex items-center justify-between" style={{ boxShadow: "var(--shadow-card)" }}>
                  <div>
                    <p className="font-medium text-sm">{c.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {c.content_categories?.name || "Uncategorized"} · Used {c.usage_count}x · {c.is_active ? "Active" : "Inactive"}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => handleDeleteLibrary(c.id)} className="text-destructive hover:bg-destructive/10">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Categories Tab */}
      {activeTab === "categories" && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-muted-foreground">Organize content by niche/category.</p>
            <Button onClick={() => setShowCatForm(!showCatForm)} className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <Plus className="h-4 w-4 mr-2" /> Add Category
            </Button>
          </div>

          {showCatForm && (
            <form onSubmit={handleAddCategory} className="rounded-xl border border-primary/30 bg-card p-6 mb-6" style={{ boxShadow: "var(--shadow-glow)" }}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <Label>Name</Label>
                  <Input value={catName} onChange={e => setCatName(e.target.value)} placeholder="e.g. Cooking, Gaming" required className="bg-muted border-border mt-1" />
                </div>
                <div>
                  <Label>Description</Label>
                  <Input value={catDesc} onChange={e => setCatDesc(e.target.value)} placeholder="Optional description" className="bg-muted border-border mt-1" />
                </div>
              </div>
              <div className="flex gap-3">
                <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground">Add Category</Button>
                <Button type="button" variant="outline" onClick={() => setShowCatForm(false)} className="border-border">Cancel</Button>
              </div>
            </form>
          )}

          {categories.length === 0 ? (
            <p className="text-muted-foreground text-sm">No categories yet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {categories.map(c => (
                <div key={c.id} className="rounded-xl border border-border bg-card p-4 flex items-center justify-between" style={{ boxShadow: "var(--shadow-card)" }}>
                  <div>
                    <p className="font-medium text-sm">{c.name}</p>
                    {c.description && <p className="text-xs text-muted-foreground">{c.description}</p>}
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => handleDeleteCategory(c.id)} className="text-destructive hover:bg-destructive/10">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Drive Approvals Tab */}
      {activeTab === "drive-approvals" && (
        <div>
          <p className="text-sm text-muted-foreground mb-4">Review and approve user-submitted Google Drive folder links.</p>
          {driveLinks.length === 0 ? (
            <p className="text-muted-foreground text-sm">No Drive link submissions.</p>
          ) : (
            <div className="space-y-3">
              {driveLinks.map(link => (
                <div key={link.id} className="rounded-xl border border-border bg-card p-4" style={{ boxShadow: "var(--shadow-card)" }}>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-medium text-sm">{link.profile?.display_name || link.profile?.email || "Unknown User"}</p>
                      <a href={link.drive_folder_url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline">
                        {link.drive_folder_url}
                      </a>
                      {link.label && <p className="text-xs text-muted-foreground mt-1">Label: {link.label}</p>}
                      <p className="text-xs text-muted-foreground">{new Date(link.created_at).toLocaleString()}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {link.status === "pending" ? (
                        <>
                          <Button size="sm" onClick={() => handleDriveAction(link.id, link.user_id, "approved", "")} className="bg-green-600 hover:bg-green-700 text-white">
                            <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Approve
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => {
                            const note = prompt("Reason for rejection (optional):") || "";
                            handleDriveAction(link.id, link.user_id, "rejected", note);
                          }} className="border-destructive text-destructive hover:bg-destructive/10">
                            <XCircle className="h-3.5 w-3.5 mr-1" /> Reject
                          </Button>
                        </>
                      ) : (
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                          link.status === "approved" ? "bg-green-500/10 text-green-500" : "bg-destructive/10 text-destructive"
                        }`}>
                          {link.status}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

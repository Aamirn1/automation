import { useState, useEffect } from "react";
import { FileVideo, Upload, Plus, Trash2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function ContentPage() {
  const [items, setItems] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => { loadContent(); }, []);

  const loadContent = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from("content_items").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
    setItems(data || []);
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
      status: "ready",
    });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Content added!" });
      setShowForm(false);
      setTitle("");
      setDescription("");
      setFileUrl("");
      loadContent();
    }
    setSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("content_items").delete().eq("id", id);
    if (!error) {
      toast({ title: "Content deleted" });
      loadContent();
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading text-2xl font-bold mb-1">Content</h1>
          <p className="text-muted-foreground text-sm">Manage your videos and content items.</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="bg-primary hover:bg-primary/90 text-primary-foreground">
          <Plus className="h-4 w-4 mr-2" /> Add Content
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="rounded-xl border border-primary/30 bg-card p-6 mb-6" style={{ boxShadow: "var(--shadow-glow)" }}>
          <h3 className="font-heading text-lg font-semibold mb-4">Add New Content</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <Label>Title</Label>
              <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Video title" required className="bg-muted border-border mt-1" />
            </div>
            <div>
              <Label>File / Drive URL</Label>
              <Input value={fileUrl} onChange={e => setFileUrl(e.target.value)} placeholder="https://drive.google.com/..." className="bg-muted border-border mt-1" />
            </div>
          </div>
          <div className="mb-4">
            <Label>Description</Label>
            <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Video description for SEO..." className="bg-muted border-border mt-1" rows={3} />
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
          <p className="text-sm text-muted-foreground mb-4">Add your first video or Google Drive link to get started.</p>
          <Button onClick={() => setShowForm(true)} variant="outline" className="border-border">
            <Upload className="h-4 w-4 mr-2" /> Add Your First Content
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map(item => (
            <div key={item.id} className="flex items-center justify-between rounded-xl border border-border bg-card p-4" style={{ boxShadow: "var(--shadow-card)" }}>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                  <FileVideo className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium text-sm">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{item.description || "No description"}</p>
                  {item.file_url && (
                    <a href={item.file_url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline inline-flex items-center gap-1 mt-1">
                      <ExternalLink className="h-3 w-3" /> View File
                    </a>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs px-2 py-1 rounded-full capitalize ${
                  item.status === "ready" ? "bg-green-500/10 text-green-500" : "bg-muted text-muted-foreground"
                }`}>{item.status}</span>
                <Button variant="ghost" size="sm" onClick={() => handleDelete(item.id)} className="text-destructive hover:bg-destructive/10">
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

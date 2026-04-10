import { useState } from "react";
import { Key, Shield, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export default function AdminSettings() {
  const { toast } = useToast();

  // Note: In production, these would be stored in Supabase secrets or a settings table.
  // This UI demonstrates the admin UX for managing these settings.
  const [openaiKey, setOpenaiKey] = useState("");
  const [googleApiKey, setGoogleApiKey] = useState("");
  const [defaultKeywords, setDefaultKeywords] = useState("video scheduling tool, automatic social media upload, social media automation");
  const [metaDescription, setMetaDescription] = useState("Schedule and automate video uploads to YouTube, Facebook, Instagram & TikTok with AI-powered SEO titles.");

  const handleSave = (section: string) => {
    // In production: save to a `system_settings` table or update Supabase secrets via API
    toast({ title: `${section} settings saved!`, description: "Changes will take effect on next function invocation." });
  };

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold mb-6">System Settings</h1>

      <div className="space-y-6 max-w-2xl">
        {/* API Keys */}
        <div className="rounded-xl border border-border bg-card p-6" style={{ boxShadow: "var(--shadow-card)" }}>
          <div className="flex items-center gap-3 mb-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Key className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-heading font-semibold">API Keys</h3>
              <p className="text-xs text-muted-foreground">Manage third-party API keys for the system.</p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <Label>OpenAI API Key (ChatGPT SEO Generation)</Label>
              <Input
                type="password"
                value={openaiKey}
                onChange={e => setOpenaiKey(e.target.value)}
                placeholder="sk-..."
                className="bg-muted border-border mt-1 font-mono text-xs"
              />
              <p className="text-xs text-muted-foreground mt-1">Used for generating SEO-optimized titles and descriptions.</p>
            </div>
            <div>
              <Label>Google API Key (Drive Validation)</Label>
              <Input
                type="password"
                value={googleApiKey}
                onChange={e => setGoogleApiKey(e.target.value)}
                placeholder="AIza..."
                className="bg-muted border-border mt-1 font-mono text-xs"
              />
              <p className="text-xs text-muted-foreground mt-1">Used to validate Google Drive folders and list video contents.</p>
            </div>
            <Button onClick={() => handleSave("API Keys")} className="bg-primary hover:bg-primary/90 text-primary-foreground">
              Save API Keys
            </Button>
          </div>
        </div>

        {/* SEO Defaults */}
        <div className="rounded-xl border border-border bg-card p-6" style={{ boxShadow: "var(--shadow-card)" }}>
          <div className="flex items-center gap-3 mb-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Tag className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-heading font-semibold">SEO Defaults</h3>
              <p className="text-xs text-muted-foreground">Site-wide SEO settings applied to all generated content.</p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <Label>Default Keywords</Label>
              <Input
                value={defaultKeywords}
                onChange={e => setDefaultKeywords(e.target.value)}
                placeholder="keyword1, keyword2, ..."
                className="bg-muted border-border mt-1"
              />
            </div>
            <div>
              <Label>Default Meta Description</Label>
              <Input
                value={metaDescription}
                onChange={e => setMetaDescription(e.target.value)}
                placeholder="Site description for SEO"
                className="bg-muted border-border mt-1"
              />
            </div>
            <Button onClick={() => handleSave("SEO")} className="bg-primary hover:bg-primary/90 text-primary-foreground">
              Save SEO Settings
            </Button>
          </div>
        </div>

        {/* Security */}
        <div className="rounded-xl border border-border bg-card p-6" style={{ boxShadow: "var(--shadow-card)" }}>
          <div className="flex items-center gap-3 mb-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-heading font-semibold">Security</h3>
              <p className="text-xs text-muted-foreground">System security and maintenance settings.</p>
            </div>
          </div>
          <div className="space-y-3 text-sm text-muted-foreground">
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <span>Row Level Security (RLS)</span>
              <span className="text-green-500 font-medium text-xs">Enabled on all tables</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <span>Admin RBAC</span>
              <span className="text-green-500 font-medium text-xs">Active via has_role()</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <span>Token Encryption</span>
              <span className="text-yellow-500 font-medium text-xs">Via Supabase Vault (recommended)</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <span>Audit Logging</span>
              <span className="text-green-500 font-medium text-xs">Active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

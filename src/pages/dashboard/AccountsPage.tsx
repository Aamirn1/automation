import { useState, useEffect } from "react";
import { Link2, Video, Globe, Camera, Music2, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const platformConfig = [
  { name: "youtube", icon: Video, label: "YouTube", color: "text-red-500" },
  { name: "facebook", icon: Globe, label: "Facebook", color: "text-blue-500" },
  { name: "instagram", icon: Camera, label: "Instagram", color: "text-pink-500" },
  { name: "tiktok", icon: Music2, label: "TikTok", color: "text-foreground" },
];

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [adding, setAdding] = useState<string | null>(null);
  const [username, setUsername] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => { loadAccounts(); }, []);

  const loadAccounts = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from("social_accounts").select("*").eq("user_id", user.id);
    setAccounts(data || []);
  };

  const handleConnect = async (platform: string) => {
    if (!username.trim()) return;
    setSubmitting(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("social_accounts").insert({
      user_id: user.id,
      platform,
      platform_username: username.trim(),
      status: "connected",
    });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: `${platform} account connected!` });
      setAdding(null);
      setUsername("");
      loadAccounts();
    }
    setSubmitting(false);
  };

  const handleDisconnect = async (id: string) => {
    const { error } = await supabase.from("social_accounts").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Account disconnected" });
      loadAccounts();
    }
  };

  const getConnectedAccount = (platform: string) => accounts.find(a => a.platform === platform);

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold mb-1">Connected Accounts</h1>
      <p className="text-muted-foreground text-sm mb-8">Link your social media accounts to enable automated uploads.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {platformConfig.map((p) => {
          const connected = getConnectedAccount(p.name);
          return (
            <div key={p.name} className="rounded-xl border border-border bg-card p-5" style={{ boxShadow: "var(--shadow-card)" }}>
              <div className="flex items-center gap-3 mb-4">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-muted ${p.color}`}>
                  <p.icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-heading font-semibold">{p.label}</h3>
                  <span className="text-xs text-muted-foreground">
                    {connected ? `@${connected.platform_username}` : "Not connected"}
                  </span>
                </div>
              </div>

              {connected ? (
                <Button variant="outline" onClick={() => handleDisconnect(connected.id)} className="w-full border-destructive/30 text-destructive hover:bg-destructive/10">
                  <Trash2 className="h-4 w-4 mr-2" /> Disconnect
                </Button>
              ) : adding === p.name ? (
                <div className="space-y-3">
                  <div>
                    <Label className="text-xs">Username / Channel</Label>
                    <Input value={username} onChange={e => setUsername(e.target.value)} placeholder={`Your ${p.label} username`} className="bg-muted border-border mt-1" />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => handleConnect(p.name)} disabled={submitting} size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                      {submitting ? "..." : "Connect"}
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => { setAdding(null); setUsername(""); }} className="border-border">Cancel</Button>
                  </div>
                </div>
              ) : (
                <Button variant="outline" className="w-full border-border text-foreground hover:bg-muted" onClick={() => setAdding(p.name)}>
                  <Plus className="h-4 w-4 mr-2" /> Connect {p.label}
                </Button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

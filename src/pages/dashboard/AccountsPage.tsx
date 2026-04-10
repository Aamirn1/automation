import { useState, useEffect } from "react";
import { Link2, Video, Globe, Camera, Music2, Trash2, Plus, Key, AlertCircle, CheckCircle2, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useSubscription } from "@/hooks/useSubscription";

const platformConfig = [
  { name: "youtube", icon: Video, label: "YouTube", color: "text-red-500", tokenLabel: "OAuth Access Token", idLabel: "Channel ID" },
  { name: "facebook", icon: Globe, label: "Facebook", color: "text-blue-500", tokenLabel: "Page Access Token", idLabel: "Page ID" },
  { name: "instagram", icon: Camera, label: "Instagram", color: "text-pink-500", tokenLabel: "Graph API Token", idLabel: "IG Business Account ID" },
  { name: "tiktok", icon: Music2, label: "TikTok", color: "text-foreground", tokenLabel: "Access Token", idLabel: "Open ID" },
];

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [adding, setAdding] = useState<string | null>(null);
  const [username, setUsername] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [platformAccountId, setPlatformAccountId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showTokens, setShowTokens] = useState<Record<string, boolean>>({});
  const { toast } = useToast();
  const { subscription, isActive, canAddAccount, accountCount, reload: reloadSub } = useSubscription();

  useEffect(() => { loadAccounts(); }, []);

  const loadAccounts = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from("social_accounts").select("*").eq("user_id", user.id);
    setAccounts(data || []);
  };

  const handleConnect = async (platform: string) => {
    if (!username.trim()) return;
    if (!canAddAccount) {
      toast({
        title: "Account limit reached",
        description: `Your ${subscription?.plan || "current"} plan allows up to ${subscription?.maxAccounts || 1} connected accounts. Upgrade to connect more.`,
        variant: "destructive",
      });
      return;
    }
    setSubmitting(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("social_accounts").insert({
      user_id: user.id,
      platform,
      platform_username: username.trim(),
      access_token: accessToken.trim() || null,
      platform_account_id: platformAccountId.trim() || null,
      status: accessToken.trim() ? "connected" : "pending_token",
    });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: `${platform} account connected!` });
      setAdding(null);
      setUsername("");
      setAccessToken("");
      setPlatformAccountId("");
      loadAccounts();
      reloadSub();
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
      reloadSub();
    }
  };

  const handleUpdateToken = async (id: string, token: string, accountId: string) => {
    const { error } = await supabase.from("social_accounts").update({
      access_token: token || null,
      platform_account_id: accountId || null,
      status: token ? "connected" : "pending_token",
    }).eq("id", id);

    if (!error) {
      toast({ title: "Token updated!" });
      loadAccounts();
    }
  };

  const getConnectedAccount = (platform: string) => accounts.find(a => a.platform === platform);

  const getTokenStatus = (account: any) => {
    if (!account.access_token) return { label: "No token", color: "text-yellow-500", icon: AlertCircle };
    if (account.token_expires_at && new Date(account.token_expires_at) < new Date()) {
      return { label: "Token expired", color: "text-destructive", icon: AlertCircle };
    }
    return { label: "Token valid", color: "text-green-500", icon: CheckCircle2 };
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h1 className="font-heading text-2xl font-bold">Connected Accounts</h1>
        <div className="text-sm text-muted-foreground flex items-center gap-2">
          <Shield className="h-4 w-4" />
          {accountCount} / {subscription?.maxAccounts || 1} accounts used
        </div>
      </div>
      <p className="text-muted-foreground text-sm mb-8">
        Link your social media accounts with API tokens to enable automated uploads.
      </p>

      {!isActive && (
        <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/5 p-4 mb-6 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-yellow-500 shrink-0" />
          <div>
            <p className="text-sm font-medium text-yellow-500">No active subscription</p>
            <p className="text-xs text-muted-foreground">Choose a plan to connect accounts and start uploading.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {platformConfig.map((p) => {
          const connected = getConnectedAccount(p.name);
          const config = p;
          return (
            <div key={p.name} className="rounded-xl border border-border bg-card p-5" style={{ boxShadow: "var(--shadow-card)" }}>
              <div className="flex items-center gap-3 mb-4">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-muted ${p.color}`}>
                  <p.icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <h3 className="font-heading font-semibold">{p.label}</h3>
                  <span className="text-xs text-muted-foreground">
                    {connected ? `@${connected.platform_username}` : "Not connected"}
                  </span>
                </div>
                {connected && (
                  <div className="flex items-center gap-1">
                    {(() => {
                      const status = getTokenStatus(connected);
                      return (
                        <span className={`text-xs flex items-center gap-1 ${status.color}`}>
                          <status.icon className="h-3 w-3" />
                          {status.label}
                        </span>
                      );
                    })()}
                  </div>
                )}
              </div>

              {connected ? (
                <div className="space-y-3">
                  {/* Token management */}
                  <div className="rounded-lg bg-muted/50 p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-medium">{config.tokenLabel}</Label>
                      <button
                        onClick={() => setShowTokens(prev => ({ ...prev, [connected.id]: !prev[connected.id] }))}
                        className="text-xs text-primary hover:underline"
                      >
                        {showTokens[connected.id] ? "Hide" : "Show/Edit"}
                      </button>
                    </div>
                    {showTokens[connected.id] && (
                      <div className="space-y-2">
                        <Input
                          defaultValue={connected.access_token || ""}
                          placeholder={`Enter ${config.tokenLabel}`}
                          className="bg-background border-border text-xs font-mono"
                          id={`token-${connected.id}`}
                        />
                        <Input
                          defaultValue={connected.platform_account_id || ""}
                          placeholder={config.idLabel}
                          className="bg-background border-border text-xs font-mono"
                          id={`accountid-${connected.id}`}
                        />
                        <Button
                          size="sm"
                          onClick={() => {
                            const tokenEl = document.getElementById(`token-${connected.id}`) as HTMLInputElement;
                            const idEl = document.getElementById(`accountid-${connected.id}`) as HTMLInputElement;
                            handleUpdateToken(connected.id, tokenEl?.value || "", idEl?.value || "");
                          }}
                          className="bg-primary hover:bg-primary/90 text-primary-foreground"
                        >
                          <Key className="h-3 w-3 mr-1" /> Save Token
                        </Button>
                      </div>
                    )}
                  </div>
                  <Button variant="outline" onClick={() => handleDisconnect(connected.id)} className="w-full border-destructive/30 text-destructive hover:bg-destructive/10">
                    <Trash2 className="h-4 w-4 mr-2" /> Disconnect
                  </Button>
                </div>
              ) : adding === p.name ? (
                <div className="space-y-3">
                  <div>
                    <Label className="text-xs">Username / Channel</Label>
                    <Input value={username} onChange={e => setUsername(e.target.value)} placeholder={`Your ${p.label} username`} className="bg-muted border-border mt-1" />
                  </div>
                  <div>
                    <Label className="text-xs">{config.tokenLabel}</Label>
                    <Input value={accessToken} onChange={e => setAccessToken(e.target.value)} placeholder="Paste your API token" className="bg-muted border-border mt-1 font-mono text-xs" />
                  </div>
                  <div>
                    <Label className="text-xs">{config.idLabel}</Label>
                    <Input value={platformAccountId} onChange={e => setPlatformAccountId(e.target.value)} placeholder="e.g. UC... or 12345" className="bg-muted border-border mt-1 font-mono text-xs" />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => handleConnect(p.name)} disabled={submitting} size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                      {submitting ? "..." : "Connect"}
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => { setAdding(null); setUsername(""); setAccessToken(""); setPlatformAccountId(""); }} className="border-border">Cancel</Button>
                  </div>
                </div>
              ) : (
                <Button
                  variant="outline"
                  className="w-full border-border text-foreground hover:bg-muted"
                  onClick={() => {
                    if (!canAddAccount) {
                      toast({
                        title: "Account limit reached",
                        description: `Upgrade your plan to connect more accounts.`,
                        variant: "destructive",
                      });
                      return;
                    }
                    setAdding(p.name);
                  }}
                  disabled={!canAddAccount}
                >
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

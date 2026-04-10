import { useState, useEffect } from "react";
import { User, Lock, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function SettingsPage() {
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setEmail(user.email || "");
    const { data } = await supabase.from("profiles").select("*").eq("user_id", user.id).maybeSingle();
    if (data) {
      setDisplayName(data.display_name || "");
      setAvatarUrl(data.avatar_url || "");
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("profiles").update({
      display_name: displayName,
      avatar_url: avatarUrl,
    }).eq("user_id", user.id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Profile updated!" });
    }
    setSaving(false);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast({ title: "Password must be at least 6 characters", variant: "destructive" });
      return;
    }
    setChangingPassword(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Password updated!" });
      setCurrentPassword("");
      setNewPassword("");
    }
    setChangingPassword(false);
  };

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold mb-1">Settings</h1>
      <p className="text-muted-foreground text-sm mb-8">Manage your account preferences.</p>

      <div className="space-y-6 max-w-2xl">
        {/* Profile Settings */}
        <form onSubmit={handleSaveProfile} className="rounded-xl border border-border bg-card p-6" style={{ boxShadow: "var(--shadow-card)" }}>
          <div className="flex items-center gap-3 mb-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <User className="h-5 w-5" />
            </div>
            <h3 className="font-heading font-semibold">Profile Settings</h3>
          </div>
          <div className="space-y-4">
            <div>
              <Label>Display Name</Label>
              <Input value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="Your name" className="bg-muted border-border mt-1" />
            </div>
            <div>
              <Label>Email</Label>
              <Input value={email} disabled className="bg-muted border-border mt-1 opacity-60" />
              <p className="text-xs text-muted-foreground mt-1">Email cannot be changed here.</p>
            </div>
            <div>
              <Label>Avatar URL</Label>
              <Input value={avatarUrl} onChange={e => setAvatarUrl(e.target.value)} placeholder="https://example.com/avatar.jpg" className="bg-muted border-border mt-1" />
            </div>
            <Button type="submit" disabled={saving} className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <Save className="h-4 w-4 mr-2" />
              {saving ? "Saving..." : "Save Profile"}
            </Button>
          </div>
        </form>

        {/* Change Password */}
        <form onSubmit={handleChangePassword} className="rounded-xl border border-border bg-card p-6" style={{ boxShadow: "var(--shadow-card)" }}>
          <div className="flex items-center gap-3 mb-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Lock className="h-5 w-5" />
            </div>
            <h3 className="font-heading font-semibold">Change Password</h3>
          </div>
          <div className="space-y-4">
            <div>
              <Label>New Password</Label>
              <Input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Min 6 characters" minLength={6} required className="bg-muted border-border mt-1" />
            </div>
            <Button type="submit" disabled={changingPassword} variant="outline" className="border-border">
              <Lock className="h-4 w-4 mr-2" />
              {changingPassword ? "Updating..." : "Update Password"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

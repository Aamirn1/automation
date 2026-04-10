import { useEffect, useState } from "react";
import { Trash2, Ban } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => { loadUsers(); }, []);

  const loadUsers = async () => {
    const { data: profiles } = await supabase.from("profiles").select("*");
    if (!profiles) { setUsers([]); return; }

    const userIds = profiles.map(p => p.user_id);
    const [{ data: subs }, { data: accountCounts }] = await Promise.all([
      supabase.from("subscriptions").select("user_id, plan, status, expires_at, uploads_used, total_uploads_allowed").in("user_id", userIds),
      supabase.from("social_accounts").select("user_id"),
    ]);

    const subMap = new Map((subs || []).map(s => [s.user_id, s]));
    const acctMap: Record<string, number> = {};
    (accountCounts || []).forEach((a: any) => {
      acctMap[a.user_id] = (acctMap[a.user_id] || 0) + 1;
    });

    const merged = profiles.map(p => ({
      ...p,
      subscription: subMap.get(p.user_id) || null,
      accountCount: acctMap[p.user_id] || 0,
    }));
    setUsers(merged);
  };

  const handleDeleteUser = async (userId: string, email: string) => {
    if (!confirm(`Delete user ${email}? This will remove all their data.`)) return;

    // Delete profile (cascade will handle related data)
    const { error } = await supabase.from("profiles").delete().eq("user_id", userId);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      // Audit log
      const { data: { user } } = await supabase.auth.getUser();
      await supabase.from("audit_logs").insert({
        actor_id: user?.id,
        action: "user_deleted",
        entity_type: "user",
        entity_id: userId,
        details: { email },
      });
      toast({ title: "User removed" });
      loadUsers();
    }
  };

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold mb-6">User Management</h1>
      <p className="text-sm text-muted-foreground mb-4">{users.length} total users</p>
      <div className="rounded-xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="text-left p-3 font-medium text-muted-foreground">User</th>
              <th className="text-left p-3 font-medium text-muted-foreground">Plan</th>
              <th className="text-left p-3 font-medium text-muted-foreground">Usage</th>
              <th className="text-left p-3 font-medium text-muted-foreground">Accounts</th>
              <th className="text-left p-3 font-medium text-muted-foreground">Joined</th>
              <th className="text-right p-3 font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} className="border-t border-border">
                <td className="p-3">
                  <p className="font-medium">{u.display_name || "—"}</p>
                  <p className="text-xs text-muted-foreground">{u.email}</p>
                </td>
                <td className="p-3 capitalize">{u.subscription?.plan || "none"}</td>
                <td className="p-3 text-muted-foreground text-xs">
                  {u.subscription?.uploads_used || 0}/{u.subscription?.total_uploads_allowed || 0}
                </td>
                <td className="p-3">{u.accountCount}</td>
                <td className="p-3 text-muted-foreground">{new Date(u.created_at).toLocaleDateString()}</td>
                <td className="p-3 text-right">
                  <Button variant="ghost" size="sm" onClick={() => handleDeleteUser(u.user_id, u.email || "")} className="text-destructive hover:bg-destructive/10">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

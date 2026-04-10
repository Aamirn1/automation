import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const { data: profiles } = await supabase.from("profiles").select("*");
      if (!profiles) { setUsers([]); return; }

      const userIds = profiles.map(p => p.user_id);
      const { data: subs } = await supabase
        .from("subscriptions")
        .select("user_id, plan, status, expires_at")
        .in("user_id", userIds);

      const subMap = new Map((subs || []).map(s => [s.user_id, s]));
      const merged = profiles.map(p => ({
        ...p,
        subscription: subMap.get(p.user_id) || null,
      }));
      setUsers(merged);
    })();
  }, []);

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold mb-6">User Management</h1>
      <div className="rounded-xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="text-left p-3 font-medium text-muted-foreground">User</th>
              <th className="text-left p-3 font-medium text-muted-foreground">Plan</th>
              <th className="text-left p-3 font-medium text-muted-foreground">Status</th>
              <th className="text-left p-3 font-medium text-muted-foreground">Joined</th>
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
                <td className="p-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    u.subscription?.status === "active" ? "bg-green-500/10 text-green-500" : "bg-muted text-muted-foreground"
                  }`}>
                    {u.subscription?.status || "inactive"}
                  </span>
                </td>
                <td className="p-3 text-muted-foreground">{new Date(u.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

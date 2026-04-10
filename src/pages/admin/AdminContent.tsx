import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export default function AdminContent() {
  const [content, setContent] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("content_items").select("*").order("created_at", { ascending: false });
      if (!data) { setContent([]); return; }
      // Fetch profile info for each unique user_id
      const userIds = [...new Set(data.map(c => c.user_id))];
      const { data: profiles } = await supabase.from("profiles").select("user_id, display_name, email").in("user_id", userIds);
      const profileMap = Object.fromEntries((profiles || []).map(p => [p.user_id, p]));
      setContent(data.map(c => ({ ...c, profile: profileMap[c.user_id] || null })));
    })();
  }, []);

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold mb-6">Content Management</h1>
      {content.length === 0 ? (
        <p className="text-muted-foreground text-sm">No content items yet.</p>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="text-left p-3 font-medium text-muted-foreground">Title</th>
                <th className="text-left p-3 font-medium text-muted-foreground">User</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Status</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Date</th>
              </tr>
            </thead>
            <tbody>
              {content.map(c => (
                <tr key={c.id} className="border-t border-border">
                  <td className="p-3 font-medium">{c.title}</td>
                  <td className="p-3 text-muted-foreground">{c.profile?.display_name || c.profile?.email || "—"}</td>
                  <td className="p-3 capitalize">{c.status}</td>
                  <td className="p-3 text-muted-foreground">{new Date(c.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

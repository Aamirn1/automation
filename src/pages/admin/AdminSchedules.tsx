import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export default function AdminSchedules() {
  const [posts, setPosts] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("scheduled_posts")
        .select("*, profiles!scheduled_posts_user_id_fkey(display_name, email), content_items(title), social_accounts(platform, platform_username)")
        .order("scheduled_at", { ascending: true });
      setPosts(data || []);
    })();
  }, []);

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold mb-6">Scheduling Dashboard</h1>
      {posts.length === 0 ? (
        <p className="text-muted-foreground text-sm">No scheduled posts yet.</p>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="text-left p-3 font-medium text-muted-foreground">User</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Content</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Platform</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Scheduled</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              {posts.map(p => (
                <tr key={p.id} className="border-t border-border">
                  <td className="p-3">{p.profiles?.display_name || p.profiles?.email || "—"}</td>
                  <td className="p-3">{p.content_items?.title || "—"}</td>
                  <td className="p-3 capitalize">{p.social_accounts?.platform || "—"}</td>
                  <td className="p-3 text-muted-foreground">{new Date(p.scheduled_at).toLocaleString()}</td>
                  <td className="p-3 capitalize">{p.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

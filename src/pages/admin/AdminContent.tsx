import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export default function AdminContent() {
  const [content, setContent] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("content_items").select("*, profiles!content_items_user_id_fkey(display_name, email)").order("created_at", { ascending: false });
      setContent(data || []);
    })();
  }, []);

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold mb-6">Content Management</h1>
      {content.length === 0 ? (
        <p className="text-muted-foreground text-sm">No content items yet. Users will see their content here after uploading.</p>
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
                  <td className="p-3 text-muted-foreground">{c.profiles?.display_name || c.profiles?.email}</td>
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

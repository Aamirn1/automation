import { useEffect, useState } from "react";
import { Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";

export default function AdminAuditLogs() {
  const [logs, setLogs] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [filterAction, setFilterAction] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadLogs(); }, []);

  const loadLogs = async () => {
    const { data } = await supabase
      .from("audit_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);
    setLogs(data || []);
    setLoading(false);
  };

  const uniqueActions = [...new Set(logs.map(l => l.action))];

  const filtered = logs.filter(log => {
    if (filterAction !== "all" && log.action !== filterAction) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        log.action?.toLowerCase().includes(q) ||
        log.actor_email?.toLowerCase().includes(q) ||
        log.entity_type?.toLowerCase().includes(q) ||
        JSON.stringify(log.details)?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const actionColor = (action: string) => {
    if (action.includes("approved") || action.includes("success")) return "text-green-500";
    if (action.includes("rejected") || action.includes("failed") || action.includes("deleted")) return "text-destructive";
    return "text-primary";
  };

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold mb-6">Audit Logs</h1>

      <div className="flex gap-3 mb-6 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search logs..."
            className="pl-10 bg-muted border-border"
          />
        </div>
        <select
          value={filterAction}
          onChange={e => setFilterAction(e.target.value)}
          className="h-10 rounded-md border border-border bg-muted px-3 text-sm"
        >
          <option value="all">All Actions</option>
          {uniqueActions.map(a => <option key={a} value={a}>{a}</option>)}
        </select>
      </div>

      {loading ? (
        <p className="text-muted-foreground text-sm">Loading logs...</p>
      ) : filtered.length === 0 ? (
        <p className="text-muted-foreground text-sm">No logs found.</p>
      ) : (
        <div className="space-y-2">
          {filtered.map(log => (
            <div key={log.id} className="rounded-lg border border-border bg-card/50 p-3">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-sm font-medium ${actionColor(log.action)}`}>
                      {log.action}
                    </span>
                    {log.entity_type && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                        {log.entity_type}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    By: {log.actor_email || "System"} · {new Date(log.created_at).toLocaleString()}
                  </p>
                  {log.details && Object.keys(log.details).length > 0 && (
                    <pre className="text-xs text-muted-foreground mt-1 font-mono bg-muted/50 rounded p-2 overflow-x-auto max-w-full">
                      {JSON.stringify(log.details, null, 2)}
                    </pre>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

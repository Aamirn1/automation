import { Link2, Video, Globe, Camera, Music2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const platforms = [
  { name: "YouTube", icon: Video, connected: false, color: "text-red-500" },
  { name: "Facebook", icon: Globe, connected: false, color: "text-blue-500" },
  { name: "Instagram", icon: Camera, connected: false, color: "text-pink-500" },
  { name: "TikTok", icon: Music2, connected: false, color: "text-foreground" },
];

export default function AccountsPage() {
  return (
    <div>
      <h1 className="font-heading text-2xl font-bold mb-1">Connected Accounts</h1>
      <p className="text-muted-foreground text-sm mb-8">Link your social media accounts to enable automated uploads.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {platforms.map((p) => (
          <div
            key={p.name}
            className="rounded-xl border border-border bg-card p-5"
            style={{ boxShadow: "var(--shadow-card)" }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-muted ${p.color}`}>
                <p.icon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-heading font-semibold">{p.name}</h3>
                <span className="text-xs text-muted-foreground">Not connected</span>
              </div>
            </div>
            <Button variant="outline" className="w-full border-border text-foreground hover:bg-muted">
              <Link2 className="h-4 w-4 mr-2" />
              Connect {p.name}
            </Button>
          </div>
        ))}
      </div>

      <p className="text-xs text-muted-foreground mt-6">
        Social platform integrations will be available once API connections are configured. 
        Your credentials are encrypted and stored securely.
      </p>
    </div>
  );
}

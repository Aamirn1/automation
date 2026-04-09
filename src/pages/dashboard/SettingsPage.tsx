import { Settings, Bell, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SettingsPage() {
  return (
    <div>
      <h1 className="font-heading text-2xl font-bold mb-1">Settings</h1>
      <p className="text-muted-foreground text-sm mb-8">Manage your account preferences.</p>

      <div className="space-y-4 max-w-2xl">
        {[
          { icon: Settings, title: "Profile Settings", desc: "Update your name, email, and password" },
          { icon: Bell, title: "Notifications", desc: "Configure email and dashboard notifications" },
          { icon: Shield, title: "Security", desc: "Manage two-factor authentication and sessions" },
        ].map((item) => (
          <div
            key={item.title}
            className="flex items-center gap-4 rounded-xl border border-border bg-card p-5"
            style={{ boxShadow: "var(--shadow-card)" }}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-muted-foreground shrink-0">
              <item.icon className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <h3 className="font-heading font-semibold text-sm">{item.title}</h3>
              <p className="text-xs text-muted-foreground">{item.desc}</p>
            </div>
            <Button size="sm" variant="outline" className="border-border text-foreground hover:bg-muted">
              Manage
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

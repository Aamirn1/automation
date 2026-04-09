import { CalendarClock, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SchedulePage() {
  return (
    <div>
      <h1 className="font-heading text-2xl font-bold mb-1">Schedule</h1>
      <p className="text-muted-foreground text-sm mb-8">Configure your upload schedule for automated posting.</p>

      <div className="rounded-xl border border-border bg-card p-6" style={{ boxShadow: "var(--shadow-card)" }}>
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <CalendarClock className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-heading font-semibold">Automation Setup</h3>
            <span className="text-xs text-muted-foreground">Configure your daily upload times</span>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3 rounded-lg border border-border p-4">
            <Clock className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Daily Upload Time</p>
              <p className="text-xs text-muted-foreground">Set when videos should be posted each day</p>
            </div>
          </div>

          <p className="text-sm text-muted-foreground">
            Connect your accounts and select content before configuring a schedule. 
            Once active, uploads will run automatically at your chosen times.
          </p>

          <Button disabled className="bg-primary/50 text-primary-foreground cursor-not-allowed">
            Configure Schedule
          </Button>
        </div>
      </div>
    </div>
  );
}

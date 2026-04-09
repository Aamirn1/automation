import { Check, Zap, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";

const plans = [
  {
    name: "Test",
    price: "Free",
    period: "5 days",
    features: ["5 video uploads", "1 connected account", "1 video/day"],
    current: false,
  },
  {
    name: "Standard",
    price: "$50",
    period: "30 days",
    features: ["30 video uploads", "Up to 3 accounts", "1 video/day", "AI SEO"],
    current: false,
    highlighted: true,
  },
  {
    name: "Premium",
    price: "$70",
    period: "30 days",
    features: ["60 video uploads", "Up to 4 accounts", "1-2 videos/day", "Advanced AI SEO"],
    current: false,
  },
];

export default function SubscriptionPage() {
  return (
    <div>
      <h1 className="font-heading text-2xl font-bold mb-1">Subscription</h1>
      <p className="text-muted-foreground text-sm mb-8">Choose a plan and manage your subscription.</p>

      <div className="rounded-lg border border-border bg-card/50 p-4 mb-8 flex items-center gap-3">
        <CreditCard className="h-5 w-5 text-muted-foreground" />
        <div>
          <p className="text-sm font-medium">No active subscription</p>
          <p className="text-xs text-muted-foreground">Select a plan below to get started</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`relative rounded-xl border p-5 flex flex-col ${
              plan.highlighted ? "border-primary/60" : "border-border"
            } bg-card`}
            style={{ boxShadow: plan.highlighted ? "var(--shadow-glow)" : "var(--shadow-card)" }}
          >
            {plan.highlighted && (
              <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-0.5 text-xs font-medium text-primary-foreground">
                <Zap className="h-3 w-3" /> Popular
              </div>
            )}
            <h3 className="font-heading text-lg font-semibold">{plan.name}</h3>
            <div className="mt-2 mb-4">
              <span className="text-3xl font-bold font-heading">{plan.price}</span>
              {plan.price !== "Free" && (
                <span className="text-muted-foreground text-sm ml-1">/ {plan.period}</span>
              )}
            </div>
            <ul className="space-y-2 mb-6 flex-1">
              {plan.features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <Button
              className={
                plan.highlighted
                  ? "bg-primary hover:bg-primary/90 text-primary-foreground"
                  : "bg-muted hover:bg-muted/80 text-foreground"
              }
            >
              Select Plan
            </Button>
            <p className="text-xs text-muted-foreground text-center mt-2">Payment requires admin approval</p>
          </div>
        ))}
      </div>
    </div>
  );
}

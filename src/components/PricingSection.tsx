import { motion } from "framer-motion";
import { Check, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const plans = [
  {
    name: "Test",
    price: "Free",
    period: "5 days",
    desc: "Try it out with no commitment",
    features: [
      "5 video uploads",
      "1 connected account",
      "1 video per day",
      "Basic SEO titles",
      "Email support",
    ],
    highlighted: false,
  },
  {
    name: "Standard",
    price: "$50",
    period: "30 days",
    desc: "Perfect for growing creators",
    features: [
      "30 video uploads",
      "Up to 3 accounts",
      "1 video per day",
      "AI SEO optimization",
      "Priority support",
      "Google Drive integration",
    ],
    highlighted: true,
  },
  {
    name: "Premium",
    price: "$70",
    period: "30 days",
    desc: "For power users & agencies",
    features: [
      "60 video uploads",
      "Up to 4 accounts",
      "1–2 videos per day",
      "Advanced AI SEO",
      "Priority support",
      "Google Drive integration",
      "Custom scheduling",
    ],
    highlighted: false,
  },
];

export function PricingSection() {
  return (
    <section id="pricing" className="py-24 sm:py-32">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-sm font-medium text-primary tracking-wider uppercase">Pricing</span>
          <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold mt-3 mb-4">
            Simple, <span className="text-gradient">Transparent</span> Pricing
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Start free and scale as you grow. No hidden fees.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.5 }}
              className={`relative rounded-xl border p-6 sm:p-8 flex flex-col ${
                plan.highlighted
                  ? "border-primary/60 bg-card"
                  : "border-border bg-card"
              }`}
              style={{
                boxShadow: plan.highlighted ? "var(--shadow-glow)" : "var(--shadow-card)",
              }}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                  <Zap className="h-3 w-3" /> Most Popular
                </div>
              )}
              <h3 className="font-heading text-xl font-semibold">{plan.name}</h3>
              <p className="text-sm text-muted-foreground mt-1 mb-4">{plan.desc}</p>
              <div className="mb-6">
                <span className="text-4xl font-bold font-heading">{plan.price}</span>
                {plan.price !== "Free" && (
                  <span className="text-muted-foreground text-sm ml-1">/ {plan.period}</span>
                )}
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <span className="text-muted-foreground">{f}</span>
                  </li>
                ))}
              </ul>
              <Link to="/auth">
                <Button
                  className={`w-full ${
                    plan.highlighted
                      ? "bg-primary hover:bg-primary/90 text-primary-foreground"
                      : "bg-muted hover:bg-muted/80 text-foreground"
                  }`}
                >
                  {plan.price === "Free" ? "Start Free Trial" : "Get Started"}
                </Button>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

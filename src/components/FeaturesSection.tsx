import { motion } from "framer-motion";
import {
  Upload, CalendarClock, Sparkles, Link2, ShieldCheck, BarChart3,
} from "lucide-react";

const features = [
  {
    icon: Link2,
    title: "Multi-Platform Linking",
    desc: "Connect YouTube, Facebook, Instagram & TikTok in one place. OAuth-secured account linking.",
  },
  {
    icon: Upload,
    title: "Automated Uploads",
    desc: "Schedule daily video uploads. Use pre-made content or your own from Google Drive.",
  },
  {
    icon: CalendarClock,
    title: "Smart Scheduling",
    desc: "Set your preferred upload times. The system handles the rest, 1–2 posts per day.",
  },
  {
    icon: Sparkles,
    title: "AI SEO Optimization",
    desc: "Auto-generate SEO-friendly titles and descriptions with ChatGPT for maximum reach.",
  },
  {
    icon: ShieldCheck,
    title: "Secure & Encrypted",
    desc: "All API keys and tokens are encrypted at rest. OAuth2 flows with PKCE protection.",
  },
  {
    icon: BarChart3,
    title: "Upload Analytics",
    desc: "Track upload history, success rates, and content performance across all platforms.",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="relative py-24 sm:py-32">
      <div className="absolute inset-0" style={{ background: "var(--gradient-glow)" }} />
      <div className="container relative z-10 mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-sm font-medium text-primary tracking-wider uppercase">Features</span>
          <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold mt-3 mb-4">
            Everything You Need to{" "}
            <span className="text-gradient">Automate</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            From account linking to AI-powered SEO — manage your entire social video strategy from one dashboard.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="group relative rounded-xl border border-border bg-card p-6 hover:border-primary/40 transition-all duration-300"
              style={{ boxShadow: "var(--shadow-card)" }}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary mb-4 group-hover:bg-primary/20 transition-colors">
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="font-heading text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

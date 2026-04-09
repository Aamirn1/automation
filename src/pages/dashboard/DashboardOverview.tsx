import { Link2, FileVideo, CalendarClock, CreditCard, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const steps = [
  {
    icon: Link2,
    title: "Connect Accounts",
    desc: "Link your YouTube, Facebook, Instagram & TikTok accounts",
    link: "/dashboard/accounts",
  },
  {
    icon: FolderVideo,
    title: "Select Content",
    desc: "Choose pre-made videos or add your Google Drive link",
    link: "/dashboard/content",
  },
  {
    icon: CalendarClock,
    title: "Set Schedule",
    desc: "Pick upload times and let automation handle the rest",
    link: "/dashboard/schedule",
  },
  {
    icon: CreditCard,
    title: "Choose Plan",
    desc: "Select a subscription plan that fits your needs",
    link: "/dashboard/subscription",
  },
];

export default function DashboardOverview() {
  return (
    <div>
      <h1 className="font-heading text-2xl font-bold mb-1">Dashboard</h1>
      <p className="text-muted-foreground text-sm mb-8">Get started with your video automation setup.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {steps.map((step, i) => (
          <Link
            key={step.title}
            to={step.link}
            className="group rounded-xl border border-border bg-card p-5 hover:border-primary/40 transition-all"
            style={{ boxShadow: "var(--shadow-card)" }}
          >
            <div className="flex items-start justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary mb-3">
                <step.icon className="h-5 w-5" />
              </div>
              <span className="text-xs text-muted-foreground font-mono">Step {i + 1}</span>
            </div>
            <h3 className="font-heading font-semibold mb-1">{step.title}</h3>
            <p className="text-sm text-muted-foreground mb-3">{step.desc}</p>
            <span className="inline-flex items-center gap-1 text-sm text-primary group-hover:gap-2 transition-all">
              Get started <ArrowRight className="h-3 w-3" />
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}

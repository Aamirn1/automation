import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { FloatingElements } from "@/components/FloatingElements";
import { motion } from "framer-motion";
import { Users, Target, Shield } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <h1 className="font-heading text-4xl font-bold mb-4">About <span className="text-gradient">SocialPilot AI</span></h1>
            <p className="text-muted-foreground mb-12 text-lg">
              We're building the simplest way to automate video uploads across every major social platform.
            </p>

            <div className="space-y-8">
              {[
                { icon: Target, title: "Our Mission", text: "To empower creators and businesses to grow their social media presence effortlessly through intelligent automation and AI-powered optimization." },
                { icon: Users, title: "Who We Serve", text: "From solo creators to agencies managing multiple accounts — anyone who wants to save time and maximize reach across YouTube, Facebook, Instagram, and TikTok." },
                { icon: Shield, title: "Security First", text: "All credentials are encrypted at rest. We use OAuth 2.0 for account connections and never store your social media passwords. Your content and data are always protected." },
              ].map((item) => (
                <div key={item.title} className="flex gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="font-heading text-lg font-semibold mb-1">{item.title}</h2>
                    <p className="text-muted-foreground text-sm leading-relaxed">{item.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
      <Footer />
      <FloatingElements />
    </div>
  );
}

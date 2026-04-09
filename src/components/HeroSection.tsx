import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Play } from "lucide-react";
import { Button } from "@/components/ui/button";

const phrases = [
  "Automate Your Social Videos",
  "Grow Your Channel Effortlessly",
  "Schedule Once, Post Everywhere",
  "AI-Powered SEO Titles",
];

export function HeroSection() {
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const currentPhrase = phrases[phraseIndex];
    let timeout: NodeJS.Timeout;

    if (!deleting && charIndex < currentPhrase.length) {
      timeout = setTimeout(() => setCharIndex(charIndex + 1), 60);
    } else if (!deleting && charIndex === currentPhrase.length) {
      timeout = setTimeout(() => setDeleting(true), 2000);
    } else if (deleting && charIndex > 0) {
      timeout = setTimeout(() => setCharIndex(charIndex - 1), 30);
    } else if (deleting && charIndex === 0) {
      setDeleting(false);
      setPhraseIndex((phraseIndex + 1) % phrases.length);
    }

    return () => clearTimeout(timeout);
  }, [charIndex, deleting, phraseIndex]);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Background glow */}
      <div className="absolute inset-0" style={{ background: "var(--gradient-hero)" }} />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full opacity-20 blur-[120px] bg-primary" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full opacity-10 blur-[100px] bg-secondary" />

      {/* Floating 3D-ish shapes */}
      <motion.div
        animate={{ y: [0, -15, 0], rotate: [0, 5, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-32 left-[10%] w-16 h-16 rounded-xl border border-primary/20 bg-primary/5 backdrop-blur-sm"
      />
      <motion.div
        animate={{ y: [0, 12, 0], rotate: [0, -8, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-40 right-[15%] w-20 h-20 rounded-full border border-secondary/20 bg-secondary/5 backdrop-blur-sm"
      />
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/2 right-[8%] w-12 h-12 rounded-lg border border-primary/15 bg-primary/5 backdrop-blur-sm rotate-45"
      />

      <div className="container relative z-10 mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm text-primary mb-8">
            <Play className="h-3 w-3 fill-current" />
            AI-Powered Video Automation
          </div>

          <h1 className="font-heading text-4xl sm:text-5xl md:text-7xl font-bold leading-tight mb-4">
            <span className="text-foreground">Upload Videos to</span>
            <br />
            <span className="text-gradient">Every Platform</span>
          </h1>

          <div className="h-12 sm:h-14 md:h-16 flex items-center justify-center mb-6">
            <span className="typewriter-cursor font-heading text-xl sm:text-2xl md:text-3xl font-medium text-primary/80">
              {phrases[phraseIndex].substring(0, charIndex)}
            </span>
          </div>

          <p className="mx-auto max-w-2xl text-muted-foreground text-base sm:text-lg mb-10">
            Connect your YouTube, Facebook, Instagram & TikTok accounts. 
            Schedule automated daily uploads with AI-generated SEO titles. 
            Grow your audience on autopilot.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/auth">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-lg animate-pulse-glow">
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <a href="#features">
              <Button size="lg" variant="outline" className="border-border text-foreground hover:bg-muted px-8 py-6 text-lg">
                See How It Works
              </Button>
            </a>
          </div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="mt-16 grid grid-cols-3 gap-8 max-w-md mx-auto"
          >
            {[
              { value: "4+", label: "Platforms" },
              { value: "AI", label: "SEO Titles" },
              { value: "24/7", label: "Automation" },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-2xl sm:text-3xl font-bold text-gradient font-heading">{stat.value}</div>
                <div className="text-xs sm:text-sm text-muted-foreground mt-1">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

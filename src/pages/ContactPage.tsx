import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { FloatingElements } from "@/components/FloatingElements";
import { motion } from "framer-motion";
import { Mail, MapPin, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-2xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <h1 className="font-heading text-4xl font-bold mb-4">Get in <span className="text-gradient">Touch</span></h1>
            <p className="text-muted-foreground mb-8">Have questions? We'd love to hear from you.</p>

            <div className="flex flex-wrap gap-6 mb-10">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4 text-primary" />
                support@socialpilotai.com
              </div>
              <a href="https://wa.me/923115794492" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <MessageCircle className="h-4 w-4 text-primary" />
                WhatsApp
              </a>
            </div>

            <form className="space-y-4 rounded-xl border border-border bg-card p-6" style={{ boxShadow: "var(--shadow-card)" }}>
              <Input placeholder="Your name" className="bg-muted border-border" />
              <Input type="email" placeholder="Your email" className="bg-muted border-border" />
              <Textarea placeholder="Your message" rows={5} className="bg-muted border-border resize-none" />
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">Send Message</Button>
            </form>
          </motion.div>
        </div>
      </div>
      <Footer />
      <FloatingElements />
    </div>
  );
}

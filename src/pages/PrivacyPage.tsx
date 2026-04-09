import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { FloatingElements } from "@/components/FloatingElements";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-3xl prose prose-invert prose-sm">
          <h1 className="font-heading text-4xl font-bold mb-8 text-foreground">Privacy Policy</h1>
          <div className="text-muted-foreground space-y-6 text-sm leading-relaxed">
            <p>Last updated: {new Date().toLocaleDateString()}</p>
            <h2 className="font-heading text-lg font-semibold text-foreground">1. Information We Collect</h2>
            <p>We collect your email address, name, and social media account tokens necessary for the automation service. We do not store social media passwords.</p>
            <h2 className="font-heading text-lg font-semibold text-foreground">2. How We Use Your Data</h2>
            <p>Your data is used solely to provide the video scheduling and upload service. Social media tokens are encrypted at rest and used only for authorized API calls.</p>
            <h2 className="font-heading text-lg font-semibold text-foreground">3. Data Security</h2>
            <p>We employ industry-standard encryption for all stored credentials. OAuth 2.0 is used for account connections. Access is restricted on a need-to-know basis.</p>
            <h2 className="font-heading text-lg font-semibold text-foreground">4. Third-Party Services</h2>
            <p>We interact with YouTube, Facebook, Instagram, and TikTok APIs on your behalf. Your use of these platforms is also governed by their respective privacy policies.</p>
            <h2 className="font-heading text-lg font-semibold text-foreground">5. Contact</h2>
            <p>For privacy-related inquiries, contact us via WhatsApp at +92-3115794492 or through our contact page.</p>
          </div>
        </div>
      </div>
      <Footer />
      <FloatingElements />
    </div>
  );
}

import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { FloatingElements } from "@/components/FloatingElements";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-3xl prose prose-invert prose-sm">
          <h1 className="font-heading text-4xl font-bold mb-8 text-foreground">Terms of Service</h1>
          <div className="text-muted-foreground space-y-6 text-sm leading-relaxed">
            <p>Last updated: {new Date().toLocaleDateString()}</p>
            <h2 className="font-heading text-lg font-semibold text-foreground">1. Acceptance of Terms</h2>
            <p>By accessing or using SocialPilot AI, you agree to be bound by these Terms of Service. If you do not agree, please do not use the service.</p>
            <h2 className="font-heading text-lg font-semibold text-foreground">2. Service Description</h2>
            <p>SocialPilot AI provides automated video scheduling and uploading services across social media platforms including YouTube, Facebook, Instagram, and TikTok.</p>
            <h2 className="font-heading text-lg font-semibold text-foreground">3. User Responsibilities</h2>
            <p>You are responsible for maintaining the security of your account credentials and API keys. You must comply with each platform's terms of service when using our automation features.</p>
            <h2 className="font-heading text-lg font-semibold text-foreground">4. Payments & Refunds</h2>
            <p>Subscription payments are subject to admin approval. Refunds may be issued at the discretion of the service administrator.</p>
            <h2 className="font-heading text-lg font-semibold text-foreground">5. Limitation of Liability</h2>
            <p>SocialPilot AI is provided "as is" without warranties. We are not liable for any damages arising from the use of our service, including failed uploads or account issues on third-party platforms.</p>
          </div>
        </div>
      </div>
      <Footer />
      <FloatingElements />
    </div>
  );
}

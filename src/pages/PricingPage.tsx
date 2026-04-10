import { Navbar } from "@/components/Navbar";
import { PricingSection } from "@/components/PricingSection";
import { Footer } from "@/components/Footer";
import { FloatingElements } from "@/components/FloatingElements";

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20">
        <PricingSection />
      </div>
      <Footer />
      <FloatingElements />
    </div>
  );
}

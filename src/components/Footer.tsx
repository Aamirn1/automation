import { Link } from "react-router-dom";
import { Zap } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border bg-card/50 py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          <div>
            <Link to="/" className="flex items-center gap-2 mb-3">
              <Zap className="h-5 w-5 text-primary" />
              <span className="text-shine text-lg font-bold font-heading">SocialPilot AI</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Automate your social media video uploads with AI-powered scheduling.
            </p>
          </div>
          <div>
            <h4 className="font-heading font-semibold mb-3 text-sm">Product</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#features" className="hover:text-foreground transition-colors">Features</a></li>
              <li><a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a></li>
              <li><a href="#faq" className="hover:text-foreground transition-colors">FAQ</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-heading font-semibold mb-3 text-sm">Company</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/about" className="hover:text-foreground transition-colors">About</Link></li>
              <li><Link to="/contact" className="hover:text-foreground transition-colors">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-heading font-semibold mb-3 text-sm">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link></li>
              <li><Link to="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-border pt-6 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} SocialPilot AI. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

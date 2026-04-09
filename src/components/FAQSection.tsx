import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    q: "How does the automation work?",
    a: "Once you connect your social accounts and select content, SocialPilot AI uploads videos at your scheduled times using each platform's official API. Everything runs automatically — you just set it and forget it.",
  },
  {
    q: "Which platforms are supported?",
    a: "We currently support YouTube, Facebook Pages, Instagram Business accounts, and TikTok for Business. More platforms are coming soon.",
  },
  {
    q: "Is my data secure?",
    a: "Absolutely. All API tokens and credentials are encrypted at rest. We use OAuth 2.0 for account linking and never store your social media passwords.",
  },
  {
    q: "Can I use my own videos?",
    a: "Yes! You can provide a Google Drive folder link with your own videos. After admin verification, your content will be queued for scheduled uploads.",
  },
  {
    q: "How does AI SEO optimization work?",
    a: "Our system uses ChatGPT to generate keyword-rich, SEO-optimized titles and descriptions for each video, tailored to the platform and content category.",
  },
  {
    q: "What happens when my subscription ends?",
    a: "Uploads pause automatically. You'll receive a notification before expiry and can renew anytime from your dashboard. Your data and settings are preserved.",
  },
];

export function FAQSection() {
  return (
    <section id="faq" className="py-24 sm:py-32">
      <div className="container mx-auto px-4 max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="text-sm font-medium text-primary tracking-wider uppercase">FAQ</span>
          <h2 className="font-heading text-3xl sm:text-4xl font-bold mt-3 mb-4">
            Frequently Asked Questions
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq, i) => (
              <AccordionItem
                key={i}
                value={`faq-${i}`}
                className="rounded-lg border border-border bg-card px-5"
              >
                <AccordionTrigger className="text-left font-medium hover:no-underline">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
}

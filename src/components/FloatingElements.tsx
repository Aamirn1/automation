import { useState, useEffect } from "react";
import { ArrowUp, MessageCircle } from "lucide-react";

export function FloatingElements() {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 400);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {/* Scroll to top - bottom left */}
      {showScrollTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-6 left-6 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-primary/20 border border-primary/30 text-primary hover:bg-primary/30 transition-all backdrop-blur-sm"
          aria-label="Scroll to top"
        >
          <ArrowUp className="h-4 w-4" />
        </button>
      )}

      {/* WhatsApp - bottom right */}
      <a
        href="https://wa.me/923115794492"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg hover:scale-110 transition-transform"
        aria-label="Chat on WhatsApp"
      >
        <MessageCircle className="h-5 w-5" />
      </a>
    </>
  );
}

import { FolderVideo, Upload, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ContentPage() {
  return (
    <div>
      <h1 className="font-heading text-2xl font-bold mb-1">Content</h1>
      <p className="text-muted-foreground text-sm mb-8">Select pre-made content or add your own videos.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-xl border border-border bg-card p-6" style={{ boxShadow: "var(--shadow-card)" }}>
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary mb-4">
            <FolderVideo className="h-5 w-5" />
          </div>
          <h3 className="font-heading font-semibold mb-2">Pre-made Content</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Browse our curated video library organized by niche and category.
          </p>
          <Button variant="outline" className="border-border text-foreground hover:bg-muted">
            Browse Library
          </Button>
        </div>

        <div className="rounded-xl border border-border bg-card p-6" style={{ boxShadow: "var(--shadow-card)" }}>
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary/10 text-secondary mb-4">
            <Upload className="h-5 w-5" />
          </div>
          <h3 className="font-heading font-semibold mb-2">My Content</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Provide a Google Drive folder link with your own videos for upload.
          </p>
          <Button variant="outline" className="border-border text-foreground hover:bg-muted">
            <ExternalLink className="h-4 w-4 mr-2" />
            Add Drive Link
          </Button>
        </div>
      </div>
    </div>
  );
}

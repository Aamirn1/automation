// supabase/functions/validate-drive/index.ts
// Validates a Google Drive folder link and optionally lists contents
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { drive_url } = await req.json();

    if (!drive_url) {
      return new Response(
        JSON.stringify({ valid: false, error: "No URL provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Basic URL validation
    const isGoogleDrive =
      drive_url.includes("drive.google.com") || drive_url.includes("docs.google.com");

    if (!isGoogleDrive) {
      return new Response(
        JSON.stringify({ valid: false, error: "Not a Google Drive URL" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Extract folder ID from various Google Drive URL formats
    let folderId = null;
    const patterns = [
      /\/folders\/([a-zA-Z0-9_-]+)/,
      /id=([a-zA-Z0-9_-]+)/,
      /\/d\/([a-zA-Z0-9_-]+)/,
    ];

    for (const pattern of patterns) {
      const match = drive_url.match(pattern);
      if (match) {
        folderId = match[1];
        break;
      }
    }

    if (!folderId) {
      return new Response(
        JSON.stringify({
          valid: false,
          error: "Could not extract folder ID from URL. Please ensure it's a valid Google Drive folder link.",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Attempt to list folder contents using Google Drive API (if API key is available)
    const GOOGLE_API_KEY = Deno.env.get("GOOGLE_API_KEY");
    let videoCount = 0;
    let videoFiles: Array<{ name: string; id: string; mimeType: string }> = [];

    if (GOOGLE_API_KEY) {
      try {
        const listRes = await fetch(
          `https://www.googleapis.com/drive/v3/files?q='${folderId}'+in+parents+and+mimeType+contains+'video'&key=${GOOGLE_API_KEY}&fields=files(id,name,mimeType,size)`,
          { method: "GET" }
        );

        if (listRes.ok) {
          const listData = await listRes.json();
          videoFiles = listData.files || [];
          videoCount = videoFiles.length;
        }
      } catch (e) {
        console.error("Google Drive API error:", e);
        // Non-fatal — we can still validate the URL format
      }
    }

    return new Response(
      JSON.stringify({
        valid: true,
        folder_id: folderId,
        video_count: videoCount,
        videos: videoFiles.slice(0, 50), // Cap at 50 files
        has_api_access: !!GOOGLE_API_KEY,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ valid: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

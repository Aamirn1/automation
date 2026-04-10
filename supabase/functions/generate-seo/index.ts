// supabase/functions/generate-seo/index.ts
// Generates SEO-optimized title and description using OpenAI API
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
    const { category, originalTitle, platform, tags } = await req.json();

    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) {
      // Fallback: generate basic SEO text without AI
      const fallbackTitle = originalTitle || `${category || "Video"} - Must Watch!`;
      const fallbackDesc = `Check out this amazing ${category || "video"} content. ${
        tags?.length ? `Tags: ${tags.join(", ")}` : ""
      } Don't forget to like and subscribe!`;
      return new Response(
        JSON.stringify({
          title: fallbackTitle,
          description: fallbackDesc,
          source: "fallback",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const prompt = `You are an expert social media SEO specialist. Generate an engaging, SEO-optimized title and description for a ${platform || "social media"} video.

Context:
- Category: ${category || "General"}
- Original title: ${originalTitle || "N/A"}
- Tags: ${tags?.join(", ") || "N/A"}
- Platform: ${platform || "YouTube"}

Requirements:
1. Title: Catchy, under 100 characters, includes relevant keywords. Use power words.
2. Description: 2-3 paragraphs, includes relevant keywords naturally, has a call-to-action, includes relevant hashtags.
3. Focus on high-demand, low-competition keywords.
4. Make it feel authentic, not spammy.

Respond in JSON format: { "title": "...", "description": "..." }`;

    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!openaiRes.ok) {
      const errText = await openaiRes.text();
      throw new Error(`OpenAI API error: ${openaiRes.status} ${errText}`);
    }

    const openaiData = await openaiRes.json();
    const content = openaiData.choices?.[0]?.message?.content || "";

    // Parse JSON from response
    let parsed;
    try {
      // Try to extract JSON from the response (it might be wrapped in markdown)
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : { title: originalTitle, description: "" };
    } catch {
      parsed = { title: originalTitle || category, description: content };
    }

    return new Response(
      JSON.stringify({ ...parsed, source: "openai" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

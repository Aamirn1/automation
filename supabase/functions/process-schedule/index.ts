// supabase/functions/process-schedule/index.ts
// Cron-triggered function to process due scheduled posts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const now = new Date().toISOString();

    // 1. Find all due scheduled posts
    const { data: duePosts, error: fetchErr } = await supabase
      .from("scheduled_posts")
      .select("id, user_id")
      .eq("status", "scheduled")
      .lte("scheduled_at", now)
      .order("scheduled_at", { ascending: true })
      .limit(50);

    if (fetchErr) throw new Error(`Failed to fetch due posts: ${fetchErr.message}`);
    if (!duePosts || duePosts.length === 0) {
      return new Response(
        JSON.stringify({ processed: 0, message: "No due posts" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 2. For each post, verify user subscription is active
    const results: Array<{ id: string; status: string; error?: string }> = [];

    for (const post of duePosts) {
      // Check subscription
      const { data: sub } = await supabase
        .from("subscriptions")
        .select("status, expires_at, uploads_used, total_uploads_allowed, max_uploads_per_day")
        .eq("user_id", post.user_id)
        .eq("status", "active")
        .maybeSingle();

      if (!sub) {
        // No active subscription — skip and mark as failed
        await supabase
          .from("scheduled_posts")
          .update({
            status: "failed",
            error_message: "No active subscription",
          })
          .eq("id", post.id);

        results.push({ id: post.id, status: "skipped", error: "No active subscription" });
        continue;
      }

      // Check if subscription has expired
      if (sub.expires_at && new Date(sub.expires_at) < new Date()) {
        await supabase
          .from("scheduled_posts")
          .update({
            status: "failed",
            error_message: "Subscription expired",
          })
          .eq("id", post.id);

        results.push({ id: post.id, status: "skipped", error: "Subscription expired" });
        continue;
      }

      // Check upload limits
      if (sub.uploads_used >= sub.total_uploads_allowed) {
        await supabase
          .from("scheduled_posts")
          .update({
            status: "failed",
            error_message: "Upload limit reached for current subscription",
          })
          .eq("id", post.id);

        // Notify user
        await supabase.rpc("create_notification", {
          _user_id: post.user_id,
          _type: "content_low",
          _title: "Upload Limit Reached",
          _message: "You've used all uploads in your current plan. Please upgrade to continue.",
          _metadata: {},
        });

        results.push({ id: post.id, status: "skipped", error: "Upload limit reached" });
        continue;
      }

      // Check daily limit
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const { count: todayCount } = await supabase
        .from("scheduled_posts")
        .select("*", { count: "exact", head: true })
        .eq("user_id", post.user_id)
        .eq("status", "posted")
        .gte("completed_at", todayStart.toISOString());

      if ((todayCount || 0) >= sub.max_uploads_per_day) {
        // Don't fail — just skip for now, will retry next check
        results.push({ id: post.id, status: "deferred", error: "Daily limit reached" });
        continue;
      }

      // 3. Trigger upload
      try {
        const uploadRes = await fetch(`${supabaseUrl}/functions/v1/upload-video`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${supabaseKey}`,
          },
          body: JSON.stringify({ scheduled_post_id: post.id }),
        });

        const uploadData = await uploadRes.json();
        results.push({
          id: post.id,
          status: uploadData.success ? "uploaded" : "failed",
          error: uploadData.error,
        });
      } catch (e) {
        results.push({ id: post.id, status: "error", error: e.message });
      }
    }

    // Log the batch processing
    await supabase.from("audit_logs").insert({
      action: "schedule_batch_processed",
      entity_type: "system",
      details: {
        total_due: duePosts.length,
        results_summary: {
          uploaded: results.filter((r) => r.status === "uploaded").length,
          failed: results.filter((r) => r.status === "failed").length,
          skipped: results.filter((r) => r.status === "skipped").length,
          deferred: results.filter((r) => r.status === "deferred").length,
        },
      },
    });

    return new Response(
      JSON.stringify({
        processed: duePosts.length,
        results,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

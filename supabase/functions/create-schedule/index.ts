// supabase/functions/create-schedule/index.ts
// Automation wizard backend — generates scheduled_posts for a date range
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
    const {
      user_id,
      content_source,        // 'premade' or 'drive'
      category_id,           // for premade
      drive_link_id,         // for drive
      account_ids,           // array of social_account UUIDs
      start_date,            // ISO date string
      upload_times,          // array of time strings like ["09:00", "18:00"]
      uploads_per_day,       // 1 or 2
    } = await req.json();

    if (!user_id) throw new Error("user_id is required");
    if (!account_ids?.length) throw new Error("At least one account is required");
    if (!start_date) throw new Error("start_date is required");
    if (!upload_times?.length) throw new Error("upload_times is required");

    // 1. Verify subscription
    const { data: sub } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", user_id)
      .eq("status", "active")
      .maybeSingle();

    if (!sub) throw new Error("No active subscription found");
    if (sub.expires_at && new Date(sub.expires_at) < new Date()) {
      throw new Error("Subscription has expired");
    }

    const remainingUploads = sub.total_uploads_allowed - sub.uploads_used;
    if (remainingUploads <= 0) throw new Error("No uploads remaining in your plan");

    // Verify account count is within limits
    if (account_ids.length > sub.max_accounts) {
      throw new Error(`Your plan allows up to ${sub.max_accounts} accounts`);
    }

    // 2. Get content items to schedule
    let contentItems: any[] = [];

    if (content_source === "premade") {
      // Fetch from content library
      let query = supabase
        .from("content_library")
        .select("id, title, description, video_url, category_id")
        .eq("is_active", true)
        .order("usage_count", { ascending: true });

      if (category_id) {
        query = query.eq("category_id", category_id);
      }

      const { data } = await query.limit(remainingUploads);
      contentItems = (data || []).map((item: any) => ({
        id: null, // We'll create content_items entries
        library_id: item.id,
        title: item.title,
        description: item.description,
        video_url: item.video_url,
        source_type: "premade",
      }));
    } else if (content_source === "drive") {
      // Fetch user's content items linked to this drive
      const { data } = await supabase
        .from("content_items")
        .select("id, title, description, video_url, file_url")
        .eq("user_id", user_id)
        .eq("source_type", "drive")
        .eq("status", "ready")
        .order("created_at", { ascending: true })
        .limit(remainingUploads);

      contentItems = (data || []).map((item: any) => ({
        id: item.id,
        title: item.title,
        description: item.description,
        video_url: item.video_url || item.file_url,
        source_type: "drive",
      }));
    }

    if (contentItems.length === 0) {
      throw new Error("No content available to schedule. Please add content first.");
    }

    // 3. Generate schedule entries
    const effectiveUploadsPerDay = Math.min(uploads_per_day || 1, sub.max_uploads_per_day);
    const timesPerDay = upload_times.slice(0, effectiveUploadsPerDay);
    const durationDays = sub.expires_at
      ? Math.min(
          Math.ceil(
            (new Date(sub.expires_at).getTime() - new Date(start_date).getTime()) / 86400000
          ),
          30
        )
      : 30;

    const posts: any[] = [];
    let contentIndex = 0;
    const startDateObj = new Date(start_date);

    for (let day = 0; day < durationDays && contentIndex < contentItems.length; day++) {
      for (const time of timesPerDay) {
        if (contentIndex >= contentItems.length) break;
        if (posts.length >= remainingUploads) break;

        const [hours, minutes] = time.split(":").map(Number);
        const scheduledDate = new Date(startDateObj);
        scheduledDate.setDate(scheduledDate.getDate() + day);
        scheduledDate.setHours(hours, minutes, 0, 0);

        // Skip past dates
        if (scheduledDate <= new Date()) continue;

        const content = contentItems[contentIndex];

        // For premade content, create a content_item entry for the user
        let contentId = content.id;
        if (content.source_type === "premade" && !contentId) {
          const { data: newItem } = await supabase
            .from("content_items")
            .insert({
              user_id,
              title: content.title,
              description: content.description,
              video_url: content.video_url,
              source_type: "premade",
              source_ref: content.library_id,
              status: "ready",
            })
            .select("id")
            .single();
          contentId = newItem?.id;

          // Increment usage count on library item
          await supabase.rpc("increment_usage_count", { _item_id: content.library_id });
        }

        // Create a post per account
        for (const accountId of account_ids) {
          posts.push({
            user_id,
            content_id: contentId,
            account_id: accountId,
            scheduled_at: scheduledDate.toISOString(),
            status: "scheduled",
          });
        }

        contentIndex++;
      }
    }

    if (posts.length === 0) {
      throw new Error("No posts could be scheduled. Check your start date and content.");
    }

    // 4. Insert all posts
    const { error: insertErr } = await supabase.from("scheduled_posts").insert(posts);
    if (insertErr) throw new Error(`Failed to create schedule: ${insertErr.message}`);

    // 5. Audit & notification
    await supabase.from("audit_logs").insert({
      actor_id: user_id,
      action: "schedule_created",
      entity_type: "automation",
      details: {
        content_source,
        total_posts: posts.length,
        accounts: account_ids.length,
        duration_days: durationDays,
        uploads_per_day: effectiveUploadsPerDay,
      },
    });

    await supabase.rpc("create_notification", {
      _user_id: user_id,
      _type: "schedule_created",
      _title: "Automation Scheduled! 🚀",
      _message: `${posts.length} uploads have been scheduled across ${account_ids.length} account(s). Starting ${startDateObj.toLocaleDateString()}.`,
      _metadata: { total_posts: posts.length },
    });

    return new Response(
      JSON.stringify({
        success: true,
        total_posts: posts.length,
        content_items_used: contentIndex,
        duration_days: durationDays,
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

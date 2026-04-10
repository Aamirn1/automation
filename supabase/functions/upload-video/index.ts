// supabase/functions/upload-video/index.ts
// Core video upload engine — dispatches to correct platform API
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
    const { scheduled_post_id } = await req.json();
    if (!scheduled_post_id) throw new Error("scheduled_post_id is required");

    // 1. Fetch the scheduled post with relations
    const { data: post, error: postErr } = await supabase
      .from("scheduled_posts")
      .select("*, content_items(*), social_accounts(*)")
      .eq("id", scheduled_post_id)
      .single();

    if (postErr || !post) throw new Error(`Post not found: ${postErr?.message}`);

    // Mark as uploading
    await supabase
      .from("scheduled_posts")
      .update({ status: "uploading", started_at: new Date().toISOString() })
      .eq("id", scheduled_post_id);

    const platform = post.social_accounts?.platform;
    const accessToken = post.social_accounts?.access_token;
    const content = post.content_items;

    if (!platform || !accessToken) {
      throw new Error(`Missing platform (${platform}) or access token for account`);
    }

    // Generate SEO title/description if not already done
    let title = post.ai_title || content?.ai_title || content?.title || "Untitled";
    let description = post.ai_description || content?.ai_description || content?.description || "";

    if (!post.ai_title) {
      try {
        const seoRes = await fetch(`${supabaseUrl}/functions/v1/generate-seo`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${supabaseKey}`,
          },
          body: JSON.stringify({
            category: content?.category_id || "General",
            originalTitle: content?.title,
            platform,
            tags: [],
          }),
        });
        if (seoRes.ok) {
          const seoData = await seoRes.json();
          title = seoData.title || title;
          description = seoData.description || description;
        }
      } catch (e) {
        console.error("SEO generation failed, using original:", e);
      }
    }

    let platformPostId = null;
    let uploadError = null;

    // 2. Platform-specific upload
    try {
      switch (platform) {
        case "youtube":
          platformPostId = await uploadToYouTube(accessToken, content, title, description);
          break;
        case "facebook":
          platformPostId = await uploadToFacebook(
            accessToken,
            post.social_accounts.platform_account_id,
            content,
            title,
            description
          );
          break;
        case "instagram":
          platformPostId = await uploadToInstagram(
            accessToken,
            post.social_accounts.platform_account_id,
            content,
            title,
            description
          );
          break;
        case "tiktok":
          platformPostId = await uploadToTikTok(accessToken, content, title, description);
          break;
        default:
          throw new Error(`Unsupported platform: ${platform}`);
      }
    } catch (e) {
      uploadError = e.message;
    }

    // 3. Update post status
    if (uploadError) {
      await supabase
        .from("scheduled_posts")
        .update({
          status: "failed",
          error_message: uploadError,
          retry_count: (post.retry_count || 0) + 1,
          ai_title: title,
          ai_description: description,
        })
        .eq("id", scheduled_post_id);

      // Notify user of failure
      await supabase.rpc("create_notification", {
        _user_id: post.user_id,
        _type: "upload_failed",
        _title: "Upload Failed",
        _message: `Failed to upload "${title}" to ${platform}: ${uploadError}`,
        _metadata: { post_id: scheduled_post_id, platform },
      });
    } else {
      await supabase
        .from("scheduled_posts")
        .update({
          status: "posted",
          platform_post_id: platformPostId,
          completed_at: new Date().toISOString(),
          ai_title: title,
          ai_description: description,
        })
        .eq("id", scheduled_post_id);

      // Increment uploads_used
      await supabase.rpc("increment_uploads_used", { _user_id: post.user_id });

      // Notify user of success
      await supabase.rpc("create_notification", {
        _user_id: post.user_id,
        _type: "upload_complete",
        _title: "Video Uploaded! ✅",
        _message: `"${title}" was successfully posted to ${platform}.`,
        _metadata: { post_id: scheduled_post_id, platform, platform_post_id: platformPostId },
      });
    }

    // 4. Audit log
    await supabase.from("audit_logs").insert({
      actor_id: post.user_id,
      action: uploadError ? "upload_failed" : "upload_success",
      entity_type: "scheduled_post",
      entity_id: scheduled_post_id,
      details: {
        platform,
        title,
        error: uploadError || null,
        platform_post_id: platformPostId,
      },
    });

    return new Response(
      JSON.stringify({
        success: !uploadError,
        platform_post_id: platformPostId,
        error: uploadError,
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

// ────────────────────────────────────────────────────────────
// Platform Upload Implementations
// ────────────────────────────────────────────────────────────

async function uploadToYouTube(
  accessToken: string,
  content: any,
  title: string,
  description: string
): Promise<string> {
  // YouTube Data API v3 — videos.insert
  // For resumable uploads: POST https://www.googleapis.com/upload/youtube/v3/videos
  const videoUrl = content?.video_url || content?.file_url;
  if (!videoUrl) throw new Error("No video URL available for YouTube upload");

  // Step 1: Initialize resumable upload
  const initRes = await fetch(
    "https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        snippet: {
          title,
          description,
          categoryId: "22", // People & Blogs
        },
        status: {
          privacyStatus: "public",
          selfDeclaredMadeForKids: false,
        },
      }),
    }
  );

  if (!initRes.ok) {
    const errText = await initRes.text();
    throw new Error(`YouTube init failed: ${initRes.status} ${errText}`);
  }

  const uploadUrl = initRes.headers.get("location");
  if (!uploadUrl) throw new Error("YouTube did not return upload URL");

  // Step 2: Download the video from source URL
  const videoRes = await fetch(videoUrl);
  if (!videoRes.ok) throw new Error(`Failed to download video from ${videoUrl}`);
  const videoBlob = await videoRes.blob();

  // Step 3: Upload the video
  const uploadRes = await fetch(uploadUrl, {
    method: "PUT",
    headers: {
      "Content-Type": videoBlob.type || "video/mp4",
    },
    body: videoBlob,
  });

  if (!uploadRes.ok) {
    const errText = await uploadRes.text();
    throw new Error(`YouTube upload failed: ${uploadRes.status} ${errText}`);
  }

  const result = await uploadRes.json();
  return result.id; // YouTube video ID
}

async function uploadToFacebook(
  accessToken: string,
  pageId: string | null,
  content: any,
  title: string,
  description: string
): Promise<string> {
  if (!pageId) throw new Error("Facebook Page ID is required");
  const videoUrl = content?.video_url || content?.file_url;
  if (!videoUrl) throw new Error("No video URL available for Facebook upload");

  // Facebook Graph API — POST /{page-id}/videos
  const res = await fetch(
    `https://graph.facebook.com/v18.0/${pageId}/videos`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        access_token: accessToken,
        file_url: videoUrl,
        title,
        description,
      }),
    }
  );

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Facebook upload failed: ${res.status} ${errText}`);
  }

  const result = await res.json();
  return result.id;
}

async function uploadToInstagram(
  accessToken: string,
  igUserId: string | null,
  content: any,
  title: string,
  description: string
): Promise<string> {
  if (!igUserId) throw new Error("Instagram User ID is required");
  const videoUrl = content?.video_url || content?.file_url;
  if (!videoUrl) throw new Error("No video URL available for Instagram upload");

  // Step 1: Create media container
  const containerRes = await fetch(
    `https://graph.facebook.com/v18.0/${igUserId}/media`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        access_token: accessToken,
        media_type: "VIDEO",
        video_url: videoUrl,
        caption: `${title}\n\n${description}`,
      }),
    }
  );

  if (!containerRes.ok) {
    const errText = await containerRes.text();
    throw new Error(`Instagram container creation failed: ${containerRes.status} ${errText}`);
  }

  const { id: containerId } = await containerRes.json();

  // Step 2: Wait for processing (poll status)
  let status = "IN_PROGRESS";
  let attempts = 0;
  while (status === "IN_PROGRESS" && attempts < 30) {
    await new Promise((r) => setTimeout(r, 5000));
    const statusRes = await fetch(
      `https://graph.facebook.com/v18.0/${containerId}?fields=status_code&access_token=${accessToken}`
    );
    const statusData = await statusRes.json();
    status = statusData.status_code || "FINISHED";
    attempts++;
    if (statusData.status_code === "ERROR") {
      throw new Error("Instagram video processing failed");
    }
  }

  // Step 3: Publish
  const publishRes = await fetch(
    `https://graph.facebook.com/v18.0/${igUserId}/media_publish`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        access_token: accessToken,
        creation_id: containerId,
      }),
    }
  );

  if (!publishRes.ok) {
    const errText = await publishRes.text();
    throw new Error(`Instagram publish failed: ${publishRes.status} ${errText}`);
  }

  const publishData = await publishRes.json();
  return publishData.id;
}

async function uploadToTikTok(
  accessToken: string,
  content: any,
  title: string,
  description: string
): Promise<string> {
  const videoUrl = content?.video_url || content?.file_url;
  if (!videoUrl) throw new Error("No video URL available for TikTok upload");

  // TikTok Content Posting API — PULL_FROM_URL method
  // Step 1: Initialize upload
  const initRes = await fetch(
    "https://open.tiktokapis.com/v2/post/publish/video/init/",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json; charset=UTF-8",
      },
      body: JSON.stringify({
        post_info: {
          title: title.substring(0, 150),
          description: description.substring(0, 150),
          privacy_level: "PUBLIC_TO_EVERYONE",
          disable_duet: false,
          disable_comment: false,
          disable_stitch: false,
        },
        source_info: {
          source: "PULL_FROM_URL",
          video_url: videoUrl,
        },
      }),
    }
  );

  if (!initRes.ok) {
    const errText = await initRes.text();
    throw new Error(`TikTok init failed: ${initRes.status} ${errText}`);
  }

  const initData = await initRes.json();
  const publishId = initData.data?.publish_id;
  if (!publishId) throw new Error("TikTok did not return publish_id");

  // Step 2: Poll status
  let postStatus = "PROCESSING_UPLOAD";
  let attempts = 0;
  while (
    (postStatus === "PROCESSING_UPLOAD" || postStatus === "PROCESSING_DOWNLOAD") &&
    attempts < 30
  ) {
    await new Promise((r) => setTimeout(r, 5000));
    const statusRes = await fetch(
      "https://open.tiktokapis.com/v2/post/publish/status/fetch/",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ publish_id: publishId }),
      }
    );

    if (statusRes.ok) {
      const statusData = await statusRes.json();
      postStatus = statusData.data?.status || "FAILED";
      if (postStatus === "PUBLISH_COMPLETE") {
        return publishId;
      }
    }
    attempts++;
  }

  if (postStatus !== "PUBLISH_COMPLETE") {
    throw new Error(`TikTok upload status: ${postStatus}`);
  }

  return publishId;
}

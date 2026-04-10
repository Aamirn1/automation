import { z } from "zod";

// ── Auth ──────────────────────────────────────────────
export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters").max(128),
});

// ── Social Account ───────────────────────────────────
export const socialAccountSchema = z.object({
  platform: z.enum(["youtube", "facebook", "instagram", "tiktok"]),
  platform_username: z.string().min(1, "Username is required").max(200),
  access_token: z.string().optional(),
  api_key: z.string().optional(),
  platform_account_id: z.string().optional(),
});

// ── Content ──────────────────────────────────────────
export const contentItemSchema = z.object({
  title: z.string().min(1, "Title is required").max(500),
  description: z.string().max(5000).optional(),
  file_url: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  video_url: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  source_type: z.enum(["manual", "premade", "drive"]).default("manual"),
  category_id: z.string().uuid().optional().nullable(),
});

// ── Google Drive Link ────────────────────────────────
export const driveLinkSchema = z.object({
  drive_folder_url: z
    .string()
    .url("Must be a valid URL")
    .refine(
      (url) => url.includes("drive.google.com") || url.includes("docs.google.com"),
      "Must be a Google Drive URL"
    ),
  label: z.string().max(200).optional(),
});

// ── Schedule ─────────────────────────────────────────
export const schedulePostSchema = z.object({
  account_id: z.string().uuid("Please select an account"),
  content_id: z.string().uuid("Please select content"),
  scheduled_at: z.string().min(1, "Date/time is required"),
});

export const automationWizardSchema = z.object({
  content_source: z.enum(["premade", "drive"]),
  category_id: z.string().uuid().optional().nullable(),
  drive_link_id: z.string().uuid().optional().nullable(),
  account_ids: z.array(z.string().uuid()).min(1, "Select at least one account"),
  start_date: z.string().min(1, "Start date is required"),
  upload_times: z.array(z.string()).min(1, "Select at least one upload time"),
  uploads_per_day: z.number().min(1).max(2).default(1),
});

// ── Payment ──────────────────────────────────────────
export const paymentSchema = z.object({
  plan: z.enum(["test", "standard", "premium"]),
  payer_name: z.string().min(2, "Name is required").max(200),
  transaction_id: z.string().min(1, "Transaction ID is required").max(200),
  payment_method: z.enum(["bank_transfer", "easypaisa", "jazzcash", "other"]),
});

// ── Admin ────────────────────────────────────────────
export const contentCategorySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  description: z.string().max(500).optional(),
});

export const contentLibrarySchema = z.object({
  title: z.string().min(1, "Title is required").max(500),
  description: z.string().max(5000).optional(),
  video_url: z.string().url("Must be a valid URL"),
  thumbnail_url: z.string().url().optional().or(z.literal("")),
  category_id: z.string().uuid().optional().nullable(),
  tags: z.array(z.string()).default([]),
});

export const driveApprovalSchema = z.object({
  status: z.enum(["approved", "rejected"]),
  admin_note: z.string().max(1000).optional(),
});

// ── Profile ──────────────────────────────────────────
export const profileSchema = z.object({
  display_name: z.string().min(1).max(200),
  avatar_url: z.string().url().optional().or(z.literal("")),
});

export const passwordSchema = z.object({
  password: z.string().min(6, "Password must be at least 6 characters").max(128),
});

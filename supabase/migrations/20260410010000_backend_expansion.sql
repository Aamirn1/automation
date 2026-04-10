-- ============================================================
-- SocialPilot AI — Backend Schema Expansion
-- ============================================================

-- 1. CONTENT CATEGORIES (admin-managed)
CREATE TABLE public.content_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.content_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read categories"
  ON public.content_categories FOR SELECT USING (true);
CREATE POLICY "Admin can manage categories"
  ON public.content_categories FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- 2. CONTENT LIBRARY (admin-uploaded pre-made videos)
CREATE TABLE public.content_library (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  category_id UUID REFERENCES public.content_categories(id) ON DELETE SET NULL,
  tags TEXT[] DEFAULT '{}',
  duration_seconds INTEGER,
  is_active BOOLEAN NOT NULL DEFAULT true,
  usage_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.content_library ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active library items"
  ON public.content_library FOR SELECT USING (is_active = true OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin can manage library"
  ON public.content_library FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_content_library_updated_at
  BEFORE UPDATE ON public.content_library
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3. GOOGLE DRIVE LINKS (user-submitted, admin-approved)
CREATE TABLE public.google_drive_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  drive_folder_url TEXT NOT NULL,
  label TEXT,
  status TEXT NOT NULL DEFAULT 'pending',  -- pending | approved | rejected
  admin_note TEXT,
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  video_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.google_drive_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own drive links"
  ON public.google_drive_links FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create drive links"
  ON public.google_drive_links FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admin can view all drive links"
  ON public.google_drive_links FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin can update drive links"
  ON public.google_drive_links FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_drive_links_updated_at
  BEFORE UPDATE ON public.google_drive_links
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 4. AUDIT LOGS
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  actor_email TEXT,
  action TEXT NOT NULL,
  entity_type TEXT,     -- e.g. 'payment', 'user', 'schedule', 'content'
  entity_id TEXT,
  details JSONB DEFAULT '{}',
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can view audit logs"
  ON public.audit_logs FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "System can insert audit logs"
  ON public.audit_logs FOR INSERT WITH CHECK (true);

-- Index for fast querying
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_actor ON public.audit_logs(actor_id);
CREATE INDEX idx_audit_logs_entity ON public.audit_logs(entity_type, entity_id);

-- 5. NOTIFICATIONS
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,        -- payment_approved, upload_complete, content_low, subscription_expiring, etc.
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "System can insert notifications"
  ON public.notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin can manage all notifications"
  ON public.notifications FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_notifications_user_unread
  ON public.notifications(user_id, is_read) WHERE is_read = false;

-- ============================================================
-- 6. ALTER EXISTING TABLES — add missing columns
-- ============================================================

-- social_accounts: add token fields
ALTER TABLE public.social_accounts
  ADD COLUMN IF NOT EXISTS refresh_token TEXT,
  ADD COLUMN IF NOT EXISTS token_expires_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS platform_account_id TEXT,
  ADD COLUMN IF NOT EXISTS api_key TEXT;

-- content_items: add source tracking and AI fields
ALTER TABLE public.content_items
  ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES public.content_categories(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS source_type TEXT NOT NULL DEFAULT 'manual',  -- manual | premade | drive
  ADD COLUMN IF NOT EXISTS source_ref TEXT,     -- library item ID or drive link ID
  ADD COLUMN IF NOT EXISTS ai_title TEXT,
  ADD COLUMN IF NOT EXISTS ai_description TEXT,
  ADD COLUMN IF NOT EXISTS video_url TEXT;       -- resolved URL for actual upload

-- scheduled_posts: add platform tracking and error fields
ALTER TABLE public.scheduled_posts
  ADD COLUMN IF NOT EXISTS platform_post_id TEXT,
  ADD COLUMN IF NOT EXISTS error_message TEXT,
  ADD COLUMN IF NOT EXISTS retry_count INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS ai_title TEXT,
  ADD COLUMN IF NOT EXISTS ai_description TEXT,
  ADD COLUMN IF NOT EXISTS started_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;

-- subscriptions: add plan limits
ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS max_accounts INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS max_uploads_per_day INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS total_uploads_allowed INTEGER NOT NULL DEFAULT 5,
  ADD COLUMN IF NOT EXISTS uploads_used INTEGER NOT NULL DEFAULT 0;

-- payment_requests: add screenshot support
ALTER TABLE public.payment_requests
  ADD COLUMN IF NOT EXISTS screenshot_url TEXT;

-- ============================================================
-- 7. INDEXES for performance
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_scheduled_posts_status_time
  ON public.scheduled_posts(status, scheduled_at)
  WHERE status = 'scheduled';

CREATE INDEX IF NOT EXISTS idx_scheduled_posts_user
  ON public.scheduled_posts(user_id, scheduled_at DESC);

CREATE INDEX IF NOT EXISTS idx_content_items_user_source
  ON public.content_items(user_id, source_type);

CREATE INDEX IF NOT EXISTS idx_social_accounts_user_platform
  ON public.social_accounts(user_id, platform);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_status
  ON public.subscriptions(user_id, status);

CREATE INDEX IF NOT EXISTS idx_drive_links_status
  ON public.google_drive_links(status)
  WHERE status = 'pending';

-- ============================================================
-- 8. Helper function: log an audit event
-- ============================================================

CREATE OR REPLACE FUNCTION public.log_audit(
  _actor_id UUID,
  _action TEXT,
  _entity_type TEXT DEFAULT NULL,
  _entity_id TEXT DEFAULT NULL,
  _details JSONB DEFAULT '{}'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _email TEXT;
BEGIN
  SELECT email INTO _email FROM public.profiles WHERE user_id = _actor_id LIMIT 1;
  INSERT INTO public.audit_logs (actor_id, actor_email, action, entity_type, entity_id, details)
  VALUES (_actor_id, _email, _action, _entity_type, _entity_id, _details);
END;
$$;

-- ============================================================
-- 9. Helper function: create a notification
-- ============================================================

CREATE OR REPLACE FUNCTION public.create_notification(
  _user_id UUID,
  _type TEXT,
  _title TEXT,
  _message TEXT,
  _metadata JSONB DEFAULT '{}'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _id UUID;
BEGIN
  INSERT INTO public.notifications (user_id, type, title, message, metadata)
  VALUES (_user_id, _type, _title, _message, _metadata)
  RETURNING id INTO _id;
  RETURN _id;
END;
$$;

-- ============================================================
-- 10. Update subscription on payment approval (trigger)
-- ============================================================

CREATE OR REPLACE FUNCTION public.on_payment_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _duration INTEGER;
  _max_accts INTEGER;
  _max_uploads INTEGER;
  _total INTEGER;
BEGIN
  -- Only fire when status changes to 'approved'
  IF NEW.status = 'approved' AND (OLD.status IS NULL OR OLD.status != 'approved') THEN
    -- Determine plan limits
    CASE NEW.plan
      WHEN 'test' THEN
        _duration := 5; _max_accts := 1; _max_uploads := 1; _total := 5;
      WHEN 'standard' THEN
        _duration := 30; _max_accts := 3; _max_uploads := 1; _total := 30;
      WHEN 'premium' THEN
        _duration := 30; _max_accts := 4; _max_uploads := 2; _total := 60;
      ELSE
        _duration := 5; _max_accts := 1; _max_uploads := 1; _total := 5;
    END CASE;

    -- Activate subscription
    UPDATE public.subscriptions SET
      plan = NEW.plan,
      status = 'active',
      starts_at = now(),
      expires_at = now() + (_duration || ' days')::INTERVAL,
      max_accounts = _max_accts,
      max_uploads_per_day = _max_uploads,
      total_uploads_allowed = _total,
      uploads_used = 0
    WHERE user_id = NEW.user_id;

    -- Notify user
    PERFORM public.create_notification(
      NEW.user_id,
      'payment_approved',
      'Payment Approved! 🎉',
      'Your ' || NEW.plan || ' plan is now active. You can start uploading videos!',
      jsonb_build_object('plan', NEW.plan, 'amount', NEW.amount)
    );

    -- Audit log
    PERFORM public.log_audit(
      auth.uid(),
      'payment_approved',
      'payment',
      NEW.id::TEXT,
      jsonb_build_object('plan', NEW.plan, 'amount', NEW.amount, 'user_id', NEW.user_id)
    );

  ELSIF NEW.status = 'rejected' AND (OLD.status IS NULL OR OLD.status != 'rejected') THEN
    PERFORM public.create_notification(
      NEW.user_id,
      'payment_rejected',
      'Payment Not Approved',
      COALESCE('Reason: ' || NEW.admin_note, 'Your payment was not approved. Please contact support.'),
      jsonb_build_object('plan', NEW.plan, 'amount', NEW.amount)
    );

    PERFORM public.log_audit(
      auth.uid(),
      'payment_rejected',
      'payment',
      NEW.id::TEXT,
      jsonb_build_object('plan', NEW.plan, 'user_id', NEW.user_id)
    );
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_payment_status_change_trigger
  AFTER UPDATE OF status ON public.payment_requests
  FOR EACH ROW EXECUTE FUNCTION public.on_payment_status_change();

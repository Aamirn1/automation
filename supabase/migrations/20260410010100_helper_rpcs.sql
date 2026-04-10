-- Helper RPCs used by Edge Functions

-- Increment uploads_used on a user's subscription
CREATE OR REPLACE FUNCTION public.increment_uploads_used(_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.subscriptions
  SET uploads_used = uploads_used + 1
  WHERE user_id = _user_id AND status = 'active';
END;
$$;

-- Increment usage_count on a content library item
CREATE OR REPLACE FUNCTION public.increment_usage_count(_item_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.content_library
  SET usage_count = usage_count + 1
  WHERE id = _item_id;
END;
$$;


-- Allow insert on profiles (for signup trigger and user self-insert)
CREATE POLICY "Allow insert profiles"
  ON public.profiles FOR INSERT
  WITH CHECK (true);

-- Allow insert on subscriptions (for signup trigger)
CREATE POLICY "Allow insert subscriptions"
  ON public.subscriptions FOR INSERT
  WITH CHECK (true);

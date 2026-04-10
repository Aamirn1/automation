import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let mounted = true;

    const checkAdmin = async (userId: string) => {
      const { data } = await supabase.rpc('has_role', {
        _user_id: userId,
        _role: 'admin',
      });
      if (mounted) setIsAdmin(!!data);
    };

    // Set up listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      setUser(session?.user ?? null);
      if (session?.user) {
        // Fire and forget — don't await inside callback
        checkAdmin(session.user.id);
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    });

    // Then get current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      setUser(session?.user ?? null);
      if (session?.user) {
        checkAdmin(session.user.id);
      }
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return { user, loading, isAdmin };
}

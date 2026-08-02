import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";

export type Profile = {
  id: string;
  name: string;
  whatsapp: string;
  birthday: string | null;
  avatar_url: string | null;
};

export function useProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data } = await supabase
      .from("profiles")
      .select("id, name, whatsapp, birthday, avatar_url")
      .eq("id", user.id)
      .single();
    setProfile((data as Profile) ?? null);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { profile, loading, refetch };
}

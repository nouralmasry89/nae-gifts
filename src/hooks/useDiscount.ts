import { useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";

export function useDiscount() {
  const { user } = useAuth();
  const { profile, refetch } = useProfile();

  const active = !!profile && profile.has_discount && !profile.discount_used;

  const markDiscountUsed = useCallback(async () => {
    if (!user || !active) return;
    await supabase.from("profiles").update({ discount_used: true }).eq("id", user.id);
    await refetch();
  }, [user, active, refetch]);

  return { active, markDiscountUsed };
}

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";

export type AppNotification = {
  id: string;
  title: string;
  body: string;
  url: string | null;
  created_at: string;
};

export function useNotificationsInbox() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      setLoading(false);
      return;
    }
    setLoading(true);

    const [{ data: notifs }, { data: profileRow }] = await Promise.all([
      supabase.from("notifications").select("*").order("created_at", { ascending: false }).limit(30),
      supabase.from("profiles").select("notifications_read_at").eq("id", user.id).single(),
    ]);

    const list = (notifs as AppNotification[]) ?? [];
    setNotifications(list);

    const readAt = profileRow?.notifications_read_at
      ? new Date(profileRow.notifications_read_at as string).getTime()
      : 0;
    const unread = list.filter((n) => new Date(n.created_at).getTime() > readAt).length;
    setUnreadCount(unread);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  const markAllRead = useCallback(async () => {
    if (!user) return;
    setUnreadCount(0);
    await supabase
      .from("profiles")
      .update({ notifications_read_at: new Date().toISOString() })
      .eq("id", user.id);
  }, [user]);

  return { notifications, unreadCount, loading, markAllRead, reload: load };
}

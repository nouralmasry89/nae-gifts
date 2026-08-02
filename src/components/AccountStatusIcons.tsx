import { useNavigate } from "@tanstack/react-router";
import { User, UserCheck, Bell, BellRing } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNotificationStatus } from "@/hooks/useNotificationStatus";
import { supabase } from "@/lib/supabase";
import { enablePushNotifications } from "@/lib/push-client";

export function AccountStatusIcons() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const enabled = useNotificationStatus();

  const handleUserClick = () => {
    if (user) {
      supabase.auth.signOut();
    } else {
      navigate({ to: "/login" });
    }
  };

  const handleBellClick = async () => {
    if (!user) {
      navigate({ to: "/signup" });
      return;
    }
    if (!enabled) {
      await enablePushNotifications();
    }
  };

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={handleUserClick}
        aria-label={user ? "تسجيل الخروج" : "تسجيل الدخول"}
        title={user ? "تسجيل الخروج" : "تسجيل الدخول"}
        className={user ? "text-primary" : "text-muted-foreground hover:text-primary"}
      >
        {user ? <UserCheck className="h-5 w-5" /> : <User className="h-5 w-5" />}
      </button>
      <button
        onClick={handleBellClick}
        aria-label="الإشعارات"
        title={enabled ? "الإشعارات مفعّلة" : "تفعيل الإشعارات"}
        className={enabled ? "text-primary" : "text-muted-foreground hover:text-primary"}
      >
        {enabled ? <BellRing className="h-5 w-5" /> : <Bell className="h-5 w-5" />}
      </button>
    </div>
  );
}

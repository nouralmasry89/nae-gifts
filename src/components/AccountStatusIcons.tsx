import { useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { User, Bell } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useNotificationStatus } from "@/hooks/useNotificationStatus";
import { useNotificationsInbox } from "@/hooks/useNotificationsInbox";
import { enablePushNotifications } from "@/lib/push-client";

function timeAgo(dateStr: string): string {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "الآن";
  if (mins < 60) return `منذ ${mins} دقيقة`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `منذ ${hours} ساعة`;
  const days = Math.floor(hours / 24);
  return `منذ ${days} يوم`;
}

export function AccountStatusIcons() {
  const { user } = useAuth();
  const { profile } = useProfile();
  const navigate = useNavigate();
  const pushEnabled = useNotificationStatus();
  const { notifications, unreadCount, markAllRead } = useNotificationsInbox();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [open]);

  const handleUserClick = () => {
    navigate({ to: user ? "/account" : "/login" });
  };

  const handleBellClick = async () => {
    if (!user) {
      navigate({ to: "/signup" });
      return;
    }
    if (!pushEnabled) {
      await enablePushNotifications();
    }
    const willOpen = !open;
    setOpen(willOpen);
    if (willOpen) {
      await markAllRead();
    }
  };

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={handleUserClick}
        aria-label={user ? "صفحتي الشخصية" : "تسجيل الدخول"}
        title={user ? "صفحتي الشخصية" : "تسجيل الدخول"}
        className="overflow-hidden rounded-full"
      >
        {profile?.avatar_url ? (
          <img src={profile.avatar_url} alt="" className="h-7 w-7 rounded-full object-cover" />
        ) : (
          <User className={`h-5 w-5 ${user ? "text-primary" : "text-muted-foreground hover:text-primary"}`} />
        )}
      </button>

      <div className="relative" ref={containerRef}>
        <button
          onClick={handleBellClick}
          aria-label="الإشعارات"
          className={`relative ${pushEnabled ? "text-primary" : "text-muted-foreground hover:text-primary"}`}
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>

        {open && (
          <div
            className="absolute left-0 top-full z-50 mt-2 w-72 rounded-xl border border-border bg-card shadow-lg"
            dir="rtl"
          >
            <div className="border-b border-border px-4 py-2 text-sm font-bold">الإشعارات</div>
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <p className="px-4 py-6 text-center text-sm text-muted-foreground">لا توجد إشعارات بعد</p>
              ) : (
                notifications.map((n) => (
                  <div key={n.id} className="border-b border-border px-4 py-3 last:border-0">
                    <div className="text-sm font-bold">{n.title}</div>
                    <div className="mt-0.5 text-xs text-muted-foreground">{n.body}</div>
                    <div className="mt-1 text-[10px] text-muted-foreground">{timeAgo(n.created_at)}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

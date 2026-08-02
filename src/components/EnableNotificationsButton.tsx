import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Bell } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNotificationStatus } from "@/hooks/useNotificationStatus";
import { enablePushNotifications } from "@/lib/push-client";

export function EnableNotificationsButton() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const enabled = useNotificationStatus();
  const [status, setStatus] = useState<{ ok: boolean; message: string } | null>(null);
  const [loading, setLoading] = useState(false);

  // لسه بيتحقق من حالة تسجيل الدخول، أو المستخدم مسجّل ومفعّل الإشعارات بالفعل — لا داعي للزر
  if (authLoading) return null;
  if (user && enabled) return null;

  const handleClick = async () => {
    if (!user) {
      navigate({ to: "/signup" });
      return;
    }
    setLoading(true);
    const result = await enablePushNotifications();
    setStatus(result);
    setLoading(false);
  };

  const label = !user
    ? "قم بتسجيل الدخول للحصول على آخر العروض و الاستفادة من الحسومات"
    : "قم بتفعيل الإشعارات للحصول على آخر العروض و الاستفادة من الحسومات";

  return (
    <div className="mx-auto max-w-md px-4 py-4 text-center">
      <button
        onClick={handleClick}
        disabled={loading}
        className="inline-flex items-center gap-2 rounded-lg border border-primary/40 bg-primary/10 px-5 py-2.5 text-sm font-bold text-primary transition hover:bg-primary/20 disabled:opacity-60"
      >
        <Bell className="h-4 w-4" />
        {loading ? "جارٍ التفعيل..." : label}
      </button>
      {status && !status.ok && (
        <p className="mt-2 text-sm text-destructive">{status.message}</p>
      )}
    </div>
  );
    }

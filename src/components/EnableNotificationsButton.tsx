import { useState } from "react";
import { Bell } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { enablePushNotifications } from "@/lib/push-client";

export function EnableNotificationsButton() {
  const { user } = useAuth();
  const [status, setStatus] = useState<{ ok: boolean; message: string } | null>(null);
  const [loading, setLoading] = useState(false);

  if (!user) return null;

  const handleClick = async () => {
    setLoading(true);
    const result = await enablePushNotifications();
    setStatus(result);
    setLoading(false);
  };

  return (
    <div className="mx-auto max-w-md px-4 py-4 text-center">
      <button
        onClick={handleClick}
        disabled={loading}
        className="inline-flex items-center gap-2 rounded-lg border border-primary/40 bg-primary/10 px-5 py-2.5 text-sm font-bold text-primary transition hover:bg-primary/20 disabled:opacity-60"
      >
        <Bell className="h-4 w-4" />
        {loading ? "جارٍ التفعيل..." : "فعّل الإشعارات لتصلك عروضنا الخاصة"}
      </button>
      {status && (
        <p className={`mt-2 text-sm ${status.ok ? "text-primary" : "text-destructive"}`}>
          {status.message}
        </p>
      )}
    </div>
  );
}

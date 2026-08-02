import { useEffect, useState } from "react";

/**
 * يتحقق هل يوجد اشتراك فعلي وفعّال بإشعارات المتصفح (Push) للجهاز الحالي.
 * يعيد فحص الحالة كل بضع ثوانٍ حتى ينعكس أي تغيير (تفعيل/إلغاء) على الفور في الواجهة.
 */
export function useNotificationStatus(): boolean {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function check() {
      if (typeof window === "undefined") return;
      if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;
      try {
        const reg = await navigator.serviceWorker.getRegistration("/sw.js");
        if (!reg) {
          if (mounted) setEnabled(false);
          return;
        }
        const sub = await reg.pushManager.getSubscription();
        if (mounted) setEnabled(!!sub && Notification.permission === "granted");
      } catch {
        if (mounted) setEnabled(false);
      }
    }

    check();
    const interval = setInterval(check, 3000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  return enabled;
}

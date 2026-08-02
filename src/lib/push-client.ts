import { supabase } from "@/lib/supabase";

// المفتاح العام (Public Key) آمن أن يكون داخل كود المتصفح — هذه طبيعة عمله.
export const VAPID_PUBLIC_KEY =
  "BEQu9ENcoBT93NcwuFJDP0CP-8X6w0K_f8scmjyFClAAaup45U8-OsrPnD2SP7W2HNbGMBOTxFKUaQuqcFFJ-cY";

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export async function enablePushNotifications(): Promise<{ ok: boolean; message: string }> {
  if (typeof window === "undefined") return { ok: false, message: "" };

  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    return { ok: false, message: "متصفحك الحالي لا يدعم إشعارات الويب." };
  }

  const { data: sessionData } = await supabase.auth.getSession();
  const user = sessionData.session?.user;
  if (!user) {
    return { ok: false, message: "يجب تسجيل الدخول أولاً لتفعيل الإشعارات." };
  }

  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    return { ok: false, message: "تم رفض إذن الإشعارات من إعدادات المتصفح." };
  }

  const registration = await navigator.serviceWorker.register("/sw.js");
  await navigator.serviceWorker.ready;

  let subscription = await registration.pushManager.getSubscription();
  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY) as BufferSource,
    });
  }

  const json = subscription.toJSON();
  const { error } = await supabase.from("push_subscriptions").upsert(
    {
      user_id: user.id,
      endpoint: json.endpoint,
      p256dh: json.keys?.p256dh,
      auth: json.keys?.auth,
    },
    { onConflict: "endpoint" }
  );

  if (error) {
    return { ok: false, message: "تم التفعيل لكن حدث خطأ أثناء الحفظ: " + error.message };
  }

  return { ok: true, message: "تم تفعيل الإشعارات بنجاح! ستصلك عروضنا القادمة 🎉" };
}

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import webpush from "web-push";
import { getSupabaseAdmin } from "@/lib/supabase.server";

const VAPID_PUBLIC_KEY =
  "BEQu9ENcoBT93NcwuFJDP0CP-8X6w0K_f8scmjyFClAAaup45U8-OsrPnD2SP7W2HNbGMBOTxFKUaQuqcFFJ-cY";

export const grantWelcomeDiscount = createServerFn({ method: "POST" })
  .inputValidator(z.object({ userId: z.string() }))
  .handler(async ({ data }) => {
    const supabaseAdmin = getSupabaseAdmin();

    const { data: profileRow } = await supabaseAdmin
      .from("profiles")
      .select("has_discount, discount_used")
      .eq("id", data.userId)
      .single();

    // لو المستخدم أخذ هذا الحسم من قبل (فعّال حالياً أو استخدمه سابقاً) لا نكرر الإرسال
    if (profileRow?.has_discount || profileRow?.discount_used) {
      return { granted: false };
    }

    await supabaseAdmin.from("profiles").update({ has_discount: true }).eq("id", data.userId);

    const title = "أهلاً وسهلاً بك في ناي للهدايا 🎁";
    const body = "لقد حصلت على خصم 10% على أي منتج تختاره، لمرة واحدة!";

    // إشعار خاص يظهر فقط لهذا المستخدم داخل الموقع (جدول notifications بحقل user_id)
    await supabaseAdmin.from("notifications").insert({
      title,
      body,
      user_id: data.userId,
    });

    // إشعار فعلي على جهاز المستخدم (لو كان مفعّلاً إشعارات المتصفح)
    const privateKey = process.env.VAPID_PRIVATE_KEY;
    if (privateKey) {
      webpush.setVapidDetails("mailto:contact@nae-gifts.com", VAPID_PUBLIC_KEY, privateKey);
      const { data: subs } = await supabaseAdmin
        .from("push_subscriptions")
        .select("*")
        .eq("user_id", data.userId);

      for (const sub of subs ?? []) {
        try {
          await webpush.sendNotification(
            {
              endpoint: sub.endpoint as string,
              keys: { p256dh: sub.p256dh as string, auth: sub.auth as string },
            },
            JSON.stringify({ title, body, url: "/" })
          );
        } catch {
          // نتجاهل الخطأ هنا؛ الإشعار داخل الموقع كافٍ كبديل لو فشل push
        }
      }
    }

    return { granted: true };
  });

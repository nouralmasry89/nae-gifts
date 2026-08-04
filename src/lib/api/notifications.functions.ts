import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import webpush from "web-push";
import { getSupabaseAdmin } from "@/lib/supabase.server";

const VAPID_PUBLIC_KEY =
  "BEQu9ENcoBT93NcwuFJDP0CP-8X6w0K_f8scmjyFClAAaup45U8-OsrPnD2SP7W2HNbGMBOTxFKUaQuqcFFJ-cY";

export const sendNotification = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      password: z.string(),
      title: z.string().min(1),
      body: z.string().min(1),
      url: z.string().optional(),
      targetWhatsapp: z.string().optional(), // فارغ = للجميع، وإلا لمستخدم محدد فقط
    })
  )
  .handler(async ({ data }) => {
    const adminPassword = process.env.ADMIN_NOTIFY_PASSWORD;
    if (!adminPassword || data.password !== adminPassword) {
      throw new Error("كلمة السر غير صحيحة.");
    }

    const privateKey = process.env.VAPID_PRIVATE_KEY;
    if (!privateKey) {
      throw new Error("VAPID_PRIVATE_KEY غير مضبوط في متغيرات البيئة على Vercel.");
    }

    webpush.setVapidDetails("mailto:contact@nae-gifts.com", VAPID_PUBLIC_KEY, privateKey);

    const supabaseAdmin = getSupabaseAdmin();

    const cleanTarget = data.targetWhatsapp?.replace(/\D/g, "") || "";
    let targetUserId: string | null = null;

    if (cleanTarget) {
      const { data: profileRow, error: profileErr } = await supabaseAdmin
        .from("profiles")
        .select("id")
        .eq("whatsapp", cleanTarget)
        .single();

      if (profileErr || !profileRow) {
        throw new Error("لا يوجد مستخدم مسجّل بهذا الرقم.");
      }
      targetUserId = profileRow.id as string;
    }

    // نسجّل الإشعار في قاعدة البيانات ليظهر داخل القائمة المنسدلة بالموقع.
    // user_id = null يعني إشعار عام يراه الجميع، وإلا يظهر فقط للمستخدم المحدد.
    await supabaseAdmin.from("notifications").insert({
      title: data.title,
      body: data.body,
      url: data.url || null,
      user_id: targetUserId,
    });

    let subsQuery = supabaseAdmin.from("push_subscriptions").select("*");
    if (targetUserId) {
      subsQuery = subsQuery.eq("user_id", targetUserId);
    }
    const { data: subs, error } = await subsQuery;
    if (error) throw new Error(error.message);

    let sent = 0;
    let failed = 0;

    for (const sub of subs ?? []) {
      const pushSubscription = {
        endpoint: sub.endpoint as string,
        keys: { p256dh: sub.p256dh as string, auth: sub.auth as string },
      };
      try {
        await webpush.sendNotification(
          pushSubscription,
          JSON.stringify({ title: data.title, body: data.body, url: data.url || "/" })
        );
        sent++;
      } catch (err: unknown) {
        failed++;
        const statusCode = (err as { statusCode?: number })?.statusCode;
        if (statusCode === 404 || statusCode === 410) {
          await supabaseAdmin.from("push_subscriptions").delete().eq("id", sub.id as string);
        }
      }
    }

    return { sent, failed, total: subs?.length ?? 0, targeted: !!targetUserId };
  });

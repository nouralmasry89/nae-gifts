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
    const { data: subs, error } = await supabaseAdmin.from("push_subscriptions").select("*");
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

    return { sent, failed, total: subs?.length ?? 0 };
  });

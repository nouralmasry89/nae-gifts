import { createClient } from "@supabase/supabase-js";

// هذا الملف يعمل على السيرفر فقط (لاحقة .server.ts تمنع Vite من إرساله للمتصفح).
// يستخدم مفتاح service_role الذي يتجاوز قواعد الحماية (RLS) ليقدر يقرأ
// كل الاشتراكات المخزّنة عند إرسال إشعار جماعي.
export function getSupabaseAdmin() {
  const url = "https://pvkvfejbvgvhwyjgugje.supabase.co";
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY غير مضبوط في متغيرات البيئة على Vercel."
    );
  }
  return createClient(url, serviceKey);
}

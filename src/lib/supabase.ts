import { createClient } from "@supabase/supabase-js";

export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

// Supabase Auth يحتاج بريد إلكتروني للتسجيل، فنحوّل رقم الواتساب
// (بعد تنظيفه من أي رموز غير رقمية) إلى بريد وهمي فريد لكل مستخدم.
// هذا لا يعني إرسال أي بريد فعلي — إنه فقط معرّف داخلي لنظام تسجيل الدخول.
export const whatsappToEmail = (whatsapp: string): string => {
  const digits = whatsapp.replace(/\D/g, "");
  return `${digits}@nae-gifts.local`;
};

export const normalizeWhatsapp = (whatsapp: string): string =>
  whatsapp.replace(/\D/g, "");

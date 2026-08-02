import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://pvkvfejbvgvhwyjgugje.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB2a3ZmZWpidmd2aHd5amd1Z2plIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU1MDI3OTQsImV4cCI6MjEwMTA3ODc5NH0.B9go_zBl3sPzugap9XjAo8pJy2Tx1UZvNtuRy-vKC1A";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Supabase Auth يحتاج بريد إلكتروني للتسجيل، فنحوّل رقم الواتساب
// (بعد تنظيفه من أي رموز غير رقمية) إلى بريد وهمي فريد لكل مستخدم.
// هذا لا يعني إرسال أي بريد فعلي — إنه فقط معرّف داخلي لنظام تسجيل الدخول.
export const whatsappToEmail = (whatsapp: string): string => {
  const digits = whatsapp.replace(/\D/g, "");
  return `${digits}@nae-gifts.local`;
};

export const normalizeWhatsapp = (whatsapp: string): string => whatsapp.replace(/\D/g, "");

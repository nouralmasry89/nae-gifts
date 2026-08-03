import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { UserPlus } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { WhatsAppFloat } from "@/components/WhatsAppFloat";
import { supabase, whatsappToEmail, normalizeWhatsapp } from "@/lib/supabase";
import { enablePushNotifications } from "@/lib/push-client";
import { grantWelcomeDiscount } from "@/lib/api/welcome-discount.functions";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "إنشاء حساب — N.A.E Gifts Store" },
      { name: "description", content: "أنشئ حسابك للحصول على عروض وحسومات خاصة." },
    ],
  }),
  component: SignupPage,
});

function SignupPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [password, setPassword] = useState("");
  const [birthday, setBirthday] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const cleanWhatsapp = normalizeWhatsapp(whatsapp);
    if (!name.trim() || cleanWhatsapp.length < 8 || password.length < 6) {
      setError("يرجى تعبئة كل الحقول: الاسم، رقم واتساب صحيح، وكلمة سر لا تقل عن 6 أحرف.");
      return;
    }

    setLoading(true);
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: whatsappToEmail(cleanWhatsapp),
      password,
    });

    if (signUpError) {
      setLoading(false);
      if (signUpError.message.toLowerCase().includes("already registered") || signUpError.message.includes("already")) {
        setError("رقم الواتساب هذا مسجّل مسبقاً. جرّب تسجيل الدخول بدلاً من ذلك.");
      } else {
        setError("حدث خطأ أثناء إنشاء الحساب: " + signUpError.message);
      }
      return;
    }

    if (data.user) {
      const { error: profileError } = await supabase.from("profiles").insert({
        id: data.user.id,
        name: name.trim(),
        whatsapp: cleanWhatsapp,
        birthday: birthday || null,
        notifications_read_at: new Date().toISOString(),
      });
      if (profileError) {
        setLoading(false);
        setError("تم إنشاء الحساب لكن حدث خطأ في حفظ بياناتك: " + profileError.message);
        return;
      }
    }

    setLoading(false);
    // نحاول تفعيل الإشعارات تلقائيًا فور إنشاء الحساب. لو المتصفح رفض الإذن
    // (مثلاً على آيفون قديم) لا نوقف العملية — الزر سيظهر لاحقاً في الرئيسية كبديل.
    await enablePushNotifications().catch(() => {});
    if (data.user) {
      grantWelcomeDiscount({ data: { userId: data.user.id } }).catch(() => {});
    }
    navigate({ to: "/" });
  };

  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-md px-4 py-12">
        <div className="mb-6 text-center">
          <UserPlus className="mx-auto h-10 w-10 text-primary" />
          <h1 className="mt-3 text-2xl font-extrabold">إنشاء حساب جديد</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            سجّل الآن لتصلك عروضنا وحسوماتنا الخاصة
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-border bg-card p-5">
          <div>
            <label className="mb-2 block text-sm font-bold">الاسم الكامل</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="مثال: نور المصري"
              className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold">رقم الواتساب</label>
            <input
              type="tel"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              placeholder="مثال: 963982244635"
              dir="ltr"
              className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold">تاريخ الميلاد (اختياري)</label>
            <input
              type="date"
              value={birthday}
              onChange={(e) => setBirthday(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold">كلمة السر</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="6 أحرف على الأقل"
              className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
            />
          </div>

          {error && (
            <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-primary px-6 py-3 text-base font-bold text-primary-foreground transition hover:opacity-90 disabled:opacity-60"
          >
            {loading ? "جارٍ إنشاء الحساب..." : "إنشاء الحساب"}
          </button>

          <p className="text-center text-sm text-muted-foreground">
            لديك حساب بالفعل؟{" "}
            <Link to="/login" className="font-bold text-primary hover:underline">
              تسجيل الدخول
            </Link>
          </p>
        </form>
      </main>
      <Footer />
      <WhatsAppFloat />
    </div>
  );
}

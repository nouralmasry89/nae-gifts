import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { LogIn } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { WhatsAppFloat } from "@/components/WhatsAppFloat";
import { supabase, whatsappToEmail, normalizeWhatsapp } from "@/lib/supabase";
import { enablePushNotifications } from "@/lib/push-client";
import { grantWelcomeDiscount } from "@/lib/api/welcome-discount.functions";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "تسجيل الدخول — N.A.E Gifts Store" },
      { name: "description", content: "سجّل دخولك لحسابك في N.A.E Gifts Store." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [whatsapp, setWhatsapp] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const cleanWhatsapp = normalizeWhatsapp(whatsapp);
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: whatsappToEmail(cleanWhatsapp),
      password,
    });

    setLoading(false);
    if (signInError) {
      setError("رقم الواتساب أو كلمة السر غير صحيحة.");
      return;
    }
    await enablePushNotifications().catch(() => {});
    if (signInData.user) {
      grantWelcomeDiscount({ data: { userId: signInData.user.id } }).catch(() => {});
    }
    navigate({ to: "/" });
  };

  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-md px-4 py-12">
        <div className="mb-6 text-center">
          <LogIn className="mx-auto h-10 w-10 text-primary" />
          <h1 className="mt-3 text-2xl font-extrabold">تسجيل الدخول</h1>
          <p className="mt-1 text-sm text-muted-foreground">أهلاً بعودتك 👋</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-border bg-card p-5">
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
            <label className="mb-2 block text-sm font-bold">كلمة السر</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
            {loading ? "جارٍ الدخول..." : "تسجيل الدخول"}
          </button>

          <p className="text-center text-sm text-muted-foreground">
            ليس لديك حساب؟{" "}
            <Link to="/signup" className="font-bold text-primary hover:underline">
              إنشاء حساب جديد
            </Link>
          </p>
        </form>
      </main>
      <Footer />
      <WhatsAppFloat />
    </div>
  );
}

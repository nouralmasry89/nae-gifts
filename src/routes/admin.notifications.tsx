import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Send } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { sendNotification } from "@/lib/api/notifications.functions";

export const Route = createFileRoute("/admin/notifications")({
  head: () => ({
    meta: [{ title: "إرسال إشعار — N.A.E Gifts Store" }],
  }),
  component: AdminNotificationsPage,
});

function AdminNotificationsPage() {
  const [password, setPassword] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [url, setUrl] = useState("");
  const [targetWhatsapp, setTargetWhatsapp] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult("");
    try {
      const res = await sendNotification({
        data: {
          password,
          title,
          body,
          url: url || undefined,
          targetWhatsapp: targetWhatsapp.trim() || undefined,
        },
      });
      const scopeText = res.targeted ? "للمستخدم المحدد" : "لجميع المستخدمين";
      setResult(`تم الإرسال بنجاح ✅ (${scopeText}) — نجح: ${res.sent} / فشل: ${res.failed} / الإجمالي: ${res.total}`);
    } catch (err: unknown) {
      setResult("خطأ: " + (err instanceof Error ? err.message : "حدث خطأ غير متوقع"));
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-md px-4 py-12">
        <div className="mb-6 text-center">
          <Send className="mx-auto h-10 w-10 text-primary" />
          <h1 className="mt-3 text-2xl font-extrabold">إرسال إشعار</h1>
          <p className="mt-1 text-sm text-muted-foreground">هذه الصفحة لك فقط</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-border bg-card p-5">
          <div>
            <label className="mb-2 block text-sm font-bold">كلمة السر الإدارية</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold">
              رقم واتساب مستخدم محدد <span className="font-normal text-muted-foreground">(اختياري)</span>
            </label>
            <input
              type="tel"
              value={targetWhatsapp}
              onChange={(e) => setTargetWhatsapp(e.target.value)}
              placeholder="اتركه فارغاً للإرسال للجميع، أو اكتب رقم واتساب المستخدم"
              dir="ltr"
              className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              لو تركته فارغاً، سيصل الإشعار لكل المستخدمين المسجّلين.
            </p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold">عنوان الإشعار</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="مثال: عرض خاص لعيد ميلادك 🎉"
              className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold">نص الإشعار</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={3}
              placeholder="مثال: احصل على خصم 15% على طلبك القادم"
              className="w-full resize-none rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold">رابط عند الضغط (اختياري)</label>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="مثال: /category/rings"
              dir="ltr"
              className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
            />
          </div>

          {result && (
            <div className="rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm">{result}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-primary px-6 py-3 text-base font-bold text-primary-foreground transition hover:opacity-90 disabled:opacity-60"
          >
            {loading ? "جارٍ الإرسال..." : "إرسال الإشعار"}
          </button>
        </form>
      </main>
      <Footer />
    </div>
  );
}

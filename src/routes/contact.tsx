import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { MessageCircle, Facebook, Instagram, Phone } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { WhatsAppFloat } from "@/components/WhatsAppFloat";
import { FACEBOOK_URL, INSTAGRAM_URL, WHATSAPP_NUMBER, waLink } from "@/lib/categories";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "تواصل معنا — N.A.E Gifts Store" },
      { name: "description", content: "تواصل مع N.A.E Gifts Store عبر واتساب أو فيسبوك أو انستغرام لطلب هديتك المخصصة." },
      { property: "og:title", content: "تواصل معنا — N.A.E Gifts Store" },
      { property: "og:description", content: "اطلب هديتك المخصصة الآن." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");

  const send = (e: React.FormEvent) => {
    e.preventDefault();
    const text = `مرحباً، أنا ${name || "زائر"}\n${message}`;
    window.open(waLink(text), "_blank");
  };

  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-4xl px-4 py-12">
        <h1 className="text-3xl font-extrabold md:text-4xl">تواصل معنا</h1>
        <p className="mt-2 text-muted-foreground">يسعدنا تواصلك معنا في أي وقت — نرد عادةً خلال دقائق عبر واتساب.</p>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <a href={waLink()} target="_blank" rel="noopener noreferrer" className="group rounded-xl border border-border bg-card p-5 transition hover:border-primary">
            <MessageCircle className="h-7 w-7 text-primary" />
            <h3 className="mt-3 font-bold">واتساب</h3>
            <p className="mt-1 text-sm text-muted-foreground" dir="ltr">+{WHATSAPP_NUMBER}</p>
          </a>
          <a href={FACEBOOK_URL} target="_blank" rel="noopener noreferrer" className="group rounded-xl border border-border bg-card p-5 transition hover:border-primary">
            <Facebook className="h-7 w-7 text-primary" />
            <h3 className="mt-3 font-bold">فيسبوك</h3>
            <p className="mt-1 text-sm text-muted-foreground">N.A.E.2020</p>
          </a>
          <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="group rounded-xl border border-border bg-card p-5 transition hover:border-primary">
            <Instagram className="h-7 w-7 text-primary" />
            <h3 className="mt-3 font-bold">انستغرام</h3>
            <p className="mt-1 text-sm text-muted-foreground">n.a.e.gifts</p>
          </a>
        </div>

        <form onSubmit={send} className="mt-10 rounded-xl border border-border bg-card p-6">
          <h2 className="text-xl font-bold">أرسل لنا رسالة سريعة</h2>
          <p className="mt-1 text-sm text-muted-foreground">سيتم تحويل رسالتك إلى محادثة واتساب.</p>
          <div className="mt-5 grid gap-4">
            <div>
              <label className="mb-1 block text-sm">الاسم</label>
              <input value={name} onChange={(e) => setName(e.target.value)} type="text"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 outline-none focus:border-primary" />
            </div>
            <div>
              <label className="mb-1 block text-sm">رسالتك</label>
              <textarea required value={message} onChange={(e) => setMessage(e.target.value)} rows={4}
                placeholder="اكتب فكرة الهدية أو القسم الذي تريد الاستفسار عنه..."
                className="w-full rounded-lg border border-border bg-background px-3 py-2 outline-none focus:border-primary" />
            </div>
            <button type="submit" className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 font-semibold text-primary-foreground hover:opacity-90">
              <Phone className="h-4 w-4" /> إرسال عبر واتساب
            </button>
          </div>
        </form>
      </main>
      <Footer />
      <WhatsAppFloat />
    </div>
  );
}

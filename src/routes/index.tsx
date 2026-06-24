import { createFileRoute, Link } from "@tanstack/react-router";
import { MessageCircle } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { WhatsAppFloat } from "@/components/WhatsAppFloat";
import { CategoryCard } from "@/components/CategoryCard";
import { categories, waLink } from "@/lib/categories";
import logo from "@/assets/logo-nae.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "N.A.E Gifts Store — هدايا مخصصة وفريدة" },
      { name: "description", content: "متجر N.A.E للهدايا المصممة يدوياً والمخصصة حسب رغبتك: ستاندات محابس، صناديق مهر، باقات ورد، هدايا المناسبات." },
      { property: "og:title", content: "N.A.E Gifts Store — هدايا مخصصة وفريدة" },
      { property: "og:description", content: "هدايا مصممة خصيصاً لكل المناسبات." },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-border">
          <div className="absolute inset-0 bg-gradient-to-bl from-primary/20 via-transparent to-transparent" />
          <div className="relative mx-auto flex max-w-6xl flex-col items-center gap-6 px-4 py-16 text-center md:py-24">
            <img src={logo} alt="N.A.E Gifts Store" width={160} height={160} className="h-32 w-32 rounded-2xl object-cover shadow-2xl md:h-40 md:w-40" />
            <h1 className="text-3xl font-extrabold leading-tight md:text-5xl">
              هدايا <span className="text-primary">فريدة</span> ومصممة خصيصاً لك
            </h1>
            <p className="max-w-xl text-base text-muted-foreground md:text-lg">
              نصمم ونصنع الهدايا حسب رغبتك لكل المناسبات. اختر القسم المناسب وتواصل معنا عبر واتساب لطلب تصميمك الخاص.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <a href={waLink("مرحباً، أود طلب تصميم هدية مخصصة.")} target="_blank" rel="noopener noreferrer"
                 className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-semibold text-primary-foreground transition hover:opacity-90">
                <MessageCircle className="h-5 w-5" /> اطلب عبر واتساب
              </a>
              <a href="#categories" className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-6 py-3 font-semibold hover:border-primary">
                تصفح الأقسام
              </a>
            </div>
          </div>
        </section>


        {/* Categories */}
        <section id="categories" className="mx-auto max-w-6xl px-4 py-10">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-extrabold md:text-3xl">أقسامنا</h2>
              <p className="mt-1 text-sm text-muted-foreground">اختر القسم وتعرف على تصاميمنا.</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            {categories.map((c) => <CategoryCard key={c.slug} category={c} />)}
          </div>
        </section>

        {/* CTA */}
        <section className="mx-auto max-w-6xl px-4 py-12">
          <div className="rounded-2xl border border-border bg-gradient-to-bl from-primary/20 via-card to-card p-8 text-center">
            <h2 className="text-2xl font-extrabold md:text-3xl">عندك فكرة هدية مميزة؟</h2>
            <p className="mt-2 text-muted-foreground">راسلنا الآن وسنحوّل فكرتك إلى هدية لا تُنسى.</p>
            <div className="mt-5 flex flex-wrap justify-center gap-3">
              <a href={waLink()} target="_blank" rel="noopener noreferrer"
                 className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-semibold text-primary-foreground hover:opacity-90">
                <MessageCircle className="h-5 w-5" /> تواصل معنا الآن
              </a>
              <Link to="/contact" className="inline-flex items-center rounded-lg border border-border bg-card px-6 py-3 font-semibold hover:border-primary">
                طرق التواصل
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <WhatsAppFloat />
    </div>
  );
}

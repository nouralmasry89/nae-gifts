import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { MessageCircle, ArrowLeft } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { WhatsAppFloat } from "@/components/WhatsAppFloat";
import { CategoryCard } from "@/components/CategoryCard";
import { categories, getCategory, waLink } from "@/lib/categories";
import { getProducts, formatPrice } from "@/lib/products";
import { motherSubs } from "@/lib/motherSubs";
import { graduationSubs } from "@/lib/graduationSubs";
import { teacherSubs } from "@/lib/teacherSubs";
import { ramadanSubs } from "@/lib/ramadanSubs";
import { newbornSubs } from "@/lib/newbornSubs";

export const Route = createFileRoute("/category/$slug")({
  loader: ({ params }) => {
    const category = getCategory(params.slug);
    if (!category) throw notFound();
    return { category };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.category.name} — N.A.E Gifts Store` },
          { name: "description", content: loaderData.category.description },
          { property: "og:title", content: `${loaderData.category.name} — N.A.E Gifts Store` },
          { property: "og:description", content: loaderData.category.description },
          { property: "og:image", content: loaderData.category.image },
        ]
      : [],
  }),
  notFoundComponent: () => (
    <div className="min-h-screen">
      <Header />
      <div className="mx-auto max-w-6xl px-4 py-20 text-center">
        <h1 className="text-3xl font-bold">القسم غير موجود</h1>
        <Link to="/" className="mt-4 inline-block text-primary hover:underline">العودة للرئيسية</Link>
      </div>
      <Footer />
    </div>
  ),
  errorComponent: () => (
    <div className="mx-auto max-w-6xl px-4 py-20 text-center">
      <h1 className="text-2xl font-bold">حدث خطأ ما</h1>
    </div>
  ),
  component: CategoryPage,
});

function CategoryPage() {
  const { category } = Route.useLoaderData();
  const others = categories.filter((c) => c.slug !== category.slug).slice(0, 3);
  const orderMsg = `مرحباً، أود الاستفسار عن قسم: ${category.name}`;
  const products = getProducts(category.slug);

  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <section className="relative">
          <div className="relative h-72 w-full overflow-hidden md:h-96">
            <img src={category.image} alt={category.name} className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-background/20" />
          </div>
          <div className="mx-auto -mt-24 max-w-6xl px-4">
            <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary">
              <ArrowLeft className="h-4 w-4 rotate-180" /> الرئيسية
            </Link>
            <h1 className="mt-3 text-3xl font-extrabold md:text-5xl">{category.name}</h1>
            <p className="mt-3 max-w-2xl text-muted-foreground">{category.description}</p>
            <div className="mt-5 flex flex-wrap gap-3">
              <a href={waLink(orderMsg)} target="_blank" rel="noopener noreferrer"
                 className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-semibold text-primary-foreground hover:opacity-90">
                <MessageCircle className="h-5 w-5" /> اطلب هذا التصميم
              </a>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-12">
          {["mother","graduation","teacher","ramadan","newborn"].includes(category.slug) ? (
            <>
              <h2 className="mb-6 text-2xl font-extrabold md:text-3xl">تصفح حسب نوع الهدية</h2>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                {(category.slug === "mother" ? motherSubs
                  : category.slug === "graduation" ? graduationSubs
                  : category.slug === "teacher" ? teacherSubs
                  : category.slug === "ramadan" ? ramadanSubs
                  : newbornSubs).map((s) => (
                  <Link
                    key={s.slug}
                    to={
                      category.slug === "mother" ? "/mother/$sub"
                      : category.slug === "graduation" ? "/graduation/$sub"
                      : category.slug === "teacher" ? "/teacher/$sub"
                      : category.slug === "ramadan" ? "/ramadan/$sub"
                      : "/newborn/$sub"
                    }
                    params={{ sub: s.slug }}
                    className="group overflow-hidden rounded-xl border border-border bg-card transition hover:border-primary"
                  >
                    <div className="aspect-square overflow-hidden">
                      <img src={s.image} alt={s.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    </div>
                    <div className="p-3">
                      <h3 className="text-sm font-bold line-clamp-2 group-hover:text-primary">{s.name}</h3>
                    </div>
                  </Link>
                ))}
              </div>
            </>
          ) : products.length > 0 ? (
            <>
              <h2 className="mb-6 text-2xl font-extrabold md:text-3xl">تصاميمنا</h2>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                {products.map((p) => (
                  <div key={p.id} className="group overflow-hidden rounded-xl border border-border bg-card transition hover:border-primary">
                    <Link to="/product/$id" params={{ id: p.id }} className="block">
                      <div className="aspect-square overflow-hidden">
                        <img src={p.image} alt={p.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      </div>
                    </Link>
                    <div className="p-3">
                      <Link to="/product/$id" params={{ id: p.id }} className="block">
                        <h3 className="text-sm font-bold line-clamp-2 hover:text-primary">{p.name}</h3>
                      </Link>
                      <div className="mt-1 text-sm font-extrabold text-primary">{formatPrice(p)}</div>
                      <Link
                        to="/product/$id"
                        params={{ id: p.id }}
                        className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground hover:opacity-90"
                      >
                        عرض التفاصيل
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="rounded-2xl border border-border bg-card p-8 text-center">
              <h2 className="text-xl font-bold">تصاميم خاصة قيد التحديث</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                نضيف صور تصاميمنا الحقيقية قريباً. للاطلاع على أحدث الأعمال أو طلب تصميم خاص، تواصل معنا مباشرة.
              </p>
              <a href={waLink(orderMsg)} target="_blank" rel="noopener noreferrer"
                 className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90">
                <MessageCircle className="h-4 w-4" /> اطلب الآن
              </a>
            </div>
          )}
        </section>

        <section className="mx-auto max-w-6xl px-4 pb-12">
          <h3 className="mb-4 text-xl font-bold">أقسام أخرى قد تعجبك</h3>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            {others.map((c) => <CategoryCard key={c.slug} category={c} />)}
          </div>
        </section>
      </main>
      <Footer />
      <WhatsAppFloat />
    </div>
  );
}

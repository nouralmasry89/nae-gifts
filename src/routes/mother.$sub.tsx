import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { MessageCircle, ArrowLeft } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { WhatsAppFloat } from "@/components/WhatsAppFloat";
import { getMotherSub } from "@/lib/motherSubs";
import { quranItems } from "@/lib/quranBoxes";
import { waLink } from "@/lib/categories";

export const Route = createFileRoute("/mother/$sub")({
  loader: ({ params }) => {
    const sub = getMotherSub(params.sub);
    if (!sub) throw notFound();
    return { sub };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.sub.name} — هدايا عيد الأم — N.A.E` },
          { name: "description", content: loaderData.sub.description },
          { property: "og:title", content: `${loaderData.sub.name} — N.A.E` },
          { property: "og:description", content: loaderData.sub.description },
          { property: "og:image", content: loaderData.sub.image },
        ]
      : [],
  }),
  notFoundComponent: () => (
    <div className="min-h-screen">
      <Header />
      <div className="mx-auto max-w-6xl px-4 py-20 text-center">
        <h1 className="text-3xl font-bold">القسم غير موجود</h1>
        <Link to="/category/$slug" params={{ slug: "mother" }} className="mt-4 inline-block text-primary hover:underline">
          العودة لهدايا عيد الأم
        </Link>
      </div>
      <Footer />
    </div>
  ),
  errorComponent: () => (
    <div className="mx-auto max-w-6xl px-4 py-20 text-center">
      <h1 className="text-2xl font-bold">حدث خطأ ما</h1>
    </div>
  ),
  component: MotherSubPage,
});

function MotherSubPage() {
  const { sub } = Route.useLoaderData();
  const orderMsg = `مرحباً، أود الاستفسار عن: ${sub.name} (هدايا عيد الأم)`;

  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <section className="relative">
          <div className="relative h-72 w-full overflow-hidden md:h-96">
            <img src={sub.image} alt={sub.name} className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-background/20" />
          </div>
          <div className="mx-auto -mt-24 max-w-6xl px-4">
            <Link to="/category/$slug" params={{ slug: "mother" }} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary">
              <ArrowLeft className="h-4 w-4 rotate-180" /> هدايا عيد الأم
            </Link>
            <h1 className="mt-3 text-3xl font-extrabold md:text-5xl">{sub.name}</h1>
            <p className="mt-3 max-w-2xl text-muted-foreground">{sub.description}</p>
            <div className="mt-5 flex flex-wrap gap-3">
              <a href={waLink(orderMsg)} target="_blank" rel="noopener noreferrer"
                 className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-semibold text-primary-foreground hover:opacity-90">
                <MessageCircle className="h-5 w-5" /> تواصل معنا
              </a>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-12">
          {sub.slug === "quran-boxes" ? (
            <>
              <h2 className="mb-6 text-2xl font-extrabold md:text-3xl">تصفح حسب النوع</h2>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                {quranItems.map((item) => (
                  <Link
                    key={item.slug}
                    to="/mother/quran-boxes/$item"
                    params={{ item: item.slug }}
                    className="group overflow-hidden rounded-xl border border-border bg-card transition hover:border-primary"
                  >
                    <div className="aspect-square overflow-hidden">
                      <img src={item.image} alt={item.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    </div>
                    <div className="p-3">
                      <h3 className="text-sm font-bold line-clamp-2 group-hover:text-primary">{item.name}</h3>
                    </div>
                  </Link>
                ))}
              </div>
            </>
          ) : (
            <div className="rounded-2xl border border-border bg-card p-8 text-center">
              <h2 className="text-xl font-bold">تصاميم قيد الإضافة</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                سنقوم بإضافة صور المنتجات الخاصة بهذا القسم قريباً. للاطلاع على أحدث الأعمال أو طلب تصميم خاص، تواصل معنا مباشرة.
              </p>
              <a href={waLink(orderMsg)} target="_blank" rel="noopener noreferrer"
                 className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90">
                <MessageCircle className="h-4 w-4" /> اطلب الآن
              </a>
            </div>
          )}
        </section>
      </main>
      <Footer />
      <WhatsAppFloat />
    </div>
  );
}

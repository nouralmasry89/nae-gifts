import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { MessageCircle, ArrowLeft } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { WhatsAppFloat } from "@/components/WhatsAppFloat";
import { getProduct, formatPrice } from "@/lib/products";
import { getCategory, waLink } from "@/lib/categories";

export const Route = createFileRoute("/product/$id")({
  loader: ({ params }) => {
    const product = getProduct(params.id);
    if (!product) throw notFound();
    const category = getCategory(product.categorySlug);
    return { product, category };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.product.name} — N.A.E Gifts Store` },
          { name: "description", content: loaderData.product.description },
          { property: "og:title", content: loaderData.product.name },
          { property: "og:description", content: loaderData.product.description },
          { property: "og:image", content: loaderData.product.image },
        ]
      : [],
  }),
  notFoundComponent: () => (
    <div className="min-h-screen">
      <Header />
      <div className="mx-auto max-w-6xl px-4 py-20 text-center">
        <h1 className="text-3xl font-bold">المنتج غير موجود</h1>
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
  component: ProductPage,
});

function ProductPage() {
  const { product, category } = Route.useLoaderData();
  const [customization, setCustomization] = useState("");
  const [notes, setNotes] = useState("");

  const message = [
    "مرحباً، أود طلب:",
    `• المنتج: ${product.name} (${product.id})`,
    category ? `• القسم: ${category.name}` : null,
    `• السعر: ${formatPrice(product)}`,
    customization.trim() ? `• اللون / الاسم: ${customization.trim()}` : null,
    notes.trim() ? `• ملاحظات: ${notes.trim()}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-8 md:py-12">
        <nav className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-primary">الرئيسية</Link>
          <span>/</span>
          {category && (
            <>
              <Link
                to="/category/$slug"
                params={{ slug: category.slug }}
                className="hover:text-primary"
              >
                {category.name}
              </Link>
              <span>/</span>
            </>
          )}
          <span className="text-foreground line-clamp-1">{product.name}</span>
        </nav>

        <div className="grid gap-8 md:grid-cols-2">
          <div className="overflow-hidden rounded-2xl border border-border bg-card">
            <div className="aspect-square overflow-hidden">
              <img
                src={product.image}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            </div>
          </div>

          <div className="flex flex-col">
            <h1 className="text-2xl font-extrabold md:text-4xl">{product.name}</h1>
            <div className="mt-3 text-2xl font-extrabold text-primary md:text-3xl">
              {formatPrice(product)}
            </div>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              {product.description}
            </p>

            <div className="mt-6 space-y-4">
              <div>
                <label htmlFor="customization" className="mb-2 block text-sm font-bold">
                  اللون أو تخصيص الاسم (اختياري)
                </label>
                <input
                  id="customization"
                  type="text"
                  value={customization}
                  onChange={(e) => setCustomization(e.target.value)}
                  placeholder="مثال: اللون الأبيض، أو الاسم: سارة ومحمد"
                  className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
                />
              </div>

              <div>
                <label htmlFor="notes" className="mb-2 block text-sm font-bold">
                  ملاحظات إضافية (اختياري)
                </label>
                <textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  placeholder="أي تفاصيل تريد إضافتها عن الطلب..."
                  className="w-full resize-none rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
                />
              </div>
            </div>

            <a
              href={waLink(message)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-4 text-base font-bold text-primary-foreground transition hover:opacity-90"
            >
              <MessageCircle className="h-5 w-5" />
              اطلب عبر واتساب
            </a>

            {category && (
              <Link
                to="/category/$slug"
                params={{ slug: category.slug }}
                className="mt-3 inline-flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-primary"
              >
                <ArrowLeft className="h-4 w-4 rotate-180" />
                العودة إلى {category.name}
              </Link>
            )}
          </div>
        </div>
      </main>
      <Footer />
      <WhatsAppFloat />
    </div>
  );
}

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
  const [showForm, setShowForm] = useState(false);
  const [groom, setGroom] = useState("");
  const [bride, setBride] = useState("");
  const [date, setDate] = useState("");
  const [colors, setColors] = useState("");
  const [notes, setNotes] = useState("");

  const productUrl =
    typeof window !== "undefined" ? window.location.href : "";

  const message = [
    "مرحباً، أود طلب المنتج التالي:",
    `• المنتج: ${product.name} (${product.id})`,
    `• السعر: ${formatPrice(product)}`,
    productUrl ? `• رابط المنتج (يحتوي الصورة): ${productUrl}` : null,
    "",
    "تفاصيل الطلب:",
    `• اسم العريس: ${groom.trim() || "-"}`,
    `• اسم العروس: ${bride.trim() || "-"}`,
    `• تاريخ المناسبة: ${date.trim() || "-"}`,
    `• الألوان المرغوبة: ${colors.trim() || "-"}`,
    `• ملاحظات إضافية: ${notes.trim() || "-"}`,
  ]
    .filter((l) => l !== null)
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
              <Link to="/category/$slug" params={{ slug: category.slug }} className="hover:text-primary">
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
              <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
            </div>
          </div>

          <div className="flex flex-col">
            <h1 className="text-2xl font-extrabold md:text-4xl">{product.name}</h1>
            <div className="mt-3 text-lg font-extrabold text-primary md:text-xl">
              {formatPrice(product)}
            </div>
            <p className="mt-4 whitespace-pre-line leading-relaxed text-muted-foreground">
              {product.description}
            </p>

            {!showForm ? (
              <button
                onClick={() => setShowForm(true)}
                className="mt-6 inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-4 text-base font-bold text-primary-foreground transition hover:opacity-90"
              >
                اطلبه الآن
              </button>
            ) : (
              <div className="mt-6 space-y-4 rounded-xl border border-border bg-card p-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="اسم العريس" value={groom} onChange={setGroom} placeholder="مثال: محمد" />
                  <Field label="اسم العروس" value={bride} onChange={setBride} placeholder="مثال: سارة" />
                  <Field label="تاريخ المناسبة" value={date} onChange={setDate} placeholder="مثال: 26/09/2025" />
                  <Field label="الألوان المرغوبة" value={colors} onChange={setColors} placeholder="ذهبي / فضي / زهري / أبيض / أسود" />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-bold">ملاحظات إضافية</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={4}
                    placeholder="أي تفاصيل أخرى تودّ إضافتها..."
                    className="w-full resize-none rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
                  />
                </div>

                <a
                  href={waLink(message)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-6 py-4 text-base font-bold text-primary-foreground transition hover:opacity-90"
                >
                  <MessageCircle className="h-5 w-5" />
                  اطلبه الآن عبر واتساب
                </a>
                <p className="text-center text-xs text-muted-foreground">
                  سيتم فتح واتساب مع رسالة تتضمن تفاصيل طلبك ورابط صورة المنتج.
                </p>
              </div>
            )}

            {category && (
              <Link
                to="/category/$slug"
                params={{ slug: category.slug }}
                className="mt-4 inline-flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-primary"
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

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-bold">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
      />
    </div>
  );
}

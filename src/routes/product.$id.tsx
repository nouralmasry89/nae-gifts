import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, MessageCircle } from "lucide-react";

import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { WhatsAppFloat } from "@/components/WhatsAppFloat";

import {
  formatPrice,
  type SizeOption,
} from "@/lib/products";

import { getProductMerged } from "@/lib/products-db";
import { getCategory, waLink } from "@/lib/categories";

export const Route = createFileRoute("/product/$id")({
  loader: async ({ params }) => {
    const product = await getProductMerged(params.id);

    if (!product) {
      throw notFound();
    }

    const category = getCategory(product.categorySlug);

    return {
      product,
      category,
    };
  },

  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          {
            title: `${loaderData.product.name} — N.A.E Gifts Store`,
          },
          {
            name: "description",
            content: loaderData.product.description,
          },
          {
            property: "og:title",
            content: loaderData.product.name,
          },
          {
            property: "og:description",
            content: loaderData.product.description,
          },
          {
            property: "og:image",
            content: loaderData.product.image,
          },
        ]
      : [],
  }),

  notFoundComponent: () => (
    <div className="min-h-screen">
      <Header />

      <main className="mx-auto max-w-6xl px-4 py-20 text-center">
        <h1 className="text-3xl font-bold">
          المنتج غير موجود
        </h1>

        <Link
          to="/"
          className="mt-4 inline-block text-primary hover:underline"
        >
          العودة للرئيسية
        </Link>
      </main>

      <Footer />
    </div>
  ),

  errorComponent: () => (
    <div className="min-h-screen">
      <Header />

      <main className="mx-auto max-w-6xl px-4 py-20 text-center">
        <h1 className="text-2xl font-bold">
          حدث خطأ ما
        </h1>

        <Link
          to="/"
          className="mt-4 inline-block text-primary hover:underline"
        >
          العودة للرئيسية
        </Link>
      </main>

      <Footer />
    </div>
  ),

  component: ProductPage,
});

function ProductPage() {
  const { product, category } = Route.useLoaderData();

  const gallery = product.gallery ?? [product.image];

  const [mainImage, setMainImage] = useState(
    product.image,
  );

  const [showForm, setShowForm] = useState(false);

  const [groom, setGroom] = useState("");
  const [bride, setBride] = useState("");
  const [date, setDate] = useState("");
  const [colors, setColors] = useState("");
  const [boxSize, setBoxSize] = useState("");
  const [notes, setNotes] = useState("");

  const [selectedSize, setSelectedSize] =
    useState<SizeOption | undefined>(
      product.sizeOptions?.[0],
    );

  const hasSizeOptions =
    Boolean(
      product.sizeOptions &&
        product.sizeOptions.length > 0,
    );

  const displayedPrice =
    selectedSize?.price ??
    product.priceNew;

  const priceText =
    hasSizeOptions && selectedSize
      ? `${selectedSize.price.toLocaleString("ar")} ل.س جديدة`
      : formatPrice(product);

  const handleWhatsAppOrder = () => {
    const messageParts = [
      "مرحباً ناي 👋",
      "",
      `أرغب بطلب المنتج: ${product.name}`,
      `القسم: ${category?.name ?? product.categorySlug}`,
    ];

    if (displayedPrice > 0) {
      messageParts.push(
        `السعر: ${displayedPrice.toLocaleString("ar")} ل.س جديدة`,
      );
    }

    if (selectedSize) {
      messageParts.push(
        `الحجم: ${selectedSize.label}`,
      );
    }

    if (groom.trim()) {
      messageParts.push(
        `اسم العريس: ${groom.trim()}`,
      );
    }

    if (bride.trim()) {
      messageParts.push(
        `اسم العروس: ${bride.trim()}`,
      );
    }

    if (date.trim()) {
      messageParts.push(
        `التاريخ: ${date.trim()}`,
      );
    }

    if (colors.trim()) {
      messageParts.push(
        `الألوان المطلوبة: ${colors.trim()}`,
      );
    }

    if (boxSize.trim()) {
      messageParts.push(
        `تفاصيل إضافية للحجم: ${boxSize.trim()}`,
      );
    }

    if (notes.trim()) {
      messageParts.push(
        `ملاحظات: ${notes.trim()}`,
      );
    }

    messageParts.push(
      "",
      "أرجو إعلامي بالتفاصيل النهائية وتكلفة الطلب.",
    );

    window.open(
      waLink(messageParts.join("\n")),
      "_blank",
      "noopener,noreferrer",
    );
  };

  return (
    <div className="min-h-screen">
      <Header />

      <main className="mx-auto max-w-6xl px-4 py-8 md:py-12">
        {/* العودة */}
        <div className="mb-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            العودة
          </Link>
        </div>

        {/* المنتج */}
        <div className="grid gap-8 md:grid-cols-2">
          {/* الصور */}
          <div>
            <div className="overflow-hidden rounded-2xl border border-border bg-card">
              <img
                src={mainImage}
                alt={product.name}
                className="aspect-square w-full object-cover"
              />
            </div>

            {gallery.length > 1 && (
              <div className="mt-3 grid grid-cols-5 gap-2">
                {gallery.map((image, index) => (
                  <button
                    key={`${image}-${index}`}
                    type="button"
                    onClick={() =>
                      setMainImage(image)
                    }
                    className={`overflow-hidden rounded-lg border-2 ${
                      mainImage === image
                        ? "border-primary"
                        : "border-border"
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className="aspect-square w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* معلومات المنتج */}
          <div>
            {category && (
              <div className="mb-2 text-sm font-bold text-primary">
                {category.name}
              </div>
            )}

            <h1 className="text-2xl font-extrabold md:text-3xl">
              {product.name}
            </h1>

            <div className="mt-5 rounded-xl border border-border bg-card p-4">
              <div className="text-sm text-muted-foreground">
                السعر
              </div>

              <div className="mt-1 text-2xl font-extrabold">
                {priceText}
              </div>

              {product.priceOld > 0 &&
                !hasSizeOptions && (
                  <div className="mt-1 text-sm text-muted-foreground line-through">
                    {product.priceOld.toLocaleString(
                      "ar",
                    )}{" "}
                    ل.س قديمة
                  </div>
                )}
            </div>

            {/* الأحجام */}
            {hasSizeOptions && (
              <div className="mt-6">
                <label className="mb-2 block text-sm font-bold">
                  اختر الحجم
                </label>

                <div className="grid grid-cols-2 gap-2">
                  {product.sizeOptions?.map(
                    (size, index) => {
                      const selected =
                        selectedSize?.label ===
                        size.label;

                      return (
                        <button
                          key={`${size.label}-${index}`}
                          type="button"
                          onClick={() =>
                            setSelectedSize(size)
                          }
                          className={`rounded-lg border px-4 py-3 text-sm font-bold ${
                            selected
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border hover:border-primary"
                          }`}
                        >
                          <div>
                            {size.label}
                          </div>

                          <div className="mt-1 text-xs">
                            {size.price.toLocaleString(
                              "ar",
                            )}{" "}
                            ل.س
                          </div>
                        </button>
                      );
                    },
                  )}
                </div>
              </div>
            )}

            {/* الوصف */}
            {product.description && (
              <div className="mt-6">
                <h2 className="mb-2 text-lg font-bold">
                  تفاصيل المنتج
                </h2>

                <div className="whitespace-pre-line text-sm leading-7 text-muted-foreground">
                  {product.description}
                </div>
              </div>
            )}

            {/* زر الطلب */}
            <div className="mt-7">
              <button
                type="button"
                onClick={() =>
                  setShowForm(!showForm)
                }
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-4 text-base font-extrabold text-primary-foreground hover:opacity-90"
              >
                <MessageCircle className="h-5 w-5" />

                {showForm
                  ? "إخفاء نموذج الطلب"
                  : "اطلب هذا المنتج عبر واتساب"}
              </button>
            </div>

            {/* نموذج الطلب */}
            {showForm && (
              <div className="mt-4 rounded-xl border border-border bg-card p-5">
                <h2 className="text-lg font-bold">
                  تفاصيل الطلب
                </h2>

                <p className="mt-1 text-xs text-muted-foreground">
                  املأ المعلومات التي تريد تخصيصها،
                  ثم اضغط إرسال الطلب عبر واتساب.
                </p>

                <div className="mt-4 space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-bold">
                      اسم العريس
                    </label>

                    <input
                      value={groom}
                      onChange={(e) =>
                        setGroom(e.target.value)
                      }
                      placeholder="اختياري"
                      className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-bold">
                      اسم العروس
                    </label>

                    <input
                      value={bride}
                      onChange={(e) =>
                        setBride(e.target.value)
                      }
                      placeholder="اختياري"
                      className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-bold">
                      التاريخ
                    </label>

                    <input
                      value={date}
                      onChange={(e) =>
                        setDate(e.target.value)
                      }
                      placeholder="مثال: 20 / 8 / 2026"
                      className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-bold">
                      الألوان المطلوبة
                    </label>

                    <input
                      value={colors}
                      onChange={(e) =>
                        setColors(e.target.value)
                      }
                      placeholder="مثال: ذهبي و أبيض"
                      className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-bold">
                      تفاصيل الحجم
                    </label>

                    <input
                      value={boxSize}
                      onChange={(e) =>
                        setBoxSize(e.target.value)
                      }
                      placeholder="اختياري"
                      className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-bold">
                      ملاحظات إضافية
                    </label>

                    <textarea
                      value={notes}
                      onChange={(e) =>
                        setNotes(e.target.value)
                      }
                      rows={4}
                      placeholder="أي تفاصيل أو طلبات خاصة..."
                      className="w-full resize-none rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={
                      handleWhatsAppOrder
                    }
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-4 text-base font-extrabold text-primary-foreground hover:opacity-90"
                  >
                    <MessageCircle className="h-5 w-5" />

                    إرسال الطلب عبر واتساب
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <WhatsAppFloat />

      <Footer />
    </div>
  );
}

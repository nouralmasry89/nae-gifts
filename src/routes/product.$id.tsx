import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { MessageCircle, ArrowLeft } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { WhatsAppFloat } from "@/components/WhatsAppFloat";
import { PriceDisplay } from "@/components/PriceDisplay";
import { formatPrice, FLOWER_PRICING, FLOWER_BOUQUET_PRICE, type SizeOption } from "@/lib/products";
import { getProductMerged } from "@/lib/products-db";
import { getCategory, waLink } from "@/lib/categories";
import { useDiscount } from "@/hooks/useDiscount";
import { applyDiscount } from "@/lib/discount";

export const Route = createFileRoute("/product/$id")({
  loader: async ({ params }) => {
    const product = await getProductMerged(params.id);
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
  const { active: discountActive, markDiscountUsed } = useDiscount();
  const [showForm, setShowForm] = useState(false);
  const isDowry = product.categorySlug === "dowry";
  const isFlowerRose = product.id === "flowers-1" || product.id === "flowers-2";
  const bouquetPrice = FLOWER_BOUQUET_PRICE[product.id];
  const isFlowerBouquet = bouquetPrice !== undefined;

  const [groom, setGroom] = useState("");
  const [bride, setBride] = useState("");
  const [date, setDate] = useState("");
  const [colors, setColors] = useState("");
  const [boxSize, setBoxSize] = useState("");
  const [notes, setNotes] = useState("");
  const gallery = product.gallery ?? [product.image];
  const [mainImage, setMainImage] = useState(product.image);
  const selectedSize = product.sizeOptions?.find((s: SizeOption) => s.

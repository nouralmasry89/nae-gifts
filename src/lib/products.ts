import ring1 from "@/assets/products/rings/ring-1.jpg";
import ring2 from "@/assets/products/rings/ring-2.jpg";
import ring3 from "@/assets/products/rings/ring-3.jpg";
import ring4 from "@/assets/products/rings/ring-4.jpg";
import ring5 from "@/assets/products/rings/ring-5.jpg";
import ring6 from "@/assets/products/rings/ring-6.jpg";
import ring7 from "@/assets/products/rings/ring-7.jpg";
import ring8 from "@/assets/products/rings/ring-8.jpg";
import ring9 from "@/assets/products/rings/ring-9.jpg";
import ring10 from "@/assets/products/rings/ring-10.jpg";

export type Product = {
  id: string;
  categorySlug: string;
  name: string;
  image: string;
  priceNew: number; // السعر بالليرة السورية الجديدة
  priceOld: number; // السعر بالليرة السورية القديمة
  description: string;
};

const RING_DESC =
  "ستاند بليكسي شفاف و (ذهبي أو فضي أو زهري أو أبيض أو أسود).\nيمكنكم تخصيصه بالأسماء و التاريخ و العبارة التي ترغبون بها.";

const ringImages = [ring1, ring2, ring3, ring4, ring5, ring6, ring7, ring8, ring9, ring10];

const rings: Product[] = ringImages.map((img, i) => ({
  id: `rings-${i + 1}`,
  categorySlug: "rings",
  name: `ستاند محابس — تصميم ${i + 1}`,
  image: img,
  priceNew: 2500,
  priceOld: 250000,
  description: RING_DESC,
}));

export const productsByCategory: Record<string, Product[]> = { rings };

export const allProducts: Product[] = Object.values(productsByCategory).flat();

export const getProducts = (slug: string): Product[] => productsByCategory[slug] ?? [];

export const getProduct = (id: string): Product | undefined =>
  allProducts.find((p) => p.id === id);

export const formatPrice = (p: Product): string =>
  `${p.priceNew.toLocaleString("ar")} ل.س جديدة • ${p.priceOld.toLocaleString("ar")} ل.س قديمة`;

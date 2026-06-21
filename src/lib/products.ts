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

const rings: Product[] = [
  { id: "rings-1",  categorySlug: "rings", name: "ستاند محابس — تصميم 1",  image: ring1,  priceNew: 3000, priceOld: 300000, description: RING_DESC },
  { id: "rings-2",  categorySlug: "rings", name: "ستاند محابس — تصميم 2",  image: ring2,  priceNew: 2250, priceOld: 225000, description: RING_DESC },
  { id: "rings-3",  categorySlug: "rings", name: "ستاند محابس — تصميم 3",  image: ring3,  priceNew: 2500, priceOld: 250000, description: RING_DESC },
  { id: "rings-4",  categorySlug: "rings", name: "ستاند محابس — تصميم 4",  image: ring4,  priceNew: 2500, priceOld: 250000, description: RING_DESC },
  { id: "rings-5",  categorySlug: "rings", name: "ستاند محابس — تصميم 5",  image: ring5,  priceNew: 2250, priceOld: 225000, description: RING_DESC },
  { id: "rings-6",  categorySlug: "rings", name: "ستاند محابس — تصميم 6",  image: ring6,  priceNew: 2500, priceOld: 250000, description: RING_DESC },
  { id: "rings-7",  categorySlug: "rings", name: "ستاند محابس — تصميم 7",  image: ring7,  priceNew: 1250, priceOld: 125000, description: RING_DESC },
  { id: "rings-8",  categorySlug: "rings", name: "ستاند محابس — تصميم 8",  image: ring8,  priceNew: 2500, priceOld: 250000, description: RING_DESC },
  { id: "rings-9",  categorySlug: "rings", name: "ستاند محابس — تصميم 9",  image: ring9,  priceNew: 2250, priceOld: 225000, description: RING_DESC },
  { id: "rings-10", categorySlug: "rings", name: "ستاند محابس — تصميم 10", image: ring10, priceNew: 2500, priceOld: 250000, description: RING_DESC },
];

export const productsByCategory: Record<string, Product[]> = { rings };

export const allProducts: Product[] = Object.values(productsByCategory).flat();

export const getProducts = (slug: string): Product[] => productsByCategory[slug] ?? [];

export const getProduct = (id: string): Product | undefined =>
  allProducts.find((p) => p.id === id);

export const formatPrice = (p: Product): string =>
  `${p.priceNew.toLocaleString("ar")} ل.س جديدة • ${p.priceOld.toLocaleString("ar")} ل.س قديمة`;

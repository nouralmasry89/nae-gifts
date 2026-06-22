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

const RING1_DESC =
  "ستاند بليكسي أسود القاعدة والأبراج باللونين الذهبي لخاتم العريس والزهري لخاتم العروس مع عبارة وتاريخ باللون الفضي.\nيمكنكم تخصيصه بالأسماء والتاريخ والعبارة التي ترغبون بها.";

const RING2_DESC =
  "ستاند بليكسي (أبيض أو أسود) مع بليكسي ذهبي أو فضي، والقطعة الخلفية يمكنكم تخصيصها بالشكل الذي ترغبون به (خريطة، قلب، أحرف، شكل عروسين…).\nيمكنكم تخصيص الستاند بالأسماء والتاريخ والعبارات التي ترغبون بها.";

const RING5_DESC =
  "ستاند بليكسي شفاف وأبيض أو أسود مع (ذهبي أو فضي).\nيمكنكم تخصيصه بالأسماء والتاريخ والعبارة التي ترغبون بها.";

const RING6_DESC =
  "ستاند بليكسي أبيض أو أسود و (ذهبي أو فضي).\nيمكنكم تخصيصه بالأسماء والتاريخ والعبارة التي ترغبون بها.";

const RING7_DESC =
  "ستاند خشبي (أبيض أو أسود بني أو بيج).\nيمكنكم تخصيصه بالأسماء والتاريخ والعبارة التي ترغبون بها.";

const RING8_DESC =
  "ستاند بليكسي أبيض أو أسود و (ذهبي أو فضي).\nيمكنكم تخصيصه بالأسماء والتاريخ والعبارة التي ترغبون بها.";

const rings: Product[] = [
  { id: "rings-1",  categorySlug: "rings", name: "ستاند محابس — تصميم 1",  image: ring1,  priceNew: 3000, priceOld: 300000, description: RING1_DESC },
  { id: "rings-2",  categorySlug: "rings", name: "ستاند محابس — تصميم 2",  image: ring2,  priceNew: 2250, priceOld: 225000, description: RING2_DESC },
  { id: "rings-3",  categorySlug: "rings", name: "ستاند محابس — تصميم 3",  image: ring3,  priceNew: 2500, priceOld: 250000, description: RING_DESC },
  { id: "rings-4",  categorySlug: "rings", name: "ستاند محابس — تصميم 4",  image: ring4,  priceNew: 2500, priceOld: 250000, description: RING_DESC },
  { id: "rings-5",  categorySlug: "rings", name: "ستاند محابس — تصميم 5",  image: ring5,  priceNew: 2250, priceOld: 225000, description: RING5_DESC },
  { id: "rings-6",  categorySlug: "rings", name: "ستاند محابس — تصميم 6",  image: ring6,  priceNew: 2500, priceOld: 250000, description: RING6_DESC },
  { id: "rings-7",  categorySlug: "rings", name: "ستاند محابس — تصميم 7",  image: ring7,  priceNew: 1250, priceOld: 125000, description: RING7_DESC },
  { id: "rings-8",  categorySlug: "rings", name: "ستاند محابس — تصميم 8",  image: ring8,  priceNew: 2500, priceOld: 250000, description: RING8_DESC },
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

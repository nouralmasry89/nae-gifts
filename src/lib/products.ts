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
  price: number; // 0 = "السعر عند الطلب"
  currency: string;
  description: string;
};

export const CURRENCY = "ل.س";

const rings: Product[] = [
  {
    id: "rings-1",
    categorySlug: "rings",
    name: "ستاند محابس مرايا ذهبي و وردي",
    image: ring1,
    price: 0,
    currency: CURRENCY,
    description: "ستاند محابس بقاعدة مرايا فاخرة، إطار ذهبي مع لمسات وردية ناعمة، يبرز محبسك بأناقة.",
  },
  {
    id: "rings-2",
    categorySlug: "rings",
    name: "ستاند محابس أبيض بخط ذهبي",
    image: ring2,
    price: 0,
    currency: CURRENCY,
    description: "تصميم نقي باللون الأبيض مع خط ذهبي رفيع وزخرفة كتابية أنيقة، مثالي للعروسين.",
  },
  {
    id: "rings-3",
    categorySlug: "rings",
    name: "ستاند محابس هندسي بحروف الاسم",
    image: ring3,
    price: 0,
    currency: CURRENCY,
    description: "تصميم هندسي عصري يحمل الأحرف الأولى لاسمي العروسين بلمسة فخمة ومميزة.",
  },
  {
    id: "rings-4",
    categorySlug: "rings",
    name: "ستاند محابس ذهبي مع وردة",
    image: ring4,
    price: 0,
    currency: CURRENCY,
    description: "قاعدة ذهبية مزينة بوردة طبيعية الشكل، تضفي رومانسية على لحظة تقديم المحبس.",
  },
  {
    id: "rings-5",
    categorySlug: "rings",
    name: "ستاند محابس دائري بالاسم",
    image: ring5,
    price: 0,
    currency: CURRENCY,
    description: "ستاند دائري أنيق يحمل اسم العروسين بخط مميز، تذكار يبقى بعد الفرح.",
  },
  {
    id: "rings-6",
    categorySlug: "rings",
    name: "ستاند محابس فخم باللون الذهبي",
    image: ring6,
    price: 0,
    currency: CURRENCY,
    description: "تصميم فاخر بالكامل باللون الذهبي، يليق بالجلسات الرسمية وحفلات الخطبة الكبرى.",
  },
  {
    id: "rings-7",
    categorySlug: "rings",
    name: "ستاند محابس خشبي كلاسيكي",
    image: ring7,
    price: 0,
    currency: CURRENCY,
    description: "قاعدة خشبية بلمسة كلاسيكية دافئة، مزج بين الطبيعة والأناقة لطلتك المميزة.",
  },
  {
    id: "rings-8",
    categorySlug: "rings",
    name: "ستاند محابس دائرة ذهبية",
    image: ring8,
    price: 0,
    currency: CURRENCY,
    description: "حلقة ذهبية مرفوعة على قاعدة راقية، تصميم بسيط وجريء في آن واحد.",
  },
  {
    id: "rings-9",
    categorySlug: "rings",
    name: "ستاند محابس مرايا مع ورد أبيض",
    image: ring9,
    price: 0,
    currency: CURRENCY,
    description: "مرايا عاكسة محاطة بورد أبيض ناعم، يبرز المحابس وكأنها في لوحة فنية.",
  },
  {
    id: "rings-10",
    categorySlug: "rings",
    name: "ستاند محابس طوق ذهبي",
    image: ring10,
    price: 0,
    currency: CURRENCY,
    description: "تصميم على شكل طوق ذهبي أنيق يلتف حول المحابس، فخامة بلمسة عصرية.",
  },
];

export const productsByCategory: Record<string, Product[]> = {
  rings,
};

export const allProducts: Product[] = Object.values(productsByCategory).flat();

export const getProducts = (slug: string): Product[] => productsByCategory[slug] ?? [];

export const getProduct = (id: string): Product | undefined =>
  allProducts.find((p) => p.id === id);

export const formatPrice = (p: Product): string =>
  p.price > 0 ? `${p.price.toLocaleString("ar")} ${p.currency}` : "السعر عند الطلب";

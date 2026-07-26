import ring1 from "@/assets/products/rings/ring-1.jpg";
import ring2 from "@/assets/products/rings/ring-2.jpg";
import ring3 from "@/assets/products/rings/ring-3.jpg";
import ring4 from "@/assets/products/rings/ring-4.jpg";
import ring5 from "@/assets/products/rings/ring-5.jpg";
import ring6 from "@/assets/products/rings/ring-6.jpg";
import ring7 from "@/assets/products/rings/ring-7.jpg";
import ring9 from "@/assets/products/rings/ring-9.jpg";
import dowry1 from "@/assets/products/dowry/dowry-1.jpg";
import dowry3 from "@/assets/products/dowry/dowry-3.jpg";
import dowry7 from "@/assets/products/dowry/dowry-7.jpg";
import dowryPlexi1 from "@/assets/products/dowry/dowry-plexi-1.jpg";
import dowryPlexi2 from "@/assets/products/dowry/dowry-plexi-2.jpg";
import dowryPlexi3 from "@/assets/products/dowry/dowry-plexi-3.jpg";
import flower1 from "@/assets/products/flowers/flower-1.jpg";
import flower2 from "@/assets/products/flowers/flower-2.jpg";
import flower3 from "@/assets/products/flowers/flower-3.jpg";
import flower4 from "@/assets/products/flowers/flower-4.jpg";

export type SizeOption = { label: string; price: number };

export type Product = {
  id: string;
  categorySlug: string;
  name: string;
  image: string;
  gallery?: string[];
  sizeOptions?: SizeOption[];
  priceNote?: string;
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

const RING9_DESC =
  "ستاند مرايا (مصنوع من الزجاج وليس البليكسي) مع حفر الأسماء والتاريخ والعبارة على المرايا بشكل مباشر.\nيمكنكم تخصيصه بالأسماء والتاريخ والعبارة التي ترغبون بها.";

const rings: Product[] = [
  { id: "rings-9",  categorySlug: "rings", name: "ستاند محابس - مرايا",  image: ring9,  priceNew: 2250, priceOld: 225000, description: RING9_DESC },
  { id: "rings-1",  categorySlug: "rings", name: "ستاند محابس - أبراج",  image: ring1,  priceNew: 3000, priceOld: 300000, description: RING1_DESC },
  { id: "rings-2",  categorySlug: "rings", name: "ستاند محابس - خريطة أو شكل",  image: ring2,  priceNew: 2250, priceOld: 225000, description: RING2_DESC },
  { id: "rings-3",  categorySlug: "rings", name: "ستاند محابس - نجمة و أسماء مجسمة - فضي",  image: ring3,  priceNew: 2500, priceOld: 250000, description: RING_DESC },
  { id: "rings-4",  categorySlug: "rings", name: "ستاند محابس - نجمة و أسماء مجسمة - دهبي",  image: ring4,  priceNew: 2500, priceOld: 250000, description: RING_DESC },
  { id: "rings-5",  categorySlug: "rings", name: "ستاند محابس دائري",  image: ring5,  priceNew: 2250, priceOld: 225000, description: RING5_DESC },
  { id: "rings-6",  categorySlug: "rings", name: "ستاند محابس - شكل دوائر وقاعدة مستطيلة",  image: ring6,  priceNew: 2500, priceOld: 250000, description: RING6_DESC },
  { id: "rings-7",  categorySlug: "rings", name: "ستاندات خشبية",  image: ring7,  priceNew: 1250, priceOld: 125000, description: RING7_DESC },
];


const DOWRY_DESC =
  "صناديق المهر متوفرة بمواد وتصاميم متنوعة (خشب — بليكسي — خشب مع غطاء بليكسي…).\nتختلف الأسعار حسب حجم الصندوق.\nيمكنكم تخصيصها بالأسماء والتاريخ والعبارة التي ترغبون بها.";

const DOWRY4_DESC =
  "صندوق مهر من البليكسي بالكامل، صندوق شفاف مع زخارف باللون الذهبي أو الفضي، وغطاء من البليكسي الأبيض أو الأسود مع كتابة الأسماء والعبارات باللون الفضي أو الذهبي.";


const dowrySizes = (prices: number[]): SizeOption[] =>
  ["20 سم", "25 سم", "30 سم", "35 سم"].map((label, i) => ({ label, price: prices[i] }));

const dowry: Product[] = [
  {
    id: "dowry-1", categorySlug: "dowry", name: "صندوق مهر — تصميم 1", image: dowry1,
    priceNew: 0, priceOld: 0, description: DOWRY_DESC,
    priceNote: "من 1,500 إلى 2,250 ل.س جديدة حسب الحجم",
    sizeOptions: dowrySizes([1500, 1750, 2000, 2250]),
  },
  {
    id: "dowry-3", categorySlug: "dowry", name: "صندوق مهر — تصميم 2", image: dowry3,
    priceNew: 0, priceOld: 0, description: DOWRY_DESC,
    priceNote: "من 1,250 إلى 2,000 ل.س جديدة حسب الحجم",
    sizeOptions: dowrySizes([1250, 1500, 1750, 2000]),
  },
  {
    id: "dowry-7", categorySlug: "dowry", name: "صندوق مهر — تصميم 3", image: dowry7,
    priceNew: 0, priceOld: 0, description: DOWRY_DESC,
    priceNote: "من 1,500 إلى 2,500 ل.س جديدة حسب الحجم",
    sizeOptions: dowrySizes([1500, 1800, 2100, 2500]),
  },

  {
    id: "dowry-4",
    categorySlug: "dowry",
    name: "صندوق مهر — تصميم 4",
    image: dowryPlexi1,
    gallery: [dowryPlexi1, dowryPlexi2, dowryPlexi3],
    priceNew: 0,
    priceOld: 0,
    priceNote: "من 2,000 إلى 3,500 ل.س جديدة حسب الحجم",
    sizeOptions: [
      { label: "20 سم", price: 2000 },
      { label: "25 سم", price: 2500 },
      { label: "30 سم", price: 3000 },
      { label: "35 سم", price: 3500 },
    ],
    description: DOWRY4_DESC,
  },

];

const FLOWERS1_DESC =
  "باقات من الورد الصناعي شبيه بالطبيعي بنسبة مئة بالمئة.\nسعر الباقة حسب عدد الورود — يمكنكم حساب سعر الباقة والطلب من خلال الجدول التالي:";

const FLOWERS2_DESC =
  "باقات ورد ساتان متوفرة بكافة الأحجام والألوان.\nلمعرفة الأسعار والتفاصيل قم بتعبئة جدول الطلب.";

const FLOWERS3_DESC =
  "مسكة عروس توليب صناعي بتصميم أنيق ومميز.\nلمعرفة الأسعار قم بتعبئة جدول الطلب.";

const FLOWERS4_DESC =
  "مسكة عروس مصنوعة من ورود القرنفل والفل والجبسفيل الصناعي بتصميم أنيق ومميز.\nلمعرفة الأسعار قم بتعبئة جدول الطلب.";

const flowers: Product[] = [
  { id: "flowers-1", categorySlug: "flowers", name: "باقة ورد صناعي — تصميم 1", image: flower1, priceNew: 0, priceOld: 0, description: FLOWERS1_DESC },
  { id: "flowers-2", categorySlug: "flowers", name: "باقات من الساتان", image: flower2, priceNew: 0, priceOld: 0, description: FLOWERS2_DESC },
  { id: "flowers-3", categorySlug: "flowers", name: "مسكة عروس توليب صناعي", image: flower3, priceNew: 0, priceOld: 0, description: FLOWERS3_DESC },
  { id: "flowers-4", categorySlug: "flowers", name: "مسكة عروس قرنفل صناعي", image: flower4, priceNew: 0, priceOld: 0, description: FLOWERS4_DESC },
];

export const FLOWER_PRICING = {
  perRose: 50,
  ribbon: 150,
  wrapping: 150,
  colors: ["أبيض", "أحمر", "خمري", "زهري", "أزرق", "أصفر", "موڤ"],
};

export const FLOWER_BOUQUET_PRICE: Record<string, number> = {
  "flowers-3": 2000,
  "flowers-4": 1500,
};

export const productsByCategory: Record<string, Product[]> = { rings, dowry, flowers };

export const allProducts: Product[] = Object.values(productsByCategory).flat();

export const getProducts = (slug: string): Product[] => productsByCategory[slug] ?? [];

export const getProduct = (id: string): Product | undefined =>
  allProducts.find((p) => p.id === id);

export const formatPrice = (p: Product): string =>
  p.priceNote
    ? p.priceNote
    : p.priceNew === 0
    ? "يمكنكم حساب الكلفة من خلال تعبئة جدول الطلب"
    : `${p.priceNew.toLocaleString("ar")} ل.س جديدة • ${p.priceOld.toLocaleString("ar")} ل.س قديمة`;

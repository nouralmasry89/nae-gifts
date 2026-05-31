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
  name: string;
  image: string;
};

export const productsByCategory: Record<string, Product[]> = {
  rings: [
    { id: "rings-1", name: "ستاند محابس مرايا ذهبي و وردي", image: ring1 },
    { id: "rings-2", name: "ستاند محابس أبيض بخط ذهبي", image: ring2 },
    { id: "rings-3", name: "ستاند محابس هندسي بحروف الاسم", image: ring3 },
    { id: "rings-4", name: "ستاند محابس ذهبي مع وردة", image: ring4 },
    { id: "rings-5", name: "ستاند محابس دائري بالاسم", image: ring5 },
    { id: "rings-6", name: "ستاند محابس فخم باللون الذهبي", image: ring6 },
    { id: "rings-7", name: "ستاند محابس خشبي كلاسيكي", image: ring7 },
    { id: "rings-8", name: "ستاند محابس دائرة ذهبية", image: ring8 },
    { id: "rings-9", name: "ستاند محابس مرايا مع ورد أبيض", image: ring9 },
    { id: "rings-10", name: "ستاند محابس طوق ذهبي", image: ring10 },
  ],
};

export const getProducts = (slug: string): Product[] => productsByCategory[slug] ?? [];

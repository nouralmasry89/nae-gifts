import m1 from "@/assets/products/mother/mother-1.png";
import m2 from "@/assets/products/mother/mother-2.jpg";
import m3 from "@/assets/products/mother/mother-3.png";
import m4 from "@/assets/products/mother/mother-4.jpg";
import m5 from "@/assets/products/mother/mother-5.jpg";

export type MotherSub = {
  slug: string;
  name: string;
  description: string;
  image: string;
};

export const motherSubs: MotherSub[] = [
  { slug: "gift-boxes", name: "صناديق هدايا", description: "صناديق هدايا فاخرة مخصصة لعيد الأم بتصاميم راقية.", image: m1 },
  { slug: "lanterns", name: "فوانيس مزخرفة", description: "فوانيس مزخرفة بحفر الأسماء والعبارات المميزة.", image: m2 },
  { slug: "frames", name: "لوحات و إطارات", description: "لوحات وإطارات مخصصة برسوم للعائلة وعبارات تليق بأمي.", image: m3 },
  { slug: "rose-jewelry", name: "صناديق ورد و مجوهرات", description: "صناديق ورد ساتان مع قطع مجوهرات أنيقة.", image: m4 },
  { slug: "money-boxes", name: "صناديق نقود مزينة", description: "صناديق نقود مزينة بالورد وعبارات عيد الأم.", image: m5 },
];

export const getMotherSub = (slug: string) => motherSubs.find((s) => s.slug === slug);

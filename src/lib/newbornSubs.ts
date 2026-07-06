import newborn from "@/assets/categories/newborn.jpg";

export type NewbornSub = {
  slug: string;
  name: string;
  description: string;
  image: string;
};

export const newbornSubs: NewbornSub[] = [
  { slug: "decor", name: "زينة", description: "زينة قدوم مولود جديد بتصاميم ناعمة يمكن تخصيصها بالاسم.", image: newborn },
  { slug: "gifts", name: "هدايا", description: "هدايا مباركة للمولود الجديد بتصاميم مميزة وقابلة للتخصيص.", image: newborn },
  { slug: "favors", name: "توزيعات", description: "توزيعات قدوم مولود جديد بأشكال متنوعة يمكن تخصيصها بالاسم والتاريخ.", image: newborn },
];

export const getNewbornSub = (slug: string) => newbornSubs.find((s) => s.slug === slug);

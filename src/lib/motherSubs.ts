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
  { slug: "quran-boxes", name: "مصاحف و صناديق مصاحف", description: "مجموعة كبيرة من أجمل تصاميم المصاحف و صناديق المصاحف التي يمكن أن تحتوي على مصحف و سجادة صلاة و مسبحة أو أي شيء ترغبون بإضافته، وبالتأكيد مع إضافة إسم صاحب الهدية و عبارة من اختياركم.", image: m1 },
  { slug: "incense", name: "مباخر", description: "مجموعة مميزة من تصميمات المباخر مع إمكانية إضافة الاسم الذي ترغبون به.", image: m2 },
  { slug: "frames", name: "لوحات طباعة و لوحات مضيئة", description: "أجمل تصميمات اللوحات المطبوعة أو اللوحات المضيئة الخاصة بكم مع إضافة الصور و الأسماء و العبارات التي ترغبون بها.", image: m3 },
  { slug: "gift-rose-boxes", name: "صناديق الهدايا و الورود", description: "مجموعة لا تنتهي من التصاميم العصرية والجميلة لصناديق الهدايا و الورود مع إضافة الأسماء و العبارات التي ترغبون بها.", image: m4 },
  { slug: "money-gifts", name: "مجموعة الهدايا النقدية", description: "إذا كنتم ترغبون بإهداء من تحبون هدية نقدية فقد قمنا بتوفير مجموعة مميزة من التصاميم التي تمكنكم من وضع النقود بطريقة مميزة وملفتة للانتباه.", image: m5 },
];

export const getMotherSub = (slug: string) => motherSubs.find((s) => s.slug === slug);

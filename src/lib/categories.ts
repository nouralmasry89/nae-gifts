import rings from "@/assets/categories/rings.jpg";
import dowry from "@/assets/categories/dowry.jpg";
import flowers from "@/assets/categories/flowers.jpg";
import mother from "@/assets/categories/mother.jpg";
import teacher from "@/assets/categories/teacher.jpg";
import birthday from "@/assets/categories/birthday.jpg";
import ramadan from "@/assets/categories/ramadan.jpg";
import graduation from "@/assets/categories/graduation.jpg";
import newborn from "@/assets/categories/newborn.jpg";

export type Category = {
  slug: string;
  name: string;
  description: string;
  image: string;
};

export const categories: Category[] = [
  { slug: "rings", name: "ستاندات محابس", description: "ستاندات أنيقة لعرض محابس الخطبة والزواج بتصاميم مميزة وفاخرة.", image: rings },
  { slug: "dowry", name: "صناديق مهر و هدايا", description: "صناديق مهر وهدايا فاخرة مصممة خصيصاً لتليق بأجمل المناسبات.", image: dowry },
  { slug: "flowers", name: "باقات ورد صناعي", description: "باقات ورد صناعي راقية تدوم طويلاً، بتنسيقات وألوان حسب رغبتك.", image: flowers },
  { slug: "mother", name: "هدايا عيد الأم", description: "هدايا مميزة لأغلى إنسانة في حياتك، مصممة بلمسة من القلب.", image: mother },
  { slug: "teacher", name: "هدايا عيد المعلم", description: "مجموعة كبيرة ومتنوعة من هدايا عيد المعلم بتصاميم وأشكال ومواد متنوعة، يمكنكم تخصيصها بالشكل والاسم أو الصورة التي ترغبون بها.", image: teacher },
  { slug: "birthday", name: "أعياد الميلاد", description: "هدايا أعياد ميلاد مخصصة بأسماء وتصاميم تناسب كل الأعمار.", image: birthday },
  { slug: "ramadan", name: "رمضان و الأعياد", description: "هدايا رمضان والأعياد بطابع روحاني وتصاميم تجمع الأصالة بالحداثة.", image: ramadan },
  { slug: "graduation", name: "هدايا التخرج", description: "تشكيلة واسعة ومتنوعة من هدايا وتوزيعات التخرج بأشكال ومواد كثيرة، يمكنكم دائماً تخصيصها بالإسم أو الصورة التي ترغبون أن تضعوها.", image: graduation },
  { slug: "newborn", name: "مولود جديد", description: "هدايا مولود جديد بتصاميم ناعمة ومخصصة لاستقبال الفرحة.", image: newborn },
];

export const getCategory = (slug: string) => categories.find((c) => c.slug === slug);

export const WHATSAPP_NUMBER = "963982244635";
export const FACEBOOK_URL = "https://www.facebook.com/N.A.E.2020";
export const INSTAGRAM_URL = "https://www.instagram.com/n.a.e.gifts";

export const waLink = (message?: string) =>
  `https://wa.me/${WHATSAPP_NUMBER}${message ? `?text=${encodeURIComponent(message)}` : ""}`;

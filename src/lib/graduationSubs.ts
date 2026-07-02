import graduation from "@/assets/categories/graduation.jpg";

export type GraduationSub = {
  slug: string;
  name: string;
  description: string;
  image: string;
};

export const graduationSubs: GraduationSub[] = [
  { slug: "gifts", name: "هدايا تخرج", description: "تشكيلة مميزة من هدايا التخرج بتصاميم راقية يمكن تخصيصها بالاسم والصورة.", image: graduation },
  { slug: "shields", name: "دروع تخرج", description: "دروع تخرج فاخرة بتصاميم أنيقة مع إمكانية إضافة الاسم والعبارة والصورة.", image: graduation },
  { slug: "favors", name: "توزيعات تخرج", description: "توزيعات تخرج بأشكال ومواد متنوعة تناسب جميع الحفلات مع تخصيص كامل.", image: graduation },
  { slug: "sashes-caps", name: "وشاحات وقبعات تخرج", description: "وشاحات وقبعات تخرج مميزة يمكن تخصيصها بالاسم واللون حسب رغبتكم.", image: graduation },
];

export const getGraduationSub = (slug: string) => graduationSubs.find((s) => s.slug === slug);

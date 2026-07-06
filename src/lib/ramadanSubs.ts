import ramadan from "@/assets/categories/ramadan.jpg";

export type RamadanSub = {
  slug: string;
  name: string;
  description: string;
  image: string;
};

export const ramadanSubs: RamadanSub[] = [
  { slug: "ramadan-decor", name: "زينة رمضان", description: "تشكيلة مميزة من زينة رمضان بتصاميم إسلامية راقية.", image: ramadan },
  { slug: "ramadan-favors", name: "توزيعات رمضان", description: "توزيعات رمضان بأشكال ومواد متنوعة يمكن تخصيصها بالاسم.", image: ramadan },
  { slug: "islamic-boards", name: "لوحات إسلامية", description: "لوحات إسلامية أنيقة بتصاميم مميزة تليق بكل منزل.", image: ramadan },
  { slug: "serving-trays", name: "صواني ضيافة", description: "صواني ضيافة فاخرة بتصاميم عصرية تناسب المناسبات.", image: ramadan },
  { slug: "islamic-eids", name: "أعياد إسلامية", description: "هدايا وتوزيعات وزينة للأعياد الإسلامية بتصاميم مميزة.", image: ramadan },
  { slug: "christian-eids", name: "أعياد مسيحية", description: "هدايا وتوزيعات وزينة للأعياد المسيحية بتصاميم راقية.", image: ramadan },
];

export const getRamadanSub = (slug: string) => ramadanSubs.find((s) => s.slug === slug);

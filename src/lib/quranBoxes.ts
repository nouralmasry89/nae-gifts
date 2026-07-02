import mushafs from "@/assets/products/quran/mushafs.jpg";
import baskets from "@/assets/products/quran/baskets.jpg";
import boxes from "@/assets/products/quran/boxes.png";

export type QuranItem = {
  slug: string;
  name: string;
  image: string;
  description: string;
  price?: string; // نص السعر المعروض
  hasOrderForm: boolean;
};

export const quranItems: QuranItem[] = [
  {
    slug: "mushafs",
    name: "مصاحف",
    image: mushafs,
    description:
      "مصاحف من المخمل بتصاميم إسلامية راقية ومميزة مع إضافة إسم الشخص الذي سوف تقومون بإهداء المصحف له وكذلك عبارة أو آية أو دعاء من اختياركم.",
    price: "وهبة المصحف مع الإسم والعبارة ٧٥٠ ليرة سورية جديدة",
    hasOrderForm: true,
  },
  {
    slug: "baskets",
    name: "سلل مصاحف",
    image: baskets,
    description:
      "سلة مصحف تحتوي على مصحف وسجادة صلاة ومسبحة بتصميم أنيق ومميز مع إضافة إسم صاحب الهدية على المصحف والمسبحة وعبارة من اختياركم على المصحف.",
    price: "وهبة سلة المصحف ١٥٠٠ ليرة سورية جديدة",
    hasOrderForm: true,
  },
  {
    slug: "boxes",
    name: "صناديق مصاحف",
    image: boxes,
    description:
      "صناديق مصاحف بتصاميم مميزة من الخشب أو البليكسي، يحتوي الصندوق على مصحف وسجادة صلاة ومسبحة أو أي إضافات ترغبون بها، مع كتابة اسم صاحب الهدية بالبليكسي على الصندوق والمصحف والمسبحة.",
    hasOrderForm: false,
  },
];

export const getQuranItem = (slug: string) =>
  quranItems.find((i) => i.slug === slug);

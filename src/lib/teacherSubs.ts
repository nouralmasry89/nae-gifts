import teacher from "@/assets/categories/teacher.jpg";

export type TeacherSub = {
  slug: string;
  name: string;
  description: string;
  image: string;
};

export const teacherSubs: TeacherSub[] = [
  { slug: "thanks-shields", name: "دروع شكر", description: "دروع شكر وتقدير للمعلم بتصاميم فاخرة مع إضافة الاسم والعبارة التي ترغبون بها.", image: teacher },
  { slug: "teacher-gifts", name: "هدايا المعلم", description: "هدايا مميزة للمعلم بتصاميم وأشكال ومواد متنوعة قابلة للتخصيص بالاسم والصورة.", image: teacher },
  { slug: "name-plates", name: "لوحات اسمية مكتبية", description: "لوحات اسمية مكتبية أنيقة تليق بمكتب المعلم مع تخصيص كامل بالاسم والتصميم.", image: teacher },
];

export const getTeacherSub = (slug: string) => teacherSubs.find((s) => s.slug === slug);

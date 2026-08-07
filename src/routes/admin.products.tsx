import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Package, Plus, Trash2, Pencil, Upload } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import {
  saveProduct,
  deleteProduct,
  listAdminProducts,
  uploadProductImage,
} from "@/lib/api/products-admin.functions";
import { allProducts } from "@/lib/products";

export const Route = createFileRoute("/admin/products")({
  head: () => ({
    meta: [{ title: "إدارة المنتجات — N.A.E Gifts Store" }],
  }),
  component: AdminProductsPage,
});

const CATEGORY_NAMES: Record<string, string> = {
  rings: "ستاندات محابس",
  dowry: "صناديق مهر و هدايا",
  flowers: "باقات ورد صناعي",
  birthday: "أعياد الميلاد",
  graduation: "التخرج",
  mother: "عيد الأم",
  newborn: "مواليد",
  ramadan: "رمضان",
  teacher: "هدايا المعلمين",
};

type SizeOption = {
  label: string;
  price: number;
};

type AdminProductRow = {
  id: string;
  category: string;
  name: string;
  image: string;
  gallery: string[] | null;
  price_new: number | null;
  price_old: number | null;
  price_note: string | null;
  size_options: SizeOption[] | null;
  description: string | null;
  source: "supabase" | "legacy";
};

function getCategoryName(slug: string): string {
  return CATEGORY_NAMES[slug] || slug;
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(",")[1] || "");
    };

    reader.onerror = () => reject(new Error("تعذّرت قراءة الملف"));
    reader.readAsDataURL(file);
  });
}

async function uploadImage(
  file: File,
  password: string,
): Promise<string> {
  const contentType =
    file.type && file.type.trim() !== ""
      ? file.type
      : "image/jpeg";

  const base64Data = await fileToBase64(file);

  const res = await uploadProductImage({
    data: {
      password,
      fileName: file.name,
      contentType,
      base64Data,
    },
  });

  return res.url;
}

function AdminProductsPage() {
  const [password, setPassword] = useState("");
  const [unlocked, setUnlocked] = useState(false);

  const [supabaseProducts, setSupabaseProducts] = useState<
    AdminProductRow[]
  >([]);

  const [loadingList, setLoadingList] = useState(false);
  const [listError, setListError] = useState("");

  // بيانات الفورم
  const [editingId, setEditingId] = useState<string | null>(null);
  const [categorySlug, setCategorySlug] = useState("rings");
  const [name, setName] = useState("");
  const [priceNew, setPriceNew] = useState("");
  const [priceOld, setPriceOld] = useState("");
  const [priceNote, setPriceNote] = useState("");
  const [description, setDescription] = useState("");
  const [sizeOptions, setSizeOptions] = useState<SizeOption[]>([]);

  const [mainImageFile, setMainImageFile] =
    useState<File | null>(null);

  const [mainImagePreview, setMainImagePreview] =
    useState<string>("");

  const [galleryFiles, setGalleryFiles] =
    useState<File[]>([]);

  const [galleryPreviews, setGalleryPreviews] =
    useState<string[]>([]);

  const [existingImageUrl, setExistingImageUrl] =
    useState("");

  const [existingGallery, setExistingGallery] =
    useState<string[]>([]);

  const [saving, setSaving] = useState(false);

  const [formMessage, setFormMessage] = useState<{
    ok: boolean;
    text: string;
  } | null>(null);

  /*
   * تحميل المنتجات الموجودة في Supabase
   */
  const loadProducts = async (pwd: string) => {
    setLoadingList(true);
    setListError("");

    try {
      const rows = await listAdminProducts({
        data: {
          password: pwd,
        },
      });

      setSupabaseProducts(rows as AdminProductRow[]);
    } catch (err) {
      setListError(
        err instanceof Error
          ? err.message
          : "حدث خطأ أثناء تحميل المنتجات",
      );
    }

    setLoadingList(false);
  };

  /*
   * دمج المنتجات القديمة من products.ts
   * مع المنتجات الجديدة من Supabase.
   */
  const allAdminProducts = useMemo<AdminProductRow[]>(() => {
    const legacyProducts: AdminProductRow[] =
      allProducts.map((p) => ({
        id: `legacy-${p.id}`,
        category: p.categorySlug,
        name: p.name,
        image: p.image,
        gallery: p.gallery || null,
        price_new: p.priceNew ?? 0,
        price_old: p.priceOld ?? 0,
        price_note: p.priceNote || null,
        size_options: p.sizeOptions || null,
        description: p.description || null,
        source: "legacy",
      }));

    const newProducts: AdminProductRow[] =
      supabaseProducts.map((p) => ({
        ...p,
        source: "supabase",
      }));

    return [...legacyProducts, ...newProducts];
  }, [supabaseProducts]);

  /*
   * الأقسام الموجودة فعليًا في المنتجات القديمة والجديدة.
   */
  const categoryOptions = useMemo(() => {
    const slugs = Array.from(
      new Set(
        allAdminProducts
          .map((p) => p.category)
          .filter(Boolean),
      ),
    );

    return slugs.map((slug) => ({
      slug,
      name: getCategoryName(slug),
    }));
  }, [allAdminProducts]);

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();

    await loadProducts(password);

    setUnlocked(true);
  };

  const resetForm = () => {
    setEditingId(null);
    setCategorySlug("rings");
    setName("");
    setPriceNew("");
    setPriceOld("");
    setPriceNote("");
    setDescription("");
    setSizeOptions([]);
    setMainImageFile(null);
    setMainImagePreview("");
    setGalleryFiles([]);
    setGalleryPreviews([]);
    setExistingImageUrl("");
    setExistingGallery([]);
    setFormMessage(null);
  };

  const startEdit = (p: AdminProductRow) => {
    /*
     * المنتجات القديمة ما زالت مرتبطة بملف products.ts.
     * سيتم تفعيل تعديلها في الخطوة التالية بعد نقلها
     * بشكل آمن إلى Supabase.
     */
    if (p.source === "legacy") {
      alert(
        "هذا المنتج من المنتجات القديمة. سنفعّل تعديله وحذفه من لوحة التحكم في الخطوة التالية بعد نقل بياناته إلى قاعدة البيانات."
      );
      return;
    }

    setEditingId(p.id);
    setCategorySlug(p.category);
    setName(p.name);
    setPriceNew(
      p.price_new !== null && p.price_new !== undefined
        ? String(p.price_new)
        : "",
    );
    setPriceOld(
      p.price_old !== null && p.price_old !== undefined
        ? String(p.price_old)
        : "",
    );
    setPriceNote(p.price_note || "");
    setDescription(p.description || "");
    setSizeOptions(p.size_options || []);
    setExistingImageUrl(p.image);
    setExistingGallery(p.gallery || []);
    setMainImageFile(null);
    setMainImagePreview("");
    setGalleryFiles([]);
    setGalleryPreviews([]);
    setFormMessage(null);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleMainImageChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setMainImageFile(file);
    setMainImagePreview(
      URL.createObjectURL(file),
    );
  };

  const handleGalleryChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = Array.from(
      e.target.files || [],
    );

    setGalleryFiles(files);

    setGalleryPreviews(
      files.map((f) =>
        URL.createObjectURL(f),
      ),
    );
  };

  const addSizeOption = () => {
    setSizeOptions([
      ...sizeOptions,
      {
        label: "",
        price: 0,
      },
    ]);
  };

  const updateSizeOption = (
    i: number,
    field: "label" | "price",
    value: string,
  ) => {
    const copy = [...sizeOptions];

    copy[i] = {
      ...copy[i],
      [field]:
        field === "price"
          ? Number(value) || 0
          : value,
    };

    setSizeOptions(copy);
  };

  const removeSizeOption = (i: number) => {
    setSizeOptions(
      sizeOptions.filter(
        (_, idx) => idx !== i,
      ),
    );
  };

  const handleSave = async (
    e: React.FormEvent,
  ) => {
    e.preventDefault();

    setSaving(true);
    setFormMessage(null);

    try {
      let imageUrl = existingImageUrl;

      if (mainImageFile) {
        imageUrl = await uploadImage(
          mainImageFile,
          password,
        );
      }

      if (!imageUrl) {
        setSaving(false);

        setFormMessage({
          ok: false,
          text: "الصورة الرئيسية مطلوبة.",
        });

        return;
      }

      let gallery = existingGallery;

      if (galleryFiles.length > 0) {
        gallery = await Promise.all(
          galleryFiles.map((f) =>
            uploadImage(f, password),
          ),
        );
      }

      const res = await saveProduct({
        data: {
          password,
          id: editingId || undefined,
          categorySlug,
          name: name.trim(),
          imageUrl,
          gallery,
          priceNew:
            Number(priceNew) || 0,
          priceOld:
            Number(priceOld) || 0,
          priceNote:
            priceNote.trim() || undefined,
          sizeOptions:
            sizeOptions.filter(
              (s) => s.label.trim(),
            ),
          description:
            description.trim(),
        },
      });

      setFormMessage({
        ok: true,
        text: editingId
          ? "تم تحديث المنتج ✅"
          : `تم إضافة المنتج ✅ (المعرّف: ${res.id})`,
      });

      resetForm();

      await loadProducts(password);
    } catch (err) {
      setFormMessage({
        ok: false,
        text:
          err instanceof Error
            ? err.message
            : "حدث خطأ غير متوقع",
      });
    }

    setSaving(false);
  };

  const handleDelete = async (
    p: AdminProductRow,
  ) => {
    if (p.source === "legacy") {
      alert(
        "هذا المنتج من المنتجات القديمة. سنفعّل حذفه من لوحة التحكم في الخطوة التالية بعد نقل بياناته إلى قاعدة البيانات."
      );
      return;
    }

    if (
      !confirm(
        "متأكد من حذف هذا المنتج؟ لا يمكن التراجع.",
      )
    ) {
      return;
    }

    try {
      await deleteProduct({
        data: {
          password,
          id: p.id,
        },
      });

      await loadProducts(password);
    } catch (err) {
      alert(
        err instanceof Error
          ? err.message
          : "حدث خطأ أثناء الحذف",
      );
    }
  };

  useEffect(() => {
    return () => {
      if (mainImagePreview) {
        URL.revokeObjectURL(
          mainImagePreview,
        );
      }

      galleryPreviews.forEach((u) => {
        URL.revokeObjectURL(u);
      });
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /*
   * شاشة تسجيل الدخول
   */
  if (!unlocked) {
    return (
      <div className="min-h-screen">
        <Header />

        <main className="mx-auto max-w-sm px-4 py-16">
          <div className="mb-6 text-center">
            <Package className="mx-auto h-10 w-10 text-primary" />

            <h1 className="mt-3 text-2xl font-extrabold">
              إدارة المنتجات
            </h1>

            <p className="mt-1 text-sm text-muted-foreground">
              هذه الصفحة لك فقط
            </p>
          </div>

          <form
            onSubmit={handleUnlock}
            className="space-y-4 rounded-xl border border-border bg-card p-5"
          >
            <input
              type="password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              placeholder="كلمة السر الإدارية"
              className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
            />

            {listError && (
              <p className="text-sm text-destructive">
                {listError}
              </p>
            )}

            <button
              type="submit"
              disabled={loadingList}
              className="w-full rounded-lg bg-primary px-6 py-3 text-base font-bold text-primary-foreground hover:opacity-90 disabled:opacity-60"
            >
              {loadingList
                ? "جارٍ التحقق..."
                : "دخول"}
            </button>
          </form>
        </main>

        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />

      <main className="mx-auto max-w-4xl px-4 py-10">
        {/* العنوان والإحصائيات */}
        <div className="mb-6">
          <div className="flex items-center gap-2">
            <Package className="h-7 w-7 text-primary" />

            <h1 className="text-2xl font-extrabold">
              إدارة المنتجات
            </h1>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="text-2xl font-extrabold">
                {allAdminProducts.length}
              </div>

              <div className="mt-1 text-xs text-muted-foreground">
                إجمالي المنتجات
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-4">
              <div className="text-2xl font-extrabold">
                {allProducts.length}
              </div>

              <div className="mt-1 text-xs text-muted-foreground">
                المنتجات القديمة
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-4">
              <div className="text-2xl font-extrabold">
                {supabaseProducts.length}
              </div>

              <div className="mt-1 text-xs text-muted-foreground">
                المنتجات الجديدة
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-4">
              <div className="text-2xl font-extrabold">
                {categoryOptions.length}
              </div>

              <div className="mt-1 text-xs text-muted-foreground">
                الأقسام
              </div>
            </div>
          </div>
        </div>

        {/* فورم الإضافة / التعديل */}
        <form
          onSubmit={handleSave}
          className="space-y-4 rounded-xl border border-border bg-card p-5"
        >
          <h2 className="text-lg font-bold">
            {editingId
              ? "تعديل منتج"
              : "إضافة منتج جديد"}
          </h2>

          <div>
            <label className="mb-2 block text-sm font-bold">
              القسم
            </label>

            <select
              value={categorySlug}
              onChange={(e) =>
                setCategorySlug(
                  e.target.value,
                )
              }
              className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
            >
              {categoryOptions.map((c) => (
                <option
                  key={c.slug}
                  value={c.slug}
                >
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold">
              اسم المنتج
            </label>

            <input
              type="text"
              value={name}
              onChange={(e) =>
                setName(e.target.value)
              }
              placeholder="مثال: ستاند محابس - تصميم جديد"
              className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold">
              الصورة الرئيسية
            </label>

            {(mainImagePreview ||
              existingImageUrl) && (
              <img
                src={
                  mainImagePreview ||
                  existingImageUrl
                }
                alt=""
                className="mb-2 h-32 w-32 rounded-lg border border-border object-cover"
              />
            )}

            <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-bold hover:border-primary">
              <Upload className="h-4 w-4" />

              اختر صورة

              <input
                type="file"
                accept="image/*"
                onChange={
                  handleMainImageChange
                }
                className="hidden"
              />
            </label>
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold">
              صور معاينة إضافية (اختياري)
            </label>

            {(galleryPreviews.length >
              0 ||
              existingGallery.length >
                0) && (
              <div className="mb-2 flex flex-wrap gap-2">
                {(
                  galleryPreviews.length >
                  0
                    ? galleryPreviews
                    : existingGallery
                ).map((src, i) => (
                  <img
                    key={i}
                    src={src}
                    alt=""
                    className="h-16 w-16 rounded-lg border border-border object-cover"
                  />
                ))}
              </div>
            )}

            <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-bold hover:border-primary">
              <Upload className="h-4 w-4" />

              اختر عدة صور

              <input
                type="file"
                accept="image/*"
                multiple
                onChange={
                  handleGalleryChange
                }
                className="hidden"
              />
            </label>

            <p className="mt-1 text-xs text-muted-foreground">
              اختيار صور جديدة سيستبدل القديمة بالكامل.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-bold">
                السعر (ليرة جديدة)
              </label>

              <input
                type="number"
                value={priceNew}
                onChange={(e) =>
                  setPriceNew(
                    e.target.value,
                  )
                }
                placeholder="مثال: 2500"
                className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold">
                السعر (ليرة قديمة)
              </label>

              <input
                type="number"
                value={priceOld}
                onChange={(e) =>
                  setPriceOld(
                    e.target.value,
                  )
                }
                placeholder="مثال: 250000"
                className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold">
              ملاحظة سعر بديلة{" "}
              <span className="font-normal text-muted-foreground">
                (اختياري)
              </span>
            </label>

            <input
              type="text"
              value={priceNote}
              onChange={(e) =>
                setPriceNote(
                  e.target.value,
                )
              }
              placeholder="مثال: من 2,000 إلى 3,500 ل.س جديدة حسب الحجم"
              className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
            />
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-sm font-bold">
                خيارات أحجام وأسعار مختلفة{" "}
                <span className="font-normal text-muted-foreground">
                  (اختياري)
                </span>
              </label>

              <button
                type="button"
                onClick={
                  addSizeOption
                }
                className="text-xs font-bold text-primary hover:underline"
              >
                + إضافة خيار
              </button>
            </div>

            {sizeOptions.map(
              (s, i) => (
                <div
                  key={i}
                  className="mb-2 flex gap-2"
                >
                  <input
                    type="text"
                    value={s.label}
                    onChange={(e) =>
                      updateSizeOption(
                        i,
                        "label",
                        e.target.value,
                      )
                    }
                    placeholder="مثال: 25 سم"
                    className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                  />

                  <input
                    type="number"
                    value={
                      s.price || ""
                    }
                    onChange={(e) =>
                      updateSizeOption(
                        i,
                        "price",
                        e.target.value,
                      )
                    }
                    placeholder="السعر"
                    className="w-28 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      removeSizeOption(
                        i,
                      )
                    }
                    className="text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ),
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold">
              الوصف
            </label>

            <textarea
              value={description}
              onChange={(e) =>
                setDescription(
                  e.target.value,
                )
              }
              rows={4}
              placeholder="وصف المنتج وتفاصيله..."
              className="w-full resize-none rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
            />
          </div>

          {formMessage && (
            <div
              className={`rounded-lg border px-3 py-2 text-sm ${
                formMessage.ok
                  ? "border-primary/40 bg-primary/10 text-primary"
                  : "border-destructive/40 bg-destructive/10 text-destructive"
              }`}
            >
              {formMessage.text}
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-base font-bold text-primary-foreground hover:opacity-90 disabled:opacity-60"
            >
              <Plus className="h-4 w-4" />

              {saving
                ? "جارٍ الحفظ..."
                : editingId
                  ? "حفظ التعديلات"
                  : "إضافة المنتج"}
            </button>

            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-lg border border-border px-6 py-3 text-sm font-bold text-muted-foreground hover:border-primary"
              >
                إلغاء
              </button>
            )}
          </div>
        </form>

        {/* جميع المنتجات */}
        <div className="mt-10">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold">
                جميع المنتجات
              </h2>

              <p className="mt-1 text-xs text-muted-foreground">
                المنتجات القديمة والجديدة معًا
              </p>
            </div>

            <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-bold text-primary">
              {allAdminProducts.length}
            </span>
          </div>

          {loadingList ? (
            <p className="text-sm text-muted-foreground">
              جارٍ تحميل المنتجات...
            </p>
          ) : allAdminProducts.length ===
            0 ? (
            <p className="text-sm text-muted-foreground">
              لا يوجد منتجات.
            </p>
          ) : (
            <div className="space-y-8">
              {categoryOptions.map(
                (category) => {
                  const categoryProducts =
                    allAdminProducts.filter(
                      (p) =>
                        p.category ===
                        category.slug,
                    );

                  if (
                    categoryProducts.length ===
                    0
                  ) {
                    return null;
                  }

                  return (
                    <section
                      key={
                        category.slug
                      }
                    >
                      <div className="mb-3 flex items-center justify-between">
                        <h3 className="text-base font-extrabold">
                          {category.name}
                        </h3>

                        <span className="text-xs text-muted-foreground">
                          {
                            categoryProducts.length
                          }{" "}
                          منتج
                        </span>
                      </div>

                      <div className="grid gap-3 md:grid-cols-2">
                        {categoryProducts.map(
                          (p) => (
                            <div
                              key={`${p.source}-${p.id}`}
                              className="flex items-center gap-3 rounded-xl border border-border bg-card p-3"
                            >
                              <img
                                src={p.image}
                                alt=""
                                className="h-16 w-16 shrink-0 rounded-lg object-cover"
                              />

                              <div className="min-w-0 flex-1">
                                <div className="truncate text-sm font-bold">
                                  {p.name}
                                </div>

                                <div className="mt-1 text-xs text-muted-foreground">
                                  {getCategoryName(
                                    p.category,
                                  )}
                                </div>

                                <div className="mt-1">
                                  {p.source ===
                                  "legacy" ? (
                                    <span className="inline-flex rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold text-muted-foreground">
                                      منتج قديم
                                    </span>
                                  ) : (
                                    <span className="inline-flex rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                                      من قاعدة البيانات
                                    </span>
                                  )}
                                </div>
                              </div>

                              <button
                                onClick={() =>
                                  startEdit(
                                    p,
                                  )
                                }
                                aria-label="تعديل"
                                className="text-muted-foreground hover:text-primary"
                              >
                                <Pencil className="h-4 w-4" />
                              </button>

                              <button
                                onClick={() =>
                                  handleDelete(
                                    p,
                                  )
                                }
                                aria-label="حذف"
                                className="text-muted-foreground hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          ),
                        )}
                      </div>
                    </section>
                  );
                },
              )}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

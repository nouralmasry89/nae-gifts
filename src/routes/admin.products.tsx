import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Package,
  Plus,
  Trash2,
  Pencil,
  Upload,
  X,
} from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import {
  saveProduct,
  deleteProduct,
  listAdminProducts,
  uploadProductImage,
} from "@/lib/api/products-admin.functions";
import { allProducts } from "@/lib/products";
import { categories } from "@/lib/categories";

export const Route = createFileRoute("/admin/products")({
  head: () => ({
    meta: [{ title: "إدارة المنتجات — N.A.E Gifts Store" }],
  }),
  component: AdminProductsPage,
});

type SizeOption = {
  label: string;
  price: number;
};

type AdminProductRow = {
  id: string;
  legacy_id?: string | null;
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

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(",")[1] || "");
    };

    reader.onerror = () =>
      reject(new Error("تعذّرت قراءة الملف"));

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

  const [supabaseProducts, setSupabaseProducts] =
    useState<AdminProductRow[]>([]);

  const [loadingList, setLoadingList] = useState(false);
  const [listError, setListError] = useState("");

  const [editingId, setEditingId] =
    useState<string | null>(null);

  const [editingLegacyId, setEditingLegacyId] =
    useState<string | null>(null);

  const [categorySlug, setCategorySlug] =
    useState("rings");

  const [name, setName] = useState("");
  const [priceNew, setPriceNew] = useState("");
  const [priceOld, setPriceOld] = useState("");
  const [priceNote, setPriceNote] = useState("");
  const [description, setDescription] =
    useState("");

  const [sizeOptions, setSizeOptions] =
    useState<SizeOption[]>([]);

  const [mainImageFile, setMainImageFile] =
    useState<File | null>(null);

  const [mainImagePreview, setMainImagePreview] =
    useState("");

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

  const loadProducts = async (pwd: string) => {
    setLoadingList(true);
    setListError("");

    try {
      const rows = await listAdminProducts({
        data: {
          password: pwd,
        },
      });

      setSupabaseProducts(
        rows as AdminProductRow[],
      );
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
   * تحويل المنتجات القديمة إلى صفوف قابلة
   * للعرض في لوحة التحكم.
   */
  const legacyProducts: AdminProductRow[] =
    allProducts.map((p) => ({
      id: "",
      legacy_id: p.id,
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

  /*
   * المنتجات التي أصبحت موجودة في Supabase.
   *
   * إذا كان المنتج يحمل legacy_id فهو نسخة
   * إدارية من منتج قديم، لذلك لا نعرضه مرتين.
   */
  const allAdminProducts = useMemo<
    AdminProductRow[]
  >(() => {
    const legacyIds = new Set(
      supabaseProducts
        .map((p) => p.legacy_id)
        .filter(Boolean),
    );

    const oldProducts = legacyProducts.filter(
      (p) => !legacyIds.has(p.legacy_id),
    );

    const newProducts =
      supabaseProducts.map((p) => ({
        ...p,
        source: "supabase" as const,
      }));

    return [...oldProducts, ...newProducts];
  }, [supabaseProducts]);

  /*
   * جميع الأقسام الموجودة في categories.ts
   * وليس فقط الأقسام التي لديها منتجات.
   */
  const categoryOptions = useMemo(() => {
    return categories.map((category) => ({
      slug: category.slug,
      name: category.name,
    }));
  }, []);

  const handleUnlock = async (
    e: React.FormEvent,
  ) => {
    e.preventDefault();

    if (!password.trim()) {
      setListError("أدخل كلمة السر الإدارية.");
      return;
    }

    await loadProducts(password);
    setUnlocked(true);
  };

  const resetForm = () => {
    setEditingId(null);
    setEditingLegacyId(null);

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

  const startEdit = (
    p: AdminProductRow,
  ) => {
    setEditingId(
      p.source === "supabase"
        ? p.id
        : null,
    );

    setEditingLegacyId(
      p.source === "legacy"
        ? p.legacy_id || null
        : p.legacy_id || null,
    );

    setCategorySlug(p.category);
    setName(p.name);

    setPriceNew(
      p.price_new !== null &&
        p.price_new !== undefined
        ? String(p.price_new)
        : "",
    );

    setPriceOld(
      p.price_old !== null &&
        p.price_old !== undefined
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

  const removeSizeOption = (
    i: number,
  ) => {
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

    if (!name.trim()) {
      setFormMessage({
        ok: false,
        text: "يرجى إدخال اسم المنتج.",
      });
      return;
    }

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
          galleryFiles.map((file) =>
            uploadImage(file, password),
          ),
        );
      }

      const res = await saveProduct({
        data: {
          password,

          id:
            editingId ||
            undefined,

          legacyId:
            editingLegacyId ||
            undefined,

          categorySlug,

          name: name.trim(),

          imageUrl,

          gallery,

          priceNew:
            Number(priceNew) || 0,

          priceOld:
            Number(priceOld) || 0,

          priceNote:
            priceNote.trim() ||
            undefined,

          sizeOptions:
            sizeOptions.filter(
              (s) =>
                s.label.trim() !== "",
            ),

          description:
            description.trim(),
        },
      });

      setFormMessage({
        ok: true,
        text: editingId ||
          editingLegacyId
          ? "تم تحديث المنتج بنجاح ✅"
          : `تم إضافة المنتج بنجاح ✅`,
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
    const isLegacy =
      p.source === "legacy";

    const message = isLegacy
      ? `سيتم حذف نسخة المنتج "${p.name}" من لوحة الإدارة/قاعدة البيانات إن كانت موجودة. المنتج الأصلي في الموقع لن يتم حذفه. هل تريد المتابعة؟`
      : `هل أنت متأكد من حذف المنتج "${p.name}"؟ لا يمكن التراجع عن هذا الإجراء.`;

    if (!confirm(message)) {
      return;
    }

    try {
      await deleteProduct({
        data: isLegacy
          ? {
              password,
              legacyId:
                p.legacy_id || undefined,
            }
          : {
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

      galleryPreviews.forEach((url) => {
        URL.revokeObjectURL(url);
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

      <main className="mx-auto max-w-5xl px-4 py-10">

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
                في قاعدة البيانات
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

        {/* نموذج المنتج */}
        <form
          onSubmit={handleSave}
          className="space-y-5 rounded-xl border border-border bg-card p-5"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">
              {editingId || editingLegacyId
                ? "تعديل المنتج"
                : "إضافة منتج جديد"}
            </h2>

            {(editingId ||
              editingLegacyId) && (
              <button
                type="button"
                onClick={resetForm}
                className="text-muted-foreground hover:text-destructive"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>

          {/* القسم */}
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
              {categoryOptions.map(
                (category) => (
                  <option
                    key={category.slug}
                    value={category.slug}
                  >
                    {category.name}
                  </option>
                ),
              )}
            </select>
          </div>

          {/* الاسم */}
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

          {/* الصورة الرئيسية */}
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
                className="mb-3 h-32 w-32 rounded-lg border border-border object-cover"
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

          {/* المعرض */}
          <div>
            <label className="mb-2 block text-sm font-bold">
              صور إضافية
            </label>

            {(galleryPreviews.length >
              0 ||
              existingGallery.length >
                0) && (
              <div className="mb-3 flex flex-wrap gap-2">
                {(galleryPreviews.length >
                0
                  ? galleryPreviews
                  : existingGallery
                ).map((src, index) => (
                  <img
                    key={index}
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
              عند اختيار صور جديدة سيتم استبدال صور المعرض القديمة.
            </p>
          </div>

          {/* الأسعار */}
          <div className="grid gap-4 md:grid-cols-2">

            <div>
              <label className="mb-2 block text-sm font-bold">
                السعر — ليرة جديدة
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
                السعر — ليرة قديمة
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

          {/* ملاحظة السعر */}
          <div>
            <label className="mb-2 block text-sm font-bold">
              ملاحظة السعر{" "}
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
              placeholder="مثال: من 2,000 إلى 3,500 ل.س حسب الحجم"
              className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
            />
          </div>

          {/* الأحجام */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-sm font-bold">
                خيارات الأحجام والأسعار
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
              (option, index) => (
                <div
                  key={index}
                  className="mb-2 flex gap-2"
                >
                  <input
                    type="text"
                    value={option.label}
                    onChange={(e) =>
                      updateSizeOption(
                        index,
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
                      option.price || ""
                    }
                    onChange={(e) =>
                      updateSizeOption(
                        index,
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
                        index,
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

          {/* الوصف */}
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
              rows={5}
              placeholder="وصف المنتج وتفاصيله..."
              className="w-full resize-none rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
            />
          </div>

          {/* الرسالة */}
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

          {/* الأزرار */}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-base font-bold text-primary-foreground hover:opacity-90 disabled:opacity-60"
            >
              {editingId ||
              editingLegacyId ? (
                <Pencil className="h-4 w-4" />
              ) : (
                <Plus className="h-4 w-4" />
              )}

              {saving
                ? "جارٍ الحفظ..."
                : editingId ||
                    editingLegacyId
                  ? "حفظ التعديلات"
                  : "إضافة المنتج"}
            </button>

            {(editingId ||
              editingLegacyId) && (
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

        {/* قائمة المنتجات */}
        <div className="mt-10">

          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold">
                جميع المنتجات
              </h2>

              <p className="mt-1 text-xs text-muted-foreground">
                المنتجات القديمة والجديدة
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
              لا توجد منتجات.
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
                          (product) => (
                            <div
                              key={`${product.source}-${product.id || product.legacy_id}`}
                              className="flex items-center gap-3 rounded-xl border border-border bg-card p-3"
                            >
                              <img
                                src={
                                  product.image
                                }
                                alt=""
                                className="h-16 w-16 shrink-0 rounded-lg object-cover"
                              />

                              <div className="min-w-0 flex-1">

                                <div className="truncate text-sm font-bold">
                                  {
                                    product.name
                                  }
                                </div>

                                <div className="mt-1 text-xs text-muted-foreground">
                                  {
                                    category.name
                                  }
                                </div>

                                <div className="mt-1">
                                  {product.source ===
                                  "legacy" ? (
                                    <span className="inline-flex rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold text-muted-foreground">
                                      منتج قديم
                                    </span>
                                  ) : (
                                    <span className="inline-flex rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                                      قاعدة البيانات
                                    </span>
                                  )}
                                </div>

                              </div>

                              <button
                                type="button"
                                onClick={() =>
                                  startEdit(
                                    product,
                                  )
                                }
                                aria-label="تعديل المنتج"
                                className="rounded-lg p-2 text-muted-foreground hover:bg-primary/10 hover:text-primary"
                              >
                                <Pencil className="h-4 w-4" />
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  handleDelete(
                                    product,
                                  )
                                }
                                aria-label="حذف المنتج"
                                className="rounded-lg p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
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

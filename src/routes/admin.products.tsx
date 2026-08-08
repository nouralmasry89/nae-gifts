import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Package,
  Plus,
  Trash2,
  Pencil,
  Upload,
  FolderPlus,
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

import {
  listAdminCategories,
  saveCategory,
  deleteCategory,
} from "@/lib/api/categories-admin.functions";

import { allProducts } from "@/lib/products";
import { categories as staticCategories } from "@/lib/categories";

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
  legacy_id?: string | null;
  source: "supabase" | "legacy";
};

type AdminCategory = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  image: string | null;
  created_at?: string;
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
  /* =========================================================
     كلمة السر
  ========================================================= */

  const [password, setPassword] = useState("");
  const [unlocked, setUnlocked] = useState(false);

  /* =========================================================
     المنتجات
  ========================================================= */

  const [supabaseProducts, setSupabaseProducts] =
    useState<AdminProductRow[]>([]);

  const [loadingList, setLoadingList] =
    useState(false);

  const [listError, setListError] =
    useState("");

  /* =========================================================
     الأقسام
  ========================================================= */

  const [adminCategories, setAdminCategories] =
    useState<AdminCategory[]>([]);

  const [categoryEditingId, setCategoryEditingId] =
    useState<string | null>(null);

  const [categorySlugInput, setCategorySlugInput] =
    useState("");

  const [categoryNameInput, setCategoryNameInput] =
    useState("");

  const [categoryDescriptionInput, setCategoryDescriptionInput] =
    useState("");

  const [categoryImageInput, setCategoryImageInput] =
    useState("");

  const [categorySaving, setCategorySaving] =
    useState(false);

  const [categoryMessage, setCategoryMessage] =
    useState<{
      ok: boolean;
      text: string;
    } | null>(null);

  /* =========================================================
     فورم المنتج
  ========================================================= */

  const [editingId, setEditingId] =
    useState<string | null>(null);

  const [editingLegacyId, setEditingLegacyId] =
    useState<string | null>(null);

  const [categorySlug, setCategorySlug] =
    useState("rings");

  const [name, setName] =
    useState("");

  const [priceNew, setPriceNew] =
    useState("");

  const [priceOld, setPriceOld] =
    useState("");

  const [priceNote, setPriceNote] =
    useState("");

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

  const [saving, setSaving] =
    useState(false);

  const [formMessage, setFormMessage] =
    useState<{
      ok: boolean;
      text: string;
    } | null>(null);

  /* =========================================================
     تحميل المنتجات
  ========================================================= */

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
    } finally {
      setLoadingList(false);
    }
  };

  /* =========================================================
     تحميل الأقسام
  ========================================================= */

  const loadCategories = async (pwd: string) => {
    try {
      const rows = await listAdminCategories({
        data: {
          password: pwd,
        },
      });

      setAdminCategories(
        rows as AdminCategory[],
      );
    } catch (err) {
      console.error(
        "تعذر تحميل الأقسام:",
        err,
      );
    }
  };

  /* =========================================================
     دمج المنتجات القديمة والجديدة
     
     إذا كان المنتج القديم موجودًا في Supabase
     بواسطة legacy_id، لا نعرض النسخة القديمة مرة ثانية.
  ========================================================= */

  const allAdminProducts =
    useMemo<AdminProductRow[]>(() => {
      const migratedLegacyIds = new Set(
        supabaseProducts
          .map((p) => p.legacy_id)
          .filter(
            (id): id is string =>
              typeof id === "string" &&
              id.length > 0,
          ),
      );

      const legacyProducts: AdminProductRow[] =
        allProducts
          .filter(
            (p) =>
              !migratedLegacyIds.has(p.id),
          )
          .map((p) => ({
            id: `legacy-${p.id}`,
            category: p.categorySlug,
            name: p.name,
            image: p.image,
            gallery: p.gallery || null,
            price_new: p.priceNew ?? 0,
            price_old: p.priceOld ?? 0,
            price_note: p.priceNote || null,
            size_options:
              p.sizeOptions || null,
            description:
              p.description || null,
            legacy_id: p.id,
            source: "legacy",
          }));

      const newProducts: AdminProductRow[] =
        supabaseProducts.map((p) => ({
          ...p,
          source: "supabase",
        }));

      return [
        ...legacyProducts,
        ...newProducts,
      ];
    }, [supabaseProducts]);

  /* =========================================================
     الأقسام
  ========================================================= */

  const categoryOptions =
    useMemo(() => {
      const map = new Map<
        string,
        {
          slug: string;
          name: string;
          description: string;
          image: string;
          source: "database" | "static";
          id?: string;
        }
      >();

      adminCategories.forEach((category) => {
        map.set(category.slug, {
          slug: category.slug,
          name: category.name,
          description:
            category.description || "",
          image: category.image || "",
          source: "database",
          id: category.id,
        });
      });

      staticCategories.forEach((category) => {
        if (!map.has(category.slug)) {
          map.set(category.slug, {
            slug: category.slug,
            name: category.name,
            description:
              category.description || "",
            image: category.image || "",
            source: "static",
          });
        }
      });

      allAdminProducts.forEach((product) => {
        if (!product.category) return;

        if (!map.has(product.category)) {
          map.set(product.category, {
            slug: product.category,
            name: getCategoryName(
              product.category,
            ),
            description: "",
            image: "",
            source: "static",
          });
        }
      });

      return Array.from(map.values());
    }, [
      adminCategories,
      allAdminProducts,
    ]);

  /* =========================================================
     فتح لوحة التحكم
  ========================================================= */

  const handleUnlock = async (
    e: React.FormEvent,
  ) => {
    e.preventDefault();

    setListError("");

    try {
      await Promise.all([
        loadProducts(password),
        loadCategories(password),
      ]);

      setUnlocked(true);
    } catch (err) {
      setListError(
        err instanceof Error
          ? err.message
          : "كلمة السر غير صحيحة.",
      );
    }
  };

  /* =========================================================
     إعادة ضبط فورم المنتج
  ========================================================= */

  const resetForm = () => {
    setEditingId(null);
    setEditingLegacyId(null);

    setCategorySlug(
      categoryOptions[0]?.slug ||
        "rings",
    );

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

  /* =========================================================
     تعديل منتج
  ========================================================= */

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

    setPriceNote(
      p.price_note || "",
    );

    setDescription(
      p.description || "",
    );

    setSizeOptions(
      p.size_options || [],
    );

    setExistingImageUrl(
      p.image,
    );

    setExistingGallery(
      p.gallery || [],
    );

    setMainImageFile(null);
    setMainImagePreview("");

    setGalleryFiles([]);
    setGalleryPreviews([]);

    setFormMessage({
      ok: true,
      text:
        p.source === "legacy"
          ? "هذا المنتج قديم. عند حفظه سيتم نقله إلى قاعدة البيانات ليصبح قابلاً للإدارة من لوحة التحكم."
          : "يمكنك تعديل المنتج وحفظ التغييرات.",
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  /* =========================================================
     الصورة الرئيسية
  ========================================================= */

  const handleMainImageChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file =
      e.target.files?.[0];

    if (!file) return;

    setMainImageFile(file);

    setMainImagePreview(
      URL.createObjectURL(file),
    );
  };

  /* =========================================================
     صور المعرض
  ========================================================= */

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

  /* =========================================================
     خيارات الأحجام
  ========================================================= */

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
    const copy = [
      ...sizeOptions,
    ];

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

  /* =========================================================
     حفظ المنتج
  ========================================================= */

  const handleSave = async (
    e: React.FormEvent,
  ) => {
    e.preventDefault();

    if (!name.trim()) {
      setFormMessage({
        ok: false,
        text: "اسم المنتج مطلوب.",
      });
      return;
    }

    setSaving(true);
    setFormMessage(null);

    try {
      let imageUrl =
        existingImageUrl;

      if (mainImageFile) {
        imageUrl =
          await uploadImage(
            mainImageFile,
            password,
          );
      }

      if (!imageUrl) {
        setFormMessage({
          ok: false,
          text:
            "الصورة الرئيسية مطلوبة.",
        });

        setSaving(false);
        return;
      }

      let gallery =
        existingGallery;

      if (
        galleryFiles.length > 0
      ) {
        gallery =
          await Promise.all(
            galleryFiles.map(
              (f) =>
                uploadImage(
                  f,
                  password,
                ),
            ),
          );
      }

      const res =
        await saveProduct({
          data: {
            password,

            /*
             * إذا كان المنتج موجودًا في Supabase
             * نرسل id.
             */
            id:
              editingId ||
              undefined,

            /*
             * إذا كان المنتج قديمًا
             * نرسل legacyId.
             */
            legacyId:
              editingLegacyId ||
              undefined,

            categorySlug,
            name: name.trim(),

            imageUrl,

            gallery,

            priceNew:
              Number(
                priceNew,
              ) || 0,

            priceOld:
              Number(
                priceOld,
              ) || 0,

            priceNote:
              priceNote.trim() ||
              undefined,

            sizeOptions:
              sizeOptions.filter(
                (s) =>
                  s.label.trim(),
              ),

            description:
              description.trim(),
          },
        });

      setFormMessage({
        ok: true,
        text: editingId
          ? "تم تحديث المنتج ✅"
          : editingLegacyId
            ? "تم نقل المنتج القديم إلى قاعدة البيانات وتحديثه ✅"
            : `تم إضافة المنتج ✅ (المعرّف: ${res.id})`,
      });

      resetForm();

      await loadProducts(
        password,
      );
    } catch (err) {
      setFormMessage({
        ok: false,
        text:
          err instanceof Error
            ? err.message
            : "حدث خطأ غير متوقع",
      });
    } finally {
      setSaving(false);
    }
  };

  /* =========================================================
     حذف منتج
  ========================================================= */

  const handleDelete = async (
    p: AdminProductRow,
  ) => {
    if (
      !confirm(
        `هل أنت متأكد من حذف المنتج "${p.name}"؟\n\nلا يمكن التراجع عن هذه العملية.`,
      )
    ) {
      return;
    }

    try {
      await deleteProduct({
        data: {
          password,

          /*
           * المنتج الموجود في Supabase
           */
          id:
            p.source === "supabase"
              ? p.id
              : undefined,

          /*
           * المنتج القديم
           */
          legacyId:
            p.source === "legacy"
              ? p.legacy_id
              : undefined,
        },
      });

      await loadProducts(
        password,
      );

      if (
        editingId === p.id ||
        editingLegacyId ===
          p.legacy_id
      ) {
        resetForm();
      }
    } catch (err) {
      alert(
        err instanceof Error
          ? err.message
          : "حدث خطأ أثناء الحذف",
      );
    }
  };

  /* =========================================================
     فورم القسم
  ========================================================= */

  const resetCategoryForm = () => {
    setCategoryEditingId(null);
    setCategorySlugInput("");
    setCategoryNameInput("");
    setCategoryDescriptionInput("");
    setCategoryImageInput("");
    setCategoryMessage(null);
  };

  const startEditCategory = (
    category: AdminCategory,
  ) => {
    setCategoryEditingId(
      category.id,
    );

    setCategorySlugInput(
      category.slug,
    );

    setCategoryNameInput(
      category.name,
    );

    setCategoryDescriptionInput(
      category.description || "",
    );

    setCategoryImageInput(
      category.image || "",
    );

    setCategoryMessage(null);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleSaveCategory =
    async (
      e: React.FormEvent,
    ) => {
      e.preventDefault();

      if (
        !categorySlugInput.trim()
      ) {
        setCategoryMessage({
          ok: false,
          text:
            "معرّف القسم مطلوب.",
        });
        return;
      }

      if (
        !categoryNameInput.trim()
      ) {
        setCategoryMessage({
          ok: false,
          text:
            "اسم القسم مطلوب.",
        });
        return;
      }

      setCategorySaving(true);
      setCategoryMessage(null);

      try {
        await saveCategory({
          data: {
            password,

            id:
              categoryEditingId ||
              undefined,

            slug:
              categorySlugInput
                .trim()
                .toLowerCase(),

            name:
              categoryNameInput.trim(),

            description:
              categoryDescriptionInput.trim(),

            image:
              categoryImageInput.trim(),
          },
        });

        setCategoryMessage({
          ok: true,
          text:
            categoryEditingId
              ? "تم تحديث القسم ✅"
              : "تم إنشاء القسم الجديد ✅",
        });

        resetCategoryForm();

        await loadCategories(
          password,
        );

        await loadProducts(
          password,
        );
      } catch (err) {
        setCategoryMessage({
          ok: false,
          text:
            err instanceof Error
              ? err.message
              : "حدث خطأ أثناء حفظ القسم.",
        });
      } finally {
        setCategorySaving(false);
      }
    };

  /* =========================================================
     حذف قسم
  ========================================================= */

  const handleDeleteCategory =
    async (
      category: AdminCategory,
    ) => {
      if (
        !confirm(
          `هل أنت متأكد من حذف قسم "${category.name}"؟`,
        )
      ) {
        return;
      }

      try {
        await deleteCategory({
          data: {
            password,
            id: category.id,
            slug: category.slug,
          },
        });

        await loadCategories(
          password,
        );

        setCategoryMessage({
          ok: true,
          text:
            "تم حذف القسم ✅",
        });
      } catch (err) {
        setCategoryMessage({
          ok: false,
          text:
            err instanceof Error
              ? err.message
              : "حدث خطأ أثناء حذف القسم.",
        });
      }
    };

  /* =========================================================
     تنظيف روابط الصور المؤقتة
  ========================================================= */

  useEffect(() => {
    return () => {
      if (mainImagePreview) {
        URL.revokeObjectURL(
          mainImagePreview,
        );
      }

      galleryPreviews.forEach(
        (u) => {
          URL.revokeObjectURL(u);
        },
      );
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* =========================================================
     شاشة تسجيل الدخول
  ========================================================= */

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
            onSubmit={
              handleUnlock
            }
            className="space-y-4 rounded-xl border border-border bg-card p-5"
          >
            <input
              type="password"
              value={password}
              onChange={(e) =>
                setPassword(
                  e.target.value,
                )
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
              disabled={
                loadingList
              }
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

  /* =========================================================
     لوحة التحكم
  ========================================================= */

  return (
    <div className="min-h-screen">
      <Header />

      <main className="mx-auto max-w-5xl px-4 py-10">

        {/* =====================================================
            العنوان والإحصائيات
        ===================================================== */}

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
                {
                  allAdminProducts.length
                }
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
                المنتجات الأصلية
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-4">
              <div className="text-2xl font-extrabold">
                {
                  supabaseProducts.length
                }
              </div>

              <div className="mt-1 text-xs text-muted-foreground">
                المنتجات في قاعدة البيانات
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-4">
              <div className="text-2xl font-extrabold">
                {
                  categoryOptions.length
                }
              </div>

              <div className="mt-1 text-xs text-muted-foreground">
                الأقسام
              </div>
            </div>

          </div>
        </div>

        {/* =====================================================
            إدارة الأقسام
        ===================================================== */}

        <section className="mb-8 rounded-xl border border-border bg-card p-5">

          <div className="mb-5 flex items-center justify-between gap-3">

            <div>
              <div className="flex items-center gap-2">
                <FolderPlus className="h-5 w-5 text-primary" />

                <h2 className="text-lg font-bold">
                  إدارة الأقسام
                </h2>
              </div>

              <p className="mt-1 text-xs text-muted-foreground">
                يمكنك إنشاء أقسام جديدة وتعديل الأقسام الموجودة في قاعدة البيانات.
              </p>
            </div>

            {categoryEditingId && (
              <button
                type="button"
                onClick={
                  resetCategoryForm
                }
                className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-xs font-bold text-muted-foreground hover:border-primary"
              >
                <X className="h-4 w-4" />
                إلغاء
              </button>
            )}

          </div>

          <form
            onSubmit={
              handleSaveCategory
            }
            className="space-y-4"
          >

            <div className="grid gap-4 md:grid-cols-2">

              <div>
                <label className="mb-2 block text-sm font-bold">
                  اسم القسم
                </label>

                <input
                  type="text"
                  value={
                    categoryNameInput
                  }
                  onChange={(e) =>
                    setCategoryNameInput(
                      e.target.value,
                    )
                  }
                  placeholder="مثال: هدايا الزواج"
                  className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold">
                  المعرّف التقني للقسم
                </label>

                <input
                  type="text"
                  value={
                    categorySlugInput
                  }
                  onChange={(e) =>
                    setCategorySlugInput(
                      e.target.value
                        .toLowerCase()
                        .replace(
                          /\s+/g,
                          "-",
                        ),
                    )
                  }
                  placeholder="مثال: wedding"
                  disabled={
                    !!categoryEditingId
                  }
                  className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary disabled:opacity-60"
                />

                <p className="mt-1 text-[11px] text-muted-foreground">
                  استخدم أحرف إنجليزية وأرقام وشرطة فقط.
                </p>
              </div>

            </div>

            <div>
              <label className="mb-2 block text-sm font-bold">
                وصف القسم
              </label>

              <textarea
                value={
                  categoryDescriptionInput
                }
                onChange={(e) =>
                  setCategoryDescriptionInput(
                    e.target.value,
                  )
                }
                rows={3}
                placeholder="وصف مختصر للقسم..."
                className="w-full resize-none rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold">
                رابط صورة القسم
                <span className="ml-1 font-normal text-muted-foreground">
                  (اختياري)
                </span>
              </label>

              <input
                type="text"
                value={
                  categoryImageInput
                }
                onChange={(e) =>
                  setCategoryImageInput(
                    e.target.value,
                  )
                }
                placeholder="https://..."
                className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
              />
            </div>

            {categoryMessage && (
              <div
                className={`rounded-lg border px-3 py-2 text-sm ${
                  categoryMessage.ok
                    ? "border-primary/40 bg-primary/10 text-primary"
                    : "border-destructive/40 bg-destructive/10 text-destructive"
                }`}
              >
                {
                  categoryMessage.text
                }
              </div>
            )}

            <button
              type="submit"
              disabled={
                categorySaving
              }
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-bold text-primary-foreground hover:opacity-90 disabled:opacity-60"
            >
              {categoryEditingId ? (
                <Pencil className="h-4 w-4" />
              ) : (
                <Plus className="h-4 w-4" />
              )}

              {categorySaving
                ? "جارٍ الحفظ..."
                : categoryEditingId
                  ? "حفظ تعديلات القسم"
                  : "إضافة قسم جديد"}
            </button>

          </form>

          {/* قائمة الأقسام */}

          <div className="mt-8">

            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-extrabold">
                الأقسام الحالية
              </h3>

              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                {
                  categoryOptions.length
                }
              </span>
            </div>

            <div className="grid gap-3 md:grid-cols-2">

              {categoryOptions.map(
                (category) => (
                  <div
                    key={
                      category.slug
                    }
                    className="flex items-center gap-3 rounded-xl border border-border bg-background p-3"
                  >

                    {category.image ? (
                      <img
                        src={
                          category.image
                        }
                        alt=""
                        className="h-14 w-14 shrink-0 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-muted">
                        <FolderPlus className="h-5 w-5 text-muted-foreground" />
                      </div>
                    )}

                    <div className="min-w-0 flex-1">

                      <div className="truncate text-sm font-bold">
                        {
                          category.name
                        }
                      </div>

                      <div className="mt-1 text-[11px] text-muted-foreground">
                        {category.slug}
                      </div>

                      <div className="mt-1">
                        {category.source ===
                        "database" ? (
                          <span className="inline-flex rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                            من قاعدة البيانات
                          </span>
                        ) : (
                          <span className="inline-flex rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold text-muted-foreground">
                            قسم أساسي
                          </span>
                        )}
                      </div>

                    </div>

                    {category.source ===
                      "database" &&
                      category.id && (
                        <>
                          <button
                            type="button"
                            onClick={() =>
                              startEditCategory(
                                {
                                  id: category.id!,
                                  slug: category.slug,
                                  name: category.name,
                                  description:
                                    category.description,
                                  image:
                                    category.image,
                                },
                              )
                            }
                            aria-label="تعديل القسم"
                            className="text-muted-foreground hover:text-primary"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleDeleteCategory(
                                {
                                  id: category.id!,
                                  slug: category.slug,
                                  name: category.name,
                                  description:
                                    category.description,
                                  image:
                                    category.image,
                                },
                              )
                            }
                            aria-label="حذف القسم"
                            className="text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </>
                      )}

                  </div>
                ),
              )}

            </div>

          </div>

        </section>

        {/* =====================================================
            فورم إضافة / تعديل المنتج
        ===================================================== */}

        <form
          onSubmit={handleSave}
          className="space-y-4 rounded-xl border border-border bg-card p-5"
        >

          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-bold">
              {editingId ||
              editingLegacyId
                ? "تعديل منتج"
                : "إضافة منتج جديد"}
            </h2>

            {(editingId ||
              editingLegacyId) && (
              <button
                type="button"
                onClick={
                  resetForm
                }
                className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-xs font-bold text-muted-foreground hover:border-primary"
              >
                <X className="h-4 w-4" />
                إلغاء التعديل
              </button>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold">
              القسم
            </label>

            <select
              value={
                categorySlug
              }
              onChange={(e) =>
                setCategorySlug(
                  e.target.value,
                )
              }
              className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
            >
              {categoryOptions.map(
                (c) => (
                  <option
                    key={c.slug}
                    value={c.slug}
                  >
                    {c.name}
                  </option>
                ),
              )}
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
                setName(
                  e.target.value,
                )
              }
              placeholder="مثال: ستاند محابس - تصميم جديد"
              className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold">
              الصورة الرئيسية
            </label>

            {(
              mainImagePreview ||
              existingImageUrl
            ) && (
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

            {(
              galleryPreviews.length >
                0 ||
              existingGallery.length >
                0
            ) && (
              <div className="mb-2 flex flex-wrap gap-2">
                {(
                  galleryPreviews.length >
                  0
                    ? galleryPreviews
                    : existingGallery
                ).map(
                  (src, i) => (
                    <img
                      key={i}
                      src={src}
                      alt=""
                      className="h-16 w-16 rounded-lg border border-border object-cover"
                    />
                  ),
                )}
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
              value={
                description
              }
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
              {
                formMessage.text
              }
            </div>
          )}

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
                onClick={
                  resetForm
                }
                className="rounded-lg border border-border px-6 py-3 text-sm font-bold text-muted-foreground hover:border-primary"
              >
                إلغاء
              </button>
            )}

          </div>

        </form>

        {/* =====================================================
            جميع المنتجات
        ===================================================== */}

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
              {
                allAdminProducts.length
              }
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
                          {
                            category.name
                          }
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
                                type="button"
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
                                type="button"
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

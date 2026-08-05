import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Package, Plus, Trash2, Pencil, Upload } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { supabase } from "@/lib/supabase";
import { saveProduct, deleteProduct, listAdminProducts } from "@/lib/api/products-admin.functions";

export const Route = createFileRoute("/admin/products")({
  head: () => ({ meta: [{ title: "إدارة المنتجات — N.A.E Gifts Store" }] }),
  component: AdminProductsPage,
});

const CATEGORY_OPTIONS = [
  { slug: "rings", name: "ستاندات محابس" },
  { slug: "dowry", name: "صناديق مهر و هدايا" },
  { slug: "flowers", name: "باقات ورد صناعي" },
];

type SizeOption = { label: string; price: number };

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
};

async function uploadImage(file: File): Promise<string> {
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
  const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  // بعض الصور القادمة من كاميرا/معرض الأندرويد بييجي نوعها (type) فارغ،
  // فبنحدد نوع افتراضي صريح لتفادي خطأ "Invalid value" عند الرفع.
  const contentType = file.type && file.type.trim() !== "" ? file.type : "image/jpeg";
  const { error } = await supabase.storage
    .from("products")
    .upload(path, file, { contentType, upsert: true });
  if (error) throw new Error("فشل رفع الصورة: " + error.message);
  const { data } = supabase.storage.from("products").getPublicUrl(path);
  return data.publicUrl;
}

function AdminProductsPage() {
  const [password, setPassword] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [products, setProducts] = useState<AdminProductRow[]>([]);
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
  const [mainImageFile, setMainImageFile] = useState<File | null>(null);
  const [mainImagePreview, setMainImagePreview] = useState<string>("");
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
  const [existingImageUrl, setExistingImageUrl] = useState("");
  const [existingGallery, setExistingGallery] = useState<string[]>([]);

  const [saving, setSaving] = useState(false);
  const [formMessage, setFormMessage] = useState<{ ok: boolean; text: string } | null>(null);

  const loadProducts = async (pwd: string) => {
    setLoadingList(true);
    setListError("");
    try {
      const rows = await listAdminProducts({ data: { password: pwd } });
      setProducts(rows as AdminProductRow[]);
    } catch (err) {
      setListError(err instanceof Error ? err.message : "حدث خطأ");
    }
    setLoadingList(false);
  };

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
    setEditingId(p.id);
    setCategorySlug(p.category);
    setName(p.name);
    setPriceNew(p.price_new ? String(p.price_new) : "");
    setPriceOld(p.price_old ? String(p.price_old) : "");
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
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setMainImageFile(file);
    setMainImagePreview(URL.createObjectURL(file));
  };

  const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setGalleryFiles(files);
    setGalleryPreviews(files.map((f) => URL.createObjectURL(f)));
  };

  const addSizeOption = () => setSizeOptions([...sizeOptions, { label: "", price: 0 }]);
  const updateSizeOption = (i: number, field: "label" | "price", value: string) => {
    const copy = [...sizeOptions];
    copy[i] = { ...copy[i], [field]: field === "price" ? Number(value) || 0 : value };
    setSizeOptions(copy);
  };
  const removeSizeOption = (i: number) => setSizeOptions(sizeOptions.filter((_, idx) => idx !== i));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFormMessage(null);

    try {
      let imageUrl = existingImageUrl;
      if (mainImageFile) {
        imageUrl = await uploadImage(mainImageFile);
      }
      if (!imageUrl) {
        setSaving(false);
        setFormMessage({ ok: false, text: "الصورة الرئيسية مطلوبة." });
        return;
      }

      let gallery = existingGallery;
      if (galleryFiles.length > 0) {
        gallery = await Promise.all(galleryFiles.map((f) => uploadImage(f)));
      }

      const res = await saveProduct({
        data: {
          password,
          id: editingId || undefined,
          categorySlug,
          name: name.trim(),
          imageUrl,
          gallery,
          priceNew: Number(priceNew) || 0,
          priceOld: Number(priceOld) || 0,
          priceNote: priceNote.trim() || undefined,
          sizeOptions: sizeOptions.filter((s) => s.label.trim()),
          description: description.trim(),
        },
      });

      setFormMessage({ ok: true, text: editingId ? "تم تحديث المنتج ✅" : `تم إضافة المنتج ✅ (المعرّف: ${res.id})` });
      resetForm();
      await loadProducts(password);
    } catch (err) {
      setFormMessage({ ok: false, text: err instanceof Error ? err.message : "حدث خطأ غير متوقع" });
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("متأكد من حذف هذا المنتج؟ لا يمكن التراجع.")) return;
    try {
      await deleteProduct({ data: { password, id } });
      await loadProducts(password);
    } catch (err) {
      alert(err instanceof Error ? err.message : "حدث خطأ أثناء الحذف");
    }
  };

  useEffect(() => {
    return () => {
      if (mainImagePreview) URL.revokeObjectURL(mainImagePreview);
      galleryPreviews.forEach((u) => URL.revokeObjectURL(u));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!unlocked) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="mx-auto max-w-sm px-4 py-16">
          <div className="mb-6 text-center">
            <Package className="mx-auto h-10 w-10 text-primary" />
            <h1 className="mt-3 text-2xl font-extrabold">إدارة المنتجات</h1>
            <p className="mt-1 text-sm text-muted-foreground">هذه الصفحة لك فقط</p>
          </div>
          <form onSubmit={handleUnlock} className="space-y-4 rounded-xl border border-border bg-card p-5">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="كلمة السر الإدارية"
              className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
            />
            {listError && <p className="text-sm text-destructive">{listError}</p>}
            <button
              type="submit"
              disabled={loadingList}
              className="w-full rounded-lg bg-primary px-6 py-3 text-base font-bold text-primary-foreground hover:opacity-90 disabled:opacity-60"
            >
              {loadingList ? "جارٍ التحقق..." : "دخول"}
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
      <main className="mx-auto max-w-3xl px-4 py-10">
        <div className="mb-6 flex items-center gap-2">
          <Package className="h-7 w-7 text-primary" />
          <h1 className="text-2xl font-extrabold">إدارة المنتجات</h1>
        </div>

        {/* فورم الإضافة / التعديل */}
        <form onSubmit={handleSave} className="space-y-4 rounded-xl border border-border bg-card p-5">
          <h2 className="text-lg font-bold">{editingId ? "تعديل منتج" : "إضافة منتج جديد"}</h2>

          <div>
            <label className="mb-2 block text-sm font-bold">القسم</label>
            <select
              value={categorySlug}
              onChange={(e) => setCategorySlug(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
            >
              {CATEGORY_OPTIONS.map((c) => (
                <option key={c.slug} value={c.slug}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold">اسم المنتج</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="مثال: ستاند محابس - تصميم جديد"
              className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold">الصورة الرئيسية</label>
            {(mainImagePreview || existingImageUrl) && (
              <img
                src={mainImagePreview || existingImageUrl}
                alt=""
                className="mb-2 h-32 w-32 rounded-lg border border-border object-cover"
              />
            )}
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-bold hover:border-primary">
              <Upload className="h-4 w-4" /> اختر صورة
              <input type="file" accept="image/*" onChange={handleMainImageChange} className="hidden" />
            </label>
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold">صور معاينة إضافية (اختياري)</label>
            {(galleryPreviews.length > 0 || existingGallery.length > 0) && (
              <div className="mb-2 flex flex-wrap gap-2">
                {(galleryPreviews.length > 0 ? galleryPreviews : existingGallery).map((src, i) => (
                  <img key={i} src={src} alt="" className="h-16 w-16 rounded-lg border border-border object-cover" />
                ))}
              </div>
            )}
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-bold hover:border-primary">
              <Upload className="h-4 w-4" /> اختر عدة صور
              <input type="file" accept="image/*" multiple onChange={handleGalleryChange} className="hidden" />
            </label>
            <p className="mt-1 text-xs text-muted-foreground">اختيار صور جديدة سيستبدل القديمة بالكامل.</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-bold">السعر (ليرة جديدة)</label>
              <input
                type="number"
                value={priceNew}
                onChange={(e) => setPriceNew(e.target.value)}
                placeholder="مثال: 2500"
                className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-bold">السعر (ليرة قديمة)</label>
              <input
                type="number"
                value={priceOld}
                onChange={(e) => setPriceOld(e.target.value)}
                placeholder="مثال: 250000"
                className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold">
              ملاحظة سعر بديلة <span className="font-normal text-muted-foreground">(اختياري، مثل صناديق المهر متعددة الأحجام)</span>
            </label>
            <input
              type="text"
              value={priceNote}
              onChange={(e) => setPriceNote(e.target.value)}
              placeholder="مثال: من 2,000 إلى 3,500 ل.س جديدة حسب الحجم"
              className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
            />
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-sm font-bold">
                خيارات أحجام وأسعار مختلفة <span className="font-normal text-muted-foreground">(اختياري)</span>
              </label>
              <button type="button" onClick={addSizeOption} className="text-xs font-bold text-primary hover:underline">
                + إضافة خيار
              </button>
            </div>
            {sizeOptions.map((s, i) => (
              <div key={i} className="mb-2 flex gap-2">
                <input
                  type="text"
                  value={s.label}
                  onChange={(e) => updateSizeOption(i, "label", e.target.value)}
                  placeholder="مثال: 25 سم"
                  className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                />
                <input
                  type="number"
                  value={s.price || ""}
                  onChange={(e) => updateSizeOption(i, "price", e.target.value)}
                  placeholder="السعر"
                  className="w-28 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                />
                <button type="button" onClick={() => removeSizeOption(i)} className="text-destructive">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold">الوصف</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
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
              {saving ? "جارٍ الحفظ..." : editingId ? "حفظ التعديلات" : "إضافة المنتج"}
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

        {/* قائمة المنتجات المضافة */}
        <div className="mt-10">
          <h2 className="mb-4 text-lg font-bold">المنتجات المضافة من اللوحة ({products.length})</h2>
          {loadingList ? (
            <p className="text-sm text-muted-foreground">جارٍ التحميل...</p>
          ) : products.length === 0 ? (
            <p className="text-sm text-muted-foreground">لا يوجد منتجات مضافة بعد.</p>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {products.map((p) => (
                <div key={p.id} className="flex items-center gap-3 rounded-xl border border-border bg-card p-3">
                  <img src={p.image} alt="" className="h-16 w-16 shrink-0 rounded-lg object-cover" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-bold">{p.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {CATEGORY_OPTIONS.find((c) => c.slug === p.category)?.name || p.category}
                    </div>
                  </div>
                  <button onClick={() => startEdit(p)} aria-label="تعديل" className="text-muted-foreground hover:text-primary">
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button onClick={() => handleDelete(p.id)} aria-label="حذف" className="text-muted-foreground hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

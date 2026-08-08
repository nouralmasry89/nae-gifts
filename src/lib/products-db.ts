import { supabase } from "@/lib/supabase";
import {
  getProducts,
  getProduct,
  type Product,
} from "@/lib/products";

type DbProductRow = {
  id: string;
  category: string;
  name: string;
  image: string;
  gallery: string[] | null;
  price_new: number | null;
  price_old: number | null;
  price_note: string | null;
  size_options:
    | { label: string; price: number }[]
    | null;
  description: string | null;
  legacy_id: string | null;
};

function rowToProduct(
  row: DbProductRow,
): Product {
  return {
    id: row.id,
    categorySlug: row.category,
    name: row.name,
    image: row.image,
    gallery:
      row.gallery &&
      row.gallery.length > 0
        ? row.gallery
        : undefined,
    sizeOptions:
      row.size_options &&
      row.size_options.length > 0
        ? row.size_options
        : undefined,
    priceNote:
      row.price_note || undefined,
    priceNew:
      row.price_new ?? 0,
    priceOld:
      row.price_old ?? 0,
    description:
      row.description || "",
  };
}

export async function fetchDbProducts(
  categorySlug?: string,
): Promise<Product[]> {
  let query = supabase
    .from("products")
    .select("*")
    .order("created_at", {
      ascending: false,
    });

  if (categorySlug) {
    query = query.eq(
      "category",
      categorySlug,
    );
  }

  const { data, error } =
    await query;

  if (error || !data) {
    return [];
  }

  return (
    data as DbProductRow[]
  ).map(rowToProduct);
}

export async function fetchDbProduct(
  id: string,
): Promise<Product | undefined> {
  const { data } =
    await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .maybeSingle();

  if (!data) {
    return undefined;
  }

  return rowToProduct(
    data as DbProductRow,
  );
}

/* =========================================================
   دمج المنتجات القديمة والجديدة بدون تكرار
========================================================= */

export async function getProductsMerged(
  slug: string,
): Promise<Product[]> {
  const staticList =
    getProducts(slug);

  const dbList =
    await fetchDbProducts(slug);

  /*
   * المنتجات القديمة التي تم نقلها إلى
   * قاعدة البيانات تحتوي على legacy_id.
   *
   * هنا نحتاج معرفة legacy IDs الموجودة
   * حتى لا يظهر المنتج مرتين.
   */

  const { data: migratedRows } =
    await supabase
      .from("products")
      .select("legacy_id")
      .eq("category", slug)
      .not("legacy_id", "is", null);

  const migratedIds = new Set(
    (migratedRows ?? [])
      .map(
        (row) => row.legacy_id,
      )
      .filter(Boolean),
  );

  const remainingStatic =
    staticList.filter(
      (product) =>
        !migratedIds.has(
          product.id,
        ),
    );

  return [
    ...remainingStatic,
    ...dbList,
  ];
}

/* =========================================================
   البحث عن منتج
========================================================= */

export async function getProductMerged(
  id: string,
): Promise<Product | undefined> {
  /*
   * نعطي الأولوية لقاعدة البيانات.
   * هذا مهم جدًا بعد تعديل منتج قديم.
   */

  const dbProduct =
    await fetchDbProduct(id);

  if (dbProduct) {
    return dbProduct;
  }

  return getProduct(id);
}

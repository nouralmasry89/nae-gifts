import { supabase } from "@/lib/supabase";
import { getProducts, getProduct, type Product } from "@/lib/products";

type DbProductRow = {
  id: string;
  category: string;
  name: string;
  image: string;
  gallery: string[] | null;
  price_new: number | null;
  price_old: number | null;
  price_note: string | null;
  size_options: { label: string; price: number }[] | null;
  description: string | null;
};

function rowToProduct(row: DbProductRow): Product {
  return {
    id: row.id,
    categorySlug: row.category,
    name: row.name,
    image: row.image,
    gallery: row.gallery && row.gallery.length > 0 ? row.gallery : undefined,
    sizeOptions: row.size_options && row.size_options.length > 0 ? row.size_options : undefined,
    priceNote: row.price_note || undefined,
    priceNew: row.price_new ?? 0,
    priceOld: row.price_old ?? 0,
    description: row.description || "",
  };
}

export async function fetchDbProducts(categorySlug?: string): Promise<Product[]> {
  let query = supabase.from("products").select("*").order("created_at", { ascending: false });
  if (categorySlug) query = query.eq("category", categorySlug);
  const { data, error } = await query;
  if (error || !data) return [];
  return (data as DbProductRow[]).map(rowToProduct);
}

export async function fetchDbProduct(id: string): Promise<Product | undefined> {
  const { data } = await supabase.from("products").select("*").eq("id", id).maybeSingle();
  if (!data) return undefined;
  return rowToProduct(data as DbProductRow);
}

/** يجمع منتجات القسم الثابتة (في الكود) مع المنتجات المضافة من لوحة التحكم */
export async function getProductsMerged(slug: string): Promise<Product[]> {
  const staticList = getProducts(slug);
  const dbList = await fetchDbProducts(slug);
  return [...staticList, ...dbList];
}

/** يبحث عن منتج بالمعرّف: أولاً في المنتجات الثابتة، وإلا في قاعدة البيانات */
export async function getProductMerged(id: string): Promise<Product | undefined> {
  return getProduct(id) ?? (await fetchDbProduct(id));
}

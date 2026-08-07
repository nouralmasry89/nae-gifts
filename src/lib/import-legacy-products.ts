import { supabase } from "@/lib/supabase";
import { allProducts } from "@/lib/products";

export async function importLegacyProducts() {
  const results = {
    imported: 0,
    skipped: 0,
    errors: [] as string[],
  };

  for (const product of allProducts) {
    try {
      // نتحقق أولاً هل المنتج موجود مسبقاً
      const { data: existing, error: checkError } = await supabase
        .from("products")
        .select("id")
        .eq("legacy_id", product.id)
        .maybeSingle();

      if (checkError) {
        results.errors.push(
          `${product.name}: ${checkError.message}`
        );
        continue;
      }

      // إذا كان موجوداً، لا نكرره
      if (existing) {
        results.skipped++;
        continue;
      }

      const { error } = await supabase.from("products").insert({
        legacy_id: product.id,
        category: product.categorySlug,
        name: product.name,
        image: product.image,
        gallery: product.gallery ?? [],
        price_new: product.priceNew,
        price_old: product.priceOld,
        price_note: product.priceNote ?? null,
        size_options: product.sizeOptions ?? [],
        description: product.description ?? "",
      });

      if (error) {
        results.errors.push(
          `${product.name}: ${error.message}`
        );
        continue;
      }

      results.imported++;
    } catch (error) {
      results.errors.push(
        `${product.name}: ${
          error instanceof Error ? error.message : "خطأ غير معروف"
        }`
      );
    }
  }

  return results;
}

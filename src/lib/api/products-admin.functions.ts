import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSupabaseAdmin } from "@/lib/supabase.server";
import { allProducts } from "@/lib/products";

function checkPassword(password: string) {
  const adminPassword = process.env.ADMIN_NOTIFY_PASSWORD;
  if (!adminPassword || password !== adminPassword) {
    throw new Error("كلمة السر غير صحيحة.");
  }
}

const sizeOptionSchema = z.object({ label: z.string(), price: z.number() });

const productInput = z.object({
  password: z.string(),
  id: z.string().optional(),
  categorySlug: z.string().min(1),
  name: z.string().min(1),
  imageUrl: z.string().min(1),
  gallery: z.array(z.string()).optional(),
  priceNew: z.number().default(0),
  priceOld: z.number().default(0),
  priceNote: z.string().optional(),
  sizeOptions: z.array(sizeOptionSchema).optional(),
  description: z.string().optional(),
});

export const uploadProductImage = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      password: z.string(),
      fileName: z.string(),
      contentType: z.string(),
      base64Data: z.string(),
    })
  )
  .handler(async ({ data }) => {
    checkPassword(data.password);
    const supabaseAdmin = getSupabaseAdmin();

    const buffer = Buffer.from(data.base64Data, "base64");
    const ext = (data.fileName.split(".").pop() || "jpg").toLowerCase();
    const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const { error } = await supabaseAdmin.storage.from("products").upload(path, buffer, {
      contentType: data.contentType || "image/jpeg",
      upsert: true,
    });
    if (error) throw new Error(error.message);

    const { data: pub } = supabaseAdmin.storage.from("products").getPublicUrl(path);
    return { url: pub.publicUrl };
  });

export const saveProduct = createServerFn({ method: "POST" })
  .inputValidator(productInput)
  .handler(async ({ data }) => {
    checkPassword(data.password);
    const supabaseAdmin = getSupabaseAdmin();

    const row = {
      category: data.categorySlug,
      name: data.name,
      image: data.imageUrl,
      gallery: data.gallery ?? [],
      price_new: data.priceNew,
      price_old: data.priceOld,
      price_note: data.priceNote || null,
      size_options: data.sizeOptions ?? [],
      description: data.description || "",
    };

    if (data.id) {
      const { error } = await supabaseAdmin.from("products").update(row).eq("id", data.id);
      if (error) throw new Error(error.message);
      return { id: data.id };
    }

    const { data: inserted, error } = await supabaseAdmin
      .from("products")
      .insert(row)
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: inserted.id as string };
  });

export const deleteProduct = createServerFn({ method: "POST" })
  .inputValidator(z.object({ password: z.string(), id: z.string() }))
  .handler(async ({ data }) => {
    checkPassword(data.password);
    const supabaseAdmin = getSupabaseAdmin();
    const { error } = await supabaseAdmin.from("products").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const listAdminProducts = createServerFn({ method: "POST" })
  .inputValidator(z.object({ password: z.string() }))
  .handler(async ({ data }) => {
    checkPassword(data.password);
    const supabaseAdmin = getSupabaseAdmin();
    const { data: rows, error } = await supabaseAdmin
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return rows ?? [];
  });
export const migrateLegacyProducts = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      password: z.string(),
    }),
  )
  .handler(async ({ data }) => {
    checkPassword(data.password);

    const supabaseAdmin = getSupabaseAdmin();

    let inserted = 0;
    let skipped = 0;

    for (const product of allProducts) {
      // نبحث عن المنتج بالاسم والقسم لمنع التكرار
      const { data: existing, error: findError } =
        await supabaseAdmin
          .from("products")
          .select("id")
          .eq("category", product.categorySlug)
          .eq("name", product.name)
          .maybeSingle();

      if (findError) {
        throw new Error(findError.message);
      }

      // المنتج موجود مسبقًا → نتجاوزه
      if (existing) {
        skipped++;
        continue;
      }

      const row = {
        category: product.categorySlug,
        name: product.name,
        image: product.image,
        gallery: product.gallery ?? [],
        price_new: product.priceNew ?? 0,
        price_old: product.priceOld ?? 0,
        price_note: product.priceNote || null,
        size_options: product.sizeOptions ?? [],
        description: product.description || "",
      };

      const { error: insertError } = await supabaseAdmin
        .from("products")
        .insert(row);

      if (insertError) {
        throw new Error(
          `فشل نقل المنتج "${product.name}": ${insertError.message}`,
        );
      }

      inserted++;
    }

    return {
      ok: true,
      inserted,
      skipped,
      total: allProducts.length,
    };
  });

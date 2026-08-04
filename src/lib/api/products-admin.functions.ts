import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSupabaseAdmin } from "@/lib/supabase.server";

function checkPassword(password: string) {
  const adminPassword = process.env.ADMIN_NOTIFY_PASSWORD;
  if (!adminPassword || password !== adminPassword) {
    throw new Error("كلمة السر غير صحيحة.");
  }
}

const sizeOptionSchema = z.object({ label: z.string(), price: z.number() });

const productInput = z.object({
  password: z.string(),
  id: z.string().optional(), // موجود = تعديل منتج قائم، غير موجود = إضافة منتج جديد
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

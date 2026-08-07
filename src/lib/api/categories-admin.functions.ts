import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSupabaseAdmin } from "@/lib/supabase.server";

function checkPassword(password: string) {
  const adminPassword = process.env.ADMIN_NOTIFY_PASSWORD;

  if (!adminPassword || password !== adminPassword) {
    throw new Error("كلمة السر غير صحيحة.");
  }
}

/* =========================================================
   جلب جميع الأقسام
   ========================================================= */

export const listAdminCategories = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      password: z.string(),
    }),
  )
  .handler(async ({ data }) => {
    checkPassword(data.password);

    const supabaseAdmin = getSupabaseAdmin();

    const { data: rows, error } = await supabaseAdmin
      .from("categories")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });

    if (error) {
      throw new Error(error.message);
    }

    return rows ?? [];
  });

/* =========================================================
   رفع صورة قسم
   ========================================================= */

export const uploadCategoryImage = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      password: z.string(),
      fileName: z.string(),
      contentType: z.string(),
      base64Data: z.string(),
    }),
  )
  .handler(async ({ data }) => {
    checkPassword(data.password);

    const supabaseAdmin = getSupabaseAdmin();

    const buffer = Buffer.from(data.base64Data, "base64");

    const ext = (
      data.fileName.split(".").pop() || "jpg"
    ).toLowerCase();

    const path = `${Date.now()}-${Math.random()
      .toString(36)
      .slice(2)}.${ext}`;

    const { error } = await supabaseAdmin.storage
      .from("Categories")
      .upload(path, buffer, {
        contentType: data.contentType || "image/jpeg",
        upsert: true,
      });

    if (error) {
      throw new Error(error.message);
    }

    const { data: pub } = supabaseAdmin.storage
      .from("Categories")
      .getPublicUrl(path);

    return {
      url: pub.publicUrl,
    };
  });

/* =========================================================
   إضافة قسم جديد
   ========================================================= */

export const saveCategory = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      password: z.string(),

      id: z.string().optional(),

      slug: z
        .string()
        .min(1, "معرّف القسم مطلوب")
        .regex(
          /^[a-z0-9-]+$/,
          "معرّف القسم يجب أن يحتوي على أحرف إنجليزية صغيرة وأرقام وشرطات فقط",
        ),

      name: z.string().min(1, "اسم القسم مطلوب"),

      description: z.string().optional(),

      image: z.string().min(1, "صورة القسم مطلوبة"),

      sortOrder: z.number().default(0),

      isActive: z.boolean().default(true),
    }),
  )
  .handler(async ({ data }) => {
    checkPassword(data.password);

    const supabaseAdmin = getSupabaseAdmin();

    const row = {
      slug: data.slug,
      name: data.name,
      description: data.description || "",
      image: data.image,
      sort_order: data.sortOrder,
      is_active: data.isActive,
      updated_at: new Date().toISOString(),
    };

    /* تعديل قسم موجود */

    if (data.id) {
      const { error } = await supabaseAdmin
        .from("categories")
        .update(row)
        .eq("id", data.id);

      if (error) {
        throw new Error(error.message);
      }

      return {
        id: data.id,
      };
    }

    /* إضافة قسم جديد */

    const { data: inserted, error } = await supabaseAdmin
      .from("categories")
      .insert(row)
      .select("id")
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return {
      id: inserted.id as string,
    };
  });

/* =========================================================
   حذف قسم
   ========================================================= */

export const deleteCategory = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      password: z.string(),
      id: z.string(),
    }),
  )
  .handler(async ({ data }) => {
    checkPassword(data.password);

    const supabaseAdmin = getSupabaseAdmin();

    const { error } = await supabaseAdmin
      .from("categories")
      .delete()
      .eq("id", data.id);

    if (error) {
      throw new Error(error.message);
    }

    return {
      ok: true,
    };
  });

/* =========================================================
   تغيير حالة القسم: ظاهر / مخفي
   ========================================================= */

export const toggleCategoryActive = createServerFn({
  method: "POST",
})
  .inputValidator(
    z.object({
      password: z.string(),
      id: z.string(),
      isActive: z.boolean(),
    }),
  )
  .handler(async ({ data }) => {
    checkPassword(data.password);

    const supabaseAdmin = getSupabaseAdmin();

    const { error } = await supabaseAdmin
      .from("categories")
      .update({
        is_active: data.isActive,
        updated_at: new Date().toISOString(),
      })
      .eq("id", data.id);

    if (error) {
      throw new Error(error.message);
    }

    return {
      ok: true,
    };
  });

/* =========================================================
   تحديث ترتيب الأقسام
   ========================================================= */

export const updateCategoryOrder = createServerFn({
  method: "POST",
})
  .inputValidator(
    z.object({
      password: z.string(),

      items: z.array(
        z.object({
          id: z.string(),
          sortOrder: z.number(),
        }),
      ),
    }),
  )
  .handler(async ({ data }) => {
    checkPassword(data.password);

    const supabaseAdmin = getSupabaseAdmin();

    for (const item of data.items) {
      const { error } = await supabaseAdmin
        .from("categories")
        .update({
          sort_order: item.sortOrder,
          updated_at: new Date().toISOString(),
        })
        .eq("id", item.id);

      if (error) {
        throw new Error(error.message);
      }
    }

    return {
      ok: true,
    };
  });

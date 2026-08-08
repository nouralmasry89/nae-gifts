import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSupabaseAdmin } from "@/lib/supabase.server";

function checkPassword(password: string) {
  const adminPassword = process.env.ADMIN_NOTIFY_PASSWORD;

  if (!adminPassword || password !== adminPassword) {
    throw new Error("كلمة السر غير صحيحة.");
  }
}

const categoryInput = z.object({
  password: z.string(),

  id: z.string().uuid().optional(),

  slug: z
    .string()
    .min(1)
    .regex(
      /^[a-z0-9-]+$/,
      "معرّف القسم يجب أن يحتوي على أحرف إنجليزية صغيرة وأرقام وشرطة فقط.",
    ),

  name: z.string().min(1),

  description: z.string().optional(),

  image: z.string().optional(),
});

/* =========================================================
   رفع صورة قسم
========================================================= */

export const uploadCategoryImage = createServerFn({
  method: "POST",
})
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

    const buffer = Buffer.from(
      data.base64Data,
      "base64",
    );

    const ext =
      (
        data.fileName.split(".").pop() ||
        "jpg"
      ).toLowerCase();

    const path = `categories/${Date.now()}-${Math.random()
      .toString(36)
      .slice(2)}.${ext}`;

    const { error } =
      await supabaseAdmin.storage
        .from("products")
        .upload(path, buffer, {
          contentType:
            data.contentType || "image/jpeg",
          upsert: true,
        });

    if (error) {
      throw new Error(error.message);
    }

    const { data: pub } =
      supabaseAdmin.storage
        .from("products")
        .getPublicUrl(path);

    return {
      url: pub.publicUrl,
    };
  });

/* =========================================================
   جلب الأقسام
========================================================= */

export const listAdminCategories =
  createServerFn({
    method: "POST",
  })
    .inputValidator(
      z.object({
        password: z.string(),
      }),
    )
    .handler(async ({ data }) => {
      checkPassword(data.password);

      const supabaseAdmin =
        getSupabaseAdmin();

      const {
        data: rows,
        error,
      } = await supabaseAdmin
        .from("categories")
        .select("*")
        .order("created_at", {
          ascending: true,
        });

      if (error) {
        throw new Error(error.message);
      }

      return rows ?? [];
    });

/* =========================================================
   إضافة / تعديل قسم
========================================================= */

export const saveCategory =
  createServerFn({
    method: "POST",
  })
    .inputValidator(categoryInput)
    .handler(async ({ data }) => {
      checkPassword(data.password);

      const supabaseAdmin =
        getSupabaseAdmin();

      const row = {
        slug: data.slug,
        name: data.name,
        description:
          data.description || "",
        image: data.image || "",
      };

      /* تعديل قسم */

      if (data.id) {
        const { error } =
          await supabaseAdmin
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

      const {
        data: inserted,
        error,
      } = await supabaseAdmin
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

export const deleteCategory =
  createServerFn({
    method: "POST",
  })
    .inputValidator(
      z.object({
        password: z.string(),
        id: z.string().uuid(),
        slug: z.string(),
      }),
    )
    .handler(async ({ data }) => {
      checkPassword(data.password);

      const supabaseAdmin =
        getSupabaseAdmin();

      /*
       * التأكد من عدم وجود منتجات
       */

      const {
        count,
        error: countError,
      } = await supabaseAdmin
        .from("products")
        .select("id", {
          count: "exact",
          head: true,
        })
        .eq("category", data.slug);

      if (countError) {
        throw new Error(
          countError.message,
        );
      }

      if ((count ?? 0) > 0) {
        throw new Error(
          "لا يمكن حذف هذا القسم لأنه يحتوي على منتجات. انقل المنتجات أو احذفها أولاً.",
        );
      }

      /*
       * حذف القسم
       */

      const { error } =
        await supabaseAdmin
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

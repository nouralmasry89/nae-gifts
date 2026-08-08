import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSupabaseAdmin } from "@/lib/supabase.server";

function checkPassword(password: string) {
  const adminPassword = process.env.ADMIN_NOTIFY_PASSWORD;

  if (!adminPassword || password !== adminPassword) {
    throw new Error("كلمة السر غير صحيحة.");
  }
}

const sizeOptionSchema = z.object({
  label: z.string(),
  price: z.number(),
});

const productInput = z.object({
  password: z.string(),
  id: z.string().optional(),
  legacyId: z.string().optional(),

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

/* =========================================================
   رفع صورة
========================================================= */

export const uploadProductImage = createServerFn({
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
      (data.fileName.split(".").pop() || "jpg")
        .toLowerCase();

    const path = `${Date.now()}-${Math.random()
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
   حفظ / تعديل منتج
========================================================= */

export const saveProduct = createServerFn({
  method: "POST",
})
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
      legacy_id: data.legacyId || null,
    };

    /* ---------------------------------------------------------
       1. تعديل بواسطة UUID
    --------------------------------------------------------- */

    if (data.id) {
      const { error } =
        await supabaseAdmin
          .from("products")
          .update(row)
          .eq("id", data.id);

      if (error) {
        throw new Error(error.message);
      }

      return {
        id: data.id,
      };
    }

    /* ---------------------------------------------------------
       2. تعديل / ترحيل منتج قديم
    --------------------------------------------------------- */

    if (data.legacyId) {
      const { data: existing, error: findError } =
        await supabaseAdmin
          .from("products")
          .select("id")
          .eq("legacy_id", data.legacyId)
          .maybeSingle();

      if (findError) {
        throw new Error(findError.message);
      }

      if (existing?.id) {
        const { error } =
          await supabaseAdmin
            .from("products")
            .update(row)
            .eq("id", existing.id);

        if (error) {
          throw new Error(error.message);
        }

        return {
          id: existing.id as string,
        };
      }

      /*
       * لا يوجد المنتج في قاعدة البيانات،
       * لذلك ننقله إليها.
       */

      const { data: inserted, error } =
        await supabaseAdmin
          .from("products")
          .insert(row)
          .select("id")
          .single();

      if (error) {
        throw new Error(error.message);
      }

      return {
        id: inserted.id as string,
      };
    }

    /* ---------------------------------------------------------
       3. إضافة منتج جديد
    --------------------------------------------------------- */

    const { data: inserted, error } =
      await supabaseAdmin
        .from("products")
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
   حذف منتج
========================================================= */

export const deleteProduct = createServerFn({
  method: "POST",
})
  .inputValidator(
    z.object({
      password: z.string(),
      id: z.string().optional(),
      legacyId: z.string().optional(),
    }),
  )
  .handler(async ({ data }) => {
    checkPassword(data.password);

    const supabaseAdmin = getSupabaseAdmin();

    /* حذف بواسطة UUID */

    if (data.id) {
      const { error } =
        await supabaseAdmin
          .from("products")
          .delete()
          .eq("id", data.id);

      if (error) {
        throw new Error(error.message);
      }

      return {
        ok: true,
      };
    }

    /* حذف بواسطة legacy_id */

    if (data.legacyId) {
      const { error } =
        await supabaseAdmin
          .from("products")
          .delete()
          .eq("legacy_id", data.legacyId);

      if (error) {
        throw new Error(error.message);
      }

      return {
        ok: true,
      };
    }

    throw new Error(
      "لم يتم تحديد المنتج المراد حذفه.",
    );
  });

/* =========================================================
   جلب المنتجات من قاعدة البيانات
========================================================= */

export const listAdminProducts = createServerFn({
  method: "POST",
})
  .inputValidator(
    z.object({
      password: z.string(),
    }),
  )
  .handler(async ({ data }) => {
    checkPassword(data.password);

    const supabaseAdmin = getSupabaseAdmin();

    const { data: rows, error } =
      await supabaseAdmin
        .from("products")
        .select("*")
        .order("created_at", {
          ascending: false,
        });

    if (error) {
      throw new Error(error.message);
    }

    return rows ?? [];
  });

/* =========================================================
   ترحيل جميع المنتجات القديمة إلى قاعدة البيانات
========================================================= */

export const migrateLegacyProducts =
  createServerFn({
    method: "POST",
  })
    .inputValidator(
      z.object({
        password: z.string(),
        products: z.array(
          z.object({
            id: z.string(),
            categorySlug: z.string(),
            name: z.string(),
            image: z.string(),
            gallery: z.array(z.string()).optional(),
            priceNew: z.number(),
            priceOld: z.number(),
            priceNote: z.string().optional(),
            sizeOptions: z
              .array(sizeOptionSchema)
              .optional(),
            description: z.string(),
          }),
        ),
      }),
    )
    .handler(async ({ data }) => {
      checkPassword(data.password);

      const supabaseAdmin =
        getSupabaseAdmin();

      let migrated = 0;

      for (const product of data.products) {
        const row = {
          category: product.categorySlug,
          name: product.name,
          image: product.image,
          gallery: product.gallery ?? [],
          price_new: product.priceNew,
          price_old: product.priceOld,
          price_note:
            product.priceNote || null,
          size_options:
            product.sizeOptions ?? [],
          description:
            product.description || "",
          legacy_id: product.id,
        };

        const { data: existing } =
          await supabaseAdmin
            .from("products")
            .select("id")
            .eq("legacy_id", product.id)
            .maybeSingle();

        if (existing?.id) {
          await supabaseAdmin
            .from("products")
            .update(row)
            .eq("id", existing.id);
        } else {
          const { error } =
            await supabaseAdmin
              .from("products")
              .insert(row);

          if (error) {
            throw new Error(
              `فشل نقل المنتج "${product.name}": ${error.message}`,
            );
          }
        }

        migrated++;
      }

      return {
        ok: true,
        migrated,
      };
    });


import { createFileRoute } from "@tanstack/react-router";
import { Package, Plus } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const Route = createFileRoute("/admin/products")({
  head: () => ({
    meta: [{ title: "إدارة المنتجات - N.A.E Gifts Store" }],
  }),
  component: AdminProductsPage,
});

function AdminProductsPage() {
  return (
    <div className="min-h-screen">
      <Header />

      <main className="mx-auto max-w-7xl px-4 py-10">

        <div className="mb-8 flex items-center justify-between">

          <div>
            <h1 className="text-3xl font-extrabold flex items-center gap-3">
              <Package className="text-primary" />
              إدارة المنتجات
            </h1>

            <p className="mt-2 text-muted-foreground">
              من هنا يمكنك إدارة جميع منتجات المتجر.
            </p>
          </div>

          <button className="rounded-lg bg-primary px-5 py-3 text-primary-foreground font-bold flex items-center gap-2 hover:opacity-90">
            <Plus size={20} />
            إضافة منتج
          </button>

        </div>

        <div className="rounded-2xl border border-border bg-card p-10 text-center">

          <Package
            className="mx-auto mb-4 text-primary"
            size={60}
          />

          <h2 className="text-2xl font-bold">
            لا توجد منتجات حالياً
          </h2>

          <p className="mt-2 text-muted-foreground">
            قريباً ستظهر جميع منتجاتك هنا مباشرة من قاعدة البيانات.
          </p>

        </div>

      </main>

      <Footer />
    </div>
  );
}
